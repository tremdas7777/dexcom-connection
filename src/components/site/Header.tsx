import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/g7-logo.png";
import { brand } from "@/lib/brand";

const nav = [
  { to: "/#tecnologia", label: "Tecnologia" },
  { to: "/#planos", label: "Planos" },
  { to: "/#ciencia", label: "Ciência" },
  { to: "/faq", label: "FAQ" },
  { to: "/contato", label: "Contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[rgba(13,13,13,0.06)]">
      <div className="container-edge flex items-center justify-between gap-4 py-3 md:py-3.5">
        <Link
          to="/"
          aria-label={brand.name}
          className="flex shrink-0 items-center pl-1 md:pl-2"
        >
          <img
            src={logo}
            alt={brand.name}
            className="h-12 w-auto max-w-[13rem] md:h-14 md:max-w-[17rem] object-contain object-left"
          />
        </Link>

        <nav className="hidden md:flex flex-1 justify-center gap-8 lg:gap-10 text-xs font-medium uppercase tracking-[0.18em]">
          {nav.map((item) => (
            <a
              key={item.label}
              href={item.to}
              className="text-[var(--ink)] hover:text-[var(--primary)] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <Link
            to="/produto"
            className="hidden sm:inline-flex bg-[var(--primary)] text-white px-5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] rounded-xl hover:opacity-90 transition-colors"
          >
            Comprar Agora
          </Link>
          <button
            aria-label="Abrir menu"
            className="md:hidden p-2"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="container-edge flex items-center justify-between py-3 pl-1">
            <img src={logo} alt={brand.name} className="h-12 w-auto max-w-[13rem] object-contain object-left" />
            <button aria-label="Fechar" className="p-2" onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="container-edge mt-8 flex flex-col gap-1">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.to}
                onClick={() => setOpen(false)}
                className="py-5 text-xs font-bold uppercase tracking-[0.2em] border-b border-[rgba(13,13,13,0.08)]"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/produto"
              onClick={() => setOpen(false)}
              className="mt-10 bg-[var(--primary)] text-white py-4 text-center text-xs font-bold uppercase tracking-[0.2em] rounded-xl"
            >
              Comprar Agora
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
