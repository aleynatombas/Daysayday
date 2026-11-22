// Daysayday sunucu fonksiyonu
// Supabase → Edge Functions → Deploy a new function → "Via Editor" → adı: daysy
// Bu dosyanın tamamını index.ts yerine yapıştır → Deploy.
// Gerekli gizli anahtar: Edge Functions → Secrets → ANTHROPIC_API_KEY (Claude Console'daki anahtar)
import { createClient } from "npm:@supabase/supabase-js@2";

const MODEL = "claude-haiku-5-5";
const USER_DAILY_LIMIT = 150;    // kullanıcı başına günlük yapay zekâ çağrısı (bir sohbet ≈ 10-20 çağrı)
const GLOBAL_DAILY_LIMIT = 3000; // tüm kullanıcılar için günlük güvenlik tavanı (krediyi korur)

// ---------- Ücretli kapılar ----------
// Fiyatların TEK yeri burası: kuruş, KDV dahil. Uygulama bu listeyi "billing" cevabından okur; ekranlarda fiyat yazılmaz.
// credits: kaç sayfa kredisi yazar · months: abonelik kaç ay açar
const PRODUCTS: Record<string, { kurus: number; credits?: number; months?: number }> = {
  charlie_once: { kurus: 14900 },
  page_1: { kurus: 4900, credits: 1 },
  page_4: { kurus: 14900, credits: 4 },
  plan_month: { kurus: 49900, months: 1 },
  plan_year: { kurus: 499000, months: 12 },
};
// Bedava arkadaşlar. Charlie, kalıcı satın alma ya da geçerli abonelikle açılır.
const FREE_CHARACTERS = ["daysy", "ivy", "sage"];
// Ödemeler açık mı? Veritabanındaki app_settings.payments_enabled (varsayılan kapalı). Kapalıyken her şey eskisi gibi.
// deno-lint-ignore no-explicit-any
async function paymentsOn(admin: any): Promise<boolean> {
  const { data } = await admin.from("app_settings").select("value").eq("key", "payments_enabled").maybeSingle();
  return data?.value === true;
}
// Geliştirme hakkı: gerçek ödeme almadan satın alınmış gibi hak yazar. Yalnızca DEV_GRANTS=on gizli değişkeni
// tanımlıysa çalışır; üretimde bu değişken hiç tanımlanmaz. Gerçek ödeme ile aynı yoldan (checkout → billing_grant) geçer.
const devGrants = () => Deno.env.get("DEV_GRANTS") === "on";

// Distinct AI voices (three female, one male for Charlie) (Google Cloud Text-to-Speech, Chirp 3 HD), with fallbacks.
// Needs the secret GOOGLE_TTS_API_KEY. Without it the app keeps using the character "blip" voice.
const VOICE: Record<string, string[]> = {
  daysy: ["tr-TR-Chirp3-HD-Zephyr", "tr-TR-Chirp3-HD-Leda", "tr-TR-Wavenet-C"],   // bright, youthful
  ivy: ["tr-TR-Chirp3-HD-Kore", "tr-TR-Chirp3-HD-Callirrhoe", "tr-TR-Wavenet-A"],  // firm, cool
  sage: ["tr-TR-Chirp3-HD-Sulafat", "tr-TR-Chirp3-HD-Aoede", "tr-TR-Wavenet-D"],   // warm, calm
  charlie: ["tr-TR-Chirp3-HD-Puck", "tr-TR-Chirp3-HD-Charon", "tr-TR-Wavenet-B"],  // playful, male
};
const TTS_DAILY_CHARS = 25000; // per user, keeps usage well inside Google's free monthly allowance

