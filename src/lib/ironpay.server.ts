import { randomBytes, timingSafeEqual } from "node:crypto";

// IronPay API pública: pagamentos Pix. Este módulo só é importado pelo servidor.
// A documentação usa api_token na query string; nunca registar URLs ou respostas com dados pessoais.
export const IRONPAY_API = "https://api.ironpayapp.com.br/api/public/v1";
export const IRONPAY_ORDER_PREFIX = "ip_";

const TOKEN_KEY = "ironpay_api_token";
const OFFER_KEY = "ironpay_offer_hash";
const PRODUCT_KEY = "ironpay_product_hash";
const WEBHOOK_TOKEN_KEY = "ironpay_webhook_token";
const CACHE_MS = 60_000;

type IronPaySettings = {
  apiToken: string | null;
  offerHash: string | null;
  productHash: string | null;
};
type IronPayAddress = {
  street: string;
  number: string;
  complement?: string | undefined;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
};

let settingsCache: { value: IronPaySettings; at: number } | null = null;

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
  settingsCache = null;
}

async function deleteSetting(key: string): Promise<void> {
  const { error } = await (await db()).from("private_settings").delete().eq("key", key);
  if (error) throw new Error(error.message);
  settingsCache = null;
}

export async function getIronPaySettings(): Promise<IronPaySettings> {
  if (settingsCache && Date.now() - settingsCache.at < CACHE_MS) return settingsCache.value;
  const [savedToken, savedOffer, savedProduct] = await Promise.all([
    savedSetting(TOKEN_KEY),
    savedSetting(OFFER_KEY),
    savedSetting(PRODUCT_KEY),
  ]);
  const value = {
    apiToken: savedToken || process.env["IRONPAY_API_TOKEN"] || null,
    offerHash: savedOffer || process.env["IRONPAY_OFFER_HASH"] || null,
    productHash: savedProduct || process.env["IRONPAY_PRODUCT_HASH"] || null,
  };
  settingsCache = { value, at: Date.now() };
  return value;
}

export async function getIronPayApiToken(): Promise<string | null> {
  return (await getIronPaySettings()).apiToken;
}

export async function getIronPayApiTokenSource(): Promise<{
  key: string | null;
  source: "admin" | "secret" | null;
}> {
  const saved = await savedSetting(TOKEN_KEY);
  if (saved) return { key: saved, source: "admin" };
  const env = process.env["IRONPAY_API_TOKEN"] || null;
  return { key: env, source: env ? "secret" : null };
}

export async function getIronPayProductOfferSource(): Promise<{
  offerHash: string | null;
  productHash: string | null;
  offerSource: "admin" | "secret" | null;
  productSource: "admin" | "secret" | null;
}> {
  const [savedOffer, savedProduct] = await Promise.all([
    savedSetting(OFFER_KEY),
    savedSetting(PRODUCT_KEY),
  ]);
  const envOffer = process.env["IRONPAY_OFFER_HASH"] || null;
  const envProduct = process.env["IRONPAY_PRODUCT_HASH"] || null;
  return {
    offerHash: savedOffer || envOffer,
    productHash: savedProduct || envProduct,
    offerSource: savedOffer ? "admin" : envOffer ? "secret" : null,
    productSource: savedProduct ? "admin" : envProduct ? "secret" : null,
  };
}

export async function saveIronPayApiToken(value: string): Promise<void> {
  await saveSetting(TOKEN_KEY, value);
}

export async function deleteIronPayApiToken(): Promise<void> {
  await deleteSetting(TOKEN_KEY);
}

export async function saveIronPayProductOffer(
  offerHash: string,
  productHash: string,
): Promise<void> {
  const [dbClient, now] = await Promise.all([db(), Promise.resolve(new Date().toISOString())]);
  const { error } = await dbClient.from("private_settings").upsert([
    { key: OFFER_KEY, value: offerHash, updated_at: now },
    { key: PRODUCT_KEY, value: productHash, updated_at: now },
  ]);
  if (error) throw new Error(error.message);
  settingsCache = null;
}

export async function deleteIronPayProductOffer(): Promise<void> {
  const { error } = await (
    await db()
  )
    .from("private_settings")
    .delete()
    .in("key", [OFFER_KEY, PRODUCT_KEY]);
  if (error) throw new Error(error.message);
  settingsCache = null;
}

