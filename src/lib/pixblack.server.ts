// Pix Black: cobranças Pix. Este módulo só é importado pelo servidor.
// A API key e o segredo do webhook são guardados em private_settings ou nos secrets do servidor.
import { createHmac, timingSafeEqual } from "node:crypto";

export const PIXBLACK_API = "https://pixxblack.com/api/v1";
export const PIXBLACK_ORDER_PREFIX = "pb_";

const API_KEY_SETTING = "pixblack_api_key";
const WEBHOOK_SECRET_SETTING = "pixblack_webhook_secret";
const CACHE_MS = 60_000;
const HTTP_TIMEOUT_MS = 15_000;
let keyCache: { value: string | null; at: number } | null = null;

type PixBlackCharge = {
  id?: unknown;
  status?: unknown;
  amount_cents?: unknown;
  pix?: { copy_paste?: unknown } | null;
};

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
  keyCache = null;
}

async function deleteSetting(key: string): Promise<void> {
  const { error } = await (await db()).from("private_settings").delete().eq("key", key);
  if (error) throw new Error(error.message);
  keyCache = null;
}

export async function getPixBlackApiKey(): Promise<string | null> {
  if (keyCache && Date.now() - keyCache.at < CACHE_MS) return keyCache.value;
  const value = (await savedSetting(API_KEY_SETTING)) || process.env["PIXBLACK_API_KEY"] || null;
  keyCache = { value, at: Date.now() };
  return value;
}

export async function getPixBlackApiKeySource(): Promise<{
  key: string | null;
  source: "admin" | "secret" | null;
}> {
  const saved = await savedSetting(API_KEY_SETTING);
  if (saved) return { key: saved, source: "admin" };
  const env = process.env["PIXBLACK_API_KEY"] || null;
  return { key: env, source: env ? "secret" : null };
}

export async function savePixBlackApiKey(value: string): Promise<void> {
  await saveSetting(API_KEY_SETTING, value);
}

export async function deletePixBlackApiKey(): Promise<void> {
  await deleteSetting(API_KEY_SETTING);
}

export async function getPixBlackWebhookSecret(): Promise<string | null> {
  return (
    (await savedSetting(WEBHOOK_SECRET_SETTING)) || process.env["PIXBLACK_WEBHOOK_SECRET"] || null
  );
}

export async function getPixBlackWebhookSecretSource(): Promise<{
  configured: boolean;
  source: "admin" | "secret" | null;
}> {
  const saved = await savedSetting(WEBHOOK_SECRET_SETTING);
  if (saved) return { configured: true, source: "admin" };
  const env = process.env["PIXBLACK_WEBHOOK_SECRET"] || null;
  return { configured: !!env, source: env ? "secret" : null };
}

export async function savePixBlackWebhookSecret(value: string): Promise<void> {
  await saveSetting(WEBHOOK_SECRET_SETTING, value);
}

export async function deletePixBlackWebhookSecret(): Promise<void> {
  await deleteSetting(WEBHOOK_SECRET_SETTING);
}

function authHeaders(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };
}

async function responseJson(res: Response): Promise<PixBlackCharge | null> {
  try {
    const value: unknown = await res.json();
    return value && typeof value === "object" ? (value as PixBlackCharge) : null;
  } catch {
    return null;
  }
}

