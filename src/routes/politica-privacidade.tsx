import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";
import { brand } from "@/lib/brand";

export const Route = createFileRoute("/politica-privacidade")({
  head: () => ({
    meta: [
      { title: `Política de Privacidade | ${brand.name}` },
      { name: "description", content: `Como a ${brand.name} protege seus dados pessoais e de saúde.` },
      { property: "og:title", content: "Política de Privacidade" },
      { property: "og:description", content: `Proteção de dados ${brand.name}.` },
      { property: "og:url", content: "/politica-privacidade" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/politica-privacidade" }],
  }),
  component: () => (
    <PolicyPage title="Política de Privacidade" intro={`A ${brand.name} respeita e protege os seus dados de acordo com a LGPD.`}>
      <h2>Dados coletados</h2>
      <p>Coletamos apenas os dados necessários para processar pedidos, enviar produtos e oferecer suporte.</p>
      <h2>Uso dos dados</h2>
      <ul>
        <li>Processamento de pedidos e pagamentos</li>
        <li>Envio dos produtos e comunicação transacional</li>
        <li>Suporte ao cliente</li>
      </ul>
      <h2>Segurança</h2>
      <p>Utilizamos criptografia, SSL e provedores certificados para proteger suas informações.</p>
      <h2>Seus direitos</h2>
      <p>Você pode solicitar acesso, correção ou exclusão de seus dados pelo email {brand.email}.</p>
    </PolicyPage>
  ),
});
