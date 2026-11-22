import fs from "node:fs";
import * as fake from "./fakedb.mjs";
const src = fs.readFileSync(new URL("../kurulum/2-edge-function-daysy.ts", import.meta.url), "utf8")
  .replace(/^import \{ createClient \} from "npm:@supabase\/supabase-js@2";/m, "const createClient = globalThis.__createClient;");
const FN = new URL("./.fn.ts", import.meta.url);
fs.writeFileSync(FN, src);
const ENV = { SUPABASE_URL: "x", SUPABASE_ANON_KEY: "anon", SUPABASE_SERVICE_ROLE_KEY: "service", ANTHROPIC_API_KEY: "k" };
globalThis.Deno = { env: { get: k => ENV[k] }, serve: h => { globalThis.__handler = h; } };
globalThis.__createClient = fake.createClient;
export const model = { calls: 0, fail: false };
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  if (String(url).includes("api.anthropic.com")) {
    model.calls++;
    if (model.fail) return new Response(JSON.stringify({ error: { message: "overloaded" } }), { status: 529 });
    const isWrite = JSON.parse(init.body).system.includes("SADECE şu JSON");
    const text = isWrite ? JSON.stringify({ title: "Sayfa " + model.calls, body: "Bugün güzeldi.", moment: "m", mood: "mutlu", tags: ["okul"], summary: "s", note: "not", favorites: [] }) : "[happy] Merhaba!";
    return new Response(JSON.stringify({ content: [{ type: "text", text }], usage: { input_tokens: 1, output_tokens: 1 }, stop_reason: "end_turn" }), { status: 200 });
  }
  return realFetch(url, init);
};
await import(FN.href);
export const env = ENV;
export async function call(uid, body) {
  const r = await globalThis.__handler(new Request("http://x", { method: "POST", headers: { Authorization: "Bearer " + uid }, body: JSON.stringify(body) }));
  return { status: r.status, body: await r.json() };
}
export const sql = fake.sql;
