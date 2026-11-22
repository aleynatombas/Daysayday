// Daysayday · "gundem" Edge Function
// Her hafta Supabase Cron tarafından çağrılır: web'de bu haftanın dizi/film/sosyal medya gündemini arar,
// kısa maddeler halinde "trends" tablosuna yazar. Charlie bu maddeleri "şu sıralar konuşulanlar" olarak bilir.
// Gerekli secret'lar: ANTHROPIC_API_KEY (zaten var), CRON_SECRET (kendin uydurduğun uzun bir parola).
// Bu fonksiyonda "Verify JWT" KAPALI olmalı; koruma CRON_SECRET başlığıyla yapılıyor.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MODEL = "claude-haiku-5-5";

const PROMPT = `Türkiye'de yaşayan 18-30 yaş arası biri için bu haftanın eğlence gündemini çıkar.
Web'de arayarak şunları bul:
- Türkiye'de şu an en çok konuşulan Türk dizileri ve son bölümlerinde ne olduğu (spoiler vermeden, genel hatlarıyla)
- Türkiye'de popüler yabancı diziler ve filmler (Netflix, Disney+, sinema vizyonu)
- TikTok, Instagram ve X'te Türkiye'de dönen eğlenceli akımlar, sesler, caps ve espriler

Kurallar:
- Sadece eğlence: siyaset, savaş, felaket, ölüm, suç, hastalık haberleri, gerçek kişiler hakkında dedikodu ve magazin YOK.
- Cinsel, şiddet içeren ya da nefret söylemi içeren akım YOK.
- Her madde tek kısa Türkçe cümle olsun (en fazla 20 kelime), kendi cümlelerinle yaz, alıntı yapma.
- Emin olmadığın şeyi yazma. Toplam 10-14 madde.

SADECE şu JSON'u döndür, başka hiçbir şey yazma:
{"items": ["madde 1", "madde 2"]}`;

Deno.serve(async (req) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) return new Response("forbidden", { status: 403 });
  try {
    const key = Deno.env.get("ANTHROPIC_API_KEY")!;
    const tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 6, user_location: { type: "approximate", country: "TR", timezone: "Europe/Istanbul" } }];
    let messages: unknown[] = [{ role: "user", content: PROMPT }];
    const ask = async (msgs: unknown[]) => {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: MODEL, max_tokens: 4000, messages: msgs, tools }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error?.message || `Claude hatası ${r.status}`);
      return d;
    };
    const textOf = (d: { content?: { type: string; text?: string }[] }) => (d.content || []).filter(c => c.type === "text").map(c => c.text || "").join("");
    const pick = (t: string): string[] => {
      const obj = t.match(/\{[\s\S]*\}/);
      if (obj) { try { const j = JSON.parse(obj[0]); const arr = j.items || Object.values(j).find(v => Array.isArray(v)); if (Array.isArray(arr)) return arr; } catch { /* try the array form */ } }
      const arr = t.match(/\[[\s\S]*\]/);
      if (arr) { try { const j = JSON.parse(arr[0]); if (Array.isArray(j)) return j; } catch { /* nothing usable */ } }
      return [];
    };
    let d = await ask(messages), text = textOf(d);
    // a long search can pause mid-turn; send it back to let it finish
    for (let round = 0; round < 3 && d.stop_reason === "pause_turn"; round++) {
      messages = [...messages, { role: "assistant", content: d.content }];
      d = await ask(messages); text += textOf(d);
    }
    let items = pick(text);
    // it searched but wrote notes instead of the list: ask once more for just the JSON, no new searches
    if (items.length < 4) {
      messages = [...messages, { role: "assistant", content: d.content }, { role: "user", content: 'Yeni arama yapma. Bulduklarından kurallara uyan 10-14 maddeyi SADECE şu biçimde ver: {"items": ["...", "..."]}' }];
      const d2 = await ask(messages);
      items = pick(textOf(d2));
      if (!items.length) text = textOf(d2) || text;
    }
    const clean = items.map(s => String(s).replace(/\s+/g, " ").trim().slice(0, 200)).filter(s => s.length > 8).slice(0, 14);
    if (clean.length < 4) return new Response(JSON.stringify({ ok: false, reason: "yetersiz sonuç", got: clean.length, stop: d.stop_reason, sample: text.slice(0, 600) }), { status: 200 });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    // last week's list retires, this week's goes live
    await admin.from("trends").update({ active: false }).eq("active", true);
    await admin.from("trends").insert(clean.map(text => ({ text })));
    // keep the table small: drop entries older than 60 days
    await admin.from("trends").delete().lt("created_at", new Date(Date.now() - 60 * 864e5).toISOString());
    return new Response(JSON.stringify({ ok: true, count: clean.length }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), { status: 500 });
  }
});
