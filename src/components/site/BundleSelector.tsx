import { Truck } from "lucide-react";
import {
  availableBundles,
  brl,
  isFreeShippingEligible,
  SENSOR_DAYS,
  type BundleId,
} from "@/lib/bundles";

export function BundleSelector({
  selected,
  onSelect,
}: {
  selected: BundleId;
  onSelect: (id: BundleId) => void;
}) {
  return (
    <div className="space-y-3">
      {availableBundles.map((b) => {
        const active = b.id === selected;
        const unitWord = b.months === 1 ? "Unidade" : "Unidades";
        const label = (
          <>
            <strong className="font-semibold">
              {b.months} {unitWord} = {b.sensors} sensores
            </strong>{" "}
            <span className={active ? "text-white/85" : "text-[var(--ink)]/55"}>
              ({SENSOR_DAYS} dias cada) ({b.monitoringDays} dias no total)
            </span>
          </>
        );
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelect(b.id)}
            aria-pressed={active}
            className={`relative w-full text-left rounded-full px-5 md:px-6 py-4 md:py-4 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
              ${
                active
                  ? "bg-[var(--primary)] text-white border border-[var(--primary)] shadow-[0_10px_30px_-12px_rgba(46,139,58,0.5)]"
                  : "bg-white text-[var(--ink)] border border-[rgba(13,13,13,0.12)] hover:border-[var(--primary)]/50"
              }`}
          >
            {b.badge && (
              <span
                className={`absolute -top-2.5 left-5 text-[9px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full ${
                  active
                    ? "bg-white text-[var(--primary)]"
                    : "bg-[var(--primary)] text-white"
                }`}
              >
                {b.badge}
              </span>
            )}

            <div className="flex items-center justify-between gap-4">
              <div className="text-[13px] md:text-sm leading-snug min-w-0">
                {label}
                {/* Mesma regra do checkout: frete grátis a partir de FREE_SHIPPING_MIN. */}
                {isFreeShippingEligible(b.price) && (
                  <span
                    className={`mt-1.5 flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                      active ? "bg-white/20 text-white" : "bg-[var(--primary)]/12 text-[var(--primary)]"
                    }`}
                  >
                    <Truck className="h-3 w-3" aria-hidden /> Frete grátis
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                <div
                  className={`text-sm md:text-base font-bold whitespace-nowrap ${
                    active ? "text-white" : "text-[var(--ink)]"
                  }`}
                >
                  {brl(b.price)}
                </div>
                {b.compareAtPrice && (
                  <div
                    className={`text-[10px] line-through ${
                      active ? "text-white/60" : "text-[var(--ink)]/40"
                    }`}
                  >
                    {brl(b.compareAtPrice)}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
