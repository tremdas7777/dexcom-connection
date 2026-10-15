// Nome do produto enviado ao gateway (Pix e cartão). Somente servidor.
// Fica salvo no banco (private_settings) e é trocado pelo /admin.
export const DEFAULT_GATEWAY_PRODUCT_NAME = "Glicomax";

const KEY = "gateway_product_name";

export async function getGatewayProductName(): Promise<string> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("private_settings").select("value").eq("key", KEY).maybeSingle();
    return data?.value?.trim() || DEFAULT_GATEWAY_PRODUCT_NAME;
  } catch {
    // Sem banco não trava a venda: usa o nome padrão.
    return DEFAULT_GATEWAY_PRODUCT_NAME;
  }
}

export async function saveGatewayProductName(name: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("private_settings")
    .upsert({ key: KEY, value: name, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}
