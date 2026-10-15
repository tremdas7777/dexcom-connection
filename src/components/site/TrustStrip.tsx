import { Headphones, Lock, Package, ShieldCheck, Truck } from "lucide-react";
import { FREE_SHIPPING_LABEL } from "@/lib/bundles";

const items = [
  { Icon: Truck, title: "Frete grátis", sub: "Acima de R$ 200" },
  { Icon: Lock, title: "Pagamento seguro", sub: "Criptografia SSL" },
  { Icon: Package, title: "Envio rastreado", sub: "3–7 dias úteis" },
  { Icon: ShieldCheck, title: "Compra protegida", sub: "Checkout seguro" },
  { Icon: Headphones, title: "Suporte", sub: "Especializado CGM" },
] as const;

export function TrustStrip({ compact }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "grid grid-cols-3 gap-2"
          : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      }
    >
      {(compact ? items.slice(0, 3) : items).map(({ Icon, title, sub }) => (
        <div
          key={title}
          className="flex flex-col items-center text-center gap-1.5 rounded-xl border border-[rgba(13,13,13,0.08)] bg-white p-4"
        >
          <Icon className="w-4 h-4 text-[var(--primary)]" strokeWidth={1.5} />
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] leading-tight">
            {title}
          </div>
          <div className="text-[10px] text-[var(--ink)]/50 uppercase tracking-[0.12em] leading-tight">
            {sub}
          </div>
        </div>
      ))}
      {compact && (
        <p className="col-span-3 text-center text-[10px] uppercase tracking-[0.16em] text-[var(--primary)] font-semibold mt-1">
          {FREE_SHIPPING_LABEL}
        </p>
      )}
    </div>
  );
}
