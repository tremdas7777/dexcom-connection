/** Marca da loja — G7, revendedor independente de sensores Dexcom G7 */
export const brand = {
  name: "G7",
  productName: "Dexcom G7 15 Dias",
  productShort: "Dexcom G7",
  tagline: "Sistema de Monitoramento Contínuo de Glicose",
  taglineShort: "Monitoramento em Tempo Real",
  /** Aviso de marca — mostrar no rodapé e na página Sobre */
  legalNotice:
    "Loja independente, revendedora autorizada. Não somos a Dexcom, Inc. Dexcom e Dexcom G7 são marcas registradas da Dexcom, Inc.",
  email: "contato@lojag7.com.br",
  whatsapp: {
    /** Número em E.164 (DDI + DDD + número), sem símbolos */
    phoneE164: "5511962460743",
    display: "(11) 96246-0743",
  },
  sensorDays: 15,
  /** Mínimo por kit — 2 sensores cobrem 30 dias de monitoramento contínuo */
  sensorsPerMonth: 2,
  monitoringDaysPerMonth: 30,
  colors: {
    primary: "#3FAE49",
    primaryDark: "#2E8B3A",
    primaryDeep: "#1F6B2B",
    onPrimary: "#ffffff",
    surfaceTint: "#EEF8EF",
  },
} as const;
