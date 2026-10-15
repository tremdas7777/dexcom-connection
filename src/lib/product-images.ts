import imgPlan30 from "@/assets/g7-plan-30.webp";
import imgPlan60 from "@/assets/g7-plan-60.webp";
import imgPlan90 from "@/assets/g7-plan-90.webp";
import imgProdReports from "@/assets/g7-prod-reports.webp";
import imgProdBluetooth from "@/assets/g7-prod-bluetooth.webp";
import imgProdWater from "@/assets/g7-prod-water.webp";
import imgProdFeatures from "@/assets/g7-prod-features.webp";
import bannerStoreMobile from "@/assets/g7-banner-mobile.webp";
import bannerStoreDesktop from "@/assets/g7-banner-desktop.jpg";
import { brand } from "@/lib/brand";
import type { BundleId } from "@/lib/bundles";

export type BannerSlide = {
  mobile: string;
  desktop: string;
  alt: string;
  caption: string;
  bg: string;
};

/** Único banner da loja — desktop (horizontal) + mobile (vertical) */
export const bannerGallery: BannerSlide[] = [
  {
    mobile: bannerStoreMobile,
    desktop: bannerStoreDesktop,
    alt: "Dexcom G7 15 Dias — glicose em tempo real, sem picadas no dedo",
    caption: "15 dias + 12h de tolerância · À prova d'água",
    bg: "#EEF8EF",
  },
];

export type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
  /** Fundo do quadro (ex.: #ffffff para foto em fundo branco) */
  bg?: string;
};

/** Foto principal de cada plano — troca quando o cliente escolhe outro plano */
export const planImages: Record<BundleId, GalleryItem> = {
  "30": {
    src: imgPlan30,
    alt: "Dexcom G7 — plano mensal com 2 sensores para 30 dias",
    caption: "Plano mensal · 2 sensores",
    bg: "#ffffff",
  },
  "60": {
    src: imgPlan60,
    alt: "Dexcom G7 — plano de 2 meses com 4 sensores para 60 dias",
    caption: "Plano de 2 meses · 4 sensores",
    bg: "#ffffff",
  },
  "90": {
    src: imgPlan90,
    alt: "Dexcom G7 — plano de 3 meses com 6 sensores para 90 dias",
    caption: "Plano de 3 meses · 6 sensores",
    bg: "#ffffff",
  },
};

/** Galeria produto — foto do plano mensal + artes de marketing */
export const productGallery: GalleryItem[] = [
  planImages["30"],
  {
    src: imgProdFeatures,
    alt: "Dexcom G7 — sem picadas no dedo, sem calibração obrigatória, 15 dias de uso",
    caption: "Sem picadas · Sem calibração obrigatória",
  },
  {
    src: imgProdReports,
    alt: "App Dexcom G7 e Dexcom Clarity — relatórios AGP e tempo no alvo",
    caption: "Relatórios e AGP completos",
  },
  {
    src: imgProdBluetooth,
    alt: "Dexcom G7 — leituras automáticas a cada 5 minutos, sem escanear",
    caption: "Leituras a cada 5 minutos, sem escanear",
  },
  {
    src: imgProdWater,
    alt: "Dexcom G7 — à prova d'água até 2,4 m por 24 horas",
    caption: "À prova d'água · até 2,4 m por 24h",
  },
];

export const productHeroImage = imgPlan30;
export const productKitImage = imgPlan30;

export const homeImages = {
  bannerWide: { mobile: bannerStoreMobile, desktop: bannerStoreDesktop },
  heroSensor: { mobile: imgPlan30, desktop: imgPlan30 },
  appIphone: { mobile: imgProdReports, desktop: imgProdReports },
  lifestyleRunning: { mobile: imgProdBluetooth, desktop: imgProdBluetooth },
  lifestyleFood: { mobile: imgProdFeatures, desktop: imgProdFeatures },
} as const;