/** URL de retorno confiável: nunca usa a origem fornecida pelo browser. */
export function getIronPayPostbackUrl(): string {
  const raw =
    process.env["IRONPAY_POSTBACK_URL"]?.trim() ||
    "https://www.dexcomg7.store/api/public/pix-webhook?gw=ip";
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("IronPay requer um postback HTTPS.");
  url.searchParams.set("gw", "ip");
  return url.toString();
}

async function ensureIronPayWebhookToken(): Promise<string> {
  const existing = await savedSetting(WEBHOOK_TOKEN_KEY);
  if (existing) return existing;
  const token = randomBytes(32).toString("hex");
  const { error } = await (await db()).from("private_settings").insert({
    key: WEBHOOK_TOKEN_KEY,
    value: token,
    updated_at: new Date().toISOString(),
  });
  if (!error) return token;
  // If another server instance created it simultaneously, use the stored value.
  if (error.code === "23505") {
    const concurrent = await savedSetting(WEBHOOK_TOKEN_KEY);
    if (concurrent) return concurrent;
  }
  throw new Error("IronPay webhook token could not be stored.");
}

export async function verifyIronPayWebhookToken(received: string | null): Promise<boolean> {
  if (!received || !/^[a-f0-9]{64}$/i.test(received)) return false;
  const expected = await savedSetting(WEBHOOK_TOKEN_KEY);
  if (!expected || !/^[a-f0-9]{64}$/i.test(expected)) return false;
  const providedBytes = Buffer.from(received, "hex");
  const expectedBytes = Buffer.from(expected, "hex");
  return (
    providedBytes.length === expectedBytes.length && timingSafeEqual(providedBytes, expectedBytes)
  );
}

function apiUrl(path: string, apiToken: string): URL {
  const url = new URL(`${IRONPAY_API}${path}`);
  url.searchParams.set("api_token", apiToken);
  return url;
}

/** Confere o token com um GET read-only; não cria nem altera transações. */
export async function testIronPayApiToken(): Promise<{
  ok: boolean;
  status?: number | undefined;
  error?: string | undefined;
}> {
  const apiToken = await getIronPayApiToken();
  if (!apiToken) return { ok: false, error: "Nenhum token IronPay cadastrado" };
  try {
    const url = apiUrl("/transactions", apiToken);
    url.searchParams.set("page", "1");
    url.searchParams.set("per_page", "1");
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.ok) return { ok: true, status: res.status };
    return {
      ok: false,
      status: res.status,
      error:
        res.status === 401 || res.status === 403
          ? "Token recusado pela IronPay"
          : `IronPay respondeu HTTP ${res.status}`,
    };
  } catch {
    return { ok: false, error: "Falha de conexão com a API IronPay" };
  }
}

