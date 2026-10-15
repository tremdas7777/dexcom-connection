import imgProdKit from "@/assets/g7-prod-kit.webp";
import imgProdReports from "@/assets/g7-prod-reports.webp";
import imgProdBluetooth from "@/assets/g7-prod-bluetooth.webp";
import imgProdWater from "@/assets/g7-prod-water.webp";
import imgProdFeatures from "@/assets/g7-prod-features.webp";
import bannerStoreMobile from "@/assets/g7-banner-mobile.webp";
import bannerStoreDesktop from "@/assets/g7-banner-desktop.jpg";
import { brand } from "@/lib/brand";

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

/** Galeria produto — kit principal + artes de marketing */
export const productGallery: GalleryItem[] = [
  {
    src: imgProdKit,
    alt: "Dexcom G7 15 Dias — caixa com sensor e aplicador",
    caption: "Monitoramento sem calibração",
    bg: "#ffffff",
  },
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

export const productHeroImage = imgProdKit;
export const productKitImage = imgProdKit;

export const homeImages = {
  bannerWide: { mobile: bannerStoreMobile, desktop: bannerStoreDesktop },
  heroSensor: { mobile: imgProdKit, desktop: imgProdKit },
  appIphone: { mobile: imgProdReports, desktop: imgProdReports },
  lifestyleRunning: { mobile: imgProdBluetooth, desktop: imgProdBluetooth },
  lifestyleFood: { mobile: imgProdFeatures, desktop: imgProdFeatures },
} as const;
