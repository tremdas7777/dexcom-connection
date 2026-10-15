import {
  Activity,
  Apple,
  Bell,
  LineChart,
  Shield,
  Sparkles,
  UtensilsCrossed,
  Zap,
} from "lucide-react";

const benefits = [
  {
    Icon: LineChart,
    title: "Acompanhamento contínuo",
    text: "Visualize sua glicose 24h por dia com leitura automática em tempo real.",
  },
  {
    Icon: UtensilsCrossed,
    title: "Controle alimentar",
    text: "Entenda como refeições impactam sua glicemia e ajuste sua rotina com dados.",
  },
  {
    Icon: Zap,
    title: "Picos glicêmicos",
    text: "Identifique picos e quedas antes que afetem sua energia e desempenho.",
  },
  {
    Icon: Activity,
    title: "Performance",
    text: "Otimize treinos e recuperação com monitoramento inteligente no dia a dia.",
  },
  {
    Icon: Sparkles,
    title: "Bem-estar",
    text: "Mais tranquilidade com alertas e tendências claras no aplicativo.",
  },
  {
    Icon: Shield,
    title: "Prevenção",
    text: "Decisões baseadas em dados para uma saúde metabólica mais consciente.",
  },
  {
    Icon: Bell,
    title: "Alertas inteligentes",
    text: "Alertas personalizáveis de alta e baixa, incluindo Baixa Urgente em Breve.",
  },
  {
    Icon: Apple,
    title: "Ecossistema integrado",
    text: "App em português, compartilhamento no Dexcom Follow e relatórios no Dexcom Clarity.",
  },
] as const;

export function PremiumBenefits({ id }: { id?: string }) {
  return (
    <section id={id} className="py-20 md:py-28 bg-white border-t border-[rgba(13,13,13,0.06)]">
      <div className="container-edge">
        <div className="max-w-2xl mb-14 md:mb-16">
          <span className="eyebrow text-[var(--primary)]">Tecnologia CGM</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 leading-[0.95] text-balance">
            Saúde inteligente, <span className="italic">dados em tempo real.</span>
          </h2>
          <p className="mt-5 text-[var(--ink)]/65 leading-relaxed">
            Monitoramento contínuo de glicose com a precisão e a experiência que você espera de um dispositivo médico premium.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {benefits.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-[rgba(13,13,13,0.08)] bg-[var(--paper)] p-6 md:p-7 hover:border-[var(--primary)]/25 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-5">
                <Icon className="w-5 h-5 text-[var(--primary)]" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] mb-2">{title}</h3>
              <p className="text-sm text-[var(--ink)]/60 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