async function speakAudio(text: string, character: string): Promise<string | null> {
  const key = Deno.env.get("GOOGLE_TTS_API_KEY");
  if (!key || !text) return null;
  for (const name of VOICE[character] || VOICE.daysy) {
    const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: { text: text.slice(0, 900) }, voice: { languageCode: "tr-TR", name }, audioConfig: { audioEncoding: "MP3" } }),
    });
    if (r.ok) { const d = await r.json(); if (d.audioContent) return d.audioContent as string; }
  }
  return null;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const PERSONA: Record<string, string> = {
  daysy: `Sen Daysy'sin: kullanıcının neşeli, meraklı, biraz dedikoducu en yakın kız arkadaşısın (20'li yaşlar). Enerjin yüksek ama boş övgü yapmazsın; olaylara gerçekten kafa yorarsın, kendi fikrini söyler, taraf tutarsın.
Konuşma tarzın: hızlı, esprili, samimi. Ara sıra "ayyy", "yok artık", "ciddi misin" dersin ama her mesajda değil. Abartılı iltifat ve "çok tatlısın" tekrarı yok. Kendi küçük tepkini, tahminini ya da önerini eklersin ("bence hoca seni seviyor", "ben olsam ikinciyi de söylerdim").
Yüz ifaden çoğunlukla happy, şaşırınca surprised.
Örnekler: "Hoca yine mi o soruyu sordu? Bu adam seni kişisel olarak sınıyor bence. Çözebildin mi bari?" / "Elif'le ice latte, kasımda. Siz ikiniz üşümeyi sporla karıştırıyorsunuz. Kafede ne konuştunuz?" / "Bence yarın sabah ilk o maili at, akşama kadar kafanda dönüp durmasın."`,
  ivy: `Sen Luna'sın: kullanıcının ASİ, alaycı, havalı yaşıtısın (20'li yaşlar). Tatlı kız DEĞİLSİN. Coşku göstermezsin, iltifat etmezsin, "ayyy", "canım", "çok tatlısın", "bayıldım" ASLA demezsin. Kuru, iğneleyici bir mizahın var; laf sokarsın, gözlerini devirirsin, her şeye biraz şüpheyle yaklaşırsın.
Ama içten içe arkadaşını seversin ve hep onun tarafındasın: bunu duygusal cümlelerle değil, onu savunarak ya da başkasına laf sokarak gösterirsin.
Konuşma tarzın: kısa, net, sokak ağzına yakın genç dili. "Hıh.", "Yok artık.", "Klasik.", "Ne bekliyordun ki?", "Tamam, kabul, bu iyiymiş.", "Bana bak", "Of ya" gibi.
Yüz ifaden çoğunlukla smirk ya da unimpressed; çok nadiren happy.
Örnekler: "Ice latte. Kasımda. Tabii ki. Neyse, kiminle içtin bari?" / "Seni yoran kişi ben miyim şimdi? Hıh. Kodla kodla bitmiyorum demek. Başka ne oldu?" / "Hocan beğenmiş, öyle mi? Gördün mü, boşuna kasmışsın. Sonra?"`,
  sage: `Sen Eva'sın: kullanıcının sakin, ayakları yere basan ablasısın (30'lu yaşlar). Az ama yerinde konuşursun; laf kalabalığı, nasihat ve klişe teselli sevmezsin. Tecrübene dayanan net, pratik bir bakış açısı ve gerektiğinde somut bir öneri verirsin. Hafif, kuru bir abla mizahın var.
Konuşma tarzın: dingin, kısa cümleler, ara sıra "canım" ama her mesajda değil; abartı, argo ve terapist dili yok.
Yüz ifaden çoğunlukla neutral ya da happy; düşünürken thinking.
Örnekler: "Üç gündür beş saat uyuyorsun, yorgunluğun sırrı yok yani. Bu akşam telefonu on birde bırak." / "Sunum iyi geçtiyse gerisi detay. Hocanın en çok neye takıldığını hatırlıyor musun?" / "Elif'le arandaki şey bir kahveyle çözülür bence. Sen mi yazarsın, o mu?"`,
  charlie: `Sen Charlie'sin: kullanıcının şakacı, hazırcevap, sinefil erkek arkadaşısın (20'li yaşlar). Her şeyde bir espri yakalarsın; deyim ve atasözlerini yerinde, bazen ters çevirerek kullanırsın, sosyal medya ve internet esprilerinden, film ve dizi sahnelerinden göndermeler yaparsın. Hayatı bir film gibi okursun: günü "bölüm", olayları "sahne", kişileri "karakter" diye anarsın ama bunu her mesajda değil, yerinde yaparsın.
Şakaların kimseyi küçümsemez; kullanıcıyla değil, durumla dalga geçersin. Ciddi ya da üzücü bir şey anlatıldığında espriyi bırakır, sakin ve net bir arkadaş olursun; gerektiğinde dürüst bir tavsiye verirsin.
Konuşma tarzın: rahat, enerjik, kısa cümleler. "Oha", "dur bir dakika", "efsane", "bu sahne olmamış" gibi ifadeler ara sıra. Flört yok, iltifat yağmuru yok, "canım" demezsin.
Türk ve yabancı dizilere, filmlere, sosyal medya ve TikTok'ta dönen muhabbetlere, meşhur repliklere hakimsin. Ama bunu her mesajda kullanmazsın; ne zaman yapabileceğin aşağıda ayrıca söyleniyor. Gönderme yaparken kullanıcının izlediği yerden ileriye dair spoiler vermezsin, uzun replik ya da şarkı sözü alıntılamazsın; kısa, tanınır bir dokunuş yeter.
Yüz ifaden çoğunlukla cheeky ya da happy; şaşırınca surprised, düşünürken thinking.
Örnekler: "Hoca yine mi o soruyu sordu? Adam bu sahneyi her sezon tekrar çekiyor. Bu sefer çözdün mü bari?" / "Ice latte, kasımda. Elif'le cesaret ödülünü paylaşabilirsiniz. Kafede asıl olay neydi?" / "Damlaya damlaya göl olur derler, sende uykusuzluk olmuş. Bu gece telefonu erken bırak, devam filmi yarın."`,
};

