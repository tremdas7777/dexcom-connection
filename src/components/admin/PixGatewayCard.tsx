import { Fragment, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deletePixgateKeyFn,
  deleteSagacePayKeyFn,
  deleteUmbrellaKeyFn,
  deleteXPayKeyFn,
  deleteXPayWebhookSecretFn,
  getPixGatewayStatus,
  savePixgateKeyFn,
  saveSagacePayKeyFn,
  saveUmbrellaKeyFn,
  saveXPayKeyFn,
  saveXPayWebhookSecretFn,
  setPixGatewayFn,
  testPixgateFn,
  testSagacePayFn,
  testUmbrellaFn,
  testXPayFn,
} from "@/lib/pix-gateway.functions";
import {
  deleteIronPayApiTokenFn,
  deleteIronPayProductOfferFn as deleteIronPayConfigFn,
  saveIronPayApiTokenFn,
  saveIronPayProductOfferFn,
  testIronPayFn,
} from "@/lib/pix-gateway.functions";

type Gateway = "pixgate" | "umbrella" | "sagacepay" | "xpay" | "ironpay";
const GATEWAYS = ["pixgate", "umbrella", "sagacepay", "xpay", "ironpay"] as const;
type KeyInfo = { key: string | null; source: "admin" | "secret" | null };
type WebhookInfo = { configured: boolean; source: "admin" | "secret" | null };
type IronPayConfigInfo = {
  offerHash: string | null;
  productHash: string | null;
  offerSource: "admin" | "secret" | null;
  productSource: "admin" | "secret" | null;
};
type Status = {
  selected: Gateway;
  active: Gateway;
  configured: Record<Gateway, boolean>;
  keys: Record<Gateway, KeyInfo>;
  webhook: WebhookInfo;
  ironpayConfig: IronPayConfigInfo;
};

const LABEL: Record<Gateway, string> = {
  pixgate: "PixGate",
  umbrella: "Umbrella",
  sagacepay: "SagacePay",
  xpay: "XPay",
  ironpay: "IronPay",
};
const SECRET: Record<Gateway, string> = {
  pixgate: "PIXGATE_API_KEY",
  umbrella: "UMBRELLA_API_KEY",
  sagacepay: "SAGACEPAY_API_KEY",
  xpay: "XPAY_API_KEY",
  ironpay: "IRONPAY_API_TOKEN",
};

