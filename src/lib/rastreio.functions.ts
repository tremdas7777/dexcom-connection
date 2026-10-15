import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function normalizeCpf(input: string): string {
  return (input || "").replace(/\D/g, "").slice(0, 11);
}

function isValidCpf(cpf: string): boolean {
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  return true;
}

export type RastreioStatus =
  | "pedido_recebido"
  | "postado"
  | "em_transito"
  | "saiu_entrega"
  | "entregue";

export const trackByCpf = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ cpf: z.string().min(11).max(18) }).parse(input))
  .handler(async ({ data }) => {
    const cpf = normalizeCpf(data.cpf);
    if (!isValidCpf(cpf)) {
      throw new Error("CPF inválido. Digite os 11 números.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Pedido pago mais recente desse CPF — de onde vêm o código e o link reais da transportadora (Rotasync).
    const { data: order, error: orderError } = await supabaseAdmin
      .from("pix_orders")
      .select("id, created_at, report_result")
      .filter("customer->>cpf", "eq", cpf)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (orderError) throw new Error(orderError.message);

    const rastro = (order?.report_result as
      | { rastro?: { ok?: boolean; trackingCode?: string; trackingUrl?: string } }
      | null)?.rastro;
    const trackingCode = rastro?.ok ? rastro.trackingCode : undefined;
    const trackingUrl = rastro?.ok ? rastro.trackingUrl : undefined;

    // Lookup by codigo_rastreio = CPF
    const { data: existing, error: trackingError } = await supabaseAdmin
      .from("rastreios")
      .select("*")
      .eq("codigo_rastreio", cpf)
      .maybeSingle();
    if (trackingError) throw new Error(trackingError.message);
    // Consulta não cria pedidos nem inventa movimentações de transporte.
    const row = existing;
    if (!row) throw new Error("Rastreio não encontrado para este CPF.");
    const status = row.status as RastreioStatus;

    return {
      pedido: row.pedido,
      status,
      data_criacao: row.data_criacao,
      data_atualizacao: row.data_atualizacao,
      tracking_code: trackingCode ?? null,
      tracking_url: trackingUrl ?? null,
    };
  });
