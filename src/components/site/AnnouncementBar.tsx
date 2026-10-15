import { useEffect, useState } from "react";

const messages = [
  "Frete grátis em compras acima de R$ 200",
  "Plano 2 meses — mais vendido · economize R$80",
  "Kit mínimo: 2 sensores · 1 mês de monitoramento contínuo",
  "App Dexcom G7 em português · iOS e Android",
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="bg-[var(--primary)] text-white"
      role="region"
      aria-label="Anúncio da loja"
      aria-live="polite"
    >
      <p
        key={index}
        className="container-edge truncate py-1.5 text-center text-[9px] font-bold uppercase leading-none tracking-[0.11em] md:py-2 md:text-xs md:tracking-[0.18em] animate-in fade-in duration-500"
        title={messages[index]}
      >
        {messages[index]}
      </p>
    </div>
  );
}
