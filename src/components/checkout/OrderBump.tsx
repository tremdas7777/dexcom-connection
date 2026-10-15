import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import type { BumpId, OrderBumpItem } from "@/lib/order-bump";
import { cn } from "@/lib/utils";
import { brl } from "./parts";

/** Texto de venda de cada order bump. */
const COPY: Record<
  BumpId,
  { question: string; body: ReactNode; benefits: string[]; cta: (price: string) => string }
> = {
  vivicap: {
    question: "Você vai acompanhar sua glicose com o G7. Mas e a sua insulina, está protegida?",
    body: (
      <>
        Insulina e canetas de GLP-1 perdem efeito no calor{" "}
        <b className="text-foreground">sem mudar de aparência</b>. O resultado aparece depois, como
        picos de glicose sem explicação no seu monitor. O{" "}
        <b className="text-foreground">VIVI Cap</b> é uma tampa térmica que substitui a tampa da
        caneta e protege o medicamento onde você estiver.
      </>
    ),
    benefits: [
      "Encaixa no lugar da tampa da sua caneta de insulina ou GLP-1",
      "Mantém o medicamento na temperatura segura 24h — sem gelo, pilha ou geladeira",
      "Luz verde mostra na hora que a insulina está protegida",
      "Liberado para avião: leve para praia, academia ou carro no sol",
    ],
    cta: (p) => `Sim! Quero proteger minha insulina por + ${p}`,
  },
  adesivos: {
    question: "Cada sensor dura 15 dias. Ele vai ficar firme até o último dia?",
    body: (
      <>
        Suor, banho, piscina e o atrito da roupa fazem o sensor{" "}
        <b className="text-foreground">descolar antes da hora</b> — e um sensor que solta precisa
        ser trocado. Os adesivos cobrem o sensor e o mantêm{" "}
        <b className="text-foreground">no lugar até a troca</b>.
      </>
    ),
    benefits: [
      "À prova d'água: banho, piscina e academia sem preocupação",
      "Segura o sensor firme, sem levantar nas bordas",
      "Transparente e flexível: discreto e confortável na pele",
      "50 unidades: estoque para muitas trocas de sensor",
    ],
    cta: (p) => `Sim! Quero meus 50 adesivos por + ${p}`,
  },
};

/** Surge (aparece e sobe) quando o cliente rola até o elemento. Sem suporte, já fica visível. */
function useReveal(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(!enabled);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof IntersectionObserver === "undefined") return setShown(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);
  return { ref, shown };
}

/** Oferta adicional (order bump) logo acima do botão de finalizar. */
export function OrderBump({
  bump,
  checked,
  onChange,
  reveal = false,
}: {
  bump: OrderBumpItem;
  checked: boolean;
  onChange: (v: boolean) => void;
  /** Surge com animação quando o cliente rola até ele (usado do segundo bump em diante). */
  reveal?: boolean;
}) {
  const { ref, shown } = useReveal(reveal);
  const copy = COPY[bump.id];
  const off = bump.compareAt ? Math.round((1 - bump.price / bump.compareAt) * 100) : 0;
  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden rounded-lg border-2 border-dashed transition-[border-color,background-color,opacity,translate] duration-700 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        checked
          ? "border-[var(--ck-ok)] bg-[var(--ck-ok)]/[0.04]"
          : "border-amber-400 bg-amber-50/60",
      )}
    >
      <div className="bg-amber-400 px-4 py-1.5 text-center text-[12px] font-bold uppercase tracking-wide text-amber-950">
        Oferta exclusiva — só aparece nesta tela
      </div>

      <div className="p-4">
        <p className="text-[14px] font-semibold leading-snug">{copy.question}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{copy.body}</p>

        <div className="mt-4 flex gap-4">
          <img
            src={bump.img}
            alt={bump.fullName}
            width={88}
            height={88}
            loading="lazy"
            className="h-[88px] w-[88px] shrink-0 rounded-md border border-border bg-white object-contain"
          />
          <ul className="space-y-1.5 text-[12.5px] leading-snug">
            {copy.benefits.map((b) => (
              <li key={b} className="flex gap-1.5">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ck-ok)]" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {bump.compareAt && (
            <span className="text-[13px] text-muted-foreground line-through">
              {brl(bump.compareAt)}
            </span>
          )}
          <span className="text-[20px] font-bold text-[var(--ck-ok)]">{brl(bump.price)}</span>
          {off > 0 && (
            <span className="rounded bg-[var(--ck-badge)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--ck-ok)]">
              {off}% OFF
            </span>
          )}
          <span className="w-full text-[12px] text-muted-foreground">
            Vai na mesma caixa do seu G7 — sem frete extra.
          </span>
        </div>

        <label
          className={cn(
            "mt-4 flex cursor-pointer items-center gap-3 rounded-md border-2 px-3 py-3 transition-colors",
            checked
              ? "border-[var(--ck-ok)] bg-white"
              : "border-amber-400 bg-white animate-pulse [animation-duration:2.5s]",
          )}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-[var(--ck-ok)]"
          />
          <span className="text-[13.5px] font-semibold leading-snug">
            {checked
              ? `Adicionado! ${bump.name} incluído no seu pedido.`
              : copy.cta(brl(bump.price))}
          </span>
        </label>
      </div>
    </div>
  );
}
