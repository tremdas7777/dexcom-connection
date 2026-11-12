// XPay Brasil: pagamentos Pix. Somente servidor.
// API keys e segredo do webhook ficam em private_settings (service role); os secrets do servidor
// XPAY_API_KEY e XPAY_WEBHOOK_SECRET são reservas opcionais.
import { createHmac, timingSafeEqual } from "node:crypto";

export const XPAY_API = "https://api.xpaybrasil.com/v1";
export const XPAY_ORDER_PREFIX = "xp_";

const API_KEY_SETTING = "xpay_api_key";
const WEBHOOK_SECRET_SETTING = "xpay_webhook_secret";
const CACHE_MS = 60_000;
let keyCache: { value: string | null; at: number } | null = null;

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function savedSetting(key: string): Promise<string | null> {
  const { data } = await (
    await db()
  )
    .from("private_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return (data?.value as string | null) || null;
}

async function saveSetting(key: string, value: string): Promise<void> {
  const { error } = await (
    await db()
  )
    .from("private_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

async function deleteSetting(key: string): Promise<void> {
  const { error } = await (await db()).from("private_settings").delete().eq("key", key);
  if (error) throw new Error(error.message);
}

async function savedApiKey(): Promise<string | null> {
  return savedSetting(API_KEY_SETTING);
}

export async function getXPayKey(): Promise<string | null> {
  if (keyCache && Date.now() - keyCache.at < CACHE_MS) return keyCache.value;
  const value = (await savedApiKey()) || process.env["XPAY_API_KEY"] || null;
  keyCache = { value, at: Date.now() };
  return value;
}

export async function getXPayKeySource(): Promise<{
  key: string | null;
  source: "admin" | "secret" | null;
}> {
  const saved = await savedApiKey();
  if (saved) return { key: saved, source: "admin" };
  const env = process.env["XPAY_API_KEY"] || null;
  return { key: env, source: env ? "secret" : null };
}

export async function saveXPayKey(value: string): Promise<void> {
  await saveSetting(API_KEY_SETTING, value);
  keyCache = null;
}

export async function deleteXPayKey(): Promise<void> {
  await deleteSetting(API_KEY_SETTING);
  keyCache = null;
}

export async function getXPayWebhookSecret(): Promise<string | null> {
  return (await savedSetting(WEBHOOK_SECRET_SETTING)) || process.env["XPAY_WEBHOOK_SECRET"] || null;
}

export async function getXPayWebhookSecretSource(): Promise<{
  configured: boolean;
  source: "admin" | "secret" | null;
}> {
  const saved = await savedSetting(WEBHOOK_SECRET_SETTING);
  if (saved) return { configured: true, source: "admin" };
  const env = process.env["XPAY_WEBHOOK_SECRET"] || null;
  return { configured: !!env, source: env ? "secret" : null };
}

export async function saveXPayWebhookSecret(value: string): Promise<void> {
  await saveSetting(WEBHOOK_SECRET_SETTING, value);
}

export async function deleteXPayWebhookSecret(): Promise<void> {
  await deleteSetting(WEBHOOK_SECRET_SETTING);
}

async function headers(key?: string | null): Promise<Record<string, string>> {
  const apiKey = key ?? (await getXPayKey());
  if (!apiKey) throw new Error("Pagamento indisponível no momento.");
  return {
    "X-API-KEY": apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/** Consulta somente limites da conta; não cria cobrança nem movimenta dinheiro. */
export async function testXPayKey(): Promise<{
  ok: boolean;
  status?: number | undefined;
  error?: string | undefined;
}> {
  const key = await getXPayKey();
  if (!key) return { ok: false, error: "Nenhuma chave cadastrada" };
  try {
    const res = await fetch(`${XPAY_API}/charge/sales-limits`, { headers: await headers(key) });
    if (res.ok) return { ok: true, status: res.status };
    return {
      ok: false,
      status: res.status,
      error:
        res.status === 401 || res.status === 403
          ? "Chave recusada pela XPay"
          : `XPay respondeu HTTP ${res.status}`,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha de conexão" };
  }
}

export type XPayAddress = {
  street: string;
  number: string;
  complement?: string | undefined;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
};

/** A OpenAPI da XPay descreve brCode como objeto, embora o exemplo e outros schemas usem string. */
function extractBrCode(value: unknown, depth = 0, preferString = false): string | null {
  if (typeof value === "string") {
    const text = value.trim();
    return text && (preferString || text.startsWith("000201")) ? text : null;
  }
  if (!value || typeof value !== "object" || depth >= 5) return null;

  const entries: [string, unknown][] = Array.isArray(value)
    ? value.map((item, index) => [String(index), item])
    : Object.entries(value as Record<string, unknown>);
  const preferredKeys = [
    "brCode",
    "br_code",
    "copyPaste",
    "copyPasteCode",
    "copy_paste",
    "pixCode",
    "payload",
    "emv",
    "code",
    "text",
    "value",
    "qrCode",
    "qr_code",
  ];

  for (const key of preferredKeys) {
    const entry = entries.find(([name]) => name === key);
    if (entry) {
      const result = extractBrCode(entry[1], depth + 1, true);
      if (result) return result;
    }
  }
  for (const [, nested] of entries) {
    const result = extractBrCode(nested, depth + 1);
    if (result) return result;
  }
  return null;
}

/** Cria Pix avulso. A XPay recebe o valor em centavos e só aceita cobranças a partir de R$ 5,00. */
export async function createXPayPix(o: {
  amount: number;
  customer: { name: string; email: string; phone: string; cpf: string };
  address?: XPayAddress | undefined;
  expiresInSeconds?: number | undefined;
}): Promise<{ id: string; qrcode: string; status: string }> {
  if (o.amount < 500) throw new Error("A XPay exige cobrança mínima de R$ 5,00.");
  const externalId = crypto.randomUUID();
  const address = o.address
    ? {
        postalCode: o.address.zipcode,
        address: o.address.street,
        district: o.address.neighborhood,
        number: o.address.number,
        ...(o.address.complement ? { line1: o.address.complement } : {}),
      }
    : {};
  const requestHeaders = await headers();
  let res: Response;
  try {
    res = await fetch(`${XPAY_API}/charge/pix`, {
      method: "POST",
      headers: { ...requestHeaders, "Idempotency-Key": externalId },
      body: JSON.stringify({
        amount: o.amount,
        expiresIn: o.expiresInSeconds ?? 30 * 60,
        externalId,
        customer: {
          taxId: o.customer.cpf,
          name: o.customer.name,
          email: o.customer.email,
          phone: o.customer.phone,
          ...address,
        },
      }),
    });
  } catch (e) {
    console.error("XPay create network error", e instanceof Error ? e.name : "unknown");
    throw new Error("XPay: falha de conexão ao criar a cobrança (sem resposta da API).");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- resposta externa sem tipo gerado
  const json = (await res.json().catch(() => null)) as any;
  const charge = json?.data ?? json;
  const id = charge?.id;
  const qrcode = extractBrCode(charge?.brCode, 0, true) ?? "";
  const brCodeValue = charge?.brCode;
  const rawCode = json?.code ?? json?.errorCode ?? json?.error?.code;
  const errorCode =
    typeof rawCode === "string" && /^[A-Za-z0-9_.-]{1,60}$/.test(rawCode) ? rawCode : null;
  if (!res.ok) {
    console.error("XPay create error", {
      status: res.status,
      errorCode,
      chargeKeys: Object.keys(charge ?? {}).slice(0, 20),
      hasId: !!id,
      brCodeType: Array.isArray(brCodeValue) ? "array" : typeof brCodeValue,
      brCodeKeys:
        brCodeValue && typeof brCodeValue === "object" ? Object.keys(brCodeValue).slice(0, 20) : [],
    });
    const statusDetail = `HTTP ${res.status}${errorCode ? `, código ${errorCode}` : ""}`;
    if (res.status >= 500) {
      throw new Error(
        `XPay: falha do servidor de pagamentos (${statusDetail}). A resposta não confirma se a cobrança foi criada; confira o painel XPay antes de tentar novamente.`,
      );
    }
    throw new Error(
      `XPay: cobrança recusada (${statusDetail}). Verifique os dados e o limite da conta.`,
    );
  }
  if (!id) {
    console.error("XPay create response missing id", {
      status: res.status,
      chargeKeys: Object.keys(charge ?? {}).slice(0, 20),
    });
    throw new Error(`XPay: resposta HTTP ${res.status} sem identificador de cobrança.`);
  }
  if (!qrcode) {
    const brCodeType = Array.isArray(brCodeValue) ? "array" : typeof brCodeValue;
    const brCodeKeys =
      brCodeValue && typeof brCodeValue === "object" ? Object.keys(brCodeValue).slice(0, 20) : [];
    console.error("XPay create response missing brCode", {
      status: res.status,
      hasId: true,
      brCodeType,
      brCodeKeys,
    });
    throw new Error(
      `XPay: resposta HTTP ${res.status} sem código Pix legível (brCode ${brCodeType}${brCodeKeys.length ? `; campos: ${brCodeKeys.join(", ")}` : ""}). Se a cobrança ficou pendente, confira no painel antes de tentar novamente.`,
    );
  }
  return {
    id: String(id),
    qrcode,
    status: String(charge?.paymentStatus ?? charge?.status ?? "processing").toLowerCase(),
  };
}

/** Consulta o estado real na API autenticada da XPay. O valor está em centavos. */
export async function xPayStatus(id: string): Promise<{ status: string; amount: number }> {
  const res = await fetch(`${XPAY_API}/charge/${encodeURIComponent(id)}`, {
    headers: await headers(),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- resposta externa sem tipo gerado
  const json = (await res.json().catch(() => null)) as any;
  const charge = json?.data ?? json;
  if (!res.ok) throw new Error(`XPay respondeu HTTP ${res.status} ao consultar a cobrança.`);
  return {
    status: String(charge?.paymentStatus ?? charge?.status ?? "pending").toLowerCase(),
    amount: Math.round(Number(charge?.total ?? charge?.amount ?? 0)),
  };
}

/** Valida X-Webhook-Signature sobre os bytes textuais exatos recebidos, conforme a XPay. */
export function verifyXPayWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;
  const match = /^sha256=([a-f0-9]{64})$/i.exec(signatureHeader.trim());
  if (!match) return false;
  const actual = Buffer.from(match[1], "hex");
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function isXPayOrderId(id: string): boolean {
  return id.startsWith(XPAY_ORDER_PREFIX);
}
