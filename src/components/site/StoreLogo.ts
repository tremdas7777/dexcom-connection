import { getRouteApi } from "@tanstack/react-router";
import defaultLogo from "@/assets/g7-logo.png";
import type { LogoMeta } from "@/lib/logo.functions";

const rootApi = getRouteApi("__root__");

/** Logo enviado no /admin (ou null: a loja usa o logo padrão). */
export function useLogo(): LogoMeta | null {
  return (rootApi.useLoaderData() as { logo?: LogoMeta | null } | undefined)?.logo ?? null;
}

/**
 * Endereço do logo da loja: o enviado no /admin ou, sem ele, o padrão (g7-logo.png).
 * Quem exibe usa altura fixa, largura automática e largura máxima, então qualquer proporção
 * cabe sem distorcer.
 */
export function useLogoSrc(): string {
  const logo = useLogo();
  return logo ? `/api/public/logo?v=${logo.version}` : defaultLogo;
}

export { defaultLogo };
