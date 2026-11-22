// Daysayday · "hatirlatici" Edge Function — akşam hatırlatma bildirimleri (web push)
//
// Ne yapar:
//  - Her 15 dakikada bir zamanlayıcı çağırır ({"action":"tick"}, x-cron-secret başlığıyla).
//    Saati gelmiş ve o gün henüz günlük yazmamış herkese, seçtiği karakterin ağzından tek bir bildirim gönderir.
//    Serisi olanlara seriyi, olmayanlara yeni bir seri başlatmayı hatırlatır. Seri tehlikedeyse 23:00'te son bir hatırlatma.
//    Uzun süredir gelmeyenlere giderek seyrekleşir (önce gün aşırı, sonra haftada bir, 60 günden sonra hiç).
//  - Uygulama içinden: {"action":"key"} → tarayıcının abone olması için açık anahtar,
//    {"action":"test"} → giriş yapmış kullanıcıya hemen bir deneme bildirimi.
//  - İlk kurulumda: tarayıcıda .../functions/v1/hatirlatici?kurulum=1 adresini aç → yeni anahtar çiftini gösterir
//    (sadece VAPID anahtarları henüz Secrets'a girilmemişse).
//
// Gerekli Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (ör. mailto:sen@ornek.com), CRON_SECRET (zaten var).
// SUPABASE_URL, SUPABASE_ANON_KEY ve SUPABASE_SERVICE_ROLE_KEY Supabase tarafından otomatik verilir.
// Bu fonksiyonda "Verify JWT" KAPALI olmalı: zamanlayıcı CRON_SECRET ile, kullanıcılar kendi oturumlarıyla doğrulanır.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

// iPhone bildirimde hep uygulama simgesini (Luna) gösterdiği için tüm hatırlatmaları Luna gönderir.
const SENDER = "ivy";
const NAMES: Record<string, string> = { daysy: "Daysy", ivy: "Luna", sage: "Eva", charlie: "Charlie" };
// {n} = seri günü. Her karakter kendi tarzında konuşur; aynı cümle arka arkaya gelmesin diye havuzdan güne göre seçilir.
const MSG: Record<string, Record<string, string[]>> = {
  daysy: {
    start: ["Heyy! İlk sayfan seni bekliyor. Bugün nasıldı, anlat bakalım 🌼", "Selaam! Bugün bana bir şey anlatsana, ilk günlük sayfanı birlikte yazalım ✨", "Bugün neler oldu? 2 dakika konuşalım, gerisini ben yazarım 🌼"],
    restart: ["Heyy, seni özledim! Bugün yeni bir seri başlatalım mı? 🌼", "Yeni bir seri için en güzel gün bugün! Nasıldı günün?", "Selaam! Biraz konuşmak ister misin? Bugünden yeni seriye başlarız ✨"],
    streak: ["Heyy, bugün nasıldı? {n} günlük serin devam etsin mi? 🌼", "{n} gündür her akşam buradayız! Bugünü de anlatsana ✨", "Bugün de biraz konuşalım mı? Serin {n} gün oldu, çok gurur duyuyorum 🌼"],
    late: ["{n} günlük serin bu gece bitiyor! 2 dakika yeter, hadi gel 🔥", "Gece yarısına az kaldı! {n} günlük serini kurtaralım mı? 🌼"],
    comeback: ["Heyy, nerelerdesin? Seni çok özledim! Biraz konuşalım mı? 🌼", "Uzun zaman oldu! Anlatacak çok şey birikmiştir, gel 🌼"],
  },
  ivy: {
    start: ["Hıh. Daha ilk sayfanı bile yazmadık. Bugün ne oldu, anlat bakalım.", "Anlatacak bir şey yok mu yani? Hiç sanmıyorum. Gel.", "Bugün kim ne yaptı? Merak etmedim. Tamam, biraz ettim. Anlat."],
    restart: ["Hıh. Seri falan kalmadı ama olsun, bugünden başlarız. Anlat.", "Bir sessizlik oldu. Bugün ne oldu? Anlat bakalım.", "Yeni seri, temiz sayfa. Bugün kim ne yaptı yine?"],
    streak: ["Hıh. Bugün hiç uğramadın. {n} günlük seri kendi kendine uzamıyor.", "{n} gün oldu, şimdi bırakma bari. Anlat bakalım.", "Bugün kim ne yaptı yine? {n} günlük serin bekliyor."],
    late: ["Saat geç. {n} günlük serin bu gece bitiyor, haberin olsun.", "Hıh. {n} günlük seriyi gece yarısına bırakmak… Cesur. Gel."],
    comeback: ["Hıh. Kayıplara karıştın. Anlatacak çok şey birikmiştir, gel.", "Seni özlemedim. Tamam, biraz özledim. Anlat bakalım."],
  },
  sage: {
    start: ["Kahvemi koydum. Gel, günün nasıl geçti anlat ☕", "Bugün seni ne yordu, ne güldürdü? İlk sayfanı birlikte yazalım ☕", "Biraz otur, nefes al. Bugün nasıldı?"],
    restart: ["Kahvem hazır. Bugün yeniden başlayalım mı? ☕", "Ara vermek de olur. Bugün nasıldı, anlatmak ister misin?", "Gel, bir kahve molası verelim. Yeni bir seri bugün başlar ☕"],
    streak: ["Kahvemi koydum. Bugün nasıl geçti? {n} günlük serin seni bekliyor ☕", "{n} gündür her akşam konuşuyoruz, çok güzel. Bugün de anlat ☕", "Yorucu bir gün müydü? Gel, biraz anlat. Serin {n} gün oldu."],
    late: ["Gece oldu ama kahve hâlâ sıcak. {n} günlük serin bu gece bitmesin ☕", "Uyumadan önce 2 dakika? {n} günlük serin için ☕"],
    comeback: ["Uzun zamandır görüşmedik. Kahvemi koydum, gel ☕", "Seni merak ettim. Nasılsın, anlatmak ister misin? ☕"],
  },
  charlie: {
    start: ["Bugünün bölümü yayında mı? Patlamış mısırım hazır 🍿", "Başrol sende! İlk sahneni anlatsana 🎬", "Bugünün filmi ne oldu? Dram mı, komedi mi? Anlat bakalım 🍿"],
    restart: ["Yeni sezon başlıyor! Bugünün ilk bölümünü anlat 🎬", "Ara verdik ama dizi bitmedi. Bugün ne oldu? 🍿", "Yeni sezon, yeni seri. Patlamış mısır hazır 🍿"],
    streak: ["Bugünün bölümü yayında mı? {n} bölümdür izliyorum, bırakmam 🍿", "{n} günlük seri! Bu dizi final yapmasın, bugünü anlat 🎬", "Patlamış mısırım hazır, başrol sende. {n}. gün geliyor 🍿"],
    late: ["Sezon finali gibi: {n} günlük serin bu gece bitiyor! 🎬", "Son dakika! {n} günlük seriyi kurtaracak sahne sende 🍿"],
    comeback: ["Diziyi yarıda bıraktın! Kaldığımız yerden devam edelim mi? 🍿", "Uzun bir reklam arası oldu. Yeni bölümler birikmiştir 🎬"],
  },
};