/** Teste estritamente read-only: consulta um UUID vazio documentado como inexistente; não cria cobrança. */
export async function testPixBlackApiKey(): Promise<{
  ok: boolean;
  status?: number | undefined;
  error?: string | undefined;
  details?: string | undefined;
}> {
  const apiKey = await getPixBlackApiKey();
  if (!apiKey) return { ok: false, error: "Nenhuma chave Pix Black cadastrada" };
  try {
    const res = await fetch(`${PIXBLACK_API}/charges/00000000-0000-0000-0000-000000000000`, {
      headers: authHeaders(apiKey),
      signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
    });
    if (res.ok) {
      return { ok: true, status: res.status, details: "API acessível; nenhum Pix foi criado." };
    }
    if (res.status === 404) {
      return {
        ok: true,
        status: res.status,
        details:
          "API acessível; HTTP 404 esperado para o UUID inexistente. Nenhuma cobrança foi criada.",
      };
    }
    return {
      ok: false,
      status: res.status,
      error:
        res.status === 401
          ? "Chave API recusada pela Pix Black"
          : res.status === 403
            ? "A conta Pix Black não está liberada ou o IP do servidor não está autorizado"
            : `Pix Black respondeu HTTP ${res.status}`,
    };
  } catch {
    return { ok: false, error: "Falha de conexão com a API Pix Black" };
  }
}

function safeIssuePaths(payload: unknown): string[] {
  if (!payload || typeof payload !== "object" || !("issues" in payload)) return [];
  const issues = (payload as { issues?: unknown }).issues;
  if (!Array.isArray(issues)) return [];
  return issues
    .slice(0, 8)
    .map((issue: unknown) => {
      if (!issue || typeof issue !== "object" || !("path" in issue)) return "";
      const path = (issue as { path?: unknown }).path;
      return typeof path === "string" && /^[a-zA-Z0-9_.-]{1,80}$/.test(path) ? path : "";
    })
    .filter(Boolean);
}

