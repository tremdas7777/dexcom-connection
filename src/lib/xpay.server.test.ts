import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { isXPayOrderId, verifyXPayWebhookSignature } from "./xpay.server";

test("accepts the XPay SHA-256 HMAC over the exact raw body", () => {
  const body = '{"event":"charge.paid","data":{"chargeId":"charge_123"}}';
  const secret = "webhook-secret-for-unit-tests";
  const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

  assert.equal(verifyXPayWebhookSignature(body, signature, secret), true);
});

test("rejects a changed body, malformed signature, or missing signature", () => {
  const body = '{"event":"charge.paid"}';
  const secret = "webhook-secret-for-unit-tests";
  const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

  assert.equal(verifyXPayWebhookSignature(`${body} `, signature, secret), false);
  assert.equal(verifyXPayWebhookSignature(body, "sha256=bad", secret), false);
  assert.equal(verifyXPayWebhookSignature(body, null, secret), false);
});

test("recognizes only XPay-prefixed order ids", () => {
  assert.equal(isXPayOrderId("xp_charge_123"), true);
  assert.equal(isXPayOrderId("um_charge_123"), false);
});
