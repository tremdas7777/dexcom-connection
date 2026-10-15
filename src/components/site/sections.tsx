import { Link } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import {
  availableBundles as bundleData,
  brl as fmt,
  bundleDurationLabel,
  FREE_SHIPPING_LABEL,
  SENSOR_DAYS,
  SENSORS_PER_MONTH,
} from "@/lib/bundles";
import { homeImages } from "@/lib/product-images";
import { StoreImage } from "@/components/site/StoreImage";
import { trackCheckoutClick } from "@/lib/analytics";
import useApplication from "@/assets/g7-use-application.webp";
import useFaq from "@/assets/g7-use-faq.webp";
import usePlacement from "@/assets/g7-use-placement.webp";
import useCare from "@/assets/g7-use-care.webp";

const { bannerWide, heroSensor, appIphone, lifestyleRunning } = homeImages;

/* ---------- Editorial immersive banner ---------- */
export function EditorialBanner() {
  return (
    <section className="relative w-full">
      <div className="relative w-full">
        <StoreImage
          srcMobile={bannerWide.mobile}
          srcDesktop={bannerWide.desktop}
          alt="Dexcom G7 — à prova d'água, no seu dia a dia"
          variant="section-banner"
          bg={brand.colors.primaryDeep}
          loading="lazy"
        />
      </div>
      <div className="container-edge py-10 md:py-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <span className="eyebrow text-[var(--ink)]/60">
          Planos de 1 a 3 meses · 2 sensores por mês · {brand.sensorDays} dias por sensor · IP28
        </span>
        <div className="flex items-center gap-4">
          <span className="rule" />
          <Link
            to="/produto"
            className="text-xs font-bold uppercase tracking-[0.18em] hover:text-[var(--primary)] transition-colors"
          >
            Conhecer o sensor
          </Link>
        </div>
      </div>
    </section>
  );
}


/* ---------- Hero — 8/4 editorial split, oversized serif ---------- */
export function Hero() {
  return (
    <section className="pt-28 sm:pt-32 md:pt-44 lg:pt-48 pb-16 md:pb-28">
      <div className="container-edge">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end">
          <div className="lg:col-span-8 fade-up">
            <span className="eyebrow text-[var(--primary)] mb-5 sm:mb-6 block">
              {brand.tagline}
            </span>
            <h1 className="font-display text-[2.75rem] sm:text-6xl md:text-8xl lg:text-[10rem] leading-[0.9] tracking-tight text-balance">
              Monitoramento <br />contínuo de <br />
              <span className="italic">glicose.</span>
            </h1>
          </div>
          <div className="lg:col-span-4 pb-2 fade-up" style={{ animationDelay: "120ms" }}>
            <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-[var(--ink)]/70 mb-8 sm:mb-10 max-w-sm">
              Tecnologia clínica de ponta agora disponível para sua rotina. Dados em tempo real, sem interrupções.
            </p>
            <div className="flex items-center gap-6">
              <span className="rule" />
              <a href="#tecnologia" className="text-xs font-bold uppercase tracking-[0.18em] hover:text-[var(--primary)] transition-colors">
                Ver como funciona
              </a>
            </div>
            <div className="mt-12 hidden lg:block">
              <StoreImage
                srcMobile={heroSensor.mobile}
                srcDesktop={heroSensor.desktop}
                alt="Sensor Dexcom G7"
                variant="section-content"
                bg={brand.colors.surfaceTint}
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Hero figure on mobile/tablet — full image, no cropping */}
        <div className="lg:hidden mt-12 sm:mt-16">
          <StoreImage
            srcMobile={heroSensor.mobile}
            srcDesktop={heroSensor.desktop}
            alt="Dexcom G7 na parte de trás do braço"
            variant="section-content"
            bg={brand.colors.surfaceTint}
          />
        </div>
      </div>
    </section>
  );
}

const trustItems = [
  {
    title: "Compra segura",
    text: "Checkout externo conectado à Shopify, com ambiente protegido para finalizar seu pedido.",
  },
  {
    title: "Frete grátis",
    text: "Envio com rastreamento para todo o Brasil, sem custo nas compras acima de R$ 200.",
  },
  {
    title: "Garantia de 7 dias",
    text: "Você tem direito de arrependimento conforme o Código de Defesa do Consumidor.",
  },
  {
    title: "Suporte humano",
    text: "Ajuda para escolher o plano, acompanhar envio e tirar dúvidas sobre o uso do sensor.",
  },
] as const;