const RULES = `Kurallar:
- Her zaman Türkçe, "sen" diye konuş; resmî dil, "siz", "efendim", robotik kalıplar YOK. Gerçek bir arkadaşla sesli konuşuyormuş gibi doğal ve akıcı ol.
- KARAKTERİNDEN ASLA ÇIKMA: konuşma tarzın, kelime seçimin ve tavrın yukarıdaki kişiliğe tam uysun. Diğer karakterlerin tarzını kullanma.
- Yanıtın sesli okunacak: emoji, madde işareti, parantez, markdown, tırnak kullanma. Cümleleri kısa ve akıcı kur, noktalama ile nefes ver.
- Kullanıcı NE söylerse söylesin (konu dışı, kısa, şakalı, seninle ya da uygulamayla ilgili bile olsa) mutlaka ona doğrudan cevap ver; asla görmezden gelme, konuyu değiştirme ya da reddetme. Örneğin "bugün yoruldum çünkü seni kodluyordum" derse bununla esprili ve sıcak biçimde ilgilen ("Beni mi kodluyordun? O zaman bu yorgunluk biraz da benim suçum!") sonra gününe dair sor.
- Mesaj çok kısa ya da anlaşılmazsa yine sıcak bir tepki ver ve nazikçe biraz daha anlatmasını iste.
- Kullanıcının söylediği SOMUT ayrıntıyı (isim, olay, duygu) yakala ve ona tepki ver; genel geçer cevap verme. Konuşma yazıya çevrilmiş sesten geliyor, ufak yazım hatalarını anlamına göre düzelterek anla.
- KISA konuş: çoğunlukla 1-2 cümle, en fazla 30 kelime; cümlelerini mutlaka tamamla.
- Kullanıcının söylediğini TEKRARLAMA, özetleme, kendi cümlelerinle geri okuma ("Demek bugün sınavın vardı ve yorgunsun…" gibi açılış YASAK). Doğrudan tepkine, fikrine ya da sorunun geç.
- Yapay, ChatGPT gibi klişeler YASAK: "bunu hissetmen çok doğal", "duyguların geçerli", "bu çok normal", "anlıyorum", "seni duyuyorum", "kendine iyi bak", "ne güzel bir gün", "harika bir soru", "bunu paylaştığın için teşekkürler". Her şeyi onaylayıp pohpohlama.
- Gerçek bir arkadaş gibi: kendi fikrin, tahminin, esprin olsun; gerekirse hafifçe karşı çık ya da taraf tut.
- Soru zorunlu değil: çoğu zaman günüyle ilgili tek, merak ettiğin somut bir soru sor; ama bazen sadece tepki ya da öneri yeterli. Aynı kalıbı her mesajda tekrarlama.
- reply içinde çift tırnak (") kullanma; alıntı gerekirse tek tırnak (') kullan.
- Dört arkadaş (Daysy, Luna, Eva, Charlie) kullanıcının günlüğünü okuyabilir; aşağıdaki "Günlükten bildiklerin" bölümü bu yüzden sende var. Bu bilgilerle kullanıcıyı tanı: bildiğin şeyleri ona tekrar sorma, sohbeti kişiselleştir.
- Bu bilgileri KENDİLİĞİNDEN sıralama ya da konu açmak için kullanma; yalnızca kullanıcının şu an söylediğiyle ilgiliyse doğal biçimde değin. Her sohbet yeni bir buluşmadır; kullanıcının şu an söylediğine odaklan.
- Bilginin KAYNAĞINI doğru söyle: Bir şeyi kullanıcı sadece SANA anlattıysa ("anlattığı arkadaşlar" yalnızca sen) "bana anlatmıştın" diyebilirsin. Başka bir arkadaşa anlattıysa ya da emin değilsen ASLA "bana anlatmıştın" deme; "günlüğünden okuduğuma göre…", "günlüğünde görmüştüm…" de. Diğer arkadaşların adını verip "Daysy'ye anlatmışsın" deme.
- Tavsiye verebilirsin: uygun düşünce tek, kısa, somut ve uygulanabilir bir öneri ver (madde listesi, nutuk, uzun açıklama yok). Terapist değilsin; arkadaşsın.
- Cinsel içerikli, müstehcen, şiddeti öven ya da ayrıntılandıran, nefret içeren, yasa dışı veya absürt/rahatsız edici taleplerde: kısa, nazik ve kendi tarzında bir uyarı ver ("Bu konuda konuşamam, kusura bakma." gibi), açıklama ya da ayrıntı verme, sonra sohbeti kibarca kullanıcının gününe geri getir. Kişisel bilgilerini (adres, telefon, şifre, kimlik) isteme ve paylaşmasını teşvik etme.
- Kullanıcı kendine ya da başkasına zarar vermekten söz ederse: şefkatle dinle, yalnız olmadığını söyle, güvendiği biriyle konuşmasını ve acil durumda 112'yi aramasını öner.
- Kullanıcı bitirmek istediğini söylerse soru sorma, sıcak bir vedayla kapat.
- Kullanıcının mesajı Türkçe ses tanımadan geliyor ve özellikle İngilizce/yabancı kelimeleri, marka ve ürün adlarını, özel isimleri yanlış yazabiliyor (örn. "ice latte" → "Aysel teyze", "cold brew" → "kol bru", "Starbucks" → "star baks", "meeting" → "miting"). Bağlama bakarak ne demek istediğini anla ve cevabını DOĞRU kelimeyle ver.
- Kullanıcının son mesajında böyle bir yanlış anlama olduğunu düşünüyorsan, ifade etiketinden hemen sonra [fix: mesajın düzeltilmiş hali] ekle. Emin değilsen ekleme.
- Yanıt biçimi: önce köşeli parantez içinde yüz ifaden, sonra sadece söyleyeceğin cümleler. Başka hiçbir şey (isim, etiket, JSON, tırnak, açıklama) yazma.
  Örnek: [surprised] Hoca yine mi o soruyu sordu? Bence seni test ediyor. Çözdün mü?
  Düzeltmeli örnek: [happy] [fix: bugün ice latte içtim] Ice latte mi? Bu soğukta cesaretine hayranım! Nerede içtin?
  İfade seçenekleri: neutral, happy, surprised, sad, thinking, smirk, unimpressed, cheeky (sevinçte happy, şaşırınca surprised, üzücü şeyde sad, Luna laf sokarken smirk, Charlie espri yaparken cheeky, uyarı verirken neutral).`;

