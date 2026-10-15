import { brand } from "@/lib/brand";

/** Plano de monitoramento em dias (30 / 60 / 90) */
export type BundleId = "30" | "60" | "90";

export const SENSOR_DAYS = brand.sensorDays;
export const SENSORS_PER_MONTH = brand.sensorsPerMonth;
/** Valor mínimo (produtos, sem frete) para liberar o frete grátis. */
export const FREE_SHIPPING_MIN = 200;
export const FREE_SHIPPING_LABEL = `Frete grátis em compras acima de R$ ${FREE_SHIPPING_MIN}`;

export const isFreeShippingEligible = (subtotal: number) => subtotal >= FREE_SHIPPING_MIN;

/** Selo de frete por plano: grátis quando o próprio plano já passa do mínimo. */
export const bundleShippingLabel = (b: { price: number }) =>
  isFreeShippingEligible(b.price) ? "Frete grátis para todo o Brasil" : FREE_SHIPPING_LABEL;

const LEGACY_IDS: Record<string, BundleId> = {
  "1": "30",
  "2": "60",
  "3": "90",
};

export type Bundle = {
  id: BundleId;
  name: string;
  months: number;
  sensors: number;
  monitoringDays: number;
  price: number;
  compareAtPrice?: number;
  dailyCostLabel: string;
  description: string;
  checkoutProductName: string;
  checkoutProductDescription: string;
  checkoutUrl: string;
  featured?: boolean;
  badge?: string;
  savings?: string;
};

export const bundles: Bundle[] = [
  {
    id: "30",
    name: "1 Mês de Monitoramento",
    months: 1,
    sensors: 2,
    monitoringDays: 30,
    price: 180,
    dailyCostLabel: "Apenas R$6 por dia",
    description: "2 sensores CGM · 30 dias de monitoramento contínuo",
    checkoutProductName: `${brand.productName} — 1 Mês · 2 Sensores · 30 dias`,
    checkoutProductDescription:
      `${brand.productName}: monitoramento contínuo de glicose por 30 dias com 2 sensores CGM (${SENSOR_DAYS} dias cada). Leituras automáticas a cada 5 minutos, alertas personalizáveis, app em português, relatórios AGP. Sem picadas no dedo e sem calibração obrigatória. À prova d'água (IP28). ${FREE_SHIPPING_LABEL}.`,
    checkoutUrl: "/checkout?plano=30",
  },
  {
    id: "60",
    name: "2 Meses de Monitoramento",
    months: 2,
    sensors: 4,
    monitoringDays: 60,
    price: 280,
    // "De": 2 kits de 1 mês comprados separados (2 × R$ 180).
    compareAtPrice: 360,
    dailyCostLabel: "Melhor valor mensal",
    description: "4 sensores CGM · 60 dias de monitoramento contínuo",
    checkoutProductName: `${brand.productName} — 2 Meses · 4 Sensores · 60 dias`,
    checkoutProductDescription:
      `${brand.productName}: 60 dias de acompanhamento glicêmico com 4 sensores CGM. Tecnologia em tempo real, alertas de hipo e hiperglicemia, app completo em português. Frete grátis para todo o Brasil. Melhor custo-benefício entre os planos mensais.`,
    checkoutUrl: "/checkout?plano=60",
    featured: true,
    badge: "Mais vendido",
    savings: "Economize R$80",
  },
  {
    id: "90",
    name: "3 Meses de Monitoramento",
    months: 3,
    sensors: 6,
    monitoringDays: 90,
    price: 360,
    // "De": 3 kits de 1 mês comprados separados (3 × R$ 180).
    compareAtPrice: 540,
    dailyCostLabel: "Maior economia por sensor",
    description: "6 sensores CGM · 90 dias de monitoramento contínuo",
    checkoutProductName: `${brand.productName} — 3 Meses · 6 Sensores · 90 dias`,
    checkoutProductDescription:
      `${brand.productName}: 90 dias de monitoramento contínuo com 6 sensores CGM. Máxima economia por sensor, dados 24h no celular, saúde metabólica inteligente. Frete grátis para todo o Brasil.`,
    checkoutUrl: "/checkout?plano=90",
    badge: "Melhor custo-benefício",
    savings: "Economize R$180",
  },
];

/** Planos visíveis na loja brasileira. */
export const availableBundles = bundles;

export function parseBundleId(raw: string | undefined): BundleId | undefined {
  if (!raw) return undefined;
  if (raw === "30" || raw === "60" || raw === "90") return raw;
  return LEGACY_IDS[raw];
}

export function getBundle(id: string | undefined): Bundle {
  const parsed = parseBundleId(id);
  return availableBundles.find((b) => b.id === parsed) ?? availableBundles[0];
}

export function getCheckoutUrl(id: string | undefined) {
  return getBundle(id).checkoutUrl;
}

/** Próximo plano para upsell (30→60, 60→90) */
export function getUpgradeBundle(current: Bundle): Bundle | null {
  if (current.id === "30") return availableBundles.find((b) => b.id === "60") ?? null;
  if (current.id === "60") return availableBundles.find((b) => b.id === "90") ?? null;
  return null;
}

export function bundleDurationLabel(bundle: Bundle) {
  return `${bundle.sensors} sensores CGM · ${bundle.monitoringDays} dias de monitoramento`;
}

export function bundleMonitoringLabel(bundle: Bundle) {
  return `${bundle.monitoringDays} dias de acompanhamento contínuo · ${bundle.sensors} sensores`;
}

export function bundleTotalDaysLabel(bundle: Bundle) {
  return `${bundle.monitoringDays} dias`;
}

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