/** Cria uma cobrança Pix conforme o contrato oficial. Valor sempre em centavos. */
export async function createPixBlackCharge(o: {
  amount: number;
  customer: { name: string; email: string; cpf: string };
  description: string;
  idempotencyKey?: string | undefined;
}): Promise<{ id: string; qrcode: string; status: string }> {
  if (!Number.isSafeInteger(o.amount) || o.amount < 500 || o.amount > 100_000_000) {
    throw new Error("Pix Black: o valor deve estar entre R$ 5,00 e R$ 1.000.000,00.");
  }
  const idempotencyKey = o.idempotencyKey;
  if (!idempotencyKey || !/^[A-Za-z0-9_-]{8,100}$/.test(idempotencyKey)) {
    throw new Error(
      "Pix Black: chave de idempotência indisponível. Atualize a página antes de iniciar uma nova tentativa.",
    );
  }
  const apiKey = await getPixBlackApiKey();
  if (!apiKey) throw new Error("Pix Black: cadastre a chave API no painel Admin.");

  const body = {
    amount_cents: o.amount,
    description: o.description.trim().slice(0, 140),
    external_reference: idempotencyKey,
    payer: {
      name: o.customer.name.trim().slice(0, 120),
      document: o.customer.cpf.replace(/\D/g, ""),
      email: o.customer.email.trim(),
    },
  };
  const startedAt = Date.now();
  let res: Response;
  try {
    res = await fetch(`${PIXBLACK_API}/charges`, {
      method: "POST",
      headers: {
        ...authHeaders(apiKey),
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Pix Black create network error", {
      durationMs: Date.now() - startedAt,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    throw new Error(
      "Pix Black: falha de conexão; a cobrança pode ter sido criada. Tente novamente nesta página, sem alterar os dados, para reutilizar a mesma chave, ou confirme no painel antes de iniciar outra compra.",
    );
  }

  const json = await responseJson(res);
  const metadata = {
    status: res.status,
    durationMs: Date.now() - startedAt,
    responseKeys: Object.keys(json ?? {}).slice(0, 20),
    issuePaths: safeIssuePaths(json),
  };
  if (!res.ok) {
    console.error("Pix Black create error", metadata);
    if (res.status === 401) throw new Error("Pix Black: chave API recusada (HTTP 401).");
    if (res.status === 403) {
      throw new Error(
        "Pix Black: acesso negado (HTTP 403). Verifique se a conta está verificada e se o IP da Vercel está autorizado.",
      );
    }
    if (res.status === 422) {
      throw new Error(
        "Pix Black: a mesma chave de tentativa já foi usada com dados diferentes (HTTP 422). Recarregue e confira o pedido antes de tentar de novo.",
      );
    }
    if (res.status === 429 || res.status === 503 || res.status >= 500) {
      throw new Error(
        `Pix Black: a API respondeu HTTP ${res.status}; o resultado pode ser incerto. Tente novamente nesta página com os mesmos dados ou confirme no painel antes de iniciar outra compra.`,
      );
    }
    const fields = metadata.issuePaths.length ? ` Campos: ${metadata.issuePaths.join(", ")}.` : "";
    throw new Error(
      `Pix Black: requisição recusada (HTTP ${res.status}). Verifique os dados.${fields}`,
    );
  }

  const chargeId = json?.id;
  const copyPaste = json?.pix?.copy_paste;
  if (
    typeof chargeId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chargeId)
  ) {
    console.error("Pix Black response missing charge id", metadata);
    throw new Error(
      `Pix Black: resposta HTTP ${res.status} sem ID da cobrança. Confirme no painel antes de tentar novamente.`,
    );
  }
  if (typeof copyPaste !== "string" || !copyPaste.trim()) {
    console.error("Pix Black response missing Pix code", metadata);
    throw new Error(
      `Pix Black: resposta HTTP ${res.status} sem pix.copy_paste. Confirme no painel antes de tentar novamente.`,
    );
  }
  const responseAmount = Number(json?.amount_cents);
  if (!Number.isSafeInteger(responseAmount) || responseAmount !== o.amount) {
    console.error("Pix Black response amount mismatch", {
      ...metadata,
      expectedCents: o.amount,
      receivedCents: Number.isSafeInteger(responseAmount) ? responseAmount : null,
    });
    throw new Error(
      "Pix Black: o valor retornado não corresponde ao pedido. Não pague este Pix; confirme com o suporte da loja.",
    );
  }
  return {
    id: String(chargeId),
    qrcode: copyPaste.trim(),
    status: String(json?.status ?? "pending").toLowerCase(),
  };
}

/** Consulta o estado real autenticado; o corpo do webhook nunca é prova suficiente de pagamento. */
export async function pixBlackStatus(id: string): Promise<{ status: string; amount: number }> {
  const apiKey = await getPixBlackApiKey();
  if (!apiKey) throw new Error("Pix Black: chave API não configurada.");
  const res = await fetch(`${PIXBLACK_API}/charges/${encodeURIComponent(id)}`, {
    headers: authHeaders(apiKey),
    signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
  });
  const json = await responseJson(res);
  if (!res.ok) throw new Error(`Pix Black respondeu HTTP ${res.status} ao consultar a cobrança.`);
  const amountValue = Number(json?.amount_cents ?? 0);
  return {
    status: String(json?.status ?? "pending").toLowerCase(),
    amount: Number.isSafeInteger(amountValue) && amountValue >= 0 ? amountValue : 0,
  };
}

/** Assinatura documentada: HMAC-SHA256(segredo, `<t>.<corpo bruto>`), janela de 300 segundos. */
export function verifyPixBlackWebhookSignature(
  rawBody: Uint8Array,
  header: string | null,
  secret: string,
  nowMs = Date.now(),
): boolean {
  if (!header || !secret) return false;
  const tRaw = /(?:^|,)\s*t=(\d+)(?:,|$)/.exec(header)?.[1];
  const signature = /(?:^|,)\s*v1=([a-f0-9]{64})(?:,|$)/i.exec(header)?.[1];
  if (!tRaw || !signature) return false;
  const timestamp = Number(tRaw);
  if (!Number.isSafeInteger(timestamp)) return false;
  if (Math.abs(Math.floor(nowMs / 1000) - timestamp) > 300) return false;

  const expected = createHmac("sha256", secret).update(`${tRaw}.`).update(rawBody).digest();
  const received = Buffer.from(signature, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function isPixBlackOrderId(id: string): boolean {
  return id.startsWith(PIXBLACK_ORDER_PREFIX);
}