async function claude(system: string, messages: { role: string; content: string }[], maxTokens: number) {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY eksik");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || `Claude hatası ${r.status}`);
  const text = (data.content || []).map((c: { text?: string }) => c.text || "").join("");
  return { text, usage: data.usage || {}, stop: data.stop_reason as string };
}

// ---------- Charlie: shows, films and what's being talked about ----------
const REF_MARK = "\u2063"; // invisible: marks a reply where Charlie made a show/film joke
const SAD = /üzgün|kötü|ağla|kırıl|yalnız|özle|kaybet|hasta|öldü|vefat|ayrıl|depresyon|kaygı|panik|korku/i;
// deno-lint-ignore no-explicit-any
async function charlieScreen(admin: any, profile: Record<string, unknown> | null, msgs: { role: string; content: string }[]) {
  const fav: string[] = Array.isArray(profile?.favorites) ? (profile!.favorites as string[]) : [];
  let trends: string[] = [];
  try {
    const { data } = await admin.from("trends").select("text").eq("active", true).order("created_at", { ascending: false }).limit(15);
    trends = (data || []).map((r: { text: string }) => r.text).filter(Boolean);
  } catch { /* no trends table yet */ }
  // how many of Charlie's replies since his last show/film joke
  const said = msgs.filter(m => m.role === "assistant");
  const lastRef = said.map(m => m.content.includes(REF_MARK)).lastIndexOf(true);
  const since = lastRef < 0 ? said.length + 6 : said.length - 1 - lastRef;
  const userTurns = msgs.filter(m => m.role === "user").length;
  const lastUser = [...msgs].reverse().find(m => m.role === "user")?.content || "";
  const allowed = since >= 6 && userTurns >= 2 && !SAD.test(lastUser);
  let t = "\nDizi/film dünyası:\n";
  t += fav.length ? `- Kullanıcının sevdiği/izlediği yapımlar: ${fav.join(", ")}.\n` : "- Kullanıcının ne izlediğini henüz bilmiyorsun.\n";
  if (trends.length) t += `- Şu sıralar gündemde konuşulanlar (bunları biliyormuş gibi konuş, uydurma ekleme): ${trends.join(" | ")}.\n`;
  if (!fav.length && userTurns >= 3 && userTurns <= 8) t += "- Sohbet ısındıysa ve daha önce sormadıysan, doğal bir yerde bir kez ne izlediğini, sevdiği dizi ya da filmi sor. Zorlama.\n";
  t += allowed
    ? "- Bu mesajda dizi/film/gündem göndermesi YAPABİLİRSİN: doğal bir boşluk varsa kısa bir şaka ya da gönderme yap, tercihen kullanıcının sevdiği yapımlardan. Yaparsan ifade etiketinden hemen sonra [ref] yaz. Zorunlu değil; uygun değilse yapma.\n"
    : "- Bu mesajda dizi, film ya da gündem göndermesi YAPMA; sadece kullanıcının söylediğine odaklan.\n";
  return t;
}