export function TrustProofSection() {
  return (
    <section className="border-y border-[rgba(13,13,13,0.08)] bg-white py-12 md:py-16">
      <div className="container-edge">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-[rgba(13,13,13,0.08)] bg-[rgba(13,13,13,0.08)] md:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.title} className="bg-white p-6 md:p-7">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                {item.title}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]/65">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const idealFor = [
  "Quer acompanhar picos e quedas de glicose durante o dia.",
  "Busca reduzir picadas de rotina e ter mais praticidade.",
  "Deseja entender como alimentação, treino e sono afetam a glicose.",
  "Precisa de alertas e histórico organizado para conversar com profissionais.",
] as const;

export function IdealForSection() {
  return (
    <section className="bg-[var(--paper)] py-20 md:py-28">
      <div className="container-edge grid gap-10 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <span className="eyebrow text-[var(--primary)]">Para quem é indicado</span>
          <h2 className="mt-5 font-display text-4xl md:text-6xl leading-tight text-balance">
            Mais clareza para quem precisa acompanhar a glicose de perto.
          </h2>
        </div>
        <div className="lg:col-span-7">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-[rgba(13,13,13,0.08)] bg-[rgba(13,13,13,0.08)] sm:grid-cols-2">
            {idealFor.map((item, index) => (
              <div key={item} className="bg-white p-7">
                <span className="font-display text-4xl italic text-[var(--primary)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-5 text-sm md:text-base leading-relaxed text-[var(--ink)]/75">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs leading-relaxed text-[var(--ink)]/45">
            O {brand.productShort} apoia o acompanhamento glicêmico, mas não substitui orientação médica individual.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section header (numbered editorial) ---------- */
function NumberedHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4 md:gap-6 mb-16 md:mb-24">
      <span className="font-display italic text-4xl md:text-6xl text-[var(--ink)]/80">{number} —</span>
      <h2 className="font-display text-4xl md:text-6xl text-balance">{title}</h2>
    </div>
  );
}

/* ---------- 01 — A Jornada Clínica (How it works) ---------- */
const steps = [
  { n: "01", title: "Aplique em segundos", text: "Sensor discreto para a parte de trás do braço, com aplicador de botão único e uso simples desde o primeiro dia." },
  { n: "02", title: "Conecte ao app", text: "Pareie no app Dexcom G7 e, após 30 minutos de aquecimento, as leituras chegam ao celular por Bluetooth." },
  { n: "03", title: "Veja tendências 24h", text: "Leituras a cada 5 minutos com picos, quedas e padrões glicêmicos, sem escanear o sensor." },
  { n: "04", title: "Decida com dados", text: "Use alertas e relatórios do Dexcom Clarity para entender alimentação, exercícios, sono e momentos importantes do dia." },
];

export function HowItWorks() {
  return (
    <section id="tecnologia" className="py-24 md:py-32 border-t border-[rgba(13,13,13,0.1)]">
      <div className="container-edge">
        <NumberedHeader number="01" title="A Jornada Clínica" />
        <div className="grid md:grid-cols-4 gap-10 md:gap-12">
          {steps.map((s) => (
            <div key={s.n} className="group">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink)]/30 group-hover:text-[var(--primary)] transition-colors">
                Passo {s.n}
              </span>
              <h3 className="text-lg md:text-xl font-medium mt-4 mb-4">{s.title}</h3>
              <p className="text-sm text-[var(--ink)]/60 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const usageGuides = [
  {
    src: useApplication,
    alt: "Como aplicar o sensor Dexcom G7 passo a passo",
    title: "Aplicação",
  },
  {
    src: usePlacement,
    alt: "Local de aplicação do sensor Dexcom G7: parte de trás do braço",
    title: "Local de aplicação",
  },
  {
    src: useFaq,
    alt: "Perguntas frequentes sobre o uso do Dexcom G7",
    title: "Dúvidas",
  },
  {
    src: useCare,
    alt: "Cuidados importantes durante o uso do Dexcom G7",
    title: "Cuidados",
  },
] as const;

export function ProductUsageSection() {
  return (
    <section id="como-usar" className="bg-white py-24 md:py-32 border-t border-[rgba(13,13,13,0.1)]">
      <div className="container-edge">
        <div className="mb-12 md:mb-16 max-w-3xl">
          <span className="eyebrow text-[var(--primary)]">Como utilizar o produto</span>
          <h2 className="mt-5 font-display text-4xl md:text-6xl leading-tight text-balance">
            Aplicação simples, conexão pelo app e cuidados no dia a dia.
          </h2>
          <p className="mt-5 text-sm md:text-base leading-relaxed text-[var(--ink)]/65">
            Reunimos em português o passo a passo do {brand.productShort}: aplicação na parte de trás do braço, pareamento
            no app e os cuidados durante os {brand.sensorDays} dias de monitoramento.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {usageGuides.map((guide) => (
            <figure
              key={guide.title}
              className="overflow-hidden rounded-2xl border border-[rgba(13,13,13,0.08)] bg-[var(--paper)]"
            >
              <img
                src={guide.src}
                alt={guide.alt}
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-contain"
              />
              <figcaption className="border-t border-[rgba(13,13,13,0.08)] bg-white px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/50">
                {guide.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 02 — Inteligência Médica (App / Benefits split) ---------- */
const intel = [
  "Alertas personalizáveis de glicose alta e baixa",
  "Gráficos de tendência glicêmica",
  "Relatórios AGP no Dexcom Clarity",
  "Compartilhamento com até 10 seguidores no Dexcom Follow",
  "Dados organizados para uma rotina mais consciente",
];

export function AppSplit() {
  return (
    <section id="ciencia" className="bg-white py-24 md:py-32">
      <div className="container-edge grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        <div className="order-2 lg:order-1 w-full">
          <StoreImage
            srcMobile={appIphone.mobile}
            srcDesktop={appIphone.desktop}
            alt="App Dexcom G7"
            variant="section-full"
            bg="#ffffff"
            loading="lazy"
          />
        </div>
        <div className="order-1 lg:order-2">
          <NumberedHeader number="02" title="Inteligência Médica" />
          <p className="font-display italic text-xl md:text-2xl text-[var(--ink)]/80 mb-12 leading-snug max-w-md">
            "O monitoramento contínuo transforma leituras soltas em uma visão clara da sua rotina glicêmica."
          </p>
          <ul>
            {intel.map((t) => (
              <li key={t} className="flex items-start gap-4 border-b border-[rgba(13,13,13,0.06)] py-6">
                <span className="text-[var(--primary)] font-bold leading-none mt-0.5">+</span>
                <span className="text-xs md:text-sm uppercase tracking-[0.18em] font-semibold">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 03 — Comparison editorial table ---------- */
const compRows = [
  ["Acompanhamento 24h", true, false],
  ["Alertas no celular", true, false],
  ["Tendências e relatórios", true, false],
  ["Sem picadas de rotina", true, false],
  ["Sem escaneamento constante", true, false],
  ["Histórico organizado no app", true, false],
] as const;

export function Comparison() {
  return (
    <section className="py-24 md:py-32 border-t border-[rgba(13,13,13,0.1)]">
      <div className="container-edge">
        <NumberedHeader number="03" title={`${brand.productShort} vs Medição Tradicional`} />
        <p className="mb-10 max-w-2xl text-sm md:text-base leading-relaxed text-[var(--ink)]/65">
          A medição tradicional mostra um momento isolado. O {brand.productShort} ajuda você a enxergar o movimento da glicose ao
          longo do dia, com alertas, gráficos e histórico para entender melhor sua rotina.
        </p>
        <div className="border border-[rgba(13,13,13,0.1)] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink)]/40 py-5 border-b border-[rgba(13,13,13,0.1)]">
            <div>Recurso</div>
            <div className="text-center px-4 md:px-0">{brand.productShort}</div>
            <div className="text-center px-4 md:px-0">Tradicional</div>
          </div>
          {compRows.map(([f, a, b], i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto] md:grid-cols-3 py-6 border-b border-[rgba(13,13,13,0.06)] text-sm md:text-base items-center">
              <div className="font-medium">{f}</div>
              <div className="text-center px-4 md:px-0">
                {a ? <span className="text-[var(--primary)] font-bold">+</span> : <span className="text-[var(--ink)]/30">—</span>}
              </div>
              <div className="text-center px-4 md:px-0">
                {b ? <span className="text-[var(--primary)] font-bold">+</span> : <span className="text-[var(--ink)]/30">—</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 04 — Investimento em Saúde (Plans) ---------- */
export function Plans() {
  return (
    <section id="planos" className="py-24 md:py-32 border-t border-[rgba(13,13,13,0.1)]">
      <div className="container-edge">
        <NumberedHeader number="04" title="Investimento em Saúde" />
        <div className={`grid gap-px bg-[rgba(13,13,13,0.08)] border border-[rgba(13,13,13,0.08)] rounded-xl overflow-hidden ${bundleData.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {bundleData.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col justify-between p-10 md:p-12 transition-all group relative ${
                p.featured
                  ? "bg-[var(--primary)] text-white overflow-hidden shadow-[0_20px_60px_-20px_rgba(46,139,58,0.45)]"
                  : "bg-white hover:bg-[var(--paper)]"
              }`}
            >
              {p.badge && (
                <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.1em] rounded-bl-xl ${
                  p.featured ? "bg-white text-[var(--primary)]" : "bg-[var(--primary)] text-white"
                }`}>
                  {p.badge}
                </div>
              )}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] mb-12">{p.name}</h3>
                <p className="font-display text-5xl md:text-6xl mb-4">{fmt(p.price)}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] opacity-70 mb-3">
                  {bundleDurationLabel(p)}
                </p>
                <p className="text-xs opacity-70 mb-2">{p.dailyCostLabel}</p>
                <p className="text-xs opacity-70 mb-12">
                  {p.monitoringDays} dias de monitoramento contínuo
                </p>
              </div>
              <a
                href={p.checkoutUrl}
                onClick={() =>
                  trackCheckoutClick({
                    source: "home_plans",
                    bundleId: p.id,
                    bundleName: p.name,
                    value: p.price,
                  })
                }
                className={`w-full block text-center py-4 text-xs font-bold uppercase tracking-[0.18em] rounded-xl transition-colors ${
                  p.featured
                    ? "bg-white text-[var(--primary)] hover:bg-[var(--paper)]"
                    : "border border-[rgba(13,13,13,0.2)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)]"
                }`}
              >
                Comprar Agora
              </a>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ---------- 05 — Editorial lifestyle / testimonial ---------- */
export function EditorialQuote() {
  return (
    <section className="bg-white py-24 md:py-32 border-t border-[rgba(13,13,13,0.1)]">
      <div className="container-edge grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 w-full">
          <StoreImage
            srcMobile={lifestyleRunning.mobile}
            srcDesktop={lifestyleRunning.desktop}
            alt="Atleta usando o Dexcom G7"
            variant="section-full"
            loading="lazy"
          />
        </div>
        <div className="lg:col-span-5">
          <span className="eyebrow text-[var(--ink)]/40">Experiência de uso</span>
          <blockquote className="font-display text-3xl md:text-5xl leading-tight mt-6 text-balance">
            "Passei a enxergar padrões que antes eu não percebia. Os alertas e gráficos deixam a rotina muito mais clara."
          </blockquote>
          <div className="mt-10 flex items-center gap-4">
            <span className="rule" />
            <div>
              <div className="text-sm font-semibold">Marina S.</div>
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--ink)]/50">Usa para rotina e treinos</div>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4">
            <Testimonial name="Rafael C." role="Rotina de trabalho" quote="Consigo ver quando a glicose sobe depois das refeições e ajustar meus hábitos com mais consciência." />
            <Testimonial name="Letícia M." role="Acompanhamento pessoal" quote="O app facilita entender tendências e compartilhar informações nas consultas." />
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonial({ name, role, quote }: { name: string; role: string; quote: string }) {
  return (
    <figure className="border-t border-[rgba(13,13,13,0.1)] pt-5">
      <blockquote className="text-sm leading-snug font-medium">"{quote}"</blockquote>
      <figcaption className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/60">
        {name} · {role}
      </figcaption>
    </figure>
  );
}

/* ---------- 06 — FAQ ---------- */
const [plan1m, plan2m, plan3m] = bundleData;

export const faqItems = [
  { q: "O que é um CGM?", a: "CGM (Continuous Glucose Monitor) é um sistema de monitoramento contínuo que mede sua glicose em tempo real, 24 horas por dia." },
  { q: "Como funciona o Dexcom G7?", a: "O sensor é aplicado na parte de trás do braço e envia leituras a cada 5 minutos ao app Dexcom G7 via Bluetooth, sem picadas no dedo e sem necessidade de escaneamento." },
  { q: "Precisa escanear?", a: "Não. As leituras são enviadas continuamente, sem necessidade de aproximar o celular do sensor." },
  {
    q: "Quanto tempo dura cada sensor?",
    a: `Cada sensor Dexcom G7 dura até ${SENSOR_DAYS} dias, com mais 12 horas de tolerância para a troca. O sensor já vem dentro do aplicador de botão único, com adesivo extra (overpatch) incluso.`,
  },
  {
    q: "Por que o kit mínimo tem 2 sensores?",
    a: `Como cada sensor dura ${SENSOR_DAYS} dias, são necessários ${SENSORS_PER_MONTH} sensores para completar 1 mês (${brand.monitoringDaysPerMonth} dias) de monitoramento sem interrupção. Por isso não vendemos kit com apenas 1 sensor.`,
  },
  {
    q: "Qual a diferença entre os planos?",
    a: `Oferecemos 3 planos de monitoramento: 1 mês (${plan1m.sensors} sensores, ${plan1m.monitoringDays} dias) por ${fmt(plan1m.price)}; 2 meses (${plan2m.sensors} sensores, ${plan2m.monitoringDays} dias) por ${fmt(plan2m.price)} — mais vendido; e 3 meses (${plan3m.sensors} sensores, ${plan3m.monitoringDays} dias) por ${fmt(plan3m.price)}.`,
  },
  { q: "O aplicativo funciona em português?", a: "Sim. O aplicativo é totalmente em português brasileiro e disponível para iOS e Android." },
  { q: "Como acompanho minha glicose?", a: "Pelo app Dexcom G7 você visualiza gráficos em tempo real, tendências e alertas; no Dexcom Clarity, relatórios completos." },
  { q: "O sensor é confortável?", a: "Sim. O design discreto e leve permite uso confortável durante todas as atividades diárias." },
  { q: "Posso tomar banho usando o sensor?", a: "Sim. O sensor é à prova d'água (IP28) até 2,4 m de profundidade por até 24 horas — dá para tomar banho, nadar e se exercitar." },
  { q: "Como funciona o envio?", a: `${FREE_SHIPPING_LABEL} com rastreamento para todo o Brasil. Detalhes em nossa política de envio.` },
  { q: "Em quanto tempo recebo?", a: "O prazo médio é de 3 a 7 dias úteis após confirmação do pagamento." },
  { q: "O aplicativo possui alertas?", a: "Sim. Alertas personalizáveis de glicose alta e baixa, além dos alertas de Baixa Urgente e Baixa Urgente em Breve, que prevê uma baixa urgente em até 20 minutos." },
  { q: "Posso compartilhar os dados?", a: "Sim. Pelo app Dexcom Follow você compartilha com até 10 seguidores, e o Dexcom Clarity gera relatórios para levar ao médico." },
];

export function FaqSection({ limit }: { limit?: number }) {
  const items = limit ? faqItems.slice(0, limit) : faqItems;
  return (
    <section className="py-24 md:py-32 border-t border-[rgba(13,13,13,0.1)]">
      <div className="container-edge max-w-4xl">
        <NumberedHeader number="05" title="Perguntas frequentes" />
        <div className="border-t border-[rgba(13,13,13,0.1)]">
          {items.map((item, i) => (
            <details key={i} className="group border-b border-[rgba(13,13,13,0.08)] py-6">
              <summary className="flex justify-between items-center cursor-pointer list-none gap-8">
                <span className="text-sm md:text-base font-medium uppercase tracking-tight">{item.q}</span>
                <span className="text-2xl font-light text-[var(--ink)]/50 group-hover:text-[var(--primary)] transition-colors leading-none">+</span>
              </summary>
              <p className="mt-4 text-sm text-[var(--ink)]/60 leading-relaxed max-w-2xl">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
export function CtaFinal() {
  return (
    <section className="py-32 md:py-48 px-6 md:px-8 text-center bg-[var(--primary)] text-white">
      <div className="container-edge">
        <h2 className="font-display text-5xl md:text-7xl lg:text-9xl mb-12 italic text-balance">
          Escolha seu plano.
        </h2>
        <p className="max-w-md mx-auto text-white/80 mb-12 text-sm md:text-base leading-relaxed">
          Comece com 1 mês de monitoramento ou economize no plano de 2 meses. Todos incluem sensores, app em
          português, frete grátis acima de R$ 200 e compra segura.
        </p>
        <Link
          to="/produto"
          className="inline-block bg-white text-[var(--primary)] px-10 md:px-12 py-5 md:py-6 text-xs md:text-sm font-bold uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] transition-transform"
        >
          Comprar Agora
        </Link>

      </div>
    </section>
  );
}