/** Escolha do gateway do Pix e gestão das credenciais. */
export function PixGatewayCard({ password }: { password: string }) {
  const statusFn = useServerFn(getPixGatewayStatus);
  const setFn = useServerFn(setPixGatewayFn);
  const savePixgateFn = useServerFn(savePixgateKeyFn);
  const deletePixgateFn = useServerFn(deletePixgateKeyFn);
  const saveUmbrellaFn = useServerFn(saveUmbrellaKeyFn);
  const deleteUmbrellaFn = useServerFn(deleteUmbrellaKeyFn);
  const testPixgate = useServerFn(testPixgateFn);
  const testUmbrella = useServerFn(testUmbrellaFn);
  const saveSagaceFn = useServerFn(saveSagacePayKeyFn);
  const deleteSagaceFn = useServerFn(deleteSagacePayKeyFn);
  const testSagace = useServerFn(testSagacePayFn);
  const saveXpayFn = useServerFn(saveXPayKeyFn);
  const deleteXpayFn = useServerFn(deleteXPayKeyFn);
  const testXpay = useServerFn(testXPayFn);
  const saveXpayWebhookFn = useServerFn(saveXPayWebhookSecretFn);
  const deleteXpayWebhookFn = useServerFn(deleteXPayWebhookSecretFn);
  const saveIronPayToken = useServerFn(saveIronPayApiTokenFn);
  const deleteIronPayToken = useServerFn(deleteIronPayApiTokenFn);
  const testIronPay = useServerFn(testIronPayFn);
  const saveIronPayConfig = useServerFn(saveIronPayProductOfferFn);
  const deleteIronPayConfig = useServerFn(deleteIronPayConfigFn);
  const keyFns = {
    pixgate: { save: savePixgateFn, remove: deletePixgateFn, test: testPixgate },
    umbrella: { save: saveUmbrellaFn, remove: deleteUmbrellaFn, test: testUmbrella },
    sagacepay: { save: saveSagaceFn, remove: deleteSagaceFn, test: testSagace },
    xpay: { save: saveXpayFn, remove: deleteXpayFn, test: testXpay },
    ironpay: { save: saveIronPayToken, remove: deleteIronPayToken, test: testIronPay },
  };

  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = () => {
    statusFn({ data: { password } })
      .then(setStatus)
      .catch(() => setStatus(null));
  };

  useEffect(() => {
    if (password) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  /** Executa a ação e mostra o resultado; devolve se deu certo. */
  const run = async (label: string, fn: () => Promise<string>): Promise<boolean> => {
    setBusy(label);
    setMsg(null);
    try {
      setMsg(await fn());
      return true;
    } catch (e) {
      setMsg(e instanceof Error && e.message ? e.message : "Algo deu errado. Tente de novo.");
      return false;
    } finally {
      setBusy(null);
      refresh();
    }
  };

  const choose = (gateway: Gateway) =>
    run(`set-${gateway}`, async () => {
      await setFn({ data: { password, gateway } });
      return `Pronto: os próximos Pix saem pela ${LABEL[gateway]}. Pedidos já gerados continuam no gateway de origem.`;
    });

  const saveKey = (gateway: Gateway, key: string) =>
    run(`save-${gateway}`, async () => {
      await keyFns[gateway].save({ data: { password, key } });
      return `Chave da ${LABEL[gateway]} salva. Os próximos Pix da ${LABEL[gateway]} já usam esta chave.`;
    });

  const deleteKey = (gateway: Gateway) =>
    run(`delete-${gateway}`, async () => {
      await keyFns[gateway].remove({ data: { password } });
      return `Chave da ${LABEL[gateway]} apagada do painel.`;
    });

  const saveIronPaySettings = (offerHash: string, productHash: string) =>
    run("save-ironpay-config", async () => {
      await saveIronPayConfig({ data: { password, offerHash, productHash } });
      return "Hashes de oferta e produto IronPay salvos.";
    });

  const deleteIronPaySettings = () =>
    run("delete-ironpay-config", async () => {
      await deleteIronPayConfig({ data: { password } });
      return "Hashes de oferta e produto IronPay apagados do painel.";
    });

  const saveWebhookSecret = (secret: string) =>
    run("save-xpay-webhook", async () => {
      await saveXpayWebhookFn({ data: { password, secret } });
      return "Segredo do webhook XPay salvo no armazenamento privado.";
    });

  const deleteWebhookSecret = () =>
    run("delete-xpay-webhook", async () => {
      await deleteXpayWebhookFn({ data: { password } });
      return "Segredo do webhook XPay apagado do painel.";
    });

  /** Consulta o gateway com a chave em uso, sem gerar Pix nem pedido. */
  const testKey = (gateway: Gateway) =>
    run(`test-${gateway}`, async () => {
      const r = await keyFns[gateway].test({ data: { password } });
      const details = "details" in r ? r.details : undefined;
      return r.ok
        ? `Chave da ${LABEL[gateway]} aceita (teste sem gerar pedido).${details ? ` ${details}` : ""}`
        : `Chave da ${LABEL[gateway]} com problema: ${r.error ?? `erro ${r.status ?? ""}`}`;
    });

  return (
    <Card className="mt-3 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-5 h-5 text-muted-foreground" aria-hidden />
          <div>
            <div className="font-medium">Gateway do Pix</div>
            <div className="text-xs text-muted-foreground">
              Escolha quem gera os próximos Pix (padrão: PixGate). A troca vale na hora; pedidos já
              gerados continuam sendo confirmados pelo gateway em que foram criados.
            </div>
          </div>
        </div>
        <span className="text-xs whitespace-nowrap text-emerald-600">
          {status ? `Em uso: ${LABEL[status.active]}` : "…"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {GATEWAYS.map((g) => (
          <Button
            key={g}
            size="sm"
            variant={status?.selected === g ? "default" : "outline"}
            disabled={!status || !!busy || status.selected === g}
            onClick={() => choose(g)}
          >
            {busy === `set-${g}` ? "Salvando…" : LABEL[g]}
            {status && !status.configured[g]
              ? g === "xpay"
                ? ` (${status.keys.xpay.key ? "sem webhook" : "sem chave"})`
                : g === "ironpay"
                  ? ` (${status.keys.ironpay.key ? "sem oferta/produto" : "sem token"})`
                  : " (sem chave)"
              : ""}
          </Button>
        ))}
      </div>

      {status && status.active !== status.selected && (
        <p className="text-xs text-destructive">
          A {LABEL[status.selected]} está escolhida mas sem chave, então o checkout está usando a{" "}
          {LABEL[status.active]}. Cadastre a chave para ela entrar em uso.
        </p>
      )}

      {GATEWAYS.map((g) => (
        <Fragment key={g}>
          <KeySection
            gateway={g}
            info={status?.keys[g] ?? null}
            loading={status === null}
            busy={busy}
            onSave={(key) => saveKey(g, key)}
            onDelete={() => deleteKey(g)}
            onTest={() => testKey(g)}
          />
          {g === "xpay" && status && (
            <XPayWebhookSection
              info={status.webhook}
              busy={busy}
              onSave={saveWebhookSecret}
              onDelete={deleteWebhookSecret}
            />
          )}
          {g === "ironpay" && status && (
            <IronPayConfigSection
              info={status.ironpayConfig}
              busy={busy}
              onSave={saveIronPaySettings}
              onDelete={deleteIronPaySettings}
            />
          )}
        </Fragment>
      ))}
      {msg && <p className="text-xs">{msg}</p>}
    </Card>
  );
}

function KeySection({
  gateway,
  info,
  loading,
  busy,
  onSave,
  onDelete,
  onTest,
}: {
  gateway: Gateway;
  info: KeyInfo | null;
  loading: boolean;
  busy: string | null;
  onSave: (key: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onTest: () => Promise<boolean>;
}) {
  const [key, setKey] = useState("");
  const label = loading
    ? "…"
    : info?.source === "admin"
      ? "Chave do painel"
      : info?.source === "secret"
        ? "Secret do servidor"
        : "Sem chave";

  return (
    <div className="flex flex-col gap-2 border-t pt-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-medium">Chave da API {LABEL[gateway]}</div>
        <span
          className={`text-xs whitespace-nowrap ${info?.source ? "text-emerald-600" : "text-destructive"}`}
        >
          {label}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        A chave salva aqui tem prioridade. Sem ela, vale o secret {SECRET[gateway]} do servidor.
      </div>
      <Input
        type="password"
        autoComplete="off"
        aria-label={`Chave da API ${LABEL[gateway]}`}
        placeholder={info?.key ? `Chave em uso (${info.key})` : `Chave da API ${LABEL[gateway]}`}
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={key.trim().length < 10 || !!busy}
          onClick={() => onSave(key.trim()).then((ok) => ok && setKey(""))}
        >
          {busy === `save-${gateway}` ? "Salvando…" : `Salvar chave ${LABEL[gateway]}`}
        </Button>
        <Button size="sm" variant="outline" disabled={!info?.source || !!busy} onClick={onTest}>
          {busy === `test-${gateway}` ? "Testando…" : `Testar chave ${LABEL[gateway]}`}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={info?.source !== "admin" || !!busy}
          onClick={onDelete}
        >
          {busy === `delete-${gateway}` ? "Apagando…" : "Apagar chave do painel"}
        </Button>
      </div>
    </div>
  );
}

function XPayWebhookSection({
  info,
  busy,
  onSave,
  onDelete,
}: {
  info: WebhookInfo;
  busy: string | null;
  onSave: (secret: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const [secret, setSecret] = useState("");

  return (
    <div className="flex flex-col gap-2 border-t pt-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-medium">Segredo de assinatura do webhook XPay</div>
        <span
          className={`text-xs whitespace-nowrap ${info.configured ? "text-emerald-600" : "text-destructive"}`}
        >
          {info.source === "admin"
            ? "Segredo salvo no painel"
            : info.source === "secret"
              ? "Secret do servidor"
              : "Não configurado"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        No painel XPay, crie um webhook para o evento <code>charge.paid</code> e use esta URL:
      </p>
      <code className="break-all rounded bg-muted px-2 py-1 text-xs">
        https://www.dexcomg7.store/api/public/pix-webhook?gw=xp
      </code>
      <p className="text-xs text-muted-foreground">
        A XPay mostra o segredo uma única vez. Cole-o aqui; a aplicação valida a assinatura e
        consulta novamente a cobrança na API antes de confirmar o pedido.
      </p>
      <Input
        type="password"
        autoComplete="off"
        aria-label="Segredo de assinatura do webhook XPay"
        placeholder={
          info.configured ? "Segredo salvo (deixe vazio para manter)" : "Segredo do webhook XPay"
        }
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={secret.trim().length < 16 || !!busy}
          onClick={() => onSave(secret.trim()).then((ok) => ok && setSecret(""))}
        >
          {busy === "save-xpay-webhook" ? "Salvando…" : "Salvar segredo do webhook"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={info.source !== "admin" || !!busy}
          onClick={onDelete}
        >
          {busy === "delete-xpay-webhook" ? "Apagando…" : "Apagar segredo salvo"}
        </Button>
      </div>
    </div>
  );
}

function IronPayConfigSection({
  info,
  busy,
  onSave,
  onDelete,
}: {
  info: IronPayConfigInfo;
  busy: string | null;
  onSave: (offerHash: string, productHash: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const [offerHash, setOfferHash] = useState("");
  const [productHash, setProductHash] = useState("");
  const configured = !!info.offerHash && !!info.productHash;

  return (
    <div className="flex flex-col gap-2 border-t pt-4">
      <div className="text-sm font-medium">Oferta e produto IronPay</div>
      <p className="text-xs text-muted-foreground">
        A API exige os dois hashes em cada transação. Copie-os do painel IronPay; use uma oferta e
        produto compatíveis com o valor calculado pelo checkout.
      </p>
      <p className="text-xs text-muted-foreground">
        Oferta: {info.offerHash ? `${info.offerHash} (${info.offerSource})` : "não configurada"} ·
        Produto:{" "}
        {info.productHash ? `${info.productHash} (${info.productSource})` : "não configurado"}
      </p>
      <Input
        type="text"
        autoComplete="off"
        aria-label="Hash da oferta IronPay"
        placeholder="Hash da oferta IronPay"
        value={offerHash}
        onChange={(e) => setOfferHash(e.target.value)}
      />
      <Input
        type="text"
        autoComplete="off"
        aria-label="Hash do produto IronPay"
        placeholder="Hash do produto IronPay"
        value={productHash}
        onChange={(e) => setProductHash(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={!offerHash.trim() || !productHash.trim() || !!busy}
          onClick={() =>
            onSave(offerHash.trim(), productHash.trim()).then((ok) => {
              if (ok) {
                setOfferHash("");
                setProductHash("");
              }
            })
          }
        >
          {busy === "save-ironpay-config" ? "Salvando…" : "Salvar hashes IronPay"}
        </Button>
        <Button size="sm" variant="destructive" disabled={!configured || !!busy} onClick={onDelete}>
          {busy === "delete-ironpay-config" ? "Apagando…" : "Apagar hashes do painel"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        O checkout envia o postback automaticamente para{" "}
        <code>https://www.dexcomg7.store/api/public/pix-webhook?gw=ip</code>. O postback apenas
        dispara uma consulta autenticada de status; o corpo recebido não é tratado como prova de
        pagamento.
      </p>
    </div>
  );
}
