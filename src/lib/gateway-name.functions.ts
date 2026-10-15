import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  DEFAULT_GATEWAY_PRODUCT_NAME,
  getGatewayProductName,
  saveGatewayProductName,
} from "./gateway-name.server";

const pw = z.object({ password: z.string().min(1).max(200) });

function assertAdmin(password: string) {
  if (password !== process.env["ADMIN_PASSWORD"]) throw new Error("Não autorizado");
}

export const getGatewayNameFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => pw.parse(d))
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return { name: await getGatewayProductName(), defaultName: DEFAULT_GATEWAY_PRODUCT_NAME };
  });

export const saveGatewayNameFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => pw.extend({ name: z.string().trim().min(2).max(60) }).parse(d))
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    await saveGatewayProductName(data.name);
    return { ok: true };
  });
