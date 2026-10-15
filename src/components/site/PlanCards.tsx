import { availableBundles, brl, bundleDurationLabel, bundleShippingLabel, type BundleId } from "@/lib/bundles";
import { trackCheckoutClick } from "@/lib/analytics";

type PlanCardsProps = {
  selected?: BundleId;
  onSelect?: (id: BundleId) => void;
  showSelector?: boolean;
};

export function PlanCards({ selected, onSelect, showSelector }: PlanCardsProps) {
  return (
    <div className={`grid gap-4 md:gap-5 ${availableBundles.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {availableBundles.map((p) => {
        const active = showSelector && selected === p.id;
        const Wrapper = showSelector ? "button" : "div";
        const wrapperProps = showSelector
          ? {
              type: "button" as const,
              onClick: () => onSelect?.(p.id),
              "aria-pressed": active,
            }
          : {};

        return (
          <Wrapper
            key={p.id}
            {...wrapperProps}
            className={`relative flex flex-col text-left rounded-2xl p-8 md:p-9 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
              p.featured
                ? "bg-[var(--primary)] text-white shadow-[0_20px_60px_-20px_rgba(46,139,58,0.45)] md:scale-[1.02] z-[1]"
                : "bg-white border border-[rgba(13,13,13,0.1)] hover:border-[var(--primary)]/30"
            } ${active ? "ring-2 ring-[var(--primary)] ring-offset-2" : ""}`}
          >
            {p.badge && (
              <span
                className={`absolute -top-2.5 left-6 text-[9px] font-bold uppercase tracking-[0.16em] px-3 py-1 rounded-full ${
                  p.featured ? "bg-white text-[var(--primary)]" : "bg-[var(--primary)] text-white"
                }`}
              >
                {p.badge}
              </span>
            )}

            <h3
              className={`text-[11px] font-bold uppercase tracking-[0.2em] mb-6 ${
                p.featured ? "text-white/90" : "text-[var(--ink)]/50"
              }`}
            >
              {p.name}
            </h3>

            <p className="font-display text-4xl md:text-5xl leading-none mb-1">{brl(p.price)}</p>
            {p.compareAtPrice && (
              <p className={`text-sm line-through mb-3 ${p.featured ? "text-white/50" : "text-[var(--ink)]/35"}`}>
                {brl(p.compareAtPrice)}
              </p>
            )}

            <p className={`text-xs mb-4 ${p.featured ? "text-white/80" : "text-[var(--ink)]/55"}`}>
              {bundleDurationLabel(p)}
            </p>

            <p
              className={`text-sm font-semibold mb-1 ${p.featured ? "text-white" : "text-[var(--primary)]"}`}
            >
              {p.dailyCostLabel}
            </p>

            <p className={`text-[11px] uppercase tracking-[0.14em] mb-6 ${p.featured ? "text-white/70" : "text-[var(--ink)]/45"}`}>
              {bundleShippingLabel(p)}
            </p>

            {p.savings && (
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.14em] mb-6 ${
                  p.featured ? "text-white" : "text-[var(--primary)]"
                }`}
              >
                {p.savings}
              </p>
            )}

            {!showSelector && (
              <a
                href={p.checkoutUrl}
                onClick={() =>
                  trackCheckoutClick({
                    source: "plan_cards",
                    bundleId: p.id,
                    bundleName: p.name,
                    value: p.price,
                  })
                }
                className={`mt-auto w-full block text-center py-4 text-[11px] font-bold uppercase tracking-[0.18em] rounded-xl transition-colors ${
                  p.featured
                    ? "bg-white text-[var(--primary)] hover:bg-[var(--paper)]"
                    : "bg-[var(--primary)] text-white hover:opacity-90"
                }`}
              >
                Começar monitoramento
              </a>
            )}
          </Wrapper>
        );
      })}
    </div>
  );
}
