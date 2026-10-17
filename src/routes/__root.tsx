import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useAntiCopy } from "@/hooks/useAntiCopy";
import { useTrackPageView } from "@/hooks/useTrackPageView";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { getLogoMeta } from "@/lib/logo.functions";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: import("@tanstack/react-router").ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "G7 | Sensor de Glicose Dexcom G7 15 Dias e Monitoramento Contínuo" },
      {
        name: "description",
        content:
          "G7, revendedora autorizada do sensor de glicose Dexcom G7 15 Dias para monitoramento contínuo em tempo real. Sem picadas no dedo, alertas personalizáveis e planos de 1 a 3 meses.",
      },
      {
        name: "keywords",
        content:
          "sensor de glicose, monitoramento contínuo de glicose, sensor sem picada, Dexcom G7, Dexcom G7 15 Dias, CGM, glicose em tempo real",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:site_name", content: "G7" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#3FAE49" },
      { property: "og:title", content: "G7 | Sensor de Glicose Dexcom G7 15 Dias e Monitoramento Contínuo" },
      { name: "twitter:title", content: "G7 | Sensor de Glicose Dexcom G7 15 Dias e Monitoramento Contínuo" },
      {
        property: "og:description",
        content:
          "Monitoramento contínuo de glicose em tempo real com o Dexcom G7 15 Dias, sensor CGM com alertas no celular, leituras a cada 5 minutos e planos com frete grátis acima de R$ 200.",
      },
      {
        name: "twitter:description",
        content:
          "Monitoramento contínuo de glicose em tempo real com o Dexcom G7 15 Dias, sensor CGM com alertas no celular, leituras a cada 5 minutos e planos com frete grátis acima de R$ 200.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
    scripts: [
      {
        type: "text/javascript",
        // Pixel UTMify (pixelId 6ad2e91c5b410252850b8b8c). Os eventos da Meta saem pela UTMify;
        // pixel da Meta direto no site só se for cadastrado no /admin.
        children: `(function(){if(document.querySelector('script[src*="cdn.utmify.com.br/scripts/pixel/pixel.js"]'))return;window.pixelId="6ad2e91c5b410252850b8b8c";var s=document.createElement("script");s.src="https://cdn.utmify.com.br/scripts/pixel/pixel.js";s.async=true;s.defer=true;(document.head||document.documentElement).appendChild(s);})();`,
      },
    ],
  }),
  // Logo enviado no /admin: só a versão e o tamanho (a imagem vem de /api/public/logo).
  // Sem banco ou sem logo, a loja usa o logo padrão.
  loader: async () => ({ logo: await getLogoMeta().catch(() => null) }),
  staleTime: 5 * 60_000,
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useAntiCopy();
  useTrackPageView();
  useMetaPixel();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <WhatsAppFloat />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
