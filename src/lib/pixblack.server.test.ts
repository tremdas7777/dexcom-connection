import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { isPixBlackOrderId, verifyPixBlackWebhookSignature } from "./pixblack.server";

const secret = "whsec-local-unit-test-secret";
const nowSeconds = 1_793_315_112;
const nowMs = nowSeconds * 1000;
const body = Buffer.from('{"type":"charge.paid","data":{"charge_id":"charge-id"}}', "utf8");

function signatureFor(payload: Uint8Array, timestamp = String(nowSeconds)) {
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.`)
    .update(payload)
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

test("accepts Pix Black HMAC over the exact raw body within the 300-second window", () => {
  assert.equal(verifyPixBlackWebhookSignature(body, signatureFor(body), secret, nowMs), true);
});

test("rejects a modified body, an expired timestamp, malformed signature, or missing header", () => {
  assert.equal(
    verifyPixBlackWebhookSignature(
      Buffer.from(`${body.toString("utf8")} `),
      signatureFor(body),
      secret,
      nowMs,
    ),
    false,
  );
  assert.equal(
    verifyPixBlackWebhookSignature(body, signatureFor(body), secret, nowMs + 301_000),
    false,
  );
  assert.equal(verifyPixBlackWebhookSignature(body, "t=bad,v1=bad", secret, nowMs), false);
  assert.equal(verifyPixBlackWebhookSignature(body, null, secret, nowMs), false);
});

test("rejects signatures generated with a different secret", () => {
  assert.equal(
    verifyPixBlackWebhookSignature(body, signatureFor(body), "different-secret", nowMs),
    false,
  );
});

test("recognizes only Pix Black-prefixed order ids", () => {
  assert.equal(isPixBlackOrderId("pb_8d3f6a12-4b9e-4c71-a2d5-6e0f1b3c9a47"), true);
  assert.equal(isPixBlackOrderId("ip_8d3f6a12-4b9e-4c71-a2d5-6e0f1b3c9a47"), false);
});
