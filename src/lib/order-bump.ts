import imgAdesivos from "@/assets/adesivos-sensor.webp";

/** Order bumps do checkout. Preços usados no servidor — o cliente só exibe. */
export const BUMP_IDS = ["vivicap", "adesivos"] as const;
export type BumpId = (typeof BUMP_IDS)[number];

export type OrderBumpItem = {
  id: BumpId;
  name: string;
  fullName: string;
  /** Nome genérico enviado ao gateway (fatura). */
  gatewayName: string;
  price: number;
  /** Preço "de" (riscado). Sem ele, a oferta mostra só o preço. */
  compareAt?: number;
  img: string;
};

export const ORDER_BUMPS: readonly OrderBumpItem[] = [
  {
    id: "vivicap",
    name: "VIVI Cap",
    fullName: "VIVI Cap — Protetor Térmico de Insulina",
    gatewayName: "Glicomax Cap",
    price: 47.9,
    compareAt: 119.9,
    img: "https://descontovivcarp.tempramedbr.shop/__l5e/assets-v1/df7109a7-fa04-414d-a793-e02b5cca8e76/taper1.webp",
  },
  {
    id: "adesivos",
    name: "50 Adesivos do sensor",
    fullName: "50 Adesivos à Prova d'Água compatíveis com o Sensor Dexcom G7",
    gatewayName: "Glicomax Adesivo",
    price: 29.9,
    img: imgAdesivos,
  },
];

/** Bumps escolhidos, na ordem do checkout (ids repetidos ou desconhecidos são ignorados). */
export const getBumps = (ids: readonly string[]) => ORDER_BUMPS.filter((b) => ids.includes(b.id));

/** Soma dos bumps escolhidos, em reais. */
export const bumpsTotal = (ids: readonly string[]) =>
  Math.round(getBumps(ids).reduce((s, b) => s + b.price * 100, 0)) / 100;