// kullanıcının saat dilimine göre "bugün" (YYYY-MM-DD) ve dakika cinsinden saat
function localNow(tz: string, now = new Date()) {
  let parts: Record<string, string>;
  try {
    parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(now).map(p => [p.type, p.value]));
  } catch { return localNow("Europe/Istanbul", now); }
  return { day: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}
const dayNum = (d: string) => Math.round(Date.parse(d + "T00:00:00Z") / 864e5);
const toMin = (t: string) => { const [h, m] = String(t || "21:00").split(":").map(Number); return (h || 0) * 60 + (m || 0); };

function streakFrom(days: Set<string>, today: string) {
  // seri dünden geriye sayılır (bugün henüz yazılmadı)
  let n = 0, d = dayNum(today) - 1;
  while (days.has(new Date(d * 864e5).toISOString().slice(0, 10))) { n++; d--; }
  return n;
}
function pick(char: string, kind: string, n: number, today: string) {
  const pool = (MSG[char] || MSG.daysy)[kind] || MSG.daysy.start;
  return pool[dayNum(today) % pool.length].replaceAll("{n}", String(n));
}

async function sendAll(admin: ReturnType<typeof createClient>, subs: { endpoint: string; p256dh: string; auth: string }[], payload: Record<string, unknown>) {
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 3 * 3600, urgency: "normal" });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint); // cihaz aboneliği bitmiş
    }
  }
  return sent;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const url = new URL(req.url);
  const pub = Deno.env.get("VAPID_PUBLIC_KEY"), priv = Deno.env.get("VAPID_PRIVATE_KEY");

  // ilk kurulum: anahtar çifti üret (anahtarlar henüz girilmemişse)
  if (url.searchParams.get("kurulum")) {
    if (pub && priv) return new Response("Anahtarlar zaten Secrets'ta kayıtlı. Yeniden üretmeye gerek yok.", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    const k = webpush.generateVAPIDKeys();
    return new Response(
      `Daysayday bildirim anahtarları (bu sayfayı kimseyle paylaşma, ekran görüntüsü de atma):\n\n` +
      `VAPID_PUBLIC_KEY\n${k.publicKey}\n\nVAPID_PRIVATE_KEY\n${k.privateKey}\n\n` +
      `İkisini de Supabase → Edge Functions → Secrets'a bu adlarla ekle. Sayfayı yenilersen yeni bir çift üretilir; ` +
      `sadece Secrets'a kaydettiğin çift geçerlidir.`,
      { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }

  let body: { action?: string } = {};
  try { body = await req.json(); } catch {}
  const action = body.action || "";
  if (!pub || !priv) return json({ error: "Bildirim anahtarları henüz kurulmadı" }, 503);
  webpush.setVapidDetails(Deno.env.get("VAPID_SUBJECT") || "mailto:destek@daysayday.com", pub, priv);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (action === "key") return json({ key: pub });

  if (action === "test") {
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return json({ error: "Giriş yapmalısın" }, 401);
    const { data: prof } = await admin.from("profiles").select("character").eq("id", user.id).maybeSingle();
    const { data: subs } = await admin.from("push_subscriptions").select("endpoint,p256dh,auth").eq("user_id", user.id);
    if (!subs?.length) return json({ error: "Bu hesapta bildirim açık bir cihaz yok" }, 400);
    const ch = SENDER; // bildirimleri her zaman Luna gönderir (iPhone uygulama simgesi Luna)
    const sent = await sendAll(admin, subs, { title: NAMES[ch], body: "Bildirimler çalışıyor! Akşam görüşürüz 🌙", url: "/app/#sohbet", char: ch, tag: "dsd-test" });
    return json({ ok: true, sent });
  }

  if (action !== "tick") return json({ error: "Bilinmeyen işlem" }, 400);
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) return json({ error: "forbidden" }, 403);

  // bildirim açık cihazı olan herkes
  const { data: subs } = await admin.from("push_subscriptions").select("user_id,endpoint,p256dh,auth");
  if (!subs?.length) return json({ ok: true, users: 0, sent: 0 });
  const byUser = new Map<string, typeof subs>();
  subs.forEach(s => byUser.set(s.user_id, [...(byUser.get(s.user_id) || []), s]));
  const { data: profs } = await admin.from("profiles")
    .select("id,character,reminder_time,remind_on,tz,last_push_on,last_push_kind,created_at").in("id", [...byUser.keys()]);

  let sentTotal = 0, users = 0;
  for (const p of profs || []) {
    if (!p.remind_on) continue;
    const { day: today, minutes } = localNow(p.tz || "Europe/Istanbul");
    const at = toMin(p.reminder_time);
    const evening = minutes >= at && minutes < at + 15;
    const lateSlot = minutes >= 23 * 60 && minutes < 23 * 60 + 15 && at < 23 * 60;
    if (!evening && !lateSlot) continue;
    if (p.last_push_on === today && (p.last_push_kind === "late" || (evening && p.last_push_kind))) continue; // bugün zaten gönderildi

    const { data: rows } = await admin.from("entries").select("day").eq("user_id", p.id).order("day", { ascending: false }).limit(120);
    const days = new Set((rows || []).map(r => String(r.day)));
    if (days.has(today)) continue; // bugün yazdı: rahatsız etme

    const streak = streakFrom(days, today);
    const last = rows?.[0]?.day ? String(rows[0].day) : null;
    const since = dayNum(today) - dayNum(last || String(p.created_at).slice(0, 10)); // son günlükten (ya da kayıttan) bu yana gün
    const lastPush = p.last_push_on ? dayNum(today) - dayNum(String(p.last_push_on)) : 999;

    let kind: string;
    if (lateSlot) {
      if (streak < 1) continue;          // gece hatırlatması sadece seri tehlikedeyken
      kind = "late";
    } else {
      // uzun süredir gelmeyene seyrek yaz: 3-6 gün gün aşırı, 7+ gün haftada bir, 60 günden sonra hiç
      if (since >= 60) continue;
      if (since >= 7 && lastPush < 7) continue;
      if (since >= 3 && since < 7 && lastPush < 2) continue;
      kind = streak >= 1 ? "streak" : !last ? "start" : since >= 7 ? "comeback" : "restart";
    }

    const ch = SENDER;
    const sent = await sendAll(admin, byUser.get(p.id) || [], {
      title: NAMES[ch] || "Daysayday", body: pick(ch, kind, streak, today), url: "/app/#sohbet", char: ch, tag: "dsd-hatirlatma",
    });
    if (sent) {
      users++; sentTotal += sent;
      await admin.from("profiles").update({ last_push_on: today, last_push_kind: kind }).eq("id", p.id);
    }
  }
  return json({ ok: true, users, sent: sentTotal });
});