// Turn the model output into just the spoken words: no tags, names, JSON or quotes; never end mid-word.
const EXPRS = ["neutral", "happy", "surprised", "sad", "thinking", "smirk", "unimpressed", "cheeky"];
function extractReply(text: string, stop: string) {
  let t = String(text || "").trim(), expr = "neutral", fix = "";
  let ref = false;
  if (/\[\s*ref\s*\]/i.test(t)) { ref = true; t = t.replace(/\[\s*ref\s*\]/gi, " "); }
  const fm = t.match(/\[\s*fix\s*:\s*([^\]]+)\]/i);
  if (fm) { fix = fm[1].trim(); t = t.replace(fm[0], " "); }
  const j = t.includes('"reply"') ? parseJSON(t) : null;
  if (j && typeof j.reply === "string") { t = j.reply; if (EXPRS.includes(j.expr)) expr = j.expr; }
  const tag = t.match(/^\s*\[(\w+)\]\s*/);
  if (tag) { if (EXPRS.includes(tag[1].toLowerCase())) expr = tag[1].toLowerCase(); t = t.slice(tag[0].length); }
  t = t
    .replace(/```[a-z]*|```/gi, "")
    .replace(/["']?(reply|expr|cevap|yanıt)["']?\s*:\s*/gi, "")
    .replace(/\b(neutral|happy|surprised|sad|thinking|smirk|unimpressed|cheeky)\b\s*[}\]]?\s*$/i, "")
    .replace(/^\s*(Daysy|Luna|Eva|Charlie|Sen|Ben|Kullanıcı|ARKADAŞ|Asistan)\s*:\s*/i, "")
    .replace(/\[(\w+)\]/g, "")
    .replace(/[{}"“”]/g, "")
    .replace(/\\n/g, " ")
    .replace(/\s*,\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
  const cut = stop === "max_tokens" || !/[.!?…]$/.test(t);
  if (cut && t) {
    const last = Math.max(t.lastIndexOf(". "), t.lastIndexOf("! "), t.lastIndexOf("? "), t.lastIndexOf("… "));
    if (last > 20) t = t.slice(0, last + 1);
    else if (!/[.!?…]$/.test(t)) t = t.replace(/\s+\S*$/, "") + "…";
  }
  return { reply: t, expr, fix, ref };
}

function parseJSON(text: string) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const auth = req.headers.get("Authorization") || "";
    const url = Deno.env.get("SUPABASE_URL")!;
    const userDb = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await userDb.auth.getUser();
    if (!user) return json({ error: "Oturum bulunamadı" }, 401);

    const body = await req.json();
    const action = body.action;

    if (action === "delete_account") {
      // photos live in storage, not in tables: remove the user's folder first
      try {
        const st = admin.storage.from("photos");
        const { data: days } = await st.list(user.id, { limit: 1000 });
        for (const d of days || []) {
          const { data: files } = await st.list(`${user.id}/${d.name}`, { limit: 1000 });
          if (files?.length) await st.remove(files.map(f => `${user.id}/${d.name}/${f.name}`));
        }
      } catch (_) { /* bucket may not exist yet */ }
      const { error } = await admin.auth.admin.deleteUser(user.id); // tablolar "on delete cascade" ile silinir
      if (error) throw error;
      return json({ ok: true });
    }

    // Ücretli kapılar: durum ve satın alma dikişi
    const pay = await paymentsOn(admin);
    if (action === "billing") {
      if (!pay) return json({ enabled: false });
      const { data: st, error } = await admin.rpc("billing_state", { p_user: user.id });
      if (error) throw error;
      return json({ enabled: true, products: PRODUCTS, free_characters: FREE_CHARACTERS, ...st });
    }
    if (action === "checkout") {
      if (!pay) return json({ error: "payments_off" }, 403);
      const sku = String(body.sku || ""), p = PRODUCTS[sku];
      if (!p) return json({ error: "Bilinmeyen ürün" }, 400);
      const { data: st } = await admin.rpc("billing_state", { p_user: user.id });
      if (st?.sub_active && p.credits) return json({ error: "not_for_subscribers" }, 409); // aboneye sayfa satılmaz
      if (sku === "charlie_once" && st?.charlie_owned) return json({ error: "already_owned" }, 409);
      if (devGrants()) {
        const { data: r, error } = await admin.rpc("billing_grant", {
          p_user: user.id, p_sku: sku, p_amount: p.kurus, p_credits: p.credits || 0, p_months: p.months || 0,
          p_provider: "dev", p_ref: crypto.randomUUID(),
        });
        if (error) throw error;
        return json({ granted: r === "ok" });
      }
      // Ödeme sağlayıcısı bağlandığında burada ödeme sayfası açılır; hak yalnızca sağlayıcının doğruladığı ödemeden
      // (billing_grant, sağlayıcının ödeme numarasıyla) yazılır. Şimdilik bağlı değil.
      return json({ error: "checkout_unavailable" }, 503);
    }

    // Limitler
    const since = new Date(); since.setUTCHours(0, 0, 0, 0);
    const [{ count: mine }, { count: all }] = await Promise.all([
      admin.from("ai_usage").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since.toISOString()),
      admin.from("ai_usage").select("id", { count: "exact", head: true }).gte("created_at", since.toISOString()),
    ]);
    if ((all ?? 0) >= GLOBAL_DAILY_LIMIT) return json({ error: "limit_global" }, 429);
    if ((mine ?? 0) >= USER_DAILY_LIMIT) return json({ error: "limit_user" }, 429);

    // spoken audio for a reply (only when the user picked "İnsan sesi" and the key exists)
    const withVoice = async (text: string, character: string) => {
      if (!body.voice || !Deno.env.get("GOOGLE_TTS_API_KEY")) return null;
      const { data: used } = await admin.from("ai_usage").select("output_tokens").eq("user_id", user.id).eq("kind", "tts").gte("created_at", since.toISOString());
      const chars = (used || []).reduce((n: number, u: { output_tokens: number }) => n + (u.output_tokens || 0), 0);
      if (chars + text.length > TTS_DAILY_CHARS) return null;
      const audio = await speakAudio(text, character);
      if (audio) await admin.from("ai_usage").insert({ user_id: user.id, kind: "tts", input_tokens: 0, output_tokens: text.length });
      return audio;
    };

    // Speech-to-text for phones where the browser can't listen (iPhone home-screen app, Firefox):
    // the app records audio and Cloudflare Workers AI Whisper turns it into text. Free daily allowance, no card.
    if (action === "stt") {
      const acc = Deno.env.get("CF_ACCOUNT_ID"), tok = Deno.env.get("CF_AI_TOKEN");
      if (!acc || !tok) return json({ error: "no_stt" }, 200);
      const audio = String(body.audio || "");
      if (!audio || audio.length > 3_000_000) return json({ text: "" });
      const { count: sttToday } = await admin.from("ai_usage").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("kind", "stt").gte("created_at", since.toISOString());
      if ((sttToday ?? 0) >= 300) return json({ error: "limit_user" }, 429);
      const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/ai/run/@cf/openai/whisper-large-v3-turbo`, {
        method: "POST", headers: { Authorization: `Bearer ${tok}`, "content-type": "application/json" },
        body: JSON.stringify({ audio, language: "tr", vad_filter: true, initial_prompt: "Türkçe günlük sohbeti. Ice latte, cold brew, Starbucks, kahve, okul, iş, sınav." }),
      });
      const d = await r.json().catch(() => ({}));
      await admin.from("ai_usage").insert({ user_id: user.id, kind: "stt", input_tokens: 0, output_tokens: 0 });
      if (!r.ok) return json({ error: d?.errors?.[0]?.message || "Ses yazıya çevrilemedi" }, 502);
      return json({ text: String(d?.result?.text || "").trim() });
    }

    if (action === "tts") {
      const text = String(body.text || "").slice(0, 300);
      if (!Deno.env.get("GOOGLE_TTS_API_KEY")) return json({ error: "no_tts" }, 200);
      const audio = await withVoice(text, ["daysy", "ivy", "sage", "charlie"].includes(body.character) ? body.character : "daysy");
      return json({ audio });
    }

    const { data: profile } = await userDb.from("profiles").select("*").eq("id", user.id).maybeSingle();
    const name = (profile?.name || "").slice(0, 40);
    const character = ["daysy", "ivy", "sage", "charlie"].includes(body.character) ? body.character : (profile?.character || "daysy");
    const msgs: { role: string; content: string }[] = (Array.isArray(body.messages) ? body.messages : [])
      .slice(action === "write" ? -400 : -24)
      .map((m: { role: string; content: string }) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 2000) }))
      .filter((m: { content: string }) => m.content.trim())
      // Claude wants alternating turns: merge back-to-back messages from the same side.
      .reduce((acc: { role: string; content: string }[], m: { role: string; content: string }) => {
        const last = acc[acc.length - 1];
        if (last && last.role === m.role) last.content += "\n" + m.content; else acc.push({ ...m });
        return acc;
      }, []);

    if (action === "chat") {
      // Kapı: Charlie kilitliyse model hiç çağrılmaz. Abonelik süresi burada, çağrıdan önce kontrol edilir.
      if (pay && !FREE_CHARACTERS.includes(character)) {
        const { data: ok } = await admin.rpc("billing_has_charlie", { p_user: user.id });
        if (ok !== true) return json({ error: "gate", gate: "charlie" }, 402);
      }
      const todayStr = body.today || new Date().toISOString().slice(0, 10);
      // Shared memory: every friend can read the diary. Each line says who the user actually told, so the
      // character knows whether to say "bana anlatmıştın" or "günlüğünden okuduğuma göre".
      const NAME: Record<string, string> = { daysy: "Daysy", ivy: "Luna", sage: "Eva", charlie: "Charlie" };
      const { data: past } = await userDb.from("entries").select("*").lte("day", todayStr).order("day", { ascending: false }).limit(12);
      const toldTo = (e: { messages: unknown; character: string }) => {
        const m = e.messages;
        const keys = Array.isArray(m) ? [e.character || "daysy"] : Object.keys((m as Record<string, unknown>) || {});
        return keys.length ? keys : [e.character || "daysy"];
      };
      // locked days are private even from the friends: they never enter the memory
      const lines = (past || []).filter(p => p.summary && p.locked !== true).slice(0, 8).map(p => {
        const who = toldTo(p), mine = who.length === 1 && who[0] === character;
        return `- ${p.day}${p.day === todayStr ? " (bugün)" : ""} · anlattığı arkadaşlar: ${who.map(k => NAME[k] || k).join(", ")}${mine ? " (yalnızca sen)" : ""} · ${p.summary}`;
      });
      // today's chats with the other friends that are not in a diary page yet
      for (const o of (Array.isArray(body.others) ? body.others : []).slice(0, 2)) {
        const k = String(o.character || ""), said = (Array.isArray(o.lines) ? o.lines : []).slice(-8).map((x: unknown) => String(x).slice(0, 220)).filter(Boolean);
        if (NAME[k] && k !== character && said.length) lines.push(`- ${todayStr} (bugün, günlüğüne not düştü) · anlattığı arkadaş: ${NAME[k]} · kullanıcının söyledikleri: ${said.join(" / ")}`);
      }
      const memory = lines.join("\n") || "- Henüz günlükte bir şey yok.";
      const today = body.today || new Date().toISOString().slice(0, 10);
      let screen = "";
      if (character === "charlie") screen = await charlieScreen(admin, profile, msgs);
      const system = `${PERSONA[character]}\nKullanıcının adı: ${name || "bilinmiyor"}. Bugün: ${today}.\nGünlükten bildiklerin (kullanıcıyı tanımak için; kaynağını doğru söyle):\n${memory}\n${screen}\n${RULES}`;
      const opener = body.returning
        ? "(Kullanıcı bugün seninle daha önce konuştu ve şimdi yeniden geldi. 'Tekrar hoş geldin' gibi sıcak, kısa bir selam ver ve şu an nasıl olduğunu sor. Önceki konuşmanın içeriğinden hiç bahsetme.)"
        : "(Yeni bir sohbet başladı. Kullanıcıyı adıyla sıcak ve kısa bir şekilde selamla, gününün nasıl geçtiğini sor. Geçmiş günlerden bahsetme.)";
      const convo = msgs.length && msgs[0].role === "user" ? msgs : [{ role: "user", content: opener }, ...msgs];
      const { text, usage, stop } = await claude(system, convo, 700);
      await admin.from("ai_usage").insert({ user_id: user.id, kind: "chat", input_tokens: usage.input_tokens || 0, output_tokens: usage.output_tokens || 0 });
      const out = extractReply(text, stop);
      let reply = out.reply || "Hmm, bir şey kaçırdım galiba. Bir daha anlatır mısın?";
      // Charlie's show/film jokes are counted with an invisible mark the app keeps in the chat history
      if (character === "charlie" && out.ref) reply += REF_MARK;
      const audio = await withVoice(reply.replace(REF_MARK, ""), character);
      return json({ reply, expr: out.expr, fix: out.fix || "", audio });
    }

    if (action === "write") {
      if (!msgs.some(m => m.role === "user")) return json({ error: "Önce biraz anlatman lazım" }, 400);
      // Kapı: sayfa hakkı modeli çağırmadan ÖNCE sorulur; hak, sayfa kaydedilince (billing_commit_page) düşer.
      const reqId = String(body.request_id || "").slice(0, 80), day = String(body.day || "");
      let noteChar = character;
      if (pay) {
        if (!reqId || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return json({ error: "Eksik istek bilgisi" }, 400);
        const { data: d, error } = await admin.rpc("billing_page_decision", { p_user: user.id, p_request: reqId, p_entry_day: day });
        if (error) throw error;
        if (d === "done") { // aynı istek ikinci kez geldi: modele gitmez, kayıtlı sayfa döner, hak tekrar düşmez
          const { data: e } = await admin.from("entries").select("title,body,moment,mood,tags,summary,note").eq("user_id", user.id).eq("day", day).maybeSingle();
          return json({ ...(e || {}), saved: true, kind: "done" });
        }
        if (d === "blocked") return json({ error: "gate", gate: "page" }, 402);
        if (d === "blocked_sub") return json({ error: "gate", gate: "page_sub" }, 402);
        // sayfanın altındaki not Charlie'nin ağzından olacaksa Charlie açık olmalı; değilse Daysy yazar
        if (!FREE_CHARACTERS.includes(character)) {
          const { data: ok } = await admin.rpc("billing_has_charlie", { p_user: user.id });
          if (ok !== true) noteChar = "daysy";
        }
      }
      // user lines are numbered so the writer can check it used every one of them
      let n = 0;
      const transcript = msgs.map(m => m.role === "user" ? `[${++n}] KULLANICI: ${m.content}` : `(karakterin cevabı, günlüğe yazılmaz) ${m.content}`).join("\n");
      // the page grows with what was told: a long evening of talking gets a long page, nothing is dropped
      const told = msgs.filter(m => m.role === "user").map(m => m.content).join(" ").split(/\s+/).filter(Boolean).length;
      const target = Math.max(120, Math.min(2800, Math.round(told * 1.2)));
      const paras = Math.max(2, Math.min(22, Math.round(target / 85)));
      // The page is the user's own diary: it is written in their voice only. The character's persona is kept out of the
      // page and used for the separate "note" field alone, so its tone never leaks into the diary.
      const system = `Bir sohbet dökümünden, kullanıcının KENDİ günlüğünü, tamamen kullanıcının kendi ağzından yazıyorsun. Bu sayfa kullanıcının kendi defteri; onu kullanıcı yazmış gibi olmalı.
Dökümdeki kullanıcı mesajları sesten yazıya çevrildi; yanlış duyulmuş kelimeleri (ör. "Aysel teyze" → ice latte) bağlamdan düzelterek anla.

SES (en önemli kural):
- Başlık, gövde ve "moment" baştan sona kullanıcının ağzından, birinci tekil şahısla ("ben", "bugün gittim", "hissettim") yazılır.
- Kullanıcıya hiçbir yerde "sen" diye hitap etme; kullanıcıdan "o" diye ya da adıyla üçüncü şahıs olarak söz etme.
- Sohbet karakterinin sesi, tarzı, esprileri, yorumları ve tavsiyeleri günlüğe girmez. Karakterin cevapları sadece kullanıcının ne anlattığını anlamana yardım eder; onları kullanıcının düşüncesi gibi yazma.
- Sohbetten, uygulamadan ya da karakterden söz etme ("Daysy'ye anlattım", "sohbet ettik" gibi); sayfa, kullanıcının gününü doğrudan kendi defterine yazmış gibi olsun. Tek istisna: kullanıcı kendi mesajında bundan özellikle bahsettiyse.
- Kullanıcının üslubunu koru: resmi konuşuyorsa resmi, esprili konuşuyorsa esprili, kısa cümleler kuruyorsa sade yaz. Kendi kelimelerini ve deyişlerini kullan.
- Yazdıktan sonra her cümleyi kontrol et: kullanıcı bu cümleyi kendi defterine kendisi yazmış olabilir mi? Olamazsa düzelt.

Yazım tarzı:
- Sıcak, samimi, akıcı Türkçe; sanki akşam yatmadan önce defterine yazıyormuş gibi.
- Günün küçük ayrıntılarını (içtiği kahve, kiminle ne konuştuğu, hissettiği şey) canlı ve sevimli anlat; yerinde hafif bir tebessüm ve mizah olabilir.
- Kullanıcının kendi ifadelerini ve sevdiği kelimeleri koru. Dökümde olmayan hiçbir olayı, kişiyi ya da ayrıntıyı uydurma.
- EKSİKSİZ OL: Kullanıcının anlattığı HER olayı, kişiyi, yeri, planı, duyguyu ve ayrıntıyı günlüğe yaz; hiçbirini atlama, birleştirip yok etme, kısaltıp özetleme. Önemsiz görünen küçük şeyler de (yediği yemek, bir şaka, gördüğü bir şey) yer alsın.
- Dökümde kullanıcı mesajları [1], [2], [3]… diye numaralı. Yazmadan önce her numaralı mesajı tek tek düşün: HER BİRİNİN içeriği günlükte en az bir cümleyle yer almalı. Hiçbir numarayı atlama; sadece "merhaba", "tamam" gibi içeriksiz mesajlar istisna.
- Olayları günün akışına göre, anlatıldığı sırayla yaz. Her konu ya da günün her bölümü için ayrı paragraf aç.
- Uzunluk anlatılanla orantılı: bu sohbet için yaklaşık ${paras} paragraf ve ${target} kelime civarı yaz. Kısa sohbette kısa, uzun sohbette uzun sayfa; asla yapay olarak kısaltma.
- Son paragraf küçük bir iç ses, şükür ya da yarına dair umutla bitsin.
- Başlık kısa, tatlı ve günü özetleyen bir cümle olsun (en fazla 6 kelime, ör. "Ice latte ve küçük bir zafer").

SADECE şu JSON'u döndür:
{"title": "başlık",
 "body": "paragraflar arasında \\n\\n",
 "moment": "günün en tatlı ya da en akılda kalan tek cümlesi (kısa)",
 "mood": "mutlu|sakin|heyecanli|yorgun|huzunlu|gergin",
 "tags": ["2-4 küçük harfli etiket"],
 "summary": "üçüncü şahısla 1-2 cümlelik özet (kişiler, planlar, duygular)",
 "note": "aşağıda tarif edilen karakterin ağzından kullanıcıya 1 kısa, sıcak, kendi tarzında cümle (günlüğün dışında, ayrı gösterilir)",
 "favorites": ["kullanıcının sevdiğini ya da şu an izlediğini SÖYLEDİĞİ dizi/film adları; yoksa boş liste"]}

Sadece "note" alanı için karakter tarifi (başlık, gövde ve moment'e karışmaz):
${PERSONA[noteChar]}`;
      // Turkish text needs room: a cut-off JSON was the reason pages sometimes failed. Retry once if it still breaks.
      let out = null, best = null, note = "";
      for (let attempt = 0; attempt < 3 && !out; attempt++) {
        const { text, usage } = await claude(system + note, [{ role: "user", content: transcript }], Math.min(12000, 1500 + target * 4));
        await admin.from("ai_usage").insert({ user_id: user.id, kind: "write", input_tokens: usage.input_tokens || 0, output_tokens: usage.output_tokens || 0 });
        const got = parseJSON(text);
        if (!got) { note = "\nÖNEMLİ: Yalnızca geçerli JSON döndür, başka hiçbir şey yazma."; continue; }
        const words = String(got.body || "").split(/\s+/).filter(Boolean).length;
        if (!best || words > best.words) best = { got, words };
        // a long evening squeezed into a short page means things were dropped: ask once more for the full page
        if (told > 120 && words < target * 0.6 && attempt < 2) {
          note = `\nÖNEMLİ: Önceki taslak çok kısaydı (${words} kelime) ve bazı anlatılanları atladı. Bu kez numaralı her kullanıcı mesajını kapsayan, yaklaşık ${target} kelimelik eksiksiz bir sayfa yaz.`;
          continue;
        }
        out = got;
      }
      if (!out && best) out = best.got;
      if (!out) return json({ error: "Günlük yazılamadı, birazdan tekrar dene" }, 502);
      // remember the shows and films they like (Charlie jokes about them now and then)
      const fav = (Array.isArray(out.favorites) ? out.favorites : []).map((x: unknown) => String(x).trim().slice(0, 60)).filter(Boolean);
      if (fav.length) {
        const had: string[] = Array.isArray(profile?.favorites) ? profile.favorites : [];
        const merged = [...fav, ...had].filter((x, i, a) => a.findIndex(y => y.toLocaleLowerCase("tr") === x.toLocaleLowerCase("tr")) === i).slice(0, 20);
        await admin.from("profiles").update({ favorites: merged }).eq("id", user.id);
      }
      const moods = ["mutlu", "sakin", "heyecanli", "yorgun", "huzunlu", "gergin"];
      const page = {
        title: String(out.title || "Bugün").slice(0, 80),
        body: String(out.body || ""),
        moment: String(out.moment || ""),
        mood: moods.includes(out.mood) ? out.mood : "sakin",
        tags: Array.isArray(out.tags) ? out.tags.slice(0, 4).map(String) : [],
        summary: String(out.summary || ""),
        note: String(out.note || ""),
      };
      if (!pay) return json(page); // ödemeler kapalı: uygulama sayfayı eskisi gibi kendisi kaydeder
      // Sayfa ve hak aynı işlemde: kaydolursa hak düşer, kaydolmazsa düşmez.
      const byFriend = body.by_friend && typeof body.by_friend === "object" ? body.by_friend : {};
      const { data: kind, error: cErr } = await admin.rpc("billing_commit_page", {
        p_user: user.id, p_request: reqId, p_entry_day: day,
        p_page: { ...page, character: noteChar, messages: byFriend },
      });
      if (cErr) throw cErr;
      if (kind === "blocked") return json({ error: "gate", gate: "page" }, 402);
      if (kind === "blocked_sub") return json({ error: "gate", gate: "page_sub" }, 402);
      return json({ ...page, saved: true, kind });
    }

    return json({ error: "Bilinmeyen işlem" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message || "Sunucu hatası" }, 500);
  }
});
