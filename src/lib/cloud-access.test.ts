import { describe, expect, test } from "bun:test";

const url = process.env['SUPABASE_URL'];
const key = process.env['SUPABASE_PUBLISHABLE_KEY'];

async function publicRead(table: string, query: string) {
  if (!url || !key) throw new Error("Cloud test environment missing");
  return fetch(`${url}/rest/v1/${table}?${query}`, { headers: { apikey: key } });
}

describe("Store database access", () => {
  test("WhatsApp starts disabled as requested", async () => {
    const response = await publicRead("site_settings", "key=eq.whatsapp_enabled&select=value");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ value: false }]);
  });

  test("private settings are not readable by visitors", async () => {
    const response = await publicRead("private_settings", "select=key");
    expect([401, 403]).toContain(response.status);
  });

  test("customer tracking records cannot be listed publicly", async () => {
    const response = await publicRead("rastreios", "select=id");
    expect([401, 403]).toContain(response.status);
  });
});