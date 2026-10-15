import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getGatewayNameFn, saveGatewayNameFn } from "@/lib/gateway-name.functions";

export interface GatewayNameCardProps {
  password: string;
}

/** Nome do produto que aparece no gateway (Pix e cartão). */
export function GatewayNameCard({ password }: GatewayNameCardProps) {
  const getFn = useServerFn(getGatewayNameFn);
  const saveFn = useServerFn(saveGatewayNameFn);

  const [current, setCurrent] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = () =>
    getFn({ data: { password } })
      .then((r) => setCurrent(r.name))
      .catch(() => setCurrent(null));

  useEffect(() => {
    if (!password) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  const save = async () => {
    const value = name.trim();
    if (value.length < 2) {
      setMsg("Digite pelo menos 2 letras.");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await saveFn({ data: { password, name: value } });
      setName("");
      setMsg("Nome salvo. Os próximos Pix e cartões já usam esse nome.");
      refresh();
    } catch {
      setMsg("Falhou ao salvar o nome.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mt-3 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Tag className="w-5 h-5 text-muted-foreground" aria-hidden />
        <div>
          <div className="font-medium">Nome do produto no gateway</div>
          <div className="text-xs text-muted-foreground">
            Nome enviado ao gateway em cada Pix e cartão (pedido e upsell). Em uso:{" "}
            <span className="font-medium text-foreground">{current ?? "…"}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Novo nome do produto"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
        />
        <Button onClick={save} disabled={saving || !name.trim()}>
          {saving ? "Salvando…" : "Salvar"}
        </Button>
      </div>
      {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
    </Card>
  );
}
