import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { FaqSection, CtaFinal } from "@/components/site/sections";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Perguntas Frequentes | Sensor de Glicose Dexcom G7" },
      {
        name: "description",
        content:
          "Tire dúvidas sobre o sensor de glicose Dexcom G7 15 Dias: duração de cada sensor, monitoramento contínuo, app em português, envio, garantia e planos.",
      },
      { property: "og:title", content: "Perguntas frequentes sobre o sensor Dexcom G7" },
      {
        property: "og:description",
        content: "Saiba como funciona o monitoramento contínuo de glicose Dexcom G7, os planos e o envio.",
      },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: () => (
    <SiteLayout>
      <FaqSection />
      <CtaFinal />
    </SiteLayout>
  ),
});
