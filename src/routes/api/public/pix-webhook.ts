import { createFileRoute } from "@tanstack/react-router";

// Notificações da PixGate, Umbrella, SagacePay, XPay, IronPay e HyperCash.
// O corpo do webhook nunca é suficiente para marcar venda como paga: consultamos o gateway autenticado.
export const Route = createFileRoute("/api/public/pix-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const gw = url.searchParams.get("gw");
        const rawBody = await request.text();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- payload do gateway externo sem tipo gerado
        let body: any = null;
        try {
          body = JSON.parse(rawBody);
        } catch {
          body = null;
        }

        if (gw === "ip") {
          const { IRONPAY_ORDER_PREFIX, verifyIronPayWebhookToken } =
            await import("@/lib/ironpay.server");
          if (!(await verifyIronPayWebhookToken(url.searchParams.get("token")))) {
            return Response.json({ ok: false }, { status: 401 });
          }
          const rawHash =
            body?.transaction_hash ??
            body?.data?.transaction_hash ??
            body?.hash ??
            body?.data?.hash;
          const hash = rawHash == null ? "" : String(rawHash);
          if (!/^[\w-]{1,64}$/.test(hash)) return Response.json({ ok: true });
          if (body?.payment_method && String(body.payment_method).toLowerCase() !== "pix") {
            return Response.json({ ok: true });
          }
          const id = `${IRONPAY_ORDER_PREFIX}${hash}`;
          try {
            const { fetchGatewayStatus, getOrder, reportPaidOnce, isPaidStatus } =
              await import("@/lib/pix-orders.server");
            const order = await getOrder(id);
            if (!order) return Response.json({ ok: true });
            const { status, amount } = await fetchGatewayStatus(id);
            if (!isPaidStatus(status)) return Response.json({ ok: true });
            if (amount !== order.amount_cents) {
              console.error("ironpay webhook amount mismatch", {
                orderId: id,
                expectedCents: order.amount_cents,
                receivedCents: amount,
              });
              return Response.json({ ok: true });
            }
            await reportPaidOnce(id, amount);
            return Response.json({ ok: true });
          } catch (e) {
            console.error("ironpay-webhook failed", {
              errorName: e instanceof Error ? e.name : "unknown",
            });
            return Response.json({ ok: false }, { status: 503 });
          }
        }

        if (gw === "xp") {
          const { getXPayWebhookSecret, verifyXPayWebhookSignature, XPAY_ORDER_PREFIX } =
            await import("@/lib/xpay.server");
          const secret = await getXPayWebhookSecret();
          if (!secret) return Response.json({ ok: false }, { status: 503 });
          if (
            !verifyXPayWebhookSignature(rawBody, request.headers.get("x-webhook-signature"), secret)
          ) {
            return Response.json({ ok: false, error: "invalid signature" }, { status: 401 });
          }
          if (!body || body.event !== "charge.paid") return Response.json({ ok: true });

          const rawId = body?.data?.chargeId ?? body?.data?.id;
          const id = rawId == null ? "" : `${XPAY_ORDER_PREFIX}${String(rawId)}`;
          if (!/^xp_[\w-]{1,64}$/.test(id)) return Response.json({ ok: true });
          try {
            const { fetchGatewayStatus, reportPaidOnce, isPaidStatus } =
              await import("@/lib/pix-orders.server");
            const { status, amount } = await fetchGatewayStatus(id);
            if (isPaidStatus(status)) await reportPaidOnce(id, amount);
            return Response.json({ ok: true });
          } catch (e) {
            console.error(
              "xpay-webhook failed",
              id,
              e instanceof Error ? e.message : "Falha ao confirmar cobrança",
            );
            return Response.json({ ok: false }, { status: 503 });
          }
        }

        // Umbrella notifica com ?gw=um e usa objectId; o pedido tem prefixo um_.
        const isUmbrella = gw === "um";
        // SagacePay notifica com ?gw=sg e data.id; o pedido tem prefixo sg_.
        const isSagace = gw === "sg";
        const rawId =
          (isUmbrella ? (body?.objectId ?? body?.data?.id ?? body?.id) : undefined) ??
          (isSagace ? (body?.data?.id ?? body?.id ?? body?.sale?.id) : undefined) ??
          body?.transaction_id ??
          body?.id ??
          body?.transaction?.id ??
          body?.body?.transaction?.id ??
          body?.data?.id;
        // HyperCash (cartão) usa ?gw=hc; os pedidos têm prefixo hc_.
        const isCard = gw === "hc";
        const prefix = isCard ? "hc_" : isUmbrella ? "um_" : isSagace ? "sg_" : "";
        const id = rawId == null ? "" : `${prefix}${String(rawId)}`;
        console.log("pix-webhook", body?.event, id);
        if (!/^[\w-]{1,64}$/.test(id)) return Response.json({ ok: true });
        try {
          const { fetchGatewayStatus, reportPaidOnce, isPaidStatus } =
            await import("@/lib/pix-orders.server");
          const { status, amount } = await fetchGatewayStatus(id);
          if (isPaidStatus(status)) await reportPaidOnce(id, amount);
        } catch (e) {
          console.error("pix-webhook failed", e);
        }
        return Response.json({ ok: true });
      },
    },
  },
});
