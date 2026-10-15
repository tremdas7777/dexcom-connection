import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { SiteLayout } from "@/components/site/Layout";
import { HeroBanner } from "@/components/site/HeroBanner";
import {
  HowItWorks, AppSplit, Comparison, Plans, TrustProofSection, IdealForSection, ProductUsageSection,
  EditorialQuote, FaqSection, CtaFinal,
} from "@/components/site/sections";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dexcom G7 15 Dias | Sensor de Glicose Sem Picadas no Dedo | G7" },
      {
        name: "description",
        content:
          "Sensor de glicose Dexcom G7 15 Dias com monitoramento contínuo, alertas em tempo real e leituras a cada 5 minutos no celular. Planos de 1 a 3 meses com kit mínimo de 2 sensores.",
      },
      { property: "og:title", content: "Dexcom G7 15 Dias | Sensor de Glicose Sem Picadas no Dedo" },
      {
        property: "og:description",
        content:
          "CGM Dexcom G7 para acompanhar glicose em tempo real no celular, sem escaneamento constante e com frete grátis acima de R$ 200 para todo o Brasil.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <HeroBanner />
      <SeoIntro />
      <TrustProofSection />
      <IdealForSection />
      <HowItWorks />
      <ProductUsageSection />
      <AppSplit />

      <Comparison />
      <Plans />
      <EditorialQuote />
      <FaqSection limit={6} />
      <CtaFinal />
    </SiteLayout>
  );
}

function SeoIntro() {
  return (
    <section className="border-b border-[rgba(13,13,13,0.08)] bg-white py-12 md:py-16">
      <div className="container-edge max-w-4xl">
        <p className="eyebrow text-[var(--primary)] mb-4">Sensor CGM {brand.productName}</p>
        <h2 className="font-display text-3xl md:text-5xl leading-tight text-balance">
          Monitoramento contínuo de glicose em tempo real, direto no celular.
        </h2>
        <p className="mt-5 text-sm md:text-base leading-relaxed text-[var(--ink)]/70">
          O {brand.productShort} é um sensor de glicose para quem busca acompanhar tendências glicêmicas 24h por dia,
          com leituras a cada 5 minutos, alertas personalizáveis e uso sem picadas no dedo. Escolha planos de 1 a 3 meses
          com sensores suficientes para monitoramento contínuo.
        </p>
      </div>
    </section>
  );
}
