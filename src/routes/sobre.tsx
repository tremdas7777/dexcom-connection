import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { homeImages } from "@/lib/product-images";
import { StoreImage } from "@/components/site/StoreImage";
import { brand } from "@/lib/brand";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: `Sobre a ${brand.name} | Revendedora autorizada Dexcom G7` },
      { name: "description", content: `A ${brand.name} é uma loja independente e revendedora autorizada dos sensores Dexcom G7 para monitoramento contínuo de glicose.` },
      { property: "og:title", content: `Sobre a ${brand.name}` },
      { property: "og:description", content: "Loja independente e revendedora autorizada dos sensores Dexcom G7." },
      { property: "og:url", content: "/sobre" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="pt-32 md:pt-44 pb-20">
        <div className="container-edge grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <span className="eyebrow text-[var(--primary)] block mb-6">Sobre</span>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.9] text-balance">
              Tecnologia médica <span className="italic">acessível.</span>
            </h1>
          </div>
          <div className="lg:col-span-4 pb-4">
            <p className="text-lg text-[var(--ink)]/70 leading-relaxed">
              Loja independente e revendedora autorizada dos sensores Dexcom G7 — compra segura, envio rastreado e atendimento humano.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(13,13,13,0.1)]">
        <div className="container-edge py-16">
          <StoreImage
            srcMobile={homeImages.lifestyleRunning.mobile}
            srcDesktop={homeImages.lifestyleRunning.desktop}
            alt="Pessoa usando o Dexcom G7 no dia a dia"
            variant="section-banner"
            bg={brand.colors.surfaceTint}
            loading="lazy"
          />
        </div>
      </section>

      <section className="py-24 border-t border-[rgba(13,13,13,0.1)]">
        <div className="container-edge grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <span className="font-display italic text-5xl text-[var(--ink)]/80">01 —</span>
            <h2 className="font-display text-4xl md:text-5xl mt-4">Missão</h2>
          </div>
          <p className="lg:col-span-8 text-lg text-[var(--ink)]/70 leading-relaxed">
            Facilitar o acesso dos brasileiros ao sensor Dexcom G7, com compra simples, entrega rápida e orientação clara para um acompanhamento contínuo da glicose.
          </p>
        </div>
      </section>

      <section className="py-24 border-t border-[rgba(13,13,13,0.1)]">
        <div className="container-edge grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <span className="font-display italic text-5xl text-[var(--ink)]/80">02 —</span>
            <h2 className="font-display text-4xl md:text-5xl mt-4">Valores</h2>
          </div>
          <p className="lg:col-span-8 text-lg text-[var(--ink)]/70 leading-relaxed">
            Transparência, atendimento humano, produto original e responsabilidade com a saúde de cada pessoa que confia na {brand.name}.
          </p>
          <p className="lg:col-span-8 lg:col-start-5 text-xs text-[var(--ink)]/50 leading-relaxed">{brand.legalNotice}</p>
        </div>
      </section>
    </SiteLayout>
  );
}