/** Cria uma transação Pix usando apenas o contrato documentado pela IronPay. Valor em centavos. */
export async function createIronPayPix(o: {
  amount: number;
  customer: { name: string; email: string; phone: string; cpf: string };
  address?: IronPayAddress | undefined;
  description: string;
}): Promise<{ id: string; qrcode: string; status: string }> {
  if (!Number.isSafeInteger(o.amount) || o.amount < 1) {
    throw new Error("IronPay: o valor da cobrança deve ser um inteiro positivo em centavos.");
  }
  const settings = await getIronPaySettings();
  if (!settings.apiToken) throw new Error("IronPay: cadastre o token de API no painel Admin.");
  if (!settings.offerHash || !settings.productHash) {
    throw new Error("IronPay: configure os hashes de oferta e produto no painel Admin.");
  }

  const customer = {
    name: o.customer.name,
    email: o.customer.email,
    phone_number: o.customer.phone.replace(/\D/g, ""),
    document: o.customer.cpf.replace(/\D/g, ""),
    ...(o.address
      ? {
          street_name: o.address.street,
          number: o.address.number,
          ...(o.address.complement ? { complement: o.address.complement } : {}),
          neighborhood: o.address.neighborhood,
          city: o.address.city,
          state: o.address.state.toUpperCase(),
          zip_code: o.address.zipcode,
        }
      : {}),
  };
  const postbackUrl = new URL(getIronPayPostbackUrl());
  postbackUrl.searchParams.set("token", await ensureIronPayWebhookToken());
  const payload = {
    amount: o.amount,
    offer_hash: settings.offerHash,
    payment_method: "pix",
    installments: 1,
    customer,
    cart: [
      {
        product_hash: settings.productHash,
        title: o.description,
        price: o.amount,
        quantity: 1,
        operation_type: 1,
        tangible: false,
      },
    ],
    expire_in_days: 1,
    transaction_origin: "api",
    postback_url: postbackUrl.toString(),
  };

  const startedAt = Date.now();
  let res: Response;
  try {
    res = await fetch(apiUrl("/transactions", settings.apiToken), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("IronPay create network error", {
      durationMs: Date.now() - startedAt,
      errorName: e instanceof Error ? e.name : "unknown",
    });
    throw new Error(
      "IronPay: falha de conexão; não é possível confirmar se a cobrança foi criada. Confira o painel IronPay antes de tentar novamente.",
    );
  }

  const rawBody = await res.text().catch(() => "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- payload externo da IronPay sem tipo gerado
  let json: any = null;
  try {
    json = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    // Não guardar nem expor texto/HTML do provedor.
  }
  const transaction = json?.data ?? json;
  const hash = transaction?.hash ?? transaction?.transaction_hash;
  const pixCode = transaction?.pix?.pix_qr_code;
  const metadata = {
    status: res.status,
    durationMs: Date.now() - startedAt,
    responseKeys: Object.keys(transaction ?? {}).slice(0, 20),
    hasHash: !!hash,
    hasPixCode: typeof pixCode === "string" && !!pixCode.trim(),
  };

  if (!res.ok) {
    console.error("IronPay create error", metadata);
    if (res.status >= 500) {
      throw new Error(
        `IronPay: erro do servidor (HTTP ${res.status}); o resultado da cobrança é incerto. Confira o painel IronPay antes de tentar novamente.`,
      );
    }
    throw new Error(
      `IronPay: requisição recusada (HTTP ${res.status}). Verifique o token, os hashes configurados e os dados do checkout.`,
    );
  }
  if (typeof hash !== "string" && typeof hash !== "number") {
    console.error("IronPay create response missing hash", metadata);
    throw new Error(
      `IronPay: resposta HTTP ${res.status} sem hash da transação. Confira o painel IronPay antes de tentar novamente.`,
    );
  }
  if (typeof pixCode !== "string" || !pixCode.trim()) {
    console.error("IronPay create response missing Pix code", metadata);
    throw new Error(
      `IronPay: resposta HTTP ${res.status} sem pix.pix_qr_code. Confira o painel IronPay antes de tentar novamente.`,
    );
  }

  return {
    id: String(hash),
    qrcode: pixCode.trim(),
    status: String(transaction?.payment_status ?? transaction?.status ?? "pending").toLowerCase(),
  };
}

/** Lê o estado real da transação pela API autenticada; o webhook não é uma fonte de pagamento. */
export async function ironPayStatus(hash: string): Promise<{ status: string; amount: number }> {
  const apiToken = await getIronPayApiToken();
  if (!apiToken) throw new Error("IronPay: token de API não configurado.");
  const res = await fetch(apiUrl(`/transactions/${encodeURIComponent(hash)}`, apiToken), {
    headers: { Accept: "application/json" },
  });
  const rawBody = await res.text().catch(() => "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- payload externo da IronPay sem tipo gerado
  let json: any = null;
  try {
    json = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    // A resposta inválida não deve ser registada nem apresentada.
  }
  const transaction = json?.data ?? json;
  if (!res.ok) throw new Error(`IronPay respondeu HTTP ${res.status} ao consultar a transação.`);
  const amountValue = Number(transaction?.amount ?? transaction?.amount_total ?? 0);
  return {
    status: String(transaction?.payment_status ?? transaction?.status ?? "pending").toLowerCase(),
    amount: Number.isSafeInteger(amountValue) && amountValue > 0 ? amountValue : 0,
  };
}

export function isIronPayOrderId(id: string): boolean {
  return id.startsWith(IRONPAY_ORDER_PREFIX);
}
