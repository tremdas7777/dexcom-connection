import { ArrowUpRight } from "lucide-react";
import { getBundle, getUpgradeBundle, brl, bundleDurationLabel, type BundleId } from "@/lib/bundles";
import { trackCheckoutClick } from "@/lib/analytics";

export function PlanUpsell({ selected }: { selected: BundleId }) {
  const current = getBundle(selected);
  const upgrade = getUpgradeBundle(current);
  if (!upgrade) return null;

  const extra = upgrade.price - current.price;

  return (
    <div className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-6 md:p-7">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
        Leve mais monitoramento e economize
      </span>
      <p className="mt-3 text-sm text-[var(--ink)]/75 leading-relaxed">
        Upgrade para <strong>{upgrade.name}</strong> — {bundleDurationLabel(upgrade)}.
        {upgrade.savings && (
          <span className="block mt-1 text-[var(--primary)] font-semibold">{upgrade.savings}</span>
        )}
      </p>
      <a
        href={upgrade.checkoutUrl}
        onClick={() =>
          trackCheckoutClick({
            source: "plan_upsell",
            bundleId: upgrade.id,
            bundleName: upgrade.name,
            value: upgrade.price,
          })
        }
        className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)] hover:opacity-80"
      >
        Adicionar +{upgrade.monitoringDays - current.monitoringDays} dias por {brl(extra)}
        <ArrowUpRight className="w-4 h-4" />
      </a>
    </div>
  );
}
