import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { Character, NAMES, hasTTS, turkishVoices, setPreferredVoice, currentVoiceName, audioCtx } from "/app/character.js?v=2611212223";

// ---------- Setup ----------
const cfg = window.DAYSAYDAY || {};
const sb = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
const root = document.getElementById("root");
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));

const MOODS = {
  mutlu: { label: "Mutlu", color: "#F6C343" }, sakin: { label: "Sakin", color: "#E9E3D6" },
  heyecanli: { label: "Heyecanlı", color: "#F07AA5" }, yorgun: { label: "Yorgun", color: "#A58BE0" },
  huzunlu: { label: "Hüzünlü", color: "#86A9E8" }, gergin: { label: "Gergin", color: "#F2785A" },
};
const flowerImg = m => `/img/flower-${MOODS[m] ? m : "sakin"}.svg`;
const FRIENDS = [
  { key: "daysy", name: "Daysy", tag: "Neşeli ve meraklı en yakın arkadaşın", q: "“Hadi biraz sohbet edelim, bugün nasıldı?”" },
  { key: "ivy", name: "Luna", tag: "Esprili ve dürüst arkadaşın", q: "“Anlat bakalım. Kim ne yaptı yine?”" },
  { key: "sage", name: "Eva", tag: "Sakin ve tecrübeli, abla gibi", q: "“Kahveni al gel. Bugün seni ne yordu?”" },
  { key: "charlie", name: "Charlie", tag: "Esprili, dizi ve film tutkunu", q: "“Lafı gediğine koyarım, filmi yarıda bırakmam!”" },
];
const mini = k => `/img/av-${k}.svg`; // round, centred avatar

const I = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c2 4 6 5 6 10a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 2 4 4 0-3 0-5 0-7z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z"/><path d="M9 9h6M9 13h4"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  micOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M9 9v2a3 3 0 0 0 5 2.2M15 10V6a3 3 0 0 0-5.7-1.3"/><path d="M5 11a7 7 0 0 0 11.5 5.3M19 11a7 7 0 0 1-.6 2.8M12 18v3"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10l5-3v10l-5-3"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12l16-8-6 16-2-7-8-1z"/></svg>',
  end: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 14c5-5 13-5 18 0l-2.5 2.5-3-1.5v-2.5a10 10 0 0 0-5 0V15l-3 1.5z"/></svg>',
  cc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 13h4M13 13h4M7 16h7"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13 7l4 4"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  kbd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8"/></svg>',
  unlock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 7.6-1.7"/></svg>',
  photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="9" cy="11" r="2"/><path d="m21 17-5-5-8 8"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  open: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 7.5-2"/></svg>',
  flame: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c2 4 6 5 6 10a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 2 4 4 0-3 0-5 0-7z"/></svg>',
};

// ---------- Dates ----------
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const today = () => iso(new Date());
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const longDate = s => parse(s).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });
const shortDate = s => parse(s).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
const monthName = (y, m) => new Date(y, m, 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

// ---------- State ----------
const S = { user: null, profile: null, char: null, prefs: loadPrefs() };
function loadPrefs() { try { return Object.assign({ voiceMode: "blip", sound: true, voiceName: "" }, JSON.parse(localStorage.getItem("dsd-prefs") || "{}")); } catch { return { voice: true, sound: true }; } }
function savePrefs() { try { localStorage.setItem("dsd-prefs", JSON.stringify(S.prefs)); } catch {} }
if (S.prefs.voiceName) setPreferredVoice(S.prefs.voiceName);
const humanVoice = () => S.prefs.voiceMode === "human";
const charKey = () => S.profile?.character || "daysy";
const charName = () => NAMES[charKey()];

function toast(msg, ms = 3200) {
  const t = document.getElementById("toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, ms);
}

// iOS/Safari: unlock speech + audio on the first tap so the character can talk later.
let unlocked = false;
document.addEventListener("click", () => {
  if (unlocked) return; unlocked = true;
  audioCtx();
  try { if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } } catch {}
}, { capture: true });

// Speech-to-text casing is messy ("bugün Ice Latte İçtim"): lowercase it and capitalise only sentence starts.
// Words made only of English letters (ice latte, cold brew, iPhone) are lowercased the English way so "I" doesn't become "ı".
const isEnglishish = w => /^[A-Za-z]+$/.test(w) && !(w.length > 1 && w === w.toUpperCase());
const lowerWord = w => isEnglishish(w) ? w.toLowerCase() : w.toLocaleLowerCase("tr");
const capWord = w => (isEnglishish(w) ? w[0].toUpperCase() : w[0].toLocaleUpperCase("tr")) + w.slice(1);
const sentenceCase = t => String(t || "").trim().replace(/\p{L}+/gu, lowerWord).replace(/(^|[.!?…]\s+)(\p{L}+)/gu, (m, p, w) => p + capWord(w));
// ---------- Server function ----------
const scrub = t => String(t || "").replace(/^\s*\[(\w+)\]\s*/, "").replace(/["']?(reply|expr)["']?\s*:\s*/gi, "").replace(/^\s*(Daysy|Luna|Eva|Charlie|Sen|Kullanıcı)\s*:\s*/i, "").replace(/[{}"“”]/g, "").replace(/\s+/g, " ").trim();
async function ai(payload) {
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("Cevap çok gecikti. İnternet bağlantını kontrol edip tekrar dener misin?")), payload.action === "write" ? 140000 : 30000));
  const { data, error } = await Promise.race([sb.functions.invoke("daysy", { body: payload }), timeout]);
  if (error) {
    let msg = "Bağlantı sorunu oldu, tekrar dener misin?";
    try { const j = await error.context.clone().json(); msg = j.error || msg; } catch {}
    if (msg === "gate") { // ücretli kapı: model hiç çağrılmadı
      let gate = ""; try { gate = (await error.context.clone().json()).gate || ""; } catch {}
      const err = new Error(gate === "charlie" ? "Charlie şu an kilitli." : "Bugünün sayfa hakkı doldu.");
      err.gate = gate; if (gate === "charlie") charlieSheet();
      throw err;
    }
    if (msg === "limit_user") msg = "Bugünlük sohbet hakkın doldu. Yarın yine buradayım!";
    if (msg === "limit_global") msg = "Bugün çok yoğunuz, sohbet hakları doldu. Yarın tekrar dene.";
    throw new Error(msg);
  }
  if (data && typeof data.reply === "string") data.reply = scrub(data.reply);
  return data;
}

// ---------- Data ----------
async function loadProfile() {
  const { data } = await sb.from("profiles").select("*").eq("id", S.user.id).maybeSingle();
  S.profile = data;
}
async function saveProfile(patch) {
  const row = { id: S.user.id, ...(S.profile || {}), ...patch };
  delete row.created_at;
  const { data, error } = await sb.from("profiles").upsert(row).select().single();
  if (error) throw error;
  S.profile = data;
}
async function getEntry(day) {
  const { data } = await sb.from("entries").select("*").eq("day", day).maybeSingle();
  return data;
}
// "locked" arrives with the 3rd SQL update; until it's run, ask without it instead of failing
async function selEntries(cols, build) {
  let r = await build(sb.from("entries").select(cols + ", locked"));
  if (r.error) r = await build(sb.from("entries").select(cols));
  return r.data || [];
}
async function entriesBetween(a, b) {
  return selEntries("day, title, mood, moment, summary", q => q.gte("day", a).lte("day", b).order("day", { ascending: true }));
}
async function recentDays(n = 400) {
  return selEntries("day, title, mood", q => q.order("day", { ascending: false }).limit(n));
}
const shownTitle = r => r.locked ? "Kilitli günlük" : (r.title || "Günlük");
function streakOf(days) {
  const set = new Set(days.map(d => d.day));
  let s = 0, cur = today();
  if (!set.has(cur)) cur = addDays(cur, -1);
  while (set.has(cur)) { s++; cur = addDays(cur, -1); }
  return s;
}

// ---------- Boot ----------
async function boot() {
  if (!cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY.startsWith("BURAYA")) {
    document.getElementById("boot").innerHTML = '<p style="max-width:420px;text-align:center;line-height:1.5">Kurulum eksik: <b>config.js</b> dosyasına Supabase anon anahtarı yazılmalı.</p>';
    return;
  }
  const { data: { session } } = await sb.auth.getSession();
  sb.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT") location.href = standalone() ? "/app/" : "/#tanitim"; });
  document.getElementById("boot").hidden = true; root.hidden = false;
  if (!session) return viewAuth(location.hash === "#giris" ? "giris" : "kaydol");
  S.user = session.user;
  if (!hasConsent(S.user)) await viewConsent();
  await loadProfile();
  await loadBilling();
  if (!S.profile || !S.profile.name) return viewOnboarding();
  window.addEventListener("hashchange", route);
  route();
  setTimeout(catchUpWrites, 1500); // conversations left without "Bitir" last time
  setTimeout(() => offerPush({ onOpen: true }).catch(() => {}), 3000); // bildirimler varsayılan açık: izin varsa sessizce abone ol, yoksa sor
}
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

// ---------- Ücretli kapılar ----------
// Fiyatlar ve haklar sunucudan gelir ("billing"); burada fiyat yazılmaz. Ödemeler kapalıysa (varsayılan)
// S.bill.enabled false olur ve hiçbir ödeme ekranı çıkmaz, uygulama eskisi gibi çalışır.
async function loadBilling() {
  try { const r = await ai({ action: "billing" }); S.bill = r && r.enabled ? r : { enabled: false }; }
  catch { S.bill = { enabled: false }; }
}
const payOn = () => !!S.bill?.enabled;
const tl = sku => `${(S.bill.products[sku].kurus / 100).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}\u00a0TL`; // "499 TL", "4.990 TL" (satır sonunda bölünmez)
const charlieLocked = () => payOn() && !S.bill.has_charlie;
const isFree = k => !payOn() || (S.bill.free_characters || []).includes(k) || S.bill.has_charlie;
// Bu gün için yeni bir sayfa yazılabilir mi? (sunucu ayrıca kontrol eder; bu sadece boşuna istek atmamak için)
function pageBlocked(day) {
  if (!payOn()) return false;
  const used = day === addDays(S.bill.today, -1) ? S.bill.yesterday_used : S.bill.today_used;
  return S.bill.sub_active ? used >= 2 : used >= 1 && !S.bill.credits;
}
// Ödeme dikişi: tek giriş noktası. Hak, yalnızca sunucuda doğrulanmış kayıttan yazılır.
async function startCheckout(sku) {
  try {
    const r = await ai({ action: "checkout", sku });
    if (r?.url) { location.href = r.url; return false; } // ödeme sağlayıcısının sayfası (bağlandığında)
    if (r?.granted) { await loadBilling(); return true; }
  } catch (e) {
    toast(/not_for_subscribers|already_owned/.test(e.message) ? "Bu zaten sende açık." : "Ödeme şu an alınamıyor. Biraz sonra tekrar dene.", 3600);
  }
  return false;
}
function paySheet(html, wire) {
  document.querySelector(".pay-sheet")?.remove();
  const el = document.createElement("div"); el.className = "pay-sheet"; el.setAttribute("role", "dialog");
  el.innerHTML = `<div class="ps-card">${html}<button class="ps-x" type="button" aria-label="Kapat">×</button></div>`;
  document.body.append(el);
  const close = () => el.remove();
  el.onclick = e => { if (e.target === el) close(); };
  el.querySelector(".ps-x").onclick = close;
  addEventListener("hashchange", close, { once: true });
  wire(el, close);
  return el;
}
const planLinks = (pre, mid, post) => `${pre}<button class="ps-link" type="button" data-sku="plan_month">ayda ${tl("plan_month")}</button>${mid}<button class="ps-link" type="button" data-sku="plan_year">yılda ${tl("plan_year")}</button>${post}`;
function wireBuy(el, close, after) {
  el.querySelectorAll("[data-sku]").forEach(b => b.onclick = async () => {
    el.querySelectorAll("button").forEach(x => x.disabled = true);
    const ok = await startCheckout(b.dataset.sku);
    if (ok) { close(); after && after(); } else el.querySelectorAll("button").forEach(x => x.disabled = false);
  });
}
// Charlie, abone değil ve kalıcı kilit açılmamış
function charlieSheet(after) {
  if (!charlieLocked()) return;
  paySheet(`<img class="ps-av" src="${mini("charlie")}" alt="">
    <p class="ps-main">Charlie ${tl("charlie_once")}. Bir kez açılır, sende kalır.</p>
    <button class="btn btn-dark btn-block" type="button" data-sku="charlie_once">Charlie'yi aç</button>
    <p class="ps-sub">${planLinks("Ya da her şey açık olsun. ", ", ", ".").replace("ayda", "Ayda")}</p>
    ${charKey() === "charlie" ? `<a class="ps-alt" href="#ayarlar">Başka bir arkadaş seç</a>` : ""}`,
    (el, close) => wireBuy(el, close, after));
}
// İkinci sayfa (abone değil, kredi yok) ya da abonenin üçüncü sayfası
function pageSheet(gate, after) {
  if (gate === "page_sub") return paySheet(`<p class="ps-main">Bugün iki sayfan da duruyor. Yarın yine yazarsın.</p>
    <button class="btn btn-dark btn-block ps-ok" type="button">Tamam</button>`, (el, close) => { el.querySelector(".ps-ok").onclick = close; });
  paySheet(`<p class="ps-main">Bugünün sayfası hazır. Bir sayfa daha ${tl("page_1")}. 4 sayfa ${tl("page_4")}.</p>
    <div class="ps-row"><button class="btn btn-dark" type="button" data-sku="page_1">1 sayfa</button><button class="btn btn-dark" type="button" data-sku="page_4">4 sayfa</button></div>
    <p class="ps-sub">${planLinks("Her gün 2 sayfa için ", " veya ", ".")}</p>`,
    (el, close) => wireBuy(el, close, after));
}

// ---------- Akşam hatırlatmaları (web push) ----------
// Telefona/tarayıcıya abone olur; saati gelince "hatirlatici" fonksiyonu seçilen karakterin ağzından bildirim yollar.
const PUSH_FN = cfg.PUSH_FN || "hatirlatici";
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
// "default" | "granted" | "denied" | "ios-install" (iPhone'da önce ana ekrana eklenmeli) | "unsupported"
const pushState = () => !pushSupported() ? (isIOS && !standalone() ? "ios-install" : "unsupported") : Notification.permission;
async function currentSub() { try { const r = await navigator.serviceWorker.ready; return await r.pushManager.getSubscription(); } catch { return null; } }
const b64u = s => { const b = atob((s + "=".repeat((4 - s.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(b, c => c.charCodeAt(0)); };
const userTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul"; } catch { return "Europe/Istanbul"; } };
async function enablePush() {
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error(perm === "denied" ? "denied" : "dismissed");
  const { data, error } = await sb.functions.invoke(PUSH_FN, { body: { action: "key" } });
  if (error || !data?.key) throw new Error("key");
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(data.key) });
  const j = sub.toJSON();
  const { error: e2 } = await sb.from("push_subscriptions").upsert({ endpoint: j.endpoint, user_id: S.user.id, p256dh: j.keys.p256dh, auth: j.keys.auth, ua: navigator.userAgent.slice(0, 200) });
  if (e2) throw e2;
  await saveProfile({ remind_on: true, tz: userTz() });
  localStorage.removeItem(PUSH_OFF);
}
async function disablePush() {
  localStorage.setItem(PUSH_OFF, "1"); // kullanıcı kendisi kapattı: bir daha kendiliğinden açma
  const sub = await currentSub(); if (!sub) return;
  await sb.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
  await sub.unsubscribe();
}
const PUSH_ASK = "dsd-push-ask", PUSH_OFF = "dsd-push-off";
const PUSH_LINE = {
  daysy: "Akşamları sana haber vereyim mi? Böylece serin hiç bozulmaz 🌼",
  ivy: "Akşamları unutursan diye haber vereyim mi? Unutursun çünkü.",
  sage: "Akşam kahvemi koyunca sana haber vereyim mi? ☕",
  charlie: "Her akşam yeni bölüm yayına girince haber vereyim mi? 🍿",
};
// İlk günlük sayfası yazılınca, karakterin ağzından bir kez sorar (reddedilirse 3 gün, iPhone kurulum notu 7 gün sonra tekrar)
// Uygulama her açıldığında da çalışır: bildirimler varsayılan olarak açık.
async function offerPush({ onOpen = false } = {}) {
  if (!S.user || document.querySelector(".push-offer") || localStorage.getItem(PUSH_OFF)) return;
  const st = pushState();
  if (st === "denied" || st === "unsupported") return;
  if (st === "granted") return enablePush().catch(() => {}); // izin zaten var: sormadan abone ol / aboneliği tazele
  if (onOpen && !["", "#bugun", "#sohbet"].includes(location.hash)) return; // görüntülü konuşmanın ortasında çıkmasın
  const last = +localStorage.getItem(PUSH_ASK) || 0;
  if (Date.now() - last < (st === "ios-install" ? 7 : 3) * 864e5) return;
  localStorage.setItem(PUSH_ASK, String(Date.now()));
  const k = "ivy", t = S.profile?.reminder_time || "21:00", ios = st === "ios-install"; // hatırlatmaları hep Luna gönderir (logo Luna)
  const el = document.createElement("div"); el.className = "push-offer"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Akşam hatırlatması");
  el.innerHTML = `<img src="${mini(k)}" alt=""><div class="po-body"><b>${NAMES[k]}</b>
    <p>${ios ? "Akşamları sana haber verebilmem için önce Daysayday'i ana ekranına eklemelisin." : PUSH_LINE[k]}</p>
    <small>${ios ? "iPhone'da bildirimler sadece ana ekrandan açılan uygulamada çalışır." : `Her akşam ${t}'da, sadece o gün yazmadıysan. Saati Ayarlar'dan değiştirebilirsin.`}</small>
    <div class="po-acts">${ios ? `<a class="btn btn-dark" href="/telefona-kur.html">Nasıl eklerim?</a>` : `<button class="btn btn-dark" type="button" data-a="yes">Evet, haber ver</button>`}<button class="btn btn-ghost" type="button" data-a="no">Şimdi değil</button></div></div>`;
  document.body.append(el);
  addEventListener("hashchange", () => el.remove(), { once: true }); // başka sayfaya geçince kart kapanır
  el.querySelector('[data-a="no"]').onclick = () => el.remove();
  const yes = el.querySelector('[data-a="yes"]');
  if (yes) yes.onclick = async () => {
    yes.disabled = true;
    try { await enablePush(); el.remove(); toast(`Tamam! Akşam ${t}'da haber veririm.`, 3400); }
    catch (e) { el.remove(); if (e.message === "denied") toast("Bildirim izni verilmedi. İstersen telefonun ayarlarından açabilirsin.", 4200); else if (e.message !== "dismissed") toast("Bildirim açılamadı, Ayarlar'dan tekrar deneyebilirsin.", 3600); }
  };
}

if (/\/test\.html$/.test(location.pathname)) window.__dsd = { offerPush }; // yalnızca yerel test sayfası için

// ---------- KVKK consent ----------
// Bump CONSENT_VERSION when the privacy text changes in a way that needs new consent: everyone is asked once more.
const CONSENT_VERSION = "2026-11-21";
const consentRecord = () => { const at = new Date().toISOString(); return { version: CONSENT_VERSION, aydinlatma_at: at, acik_riza_at: at }; };
const hasConsent = user => user?.user_metadata?.consent?.version === CONSENT_VERSION;
// Giriş / kayıt ekranlarının sol paneli (geniş ekranda): görselsiz, kısa uygulama tanıtımı
const ART = `<div class="art"><div class="intro">
  <span class="k">Daysayday nasıl çalışır?</span>
  <h2 class="disp">Gününü anlat,<br>gerisini biz yazalım.</h2>
  <ol>
    <li><b>Arkadaşını seç</b><span>Daysy, Luna, Eva ya da Charlie. Her birinin kendi tarzı var.</span></li>
    <li><b>Gününü anlat</b><span>İster mesajlaş, ister sesli konuş, istersen görüntülü.</span></li>
    <li><b>Günlüğün kendini yazsın</b><span>Sohbetin, senin ağzından bir günlük sayfasına dönüşür.</span></li>
    <li><b>Serini büyüt</b><span>Her gün bir çiçek; ayın sonunda hikâyen hazır.</span></li>
  </ol>
  <p class="foot">Ücretsiz · Mağazadan indirmeye gerek yok</p>
</div></div>`;
function viewConsent() {
  return new Promise(resolve => {
    root.innerHTML = `
    <div class="auth">${ART}
      <div class="pane">
        <a class="brand disp" href="/#tanitim"><img src="/img/logo.png" alt=""><span>Day<b>say</b>day</span></a>
        <h1 class="disp">Küçük bir onay</h1>
        <p class="sub">Kişisel verilerin için devam etmeden önce iki şeyi onaylaman gerekiyor. Günlüklerin olduğu gibi duruyor.</p>
        <form id="cForm" class="friends" novalidate>
          <div class="consent">
            <label class="check"><input type="checkbox" id="cKvkk"><span><a href="/gizlilik.html" target="_blank" rel="noopener">Gizlilik ve KVKK Aydınlatma Metni</a>’ni okudum.</span></label>
            <label class="check"><input type="checkbox" id="cRiza"><span>Sohbet ve günlük içeriklerimin işlenmesine ve cevap üretilmesi için yurt dışındaki yapay zekâ hizmetine (Anthropic) aktarılmasına <a href="/gizlilik.html#acik-riza" target="_blank" rel="noopener">açık rıza</a> veriyorum.</span></label>
          </div>
          <div class="err" id="cErr" role="alert"></div>
          <button class="btn btn-dark btn-block" id="cBtn" type="submit">Onayla ve devam et</button>
          <button class="btn btn-ghost btn-block" id="cOut" type="button">Onaylamadan çıkış yap</button>
        </form>
      </div></div>`;
    $("#cOut").onclick = () => sb.auth.signOut();
    $("#cForm").onsubmit = async e => {
      e.preventDefault();
      if (!($("#cKvkk").checked && $("#cRiza").checked)) return $("#cErr").textContent = "Devam etmek için iki onay kutusunu da işaretlemelisin.";
      $("#cBtn").disabled = true;
      const { data, error } = await sb.auth.updateUser({ data: { consent: consentRecord() } });
      if (error) { $("#cBtn").disabled = false; return $("#cErr").textContent = "Onay kaydedilemedi, biraz sonra tekrar dene."; }
      if (data?.user) S.user = data.user;
      resolve();
    };
  });
}

// ---------- Auth ----------
function viewAuth(mode) {
  root.innerHTML = `
  <div class="auth">
    ${ART}
    <div class="pane">
      <a class="brand disp" href="/#tanitim"><img src="/img/logo.png" alt=""><span>Day<b>say</b>day</span></a>
      <h1 class="disp" id="aTitle"></h1>
      <p class="sub" id="aSub"></p>
      <div class="seg" role="group" aria-label="Hesap">
        <button type="button" data-m="kaydol">Kaydol</button><button type="button" data-m="giris">Giriş yap</button>
      </div>
      <form id="aForm" class="friends" novalidate>
        <div class="field" id="nameField"><label for="aName">Adın ya da lakabın</label><input class="input" id="aName" autocomplete="given-name" maxlength="40"></div>
        <div class="field"><label for="aEmail">E-posta</label><input class="input" id="aEmail" type="email" autocomplete="email" required></div>
        <div class="field"><label for="aPass">Şifre</label><input class="input" id="aPass" type="password" minlength="6" required></div>
        <div class="consent" id="consentField">
          <label class="check"><input type="checkbox" id="aKvkk"><span><a href="/gizlilik.html" target="_blank" rel="noopener">Gizlilik ve KVKK Aydınlatma Metni</a>’ni okudum.</span></label>
          <label class="check"><input type="checkbox" id="aRiza"><span>Sohbet ve günlük içeriklerimin işlenmesine ve cevap üretilmesi için yurt dışındaki yapay zekâ hizmetine (Anthropic) aktarılmasına <a href="/gizlilik.html#acik-riza" target="_blank" rel="noopener">açık rıza</a> veriyorum.</span></label>
        </div>
        <div class="err" id="aErr" role="alert"></div>
        <button class="btn btn-dark btn-block" id="aBtn" type="submit"></button>
        <button class="btn btn-ghost btn-block" id="aForgot" type="button">Şifremi unuttum</button>
      </form>
    </div>
  </div>`;
  const set = m => {
    mode = m;
    $$(".seg button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
    $("#aTitle").textContent = m === "kaydol" ? "Gününü anlatmaya başla" : "Tekrar hoş geldin";
    $("#aSub").textContent = m === "kaydol" ? "Ücretsiz hesabını oluştur, bu akşam ilk sohbetini yap." : "Kaldığın yerden devam edelim.";
    $("#nameField").hidden = m !== "kaydol";
    $("#consentField").hidden = m !== "kaydol";
    $("#aForgot").hidden = m === "kaydol";
    $("#aBtn").textContent = m === "kaydol" ? "Hesap oluştur" : "Giriş yap";
    $("#aPass").autocomplete = m === "kaydol" ? "new-password" : "current-password";
    $("#aErr").textContent = "";
    history.replaceState(null, "", "#" + m);
  };
  $$(".seg button").forEach(b => b.onclick = () => set(b.dataset.m));
  set(mode);
  $("#aForgot").onclick = async () => {
    const email = $("#aEmail").value.trim();
    if (!email) { $("#aErr").textContent = "Önce e-posta adresini yaz."; return; }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + "/app/#ayarlar" });
    $("#aErr").textContent = error ? "Şu an e-posta gönderilemedi, biraz sonra tekrar dene." : "Şifre yenileme bağlantısı e-postana gönderildi.";
  };
  $("#aForm").onsubmit = async e => {
    e.preventDefault();
    const email = $("#aEmail").value.trim(), pass = $("#aPass").value, name = $("#aName").value.trim();
    const err = $("#aErr"), btn = $("#aBtn");
    if (mode === "kaydol" && !name) return err.textContent = "Sana nasıl sesleneyim? Adını yaz.";
    if (!email || !pass) return err.textContent = "E-posta ve şifre gerekli.";
    if (pass.length < 6) return err.textContent = "Şifre en az 6 karakter olmalı.";
    if (mode === "kaydol" && !($("#aKvkk").checked && $("#aRiza").checked)) return err.textContent = "Hesap oluşturmak için iki onay kutusunu da işaretlemelisin.";
    btn.disabled = true; err.textContent = "";
    try {
      if (mode === "kaydol") {
        const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { name, consent: consentRecord() } } });
        if (error) throw error;
        if (!data.session) { err.textContent = "Hesabın oluştu! E-postana gelen bağlantıyla onaylayıp giriş yap."; btn.disabled = false; return; }
        S.user = data.user;
        await saveProfile({ name, character: "daysy" });
        viewOnboarding();
      } else {
        const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        S.user = data.user;
        location.hash = "#bugun"; location.reload();
      }
    } catch (ex) {
      const m = String(ex.message || "");
      err.textContent = /Invalid login/i.test(m) ? "E-posta ya da şifre hatalı." : /registered|exists/i.test(m) ? "Bu e-postayla zaten bir hesap var. Giriş yapmayı dene." : /rate|limit/i.test(m) ? "Çok fazla deneme oldu, biraz bekleyip tekrar dene." : "Olmadı: " + m;
      btn.disabled = false;
    }
  };
}

// ---------- Onboarding ----------
function friendCards(selected) {
  return FRIENDS.map(f => { const lock = !isFree(f.key);
    return `<button type="button" class="friend-card f-${f.key}${lock ? " locked" : ""}" data-k="${f.key}" aria-pressed="${f.key === selected && !lock}">
    <span class="av"><img src="${mini(f.key)}" alt=""></span>
    <span><b>${f.name}</b><small>${f.tag}</small><span class="q">${f.q}</span>${lock ? `<span class="lk">${tl("charlie_once")} · bir kez açılır</span>` : ""}</span></button>`; }).join("");
}
// kilitli kart seçilmez; satın alınca kartlar yenilenir ve seçilir
function lockedPick(k, box, onPick) {
  if (isFree(k)) return false;
  charlieSheet(() => { box.innerHTML = friendCards(k); onPick(k); });
  return true;
}
function viewOnboarding() {
  let pick = S.profile?.character || "daysy";
  const name = S.profile?.name || S.user.user_metadata?.name || "";
  root.innerHTML = `
  <div class="auth">
    ${ART}
    <div class="pane">
      <div class="stage" style="margin:0"><div class="charbox" id="obChar"></div><div class="bubble" id="obBubble">Selaaam! Ben Daysy. Her akşam bana gününü anlatıyorsun, ben de günlüğüne yazıyorum.</div></div>
      <h1 class="disp">Akşamları kiminle konuşmak istersin?</h1>
      <p class="sub">İstediğin zaman ayarlardan değiştirebilirsin.</p>
      <div class="field"><label for="obName">Sana nasıl seslenelim?</label><input class="input" id="obName" maxlength="40" value="${esc(name)}"></div>
      <div class="friends" id="obFriends">${friendCards(pick)}</div>
      <div class="err" id="obErr" role="alert"></div>
      <button class="btn btn-dark btn-block" id="obGo" type="button"></button>
    </div>
  </div>`;
  const ch = new Character($("#obChar"), "daysy"); ch.sound = S.prefs.sound; ch.voiceOn = false;
  setTimeout(() => ch.signature(), 400);
  const upd = () => { $("#obGo").textContent = `${NAMES[pick]} ile başla`; $$("#obFriends .friend-card").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.k === pick))); };
  const wireOb = () => $$("#obFriends .friend-card").forEach(b => b.onclick = () => {
    if (lockedPick(b.dataset.k, $("#obFriends"), k => { pick = k; wireOb(); upd(); })) return;
    pick = b.dataset.k; upd();
    ch.mount(pick); ch.voiceOn = false;
    const line = { daysy: "Yaşasın, beni seçtin! Hadi bu akşam başlayalım.", ivy: "Tamam. Ben dinlerim, sen anlatırsın. Anlaştık.", sage: "Ne güzel. Kahveni al, her akşam buradayım.", charlie: "Seçildim! Patlamış mısırlar benden, hikâye senden." }[pick];
    ch.say(line, "happy", null, t => $("#obBubble").textContent = t);
  });
  wireOb();
  upd();
  $("#obGo").onclick = async () => {
    const n = $("#obName").value.trim();
    if (!n) return $("#obErr").textContent = "Adını yazar mısın?";
    $("#obGo").disabled = true;
    try { await saveProfile({ name: n, character: pick }); location.hash = "#bugun"; location.reload(); }
    catch (e) { $("#obErr").textContent = "Kaydedilemedi: " + e.message; $("#obGo").disabled = false; }
  };
}

// ---------- Shell ----------
const NAV = [
  { h: "#bugun", t: "Bugün", i: I.home }, { h: "#takvim", t: "Takvim", i: I.cal }, { h: "#gunlukler", t: "Günlükler", i: I.book },
  { h: "#ozet", t: "Aylık özet", i: I.chart }, { h: "#mektup", t: "Geleceğe mektup", i: I.mail }, { h: "#ayarlar", t: "Ayarlar", i: I.gear },
];
function shell(active, html) {
  const cur = h => (h === active ? 'aria-current="page"' : "");
  root.innerHTML = `
  <div class="shell">
    <aside class="side">
      <a class="brand disp" href="#bugun"><img src="/img/logo.png" alt=""><span>Day<b>say</b>day</span></a>
      <nav aria-label="Menü">${NAV.map(n => `<a href="${n.h}" ${cur(n.h)}>${n.i}${n.t}</a>`).join("")}</nav>
      <a class="me" href="#ayarlar"><img class="mini" src="${mini(charKey())}" alt=""><b>${charName()}</b></a>
    </aside>
    <main class="main" id="main">${html}</main>
    <nav class="tabbar" aria-label="Alt menü">
      <a href="#bugun" ${cur("#bugun")}>${I.home}Bugün</a>
      <a href="#takvim" ${cur("#takvim")}>${I.cal}Takvim</a>
      <a class="talk" href="#goruntulu" aria-label="${charName()} ile görüntülü konuş">${I.video}</a>
      <a href="#ozet" ${cur("#ozet")}>${I.chart}Özet</a>
      <a href="#ayarlar" ${cur("#ayarlar")}>${I.gear}Ayarlar</a>
    </nav>
  </div>`;
  return $("#main");
}

// ---------- Router ----------
let leave = null;
function route() {
  if (leave) { try { leave(); } catch {} leave = null; }
  const h = location.hash || "#bugun";
  const [p, arg] = h.slice(1).split("/");
  window.scrollTo(0, 0);
  if (["sohbet", "arama", "goruntulu"].includes(p) && charKey() === "charlie" && charlieLocked()) {
    location.replace("#bugun"); setTimeout(() => charlieSheet(), 60); return;
  }
  if (p === "sohbet") return viewChat();
  if (p === "arama") return viewCall(false);
  if (p === "goruntulu") return viewCall(true);
  if (p === "gun") return viewEntry(arg || today());
  if (p === "gunlukler") return viewList();
  if (p === "ozet") return viewSummary(arg);
  if (p === "mektup") return viewLetters();
  if (p === "ayarlar") return viewSettings();
  if (p === "takvim") return viewHome(arg);
  return viewToday();
}

// ---------- Home / calendar ----------
async function viewHome(ym) {
  const now = new Date();
  let [y, m] = ym ? ym.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  m -= 1;
  const greet = now.getHours() < 12 ? "Günaydın" : now.getHours() < 18 ? "İyi günler" : "İyi akşamlar";
  const main = shell("#takvim", `
    <div class="head-row">
      <div><div class="date">${esc(longDate(today()))}</div><h1 class="disp">${greet} ${esc(S.profile.name)}, bugün nasıldı?</h1></div>
      <div class="head-actions">
        <a class="btn btn-primary" href="#goruntulu">${I.video}Görüntülü konuş</a><a class="btn btn-ghost" href="#arama">${I.mic}Sesli konuş</a>
        <a class="btn btn-dark" href="#sohbet">${I.chat}Mesajlaş</a>
      </div>
    </div>
    <div class="home-grid">
      <section class="card" aria-labelledby="calTitle">
        <div class="cal-head">
          <h2 class="disp" id="calTitle">${monthName(y, m)}</h2>
          <div class="nav"><span class="streak" id="streak" hidden></span>
            <a class="icon-btn" href="#takvim/${iso(new Date(y, m - 1, 1)).slice(0, 7)}" aria-label="Önceki ay">${I.back}</a>
            <a class="icon-btn" href="#takvim/${iso(new Date(y, m + 1, 1)).slice(0, 7)}" aria-label="Sonraki ay">${I.next}</a></div>
        </div>
        <div class="dow"><span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span></div>
        <div class="days" id="days"></div>
      </section>
      <div class="side-col" id="sideCol"></div>
    </div>`);
  const first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
  const [monthRows, recent, weekAgo] = await Promise.all([
    entriesBetween(iso(first), iso(last)), recentDays(60), getEntry(addDays(today(), -7)),
  ]);
  if (!document.body.contains(main)) return;
  const byDay = Object.fromEntries(monthRows.map(e => [e.day, e]));
  const lead = (first.getDay() + 6) % 7, t = today();
  let cells = "";
  for (let i = 0; i < lead; i++) cells += '<span class="day blank"></span>';
  for (let d = 1; d <= last.getDate(); d++) {
    const k = iso(new Date(y, m, d)), e = byDay[k], fut = k > t;
    const cls = ["day", e ? "has" : "", k === t ? "tdy" : "", fut ? "future" : ""].join(" ");
    const label = `${d} ${monthName(y, m)}${e ? ", " + MOODS[e.mood]?.label : ""}`;
    cells += fut ? `<span class="${cls}"><span class="n">${d}</span></span>`
      : `<a class="${cls}" href="#gun/${k}" aria-label="${esc(label)}"><span class="n">${d}</span>${e ? `<img src="${flowerImg(e.mood)}" alt="">` : ""}</a>`;
  }
  $("#days").innerHTML = cells;
  const st = streakOf(recent);
  if (st > 0) { $("#streak").hidden = false; $("#streak").innerHTML = `${I.flame}${st} gün seri`; }
  const done = recent.some(r => r.day === t);
  $("#sideCol").innerHTML = `
    ${vaseCard(monthRows.filter(r => r.day <= t), y, m)}
    <div class="today-cta"><img class="mini" src="${mini(charKey())}" alt="">
      <div><b>${done ? "Bugünkü günlüğün hazır" : `${charName()} seni bekliyor`}</b>
      <p>${done ? "İstersen biraz daha konuşup günlüğünü güncelleyebilirsin." : "Birkaç dakika konuşalım, gününü günlüğüne yazayım."}</p>
      <a class="btn btn-primary" href="${done ? "#gun/" + t : "#goruntulu"}">${done ? "Günlüğünü oku" : "Hadi konuşalım"}</a></div></div>
    ${weekAgo ? `<a class="memory" href="#gun/${weekAgo.day}"><img src="${flowerImg(weekAgo.mood)}" alt=""><div><div class="k">1 HAFTA ÖNCE BUGÜN · ${esc(shortDate(weekAgo.day).toLocaleUpperCase("tr"))}</div><div class="t">${weekAgo.locked ? "Kilitli bir günlük" : esc(weekAgo.moment || weekAgo.title)}</div></div></a>` : ""}
    <section class="card"><h2 class="disp" style="font-size:20px">Son günlükler</h2>
      <div class="list">${recent.slice(0, 4).map(r => `<a class="row-link" href="#gun/${r.day}"><img src="${flowerImg(r.mood)}" alt=""><span style="flex:1;min-width:0"><b>${r.locked ? I.lock : ""}${esc(shownTitle(r))}</b><span>${esc(shortDate(r.day))} · ${MOODS[r.mood]?.label || ""}</span></span></a>`).join("") || '<p class="empty">Henüz günlük yok. İlk sohbetinden sonra burada görünecek.</p>'}</div>
    </section>`;
}

// ---------- The month's bouquet: every diary page puts that day's flower in a glass vase ----------
function vaseCard(rows, y, m) {
  const n = rows.length, N = 31, cx = 150, cy = 118;
  const rnd = i => { const x = Math.sin(i * 12.9898 + y * 78.233 + m * 3.7) * 43758.5453; return x - Math.floor(x); };
  // golden-angle spiral: the bouquet grows outward as the month fills, earlier flowers keep their place
  const heads = rows.map((r, i) => {
    const rad = Math.sqrt((i + .6) / N) * 104, a = i * 2.39996 + .4;
    const x = cx + Math.cos(a) * rad * 1.15, yy = cy + Math.sin(a) * rad * .72 - (1 - rad / 104) * 10;
    return { r, x, y: yy, s: 40 + rnd(i) * 8, rot: (rnd(i + 50) - .5) * 30 };
  }).sort((a, b) => a.y - b.y);
  const neck = i => cx - 22 + (rnd(i + 9) * 44);
  // where the stem meets the bloom (tulips and lavender sit lower in their picture)
  const base = h => { const low = h.r.mood === "heyecanli" || h.r.mood === "yorgun"; const d = h.s * (low ? .2 : .06), t = h.rot * Math.PI / 180;
    return [h.x - Math.sin(t) * d, h.y + Math.cos(t) * d]; };
  const stems = heads.map((h, i) => { const nx = neck(i), [bx, by] = base(h);
    // one smooth curve from the vase neck straight into the flower's base
    return `<path d="M${nx.toFixed(1)} 318 C ${nx.toFixed(1)} 250 ${bx.toFixed(1)} ${Math.min(300, by + 70).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}" />`; }).join("");
  // each flower lives in its own group at its spot; the bloom animation scales around that spot, so it never drifts off its stem
  const flowers = heads.map((h, i) => `<a href="#gun/${h.r.day}" aria-label="${esc(longDate(h.r.day))}"><g transform="translate(${h.x.toFixed(1)} ${h.y.toFixed(1)}) rotate(${h.rot.toFixed(1)})"><g class="fl${h.r.day === today() ? " new" : ""}" style="--d:${i * 40}ms"><image href="${flowerImg(h.r.mood)}" x="${(-h.s / 2).toFixed(1)}" y="${(-h.s / 2).toFixed(1)}" width="${h.s.toFixed(1)}" height="${h.s.toFixed(1)}"/></g></g></a>`).join("");
  const leaves = n ? `<g fill="#8CC48A" opacity=".9"><path d="M128 214 q-34 -6 -46 -30 q30 0 46 30z"/><path d="M172 214 q34 -8 44 -34 q-30 2 -44 34z"/><path d="M140 210 q-10 -30 4 -50 q8 26 -4 50z" fill="#79B577"/></g>` : "";
  const days = new Date(y, m + 1, 0).getDate();
  return `<section class="card vase-card" aria-label="${monthName(y, m)} buketi">
    <div class="vase-head"><h2 class="disp">${monthName(y, m).split(" ")[0]} buketin</h2><span>${n} / ${days} çiçek</span></div>
    <svg class="vase" viewBox="0 28 300 316" role="img" aria-label="Şeffaf vazoda ${n} çiçek">
      <defs><linearGradient id="vg" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#EFE6F7" stop-opacity=".18"/><stop offset="1" stop-color="#D9C9E8" stop-opacity=".42"/></linearGradient>
        <clipPath id="vclip"><path d="M118 206 C 118 222 96 236 92 266 C 86 306 110 332 150 332 C 190 332 214 306 208 266 C 204 236 182 222 182 206 Z"/></clipPath></defs>
      <ellipse cx="150" cy="334" rx="72" ry="7" fill="#2A1B30" opacity=".07"/>
      <g fill="none" stroke="#6FA96D" stroke-width="2.6" stroke-linecap="round">${stems}</g>
      ${leaves}
      <rect x="80" y="262" width="140" height="80" fill="#BFD7F2" opacity=".35" clip-path="url(#vclip)"/>
      <path d="M118 206 C 118 222 96 236 92 266 C 86 306 110 332 150 332 C 190 332 214 306 208 266 C 204 236 182 222 182 206 Z" fill="url(#vg)" stroke="#B9A6CC" stroke-opacity=".7" stroke-width="2"/>
      <ellipse cx="150" cy="206" rx="32" ry="6" fill="none" stroke="#B9A6CC" stroke-opacity=".8" stroke-width="2"/>
      <path d="M106 248 C 100 266 100 292 112 312" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity=".75"/>
      <line x1="94" y1="262" x2="206" y2="262" stroke="#9EC2EA" stroke-opacity=".6" stroke-width="1.5" clip-path="url(#vclip)"/>
      <g class="heads">${flowers}</g>
      ${n ? "" : `<text x="150" y="120" text-anchor="middle" class="vase-empty">İlk günlüğünle</text><text x="150" y="142" text-anchor="middle" class="vase-empty">vazoya ilk çiçek gelir</text>`}
    </svg>
    <p class="vase-note">${n ? `Her günlük, o günün çiçeğini vazoya ekler. Ay sonunda ${days} çiçeklik buketin tamamlanır.` : "Her günlük, o günün çiçeğini bu vazoya ekler."}</p>
  </section>`;
}

// ---------- Today (streak home) ----------
const MILESTONES = [3, 7, 14, 30, 50, 100, 365];
function flameSVG(lit, size = 120, num = null) {
  const id = "fl" + Math.random().toString(36).slice(2, 7);
  const outer = lit ? `url(#${id}a)` : "#D9CFE0", inner = lit ? `url(#${id}b)` : "#EEE7F2";
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true"><defs>
    <linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB13B"/><stop offset="1" stop-color="#FF5A36"/></linearGradient>
    <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3A6"/><stop offset="1" stop-color="#FFC531"/></linearGradient></defs>
    <path d="M50 4C56 22 78 32 78 60a28 28 0 0 1-56 0c0-14 8-20 10-32 7 6 11 12 12 20 4-12 6-26 6-44z" fill="${outer}"/>
    <path d="M50 46c4 9 14 14 14 26a14 14 0 0 1-28 0c0-7 4-10 5-16 4 3 6 6 6 10 2-6 3-12 3-20z" fill="${inner}"/>
    ${num !== null ? `<text x="50" y="80" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="${String(num).length > 2 ? 22 : 28}" fill="${lit ? "#7A2A10" : "#8A7C93"}">${num}</text>` : ""}</svg>`;
}
function bestStreak(days) {
  const ds = [...new Set(days.map(d => d.day))].sort();
  let best = 0, run = 0, prev = null;
  ds.forEach(d => { run = prev && addDays(prev, 1) === d ? run + 1 : 1; best = Math.max(best, run); prev = d; });
  return best;
}
async function viewToday() {
  const main = shell("#bugun", `<div class="today" id="tw"><p class="empty">Yükleniyor…</p></div>`);
  const [recent, weekAgo] = await Promise.all([recentDays(400), getEntry(addDays(today(), -7))]);
  if (!document.body.contains(main)) return;
  const t = today(), set = new Set(recent.map(r => r.day)), done = set.has(t);
  const streak = streakOf(recent), best = Math.max(bestStreak(recent), streak);
  const k = charKey(), name = esc(S.profile.name);
  // this week, Monday first
  const now = new Date(), monday = addDays(t, -((now.getDay() + 6) % 7));
  const week = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((lbl, i) => { const d = addDays(monday, i); return { lbl, d, lit: set.has(d), isToday: d === t, future: d > t }; });
  const next = MILESTONES.find(m => m > streak) || streak + 100, prevM = [...MILESTONES].reverse().find(m => m <= streak) || 0;
  const pct = Math.round((streak / next) * 100);
  const lines = {
    daysy: { done: `Bugünü de yazdık ${name}! Yarın yine bekliyorum.`, risk: `Serin devam ediyor ama bugünü henüz yazmadık. Hadi anlat, nasıl geçti?`, zero: `Selaaam ${name}! Yeni bir seri başlatalım mı? Bugün nasıldı?` },
    ivy: { done: `Tamam, bugünü hallettin. Yarın da gel, seriyi bozarsan bilirim.`, risk: `${streak} günlük seriyi bozacak mısın yani? İki dakika, hadi.`, zero: `Seri sıfır. Değiştirelim mi bunu? Anlat bakalım.` },
    sage: { done: `Ne güzel, bugünü de yazdın canım. Kendine ayırdığın bu zaman çok kıymetli.`, risk: `Her akşam biraz konuşmak sana iyi geliyor. Serini bugün de sürdürelim mi?`, zero: `Merhaba ${name}. Kahveni al gel, bugünden başlayalım.` },
    charlie: { done: `Bugünün bölümü yayında ${name}! Yarın yeni bölümde görüşürüz.`, risk: `${streak} bölümlük diziyi yarıda mı bırakacağız? Bugünün sahnesini anlat hadi.`, zero: `Selam ${name}! Pilot bölümü çekelim mi? Bugün nasıldı?` },
  }[k];
  const line = done ? lines.done : streak > 0 ? lines.risk : lines.zero;
  // a conversation that was left without pressing "Bitir" → offer to turn it into today's page
  const pending = !writing.has(t) && localStorage.getItem(dirtyKey(t))
    ? FR.map(f => [f, readDraft(t, f)]).find(([, m]) => m.some(x => x.role === "user")) : null;
  $("#tw").innerHTML = `
    <div class="today-col">
    <div class="today-head"><div class="date">${esc(longDate(t))}</div>
      <div class="pill-row"><span class="streak">${I.flame}${streak} gün</span><span class="best">En iyi: ${best}</span></div></div>
    <section class="streak-hero ${done ? "lit" : streak > 0 ? "risk" : ""}">
      <div class="flame-wrap ${done ? "glow" : ""}">${flameSVG(done || streak > 0, 132, streak)}</div>
      <h1 class="disp">${streak === 0 ? "Serini başlat" : done ? `${streak} günlük seri` : "Bugünü henüz yazmadın"}</h1>
      <p>${streak === 0 ? "Bugünün günlüğünü yazarak serini başlat." : done ? "Bugünkü günlüğün hazır. Yarın da yazarak serini sürdür." : "Serinin devam etmesi için bugünün günlüğünü yaz. Birkaç dakika yeter."}</p>
      <div class="week" aria-label="Bu hafta">${week.map(w => `<div class="wd ${w.isToday ? "is-today" : ""} ${w.future ? "future" : ""}">${flameSVG(w.lit, 34)}<span>${w.lbl}</span></div>`).join("")}</div>
    </section>
    <section class="buddy">
      <img class="av" src="${mini(k)}" alt="${charName()}">
      <div class="say"><b>${charName()}</b><p>${line}</p>
        <div class="head-actions">${done
          ? `<a class="btn btn-primary" href="#goruntulu">${I.video}Görüntülü konuş</a><a class="btn btn-ghost" href="#arama">${I.mic}Sesli konuş</a><a class="btn btn-dark" href="#sohbet">${I.chat}Mesajlaş</a><a class="btn btn-ghost" href="#gun/${t}">${I.book}Bugünkü günlüğünü oku</a>`
          : `<a class="btn btn-primary" href="#goruntulu">${I.video}Görüntülü konuş</a><a class="btn btn-ghost" href="#arama">${I.mic}Sesli konuş</a><a class="btn btn-dark" href="#sohbet">${I.chat}Mesajlaş</a>`}</div></div>
    </section>
    </div><div class="today-col">
    ${pending ? `<section class="pending"><div><b>Yeni sohbetin günlüğe eklenmeyi bekliyor</b><span>${localStorage.getItem(editedKey(t)) ? "Bugünkü günlüğünü kendin düzenlemiştin. Yeni konuştuklarınla yeniden yazalım mı?" : `${NAMES[pending[0]]} ile konuştuklarından günlüğünü yazalım mı?`}</span></div><button class="btn btn-primary" id="writeNow" type="button">Günlüğü yaz</button></section>` : ""}
    <section class="card goals">
      <div class="goal-top"><h2 class="disp">Sonraki rozet: ${next} gün</h2><span>${streak}/${next}</span></div>
      <div class="bar"><i style="width:${Math.max(4, pct)}%"></i></div>
      <div class="badges">${MILESTONES.slice(0, 6).map(m => `<div class="badge ${best >= m ? "got" : ""}" title="${m} günlük seri">${flameSVG(best >= m, 40)}<span>${m}</span></div>`).join("")}</div>
    </section>
    ${weekAgo ? `<a class="memory" href="#gun/${weekAgo.day}"><img src="${flowerImg(weekAgo.mood)}" alt=""><div><div class="k">1 HAFTA ÖNCE BUGÜN · ${esc(shortDate(weekAgo.day).toLocaleUpperCase("tr"))}</div><div class="t">${weekAgo.locked ? "Kilitli bir günlük" : esc(weekAgo.moment || weekAgo.title)}</div></div></a>` : ""}
    <div class="quick">
      <a class="card q" href="#takvim">${I.cal}<b>Çiçekli takvim</b><span>Ayın duygu haritası</span></a>
      <a class="card q" href="#ozet">${I.chart}<b>Aylık özet</b><span>Paylaşmalık kartın</span></a>
      <a class="card q" href="#mektup">${I.mail}<b>Geleceğe mektup</b><span>Kendine yaz, kilitle</span></a>
      <a class="card q" href="/telefona-kur.html">${I.home}<b>Telefona kur</b><span>Mağaza gerekmez</span></a>
    </div></div>`;
  if (pending) $("#writeNow").onclick = () => { localStorage.removeItem(editedKey(t)); finishAndWrite(t, pending[0], pending[1]); };
}

// ---------- List ----------
async function viewList() {
  const main = shell("#gunlukler", `<div class="page"><h1 class="disp">Günlüklerin</h1><div class="list" id="all"><p class="empty">Yükleniyor…</p></div></div>`);
  const rows = await recentDays(400);
  if (!document.body.contains(main)) return;
  $("#all").innerHTML = rows.map(r => `<a class="row-link" href="#gun/${r.day}" style="background:#fff"><img src="${flowerImg(r.mood)}" alt=""><span style="flex:1;min-width:0"><b>${r.locked ? I.lock : ""}${esc(shownTitle(r))}</b><span>${esc(longDate(r.day))}</span></span></a>`).join("")
    || '<p class="empty">Henüz günlük yok. <a href="#goruntulu">İlk sohbetini başlat.</a></p>';
}

// ---------- Speech recognition: push-to-talk dictation ----------
// Tap to start, talk as long as you like (pauses are fine), tap again to stop and get the whole text.
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function makeDictation(onText, onError) {
  if (!SR) return null;
  let committed = "", interim = "", active = false, r = null, resolveStop = null;
  const startOne = () => {
    r = new SR(); r.lang = "tr-TR"; r.interimResults = true; r.continuous = !/Android/i.test(navigator.userAgent); r.maxAlternatives = 1;
    r.onresult = e => {
      interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i], t = res[0].transcript.trim();
        if (res.isFinal) { if (t) committed += (committed ? " " : "") + t; } else interim += (interim ? " " : "") + t;
      }
      onText((committed + " " + interim).trim());
    };
    r.onerror = ev => {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        active = false;
        const iosApp = /iPhone|iPad/.test(navigator.userAgent) && (navigator.standalone || matchMedia("(display-mode: standalone)").matches);
        toast(iosApp ? "iPhone'da ana ekran uygulamasında sesli dinleme kapalı olabiliyor. Klavye ile yazabilir ya da siteyi Safari'de açabilirsin." : "Mikrofon izni yok. Adres çubuğundaki kilit simgesinden mikrofona izin ver.", 7000);
        onError && onError(ev.error);
      } else if (ev.error === "network" || ev.error === "audio-capture") { active = false; onError && onError(ev.error); }
    };
    r.onend = () => {
      if (active) { try { startOne(); } catch {} return; } // phones stop after silence: keep listening
      if (resolveStop) { const t = (committed + " " + interim).trim(); resolveStop(t); resolveStop = null; }
    };
    r.start();
  };
  return {
    start() { committed = ""; interim = ""; active = true; try { startOne(); return true; } catch { active = false; return false; } },
    stop() { active = false; return new Promise(res => { resolveStop = res; try { r.stop(); } catch { res((committed + " " + interim).trim()); } setTimeout(() => { if (resolveStop) { resolveStop((committed + " " + interim).trim()); resolveStop = null; } }, 1500); }); },
    abort() { active = false; resolveStop = null; try { r && r.abort(); } catch {} },
    get on() { return active; },
  };
}

// iPhone (and browsers without speech recognition): record the voice and let the server turn it into text.
const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
let cloudSTT = null; // null = unknown, true = server can transcribe, false = not set up
function makeRecorderDictation(onText, onError) {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return null;
  let rec = null, stream = null, chunks = [], active = false, t0 = 0, tick = null, maxT = null;
  const cleanup = () => { clearInterval(tick); clearTimeout(maxT); stream && stream.getTracks().forEach(t => t.stop()); stream = null; };
  return {
    start() {
      if (cloudSTT === false) { onError && onError("no_stt"); return false; }
      active = true; chunks = [];
      navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(s => {
        if (!active) { s.getTracks().forEach(t => t.stop()); return; }
        stream = s;
        const type = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg"].find(t => MediaRecorder.isTypeSupported?.(t)) || "";
        rec = new MediaRecorder(s, type ? { mimeType: type } : undefined);
        rec.ondataavailable = e => e.data && e.data.size && chunks.push(e.data);
        rec.start(250); t0 = Date.now();
        tick = setInterval(() => onText && onText(""), 1000);
        maxT = setTimeout(() => active && toast("En fazla 1 dakika konuşabilirsin; göndermek için dokun."), 60000);
      }).catch(() => { active = false; toast("Mikrofon izni yok. Ayarlardan bu siteye mikrofon izni ver.", 6000); onError && onError("not-allowed"); });
      return true;
    },
    async stop() {
      active = false;
      if (!rec) { cleanup(); return ""; }
      await new Promise(res => { rec.onstop = res; try { rec.stop(); } catch { res(); } });
      cleanup();
      const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" }); rec = null;
      if (blob.size < 2000) return "";
      const b64 = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1] || ""); fr.readAsDataURL(blob); });
      try {
        const r = await ai({ action: "stt", audio: b64, mime: blob.type });
        if (r.error === "no_stt") { cloudSTT = false; onError && onError("no_stt"); return ""; }
        cloudSTT = true; return String(r.text || "");
      } catch (e) { toast(e.message); return ""; }
    },
    abort() { active = false; try { rec && rec.stop(); } catch {} rec = null; cleanup(); },
    get on() { return active; },
    get seconds() { return t0 ? Math.round((Date.now() - t0) / 1000) : 0; },
    cloud: true,
  };
}
// Pick the best way to listen on this device.
function makeListener(onText, onError) {
  const wantCloud = (IS_IOS || !SR) && cloudSTT !== false;
  return (wantCloud && makeRecorderDictation(onText, onError)) || makeDictation(onText, onError);
}

// When it's your turn and nothing happens for 5 s, she does her own thing (hop / gum / coffee), then every ~12 s.
// Any key or tap resets the clock; sending a message stops the move and her face follows the conversation again.
function idleMoves(ch, isWaiting) {
  let last = Date.now(), moves = 0;
  const poke = () => { last = Date.now(); moves = 0; };
  const iv = setInterval(() => {
    if (!isWaiting() || document.hidden) { last = Date.now(); return; }
    if (Date.now() - last >= (moves ? 12000 : 5000)) { last = Date.now(); moves++; ch.flourish(); }
  }, 500);
  document.addEventListener("keydown", poke); document.addEventListener("pointerdown", poke);
  return { poke, stop() { clearInterval(iv); document.removeEventListener("keydown", poke); document.removeEventListener("pointerdown", poke); } };
}

// ---------- Conversation (shared by chat + call) ----------
// Each friend has her own conversation; the day's diary page is written from all of them together.
const clean = list => (Array.isArray(list) ? list : []).filter(m => m && (m.role === "user" || m.role === "assistant") && String(m.content || "").trim());
function byFriend(entry) {
  if (!entry) return {};
  const m = entry.messages;
  if (Array.isArray(m)) return m.length ? { [entry.character || "daysy"]: clean(m) } : {};
  return Object.fromEntries(Object.entries(m || {}).map(([k, v]) => [k, clean(v)]));
}
// The AI may notice speech-to-text slips ("Aysel teyze" → "ice latte") and send back the corrected sentence.
function applyFix(msgs, fix) {
  fix = scrub(fix); if (!fix) return false;
  for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === "user") { msgs[i] = { role: "user", content: fix }; return true; }
  return false;
}
// What the user told the other friends today (not yet in a diary page): they "read it in the diary".
function othersFor(day, key) {
  return ["daysy", "ivy", "sage", "charlie"].filter(k => k !== key).map(k => {
    let m = []; try { m = clean(JSON.parse(localStorage.getItem(draftKey(day, k)) || "[]")); } catch {}
    return { character: k, lines: m.filter(x => x.role === "user").map(x => x.content).slice(-8) };
  }).filter(o => o.lines.length);
}
function draftKey(day, key) { return `dsd-chat-${S.user.id}-${day}-${key}`; }
async function loadConversation(day, key) {
  try { const d = clean(JSON.parse(localStorage.getItem(draftKey(day, key)) || "null")); if (d.length) return d; } catch {}
  return byFriend(await getEntry(day))[key] || [];
}
function saveDraft(day, key, msgs) { try { localStorage.setItem(draftKey(day, key), JSON.stringify(clean(msgs))); } catch {} }

// Every conversation becomes a diary page on its own: when you leave the chat/call (or the app),
// everything told to every friend today is written up in the background. "Bitir" just does it now.
const FR = ["daysy", "ivy", "sage", "charlie"];
const dirtyKey = day => `dsd-dirty-${S.user.id}-${day}`;
const editedKey = day => `dsd-edited-${S.user.id}-${day}`;
const readDraft = (day, k) => { try { return clean(JSON.parse(localStorage.getItem(draftKey(day, k)) || "[]")); } catch { return []; } };
const markDirty = (day, key) => { try { localStorage.setItem(dirtyKey(day), key); } catch {} };
const writing = new Map(); // day → promise of the write in progress
async function writeDiary(day, key) {
  const all = byFriend(await getEntry(day));
  for (const k of FR) { const d = readDraft(day, k); if (d.length) all[k] = d; }
  if (!Object.values(all).some(m => m.some(x => x.role === "user"))) return false;
  // the page covers everything told to every friend today; the friend you talked to last goes last
  const order = [...Object.keys(all).filter(k => k !== key), key].filter(k => all[k]);
  // aynı içerik = aynı istek: tekrar gönderilirse sunucu hakkı ikinci kez düşmez
  const request_id = await sha(JSON.stringify([day, key, all]));
  const out = await ai({ action: "write", messages: order.flatMap(k => all[k]), character: key, day, request_id, by_friend: all });
  if (!out.saved) { // ödemeler kapalı: sayfayı eskisi gibi uygulama kaydeder
    const { saved, kind, ...page } = out;
    const { error } = await sb.from("entries").upsert({ user_id: S.user.id, day, ...page, character: key, messages: all }, { onConflict: "user_id,day" });
    if (error) throw error;
  } else loadBilling();
  FR.forEach(k => localStorage.removeItem(draftKey(day, k)));
  localStorage.removeItem(dirtyKey(day)); localStorage.removeItem(editedKey(day));
  setTimeout(() => offerPush().catch(() => {}), 2800); // "yarın akşam haber vereyim mi?"
  return true;
}
async function sha(t) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
}
function autoWrite(day, key) {
  if (writing.has(day)) return writing.get(day);
  if (pageBlocked(day)) return null; // hak yok: sohbet taslakta bekler, "Bitir" deyince seçenekler çıkar
  if (!localStorage.getItem(dirtyKey(day))) return null;
  if (localStorage.getItem(editedKey(day))) return null; // you edited this page by hand: ask first (Bugün ekranı)
  key = key || localStorage.getItem(dirtyKey(day)) || charKey();
  toast(`${NAMES[key]} sohbetinizi günlüğüne yazıyor…`, 3500);
  const job = writeDiary(day, key)
    .then(ok => { if (ok) { toast("Günlüğün kaydedildi.", 2600); const hsh = location.hash || "#bugun"; if (hsh === "#bugun" || hsh === "#gun/" + day || hsh.startsWith("#gunlukler")) route(); } return ok; })
    .catch(() => false) // stays dirty: tried again next time the app opens
    .finally(() => writing.delete(day));
  writing.set(day, job);
  return job;
}
function catchUpWrites() {
  if (!S.user) return;
  const pre = `dsd-dirty-${S.user.id}-`;
  Object.keys(localStorage).filter(k => k.startsWith(pre)).forEach(k => {
    const day = k.slice(pre.length);
    if (S.convo && S.convo.day === day) return; // still talking
    autoWrite(day, localStorage.getItem(k));
  });
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && S.convo) autoWrite(S.convo.day, S.convo.key); });
async function finishAndWrite(day, key, msgs) {
  saveDraft(day, key, msgs);
  if (!clean(msgs).some(m => m.role === "user")) { toast("Önce biraz anlatman lazım."); return false; }
  const ov = document.createElement("div"); ov.className = "writing";
  ov.innerHTML = `<div class="charbox" id="wrChar"></div><b>${NAMES[key]} gününü yazıyor…</b><span style="color:var(--soft)">Birkaç saniye sürer.</span>`;
  document.body.append(ov);
  const ch = new Character($("#wrChar", ov), key); ch.sound = false; ch.applyExpr("thinking");
  try {
    S.convo = null; await (writing.get(day) || writeDiary(day, key));
    ov.remove(); location.hash = "#gun/" + day; return true;
  } catch (e) {
    ov.remove();
    if (e.gate === "page" || e.gate === "page_sub") { pageSheet(e.gate, () => finishAndWrite(day, key, msgs)); return false; }
    toast(e.message || "Günlük yazılamadı."); return false;
  }
}

// ---------- Chat (voice / text) ----------
async function viewChat() {
  const day = today();
  root.innerHTML = "";
  const main = shell("", `
    <div class="chat">
      <div class="chat-top">
        <a class="icon-btn" href="#bugun" aria-label="Geri">${I.back}</a>
        <div class="who"><b>${charName()}</b><span>${esc(shortDate(day))}</span></div>
        <button class="btn btn-dark finish" id="finish" type="button" style="min-height:44px;padding:0 16px">Bitir</button>
      </div>
      <div class="chat-body"><div class="stage"><div class="charbox" id="chChar"></div><div class="st-pill" id="chStatus"><i></i><span>${charName()} geliyor…</span></div></div>
      <div class="convo">
        <div class="convo-head">
          <img class="av" src="${mini(charKey())}" alt="">
          <div class="who"><b>${charName()}</b><span>${esc(longDate(day))}</span></div>
          <button class="btn btn-dark finish" type="button">Bitir ve günlüğe yaz</button>
        </div>
        <div class="log" id="log" aria-live="polite"></div>
      <div class="composer">
        <form id="cForm">
          <label for="cText" class="sr">Mesajın</label>
          <textarea id="cText" rows="1" placeholder="Bir şey yaz…"></textarea>
          <button class="mic" id="micBtn" type="button" aria-label="Sesli anlat">${I.mic}</button>
          <button class="mic" id="sendBtn" type="submit" aria-label="Gönder" style="background:var(--ink)" hidden>${I.send}</button>
        </form>
        <div class="hint" id="hint">${SR ? "Mikrofona dokun, konuş; bitince tekrar dokun." : "Bu tarayıcı sesli dinlemeyi desteklemiyor (Chrome, Edge ya da Safari kullan). Yazarak da anlatabilirsin."}</div>
      </div></div></div>
    </div>`);
  const ch = new Character($("#chChar"), charKey()); ch.sound = S.prefs.sound; ch.voiceOn = humanVoice();
  const log = $("#log"), bubble = $("#chStatus"), ta = $("#cText");
  const key = charKey();
  let idle = null;
  S.convo = { day, key };
  leave = () => { idle && idle.stop(); ch.stop(); S.convo = null; autoWrite(day, key); };
  // every visit is a new conversation: earlier chats of today stay saved for the diary, but the AI only sees this one
  let msgs = await loadConversation(day, key), busy = false;
  const start = msgs.length, session = () => msgs.slice(start);
  const av = mini(charKey());
  const row = (m, extra = "") => m.role === "user"
    ? `<div class="row u"><div class="msg u">${esc(m.content)}</div></div>`
    : `<div class="row a${extra}"><img class="mav" src="${av}" alt=""><div class="msg a">${m.content == null ? '<span class="typing"><i></i><i></i><i></i></span>' : esc(m.content)}</div></div>`;
  // phone: only the conversation box scrolls (character stays put); wide screen: the page scrolls
  const toEnd = (smooth = true) => {
    if (getComputedStyle(log).overflowY === "auto") log.scrollTo({ top: log.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    else log.lastElementChild?.scrollIntoView({ block: "end", behavior: smooth ? "smooth" : "auto" });
  };
  const draw = () => { log.innerHTML = session().map(m => row(m)).join(""); toEnd(); };
  // while she types, keep following the newest words; stop only if you scroll up yourself to read back
  let follow = true;
  const scroller = () => getComputedStyle(log).overflowY === "auto" ? log : document.scrollingElement;
  const nearEnd = () => { const el = scroller(); return el.scrollHeight - el.scrollTop - el.clientHeight < 140; };
  const unstick = () => { setTimeout(() => { follow = nearEnd(); }, 60); };
  ["wheel", "touchmove"].forEach(ev => { log.addEventListener(ev, unstick, { passive: true }); window.addEventListener(ev, unstick, { passive: true }); });
  const followEnd = () => { if (!follow) return; const el = scroller(); el.scrollTop = el.scrollHeight; if (el !== log) log.lastElementChild?.scrollIntoView({ block: "end" }); };
  const status = (kind) => {
    const n = charName(), t = { think: `${n} yazıyor…`, talk: `${n} konuşuyor`, listen: `${n} seni dinliyor`, err: "Bir sorun oldu" }[kind];
    bubble.className = "st-pill " + kind; bubble.querySelector("span").textContent = t;
  };
  // a fresh bubble in the conversation for her next line: typing dots first, then the words as she says them
  const liveRow = () => { log.insertAdjacentHTML("beforeend", row({ role: "assistant", content: null }, " live")); const el = log.lastElementChild; follow = true; toEnd(false); return el; };
  const toggleSend = () => { const has = !!ta.value.trim(), dictating = $("#micBtn").classList.contains("on"); $("#sendBtn").hidden = !has || dictating; $("#micBtn").hidden = has && !!SR && !dictating; };
  ta.oninput = () => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 140) + "px"; toggleSend(); };
  async function reply() {
    busy = true; status("think"); ch.applyExpr("thinking");
    let live = liveRow();
    try {
      const r = await ai({ action: "chat", messages: session(), returning: start > 0, character: charKey(), today: day, voice: humanVoice(), others: othersFor(day, charKey()) });
      if (applyFix(msgs, r.fix)) { draw(); live = liveRow(); }
      if (r.reply) {
        msgs.push({ role: "assistant", content: r.reply }); saveDraft(day, key, msgs);
        const box = live.querySelector(".msg"); live.classList.add("speaking"); status("talk");
        box.textContent = "";
        await ch.say(r.reply, r.expr, null, t => { box.textContent = t; followEnd(); }, r.audio);
        box.textContent = r.reply; live.classList.remove("speaking", "live");
      } else live.remove();
      status("listen"); ch.applyExpr(ch.idle);
    } catch (e) { live.remove(); status("err"); log.insertAdjacentHTML("beforeend", `<div class="row note"><div class="msg note">${esc(e.message)}</div></div>`); ch.applyExpr("sad"); }
    busy = false;
  }
  async function send(text) {
    text = text.trim(); if (!text || busy) return;
    ch.stop(); msgs.push({ role: "user", content: text }); saveDraft(day, key, msgs); markDirty(day, key); draw(); ta.value = ""; ta.oninput();
    await reply();
  }
  $("#cForm").onsubmit = e => { e.preventDefault(); send(ta.value); };
  ta.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(ta.value); } };
  const dict = makeListener(t => { if (t) { ta.value = sentenceCase(t); ta.oninput(); } else if (dict?.cloud) $("#hint").textContent = `Kaydediliyor… ${dict.seconds} sn · bitince tekrar dokun`; });
  idle = idleMoves(ch, () => !busy && !dict?.on);
  const micIdle = () => { $("#micBtn").classList.remove("on"); $("#micBtn").innerHTML = I.mic; $("#micBtn").setAttribute("aria-label", "Konuşmaya başla"); $("#hint").textContent = "Mikrofona dokun, konuş; bitince tekrar dokun."; };
  $("#micBtn").onclick = async () => {
    if (!dict) { ta.focus(); return; }
    if (dict.on) {
      micIdle(); $("#hint").textContent = "Gönderiliyor…";
      const t = sentenceCase(await dict.stop());
      micIdle(); ch.applyExpr(ch.idle);
      ta.value = t; ta.oninput();
      if (t) { ta.focus(); $("#hint").textContent = "Doğru anlamış mıyım? Gerekirse düzelt, sonra gönder."; } // nothing heard: nothing happens
      return;
    }
    ch.stop(); ch.listen();
    if (!dict.start()) return toast("Mikrofon açılamadı.");
    $("#micBtn").classList.add("on"); $("#micBtn").innerHTML = I.send; $("#micBtn").setAttribute("aria-label", "Bitir ve gönder");
    $("#hint").textContent = "Dinliyorum… istediğin kadar anlat, bitince tekrar dokun.";
  };
  $$(".finish").forEach(b => b.onclick = () => { ch.stop(); finishAndWrite(day, key, msgs); });
  const prev = leave; leave = () => { prev && prev(); dict && dict.abort(); };
  const lastReply = () => { const a = [...msgs].reverse().find(m => m.role === "assistant"); return a ? a.content : `${charName()} dinliyor…`; };
  draw();
  await reply(); // always a fresh hello
}

// ---------- Calls: video (full-screen, her room) and voice (push to talk) ----------
// each friend calls from her own room

// a desk in front of her so the picture doesn't end where her sweater does
const desk = (top, front, edge, props) => `<svg viewBox="0 0 520 200" preserveAspectRatio="xMidYMin meet" style="overflow:visible">
  <path d="M0,40 L520,40 L520,2000 L0,2000Z" fill="${front}"/>
  <path d="M0,0 L520,0 L520,44 L0,44Z" fill="${top}"/>
  <path d="M0,44 H520" stroke="${edge}" stroke-width="4"/>
  <path d="M0,4 H520" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>
  ${props}</svg>`;
const DESKS = {
  daysy: desk("#E7D6FF", "#C9B2F2", "#B79BEF", `<g transform="translate(70 -6) rotate(-8)"><rect width="78" height="30" rx="4" fill="#FF9BB0"/><rect x="6" y="4" width="66" height="22" rx="2" fill="#fff"/><path d="M14,12 H60 M14,18 H50" stroke="#E2B0C8" stroke-width="2"/></g><g transform="translate(390 -14)"><rect width="38" height="40" rx="8" fill="#fff"/><path d="M38,12 c12,0 12,16 0,16" fill="none" stroke="#fff" stroke-width="5"/><circle cx="19" cy="18" r="7" fill="#FFD84A"/></g>`),
  ivy: desk("#3A3E66", "#24274A", "#1A1C38", `<g transform="translate(64 -4) rotate(-6)"><rect width="46" height="24" rx="6" fill="#F28DB2"/><rect x="5" y="4" width="36" height="16" rx="3" fill="#1A1C38"/></g><g transform="translate(380 -18)"><rect width="34" height="44" rx="5" fill="#E2E4F6"/><path d="M8,14 l10,-6 v20 l-10,-6Z" fill="#2E3150"/></g>`),
  charlie: desk("#B9774F", "#8E5638", "#6E3F28", `<g transform="translate(396 -34)"><path d="M0,0 H34 L30,40 H4Z" fill="#E2524A"/><rect x="-2" y="-6" width="38" height="8" rx="3" fill="#fff"/><path d="M20,-6 L28,-26" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g><g transform="translate(64 -4) rotate(-6)"><rect width="70" height="26" rx="3" fill="#2E2A36"/><rect x="5" y="5" width="60" height="16" fill="#3F4E73"/></g>`),
  sage: desk("#D8B98F", "#B48A5E", "#94704A", `<g transform="translate(66 -6) rotate(-5)"><rect width="84" height="30" rx="3" fill="#8DB596"/><rect x="42" y="0" width="3" height="30" fill="#759E80"/></g><g transform="translate(392 -26)"><path d="M0,20 Q20,-10 40,20 L34,52 H6Z" fill="#E7B98E"/><path d="M20,20 C14,0 6,-6 0,-14 M20,20 C26,0 34,-6 40,-12" stroke="#7FAA8A" stroke-width="5" fill="none" stroke-linecap="round"/></g>`),
};
const SCENES = {
daysy:`<svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><rect width="390" height="844" fill="#EADCFB"/>
 <rect x="0" y="560" width="390" height="284" fill="#DCC8F6"/>
 <g transform="translate(-30 90)"><rect width="170" height="230" rx="14" fill="#FFFFFF"/><rect x="10" y="10" width="150" height="210" rx="8" fill="#BFE3FF"/><ellipse cx="60" cy="80" rx="34" ry="16" fill="#fff"/><ellipse cx="88" cy="74" rx="24" ry="14" fill="#fff"/><path d="M85,10 V220 M10,115 H160" stroke="#fff" stroke-width="8"/></g>
 <path d="M150,60 Q230,96 300,62 T420,70" fill="none" stroke="#B79BEF" stroke-width="2"/>
 ${[170,205,240,275,310,345,380].map((x,i)=>`<circle cx="${x}" cy="${74+((i%2)?8:14)}" r="7" fill="${['#FFD84A','#FF9BB0','#FFFFFF'][i%3]}"/>`).join("")}
 <g transform="translate(300 200)"><rect width="110" height="10" rx="4" fill="#C9B6F5"/><rect x="18" y="-46" width="30" height="46" rx="6" fill="#F28DB2"/><path d="M33,-46 C24,-70 30,-84 33,-92 C38,-80 42,-68 33,-46Z" fill="#8DB596"/><rect x="60" y="-32" width="26" height="32" rx="4" fill="#FFCD80"/></g>
</svg>`,
ivy:`<svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><rect width="390" height="844" fill="#2B2E4D"/>
 <g transform="translate(200 70)"><rect width="230" height="300" rx="10" fill="#171A33"/><rect x="10" y="10" width="210" height="280" rx="6" fill="#262C5C"/>
  <circle cx="150" cy="70" r="26" fill="#F4F1FF"/><circle cx="160" cy="62" r="24" fill="#262C5C"/>
  ${[[30,40],[70,90],[110,30],[40,140],[190,120]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.5" fill="#fff"/>`).join("")}
  <path d="M10,290 V220 H40 V180 H70 V230 H100 V160 H140 V210 H170 V190 H220 V290Z" fill="#14172E"/>
  ${[[50,200],[110,180],[120,200],[180,210],[80,240],[150,240]].map(([x,y])=>`<rect x="${x}" y="${y}" width="7" height="9" fill="#F7C873" opacity=".85"/>`).join("")}
  <path d="M115,10 V290" stroke="#171A33" stroke-width="6"/></g>
 <rect x="0" y="40" width="390" height="6" fill="#F28DB2" opacity=".9"/><rect x="0" y="34" width="390" height="18" fill="#F28DB2" opacity=".18"/>
 <g transform="translate(14 120) rotate(-4)"><rect width="110" height="150" rx="6" fill="#F28DB2"/><path d="M40,30 L30,80 L52,80 L42,124 L80,62 L58,62 L70,30Z" fill="#2B2E4D"/></g>
 <rect x="0" y="600" width="390" height="244" fill="#24274A"/>
</svg>`,
charlie:`<svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><rect width="390" height="844" fill="#F3B967"/>
 <rect x="0" y="0" width="390" height="40" fill="#C8302F"/>${Array.from({length:14},(_,i)=>`<circle cx="${14+i*28}" cy="20" r="6" fill="#FFE7A8"/>`).join("")}
 <g transform="translate(-10 90) rotate(-3)"><rect width="128" height="180" rx="6" fill="#2E2A36"/><rect x="8" y="8" width="112" height="164" rx="3" fill="#E2524A"/><circle cx="64" cy="70" r="30" fill="#FFE7A8"/><path d="M30,140 H98 M40,154 H88" stroke="#FFE7A8" stroke-width="6" stroke-linecap="round"/></g>
 <g transform="translate(276 110) rotate(4)"><rect width="128" height="180" rx="6" fill="#2E2A36"/><rect x="8" y="8" width="112" height="164" rx="3" fill="#3F4E73"/><path d="M30,120 L64,40 L98,120Z" fill="#FFCD80"/><path d="M30,146 H98" stroke="#FFE7A8" stroke-width="6" stroke-linecap="round"/></g>
 <rect x="0" y="600" width="390" height="244" fill="#7A3B2E"/>
 <g transform="translate(300 480)"><path d="M0,0 H70 L60,110 H10Z" fill="#fff"/><path d="M17,0 L22,110 M35,0 V110 M53,0 L48,110" stroke="#E2524A" stroke-width="9"/>${[[10,-6],[26,-12],[44,-8],[58,-4],[34,-20],[18,-20]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="10" fill="#FFF6D6"/>`).join("")}</g>
</svg>`,
sage:`<svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><rect width="390" height="844" fill="#E1EDD8"/>
 <g transform="translate(-20 110)"><rect width="150" height="10" rx="4" fill="#B48A5E"/><rect y="110" width="150" height="10" rx="4" fill="#B48A5E"/>
  <path d="M30,0 v-30 h26 v30Z" fill="#fff"/><path d="M56,-22 c10,0 10,14 0,14" fill="none" stroke="#fff" stroke-width="5"/><rect x="80" y="-40" width="22" height="40" rx="4" fill="#8DB596"/>
  <path d="M30,110 v-30 h26 v30Z" fill="#F2C6A0"/><rect x="80" y="76" width="36" height="34" rx="6" fill="#FFFFFF"/></g>
 <g transform="translate(320 60)"><path d="M0,0 V60" stroke="#8C6B4A" stroke-width="2"/><path d="M-30,60 H30 L22,96 H-22Z" fill="#E7B98E"/>
  ${[[-40,110,-30],[40,104,30],[-24,130,-60],[24,128,60],[0,140,90]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="30" ry="11" fill="#7FAA8A" transform="rotate(${r} ${x} ${y})"/>`).join("")}</g>
 <g transform="translate(200 0)"><path d="M40,0 V70" stroke="#8C6B4A" stroke-width="2"/><path d="M14,70 H66 L58,96 H22Z" fill="#F6E7BF"/><circle cx="40" cy="100" r="9" fill="#FFF3C4"/></g>
 <rect x="0" y="600" width="390" height="244" fill="#CFE1C4"/>
</svg>`};

async function viewCall(video = false) {
  const day = today(), key = charKey();
  root.innerHTML = `
  <div class="call ${key}${video ? " video" : ""}" role="dialog" aria-label="${charName()} ile ${video ? "görüntülü" : "sesli"} sohbet">
    ${video ? `<div class="scene" aria-hidden="true">${SCENES[key] || SCENES.daysy}</div><div class="shade" aria-hidden="true"></div>` : `<div class="bokeh" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>`}
    <div class="top">
      <span class="spacer"></span>
      <div class="who"><b class="disp">${charName()}</b><span><i></i><span id="timer">00:00</span></span></div>
      <div class="self" id="selfBox" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>Sen</div>
    </div>
    <div class="big"><div class="charbox" id="callChar"></div>${video ? `<div class="desk" aria-hidden="true">${DESKS[key] || DESKS.daysy}</div>` : ""}</div>
    <div class="talk">
      <div class="cap a" id="capA">Bağlanıyor…</div>
      <div class="cap u" id="capU" hidden></div>
    </div>
    <div class="state" id="state"></div>
    <form class="typebar" id="typebar" hidden>
      <label for="typeIn" class="sr">Mesajın</label>
      <input id="typeIn" autocomplete="off" placeholder="Yaz ya da klavyenin mikrofonuyla konuş…">
      <button type="submit" aria-label="Gönder">${I.send}</button>
    </form>
    <div class="ctrls">
      <button class="c" id="sideBtn" type="button" aria-label="Klavye ile yaz">${I.kbd}</button>
      <button class="c mainmic" id="talkBtn" type="button" aria-label="Konuşmaya başla">${I.mic}</button>
      <button class="c end" id="endBtn" type="button" aria-label="Bitir ve günlüğe yaz">${I.end}</button>
    </div>
  </div>`;
  const ch = new Character($("#callChar"), key); ch.sound = S.prefs.sound; ch.voiceOn = humanVoice();
  if (video) {
    // up close, like a phone camera: no round backdrop, head and shoulders fill the screen
    [...ch.svg.children].forEach(n => { if (n.tagName !== "clipPath" && !n.classList.contains("bodybob") && !n.querySelector?.(".bodybob") && !n.querySelector?.(".head")) n.remove(); });
    ch.svg.setAttribute("viewBox", "34 24 172 238"); ch.svg.setAttribute("preserveAspectRatio", "xMidYMax meet");
  }
  const capA = $("#capA"), capU = $("#capU"), state = $("#state"), talk = $("#talkBtn"), side = $("#sideBtn");
  avatarUrl().then(u => { if (u && $("#selfBox")) { $("#selfBox").classList.add("has-photo"); $("#selfBox").innerHTML = `<img src="${u}" alt=""><span>Sen</span>`; } });
  let msgs = await loadConversation(day, key), alive = true, mode = "idle", capsOn = true;
  const start = msgs.length, session = () => msgs.slice(start);
  const lastReply = () => { const a = [...msgs].reverse().find(m => m.role === "assistant"); return a ? a.content : ""; };
  const t0 = Date.now(), tick = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); $("#timer").textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }, 1000);
  // While you talk she listens: nods, smiles, raises her brows, and reacts to what she hears.
  let listenTimer = null, lastLen = 0, lastFlourish = 0;
  const MOODWORDS = [[/harika|süper|mutlu|sevin|güzel|başar|kazan|aşık|eğlen|gül/i, "smile"], [/üzgün|kötü|ağla|kırıl|yalnız|özle|kaybet|hasta|yorgun/i, "sad"], [/inanamıyorum|şok|vay|nasıl ya|cidden|aniden|meğer/i, "surprised"], [/sinir|kız(dım|gın)|kavga|bıktım|nefret/i, "brow"]];
  const startListening = () => { stopListening(); const loop = () => { listenTimer = setTimeout(() => {
    if (Date.now() - lastFlourish > 18000 && Math.random() < .18) { lastFlourish = Date.now(); ch.flourish(); }
    else ch.react(["nod", "brow", "tilt", "nod", "smile"][Math.floor(Math.random() * 5)]);
    loop(); }, 1600 + Math.random() * 1800); }; loop(); };
  const stopListening = () => { clearTimeout(listenTimer); listenTimer = null; };
  const typebar = $("#typebar"), typeIn = $("#typeIn");
  const openType = (focus = true) => { typebar.hidden = false; if (focus) typeIn.focus(); };
  const dict = makeListener(t => {
    if (!t) { if (dict?.cloud && mode === "rec") state.textContent = `Dinliyorum… ${dict.seconds} sn · bitince tekrar dokun, gönderilsin`; return; }
    showCap(sentenceCase(t), true);
    const fresh = t.slice(lastLen); lastLen = t.length;
    for (const [re, r] of MOODWORDS) if (re.test(fresh)) { ch.react(r); break; }
  }, kind => { setMode("idle"); showCap(lastReply()); openType(false); state.textContent = kind === "no_stt" ? "Bu cihazda sesli konuşma henüz etkin değil. Yazabilir ya da klavyenin mikrofon tuşuyla konuşabilirsin." : "Sesli dinleme şu an çalışmıyor; yazarak devam edebilirsin."; });
  const idle = idleMoves(ch, () => mode === "ready" || mode === "idle");
  S.convo = { day, key };
  leave = () => { idle.stop(); alive = false; clearInterval(tick); stopListening(); clearTimeout(pendingTimer); ch.stop(); dict && dict.abort(); S.convo = null; autoWrite(day, key); };

  function showCap(t, you = false) {
    const el = you ? capU : capA;
    capA.hidden = you; capU.hidden = !you;
    el.textContent = t || "";
    el.style.visibility = capsOn && t ? "visible" : "hidden";
  }
  function setMode(m) {
    mode = m;
    if (m === "rec") { lastLen = 0; startListening(); } else stopListening();
    talk.classList.toggle("rec", m === "rec");
    talk.classList.toggle("ready", m === "ready");
    talk.innerHTML = m === "rec" ? I.send : I.mic;
    talk.disabled = m === "thinking" || m === "confirm";
    talk.setAttribute("aria-label", m === "rec" ? "Bitir ve gönder" : "Konuşmaya başla");
    side.innerHTML = m === "rec" ? I.x : I.kbd;
    side.setAttribute("aria-label", m === "rec" ? "Vazgeç" : "Klavye ile yaz");
    state.textContent = { idle: SR ? "Konuşmak için mikrofona dokun" : "Bu tarayıcı sesli dinlemeyi desteklemiyor. Chrome, Edge ya da Safari kullan.", rec: "Dinliyorum… bitince tekrar dokun, gönderilsin", thinking: `${charName()} düşünüyor…`, speaking: `${charName()} konuşuyor…`, ready: "Sıra sende! Konuşmak için mikrofona dokun", confirm: "" }[m];
  }
  async function speak(text, expr, audio) {
    setMode("speaking");
    await ch.say(text, expr, null, t => { if (mode === "speaking") showCap(t); }, audio);
    if (!alive) return;
    if (mode === "speaking" || mode === "idle") {
      showCap(text); setMode("ready");
    }
  }
  async function ask() {
    ch.stop(); setMode("thinking"); ch.applyExpr("thinking");
    try {
      const r = await ai({ action: "chat", messages: session(), returning: start > 0, character: key, today: day, voice: humanVoice(), others: othersFor(day, key) });
      if (!alive) return;
      applyFix(msgs, r.fix);
      if (!r.reply) { showCap(lastReply()); ch.applyExpr(ch.idle); setMode("idle"); return; }
      msgs.push({ role: "assistant", content: r.reply }); saveDraft(day, key, msgs);
      await speak(r.reply, r.expr, r.audio);
    } catch (e) {
      if (!alive) return;
      showCap(lastReply()); ch.applyExpr("sad"); setMode("idle");
      state.textContent = e.message + " Söylediğin kaydedildi; tekrar konuşunca devam eder.";
    }
  }
  talk.onclick = async () => {
    if (!dict) { openType(); state.textContent = "Bu tarayıcıda sesli dinleme yok; yazarak konuşabilirsin."; return; }
    if (mode === "rec") {
      setMode("thinking"); state.textContent = "Gönderiliyor…";
      const text = sentenceCase(await dict.stop());
      if (!alive) return;
      if (!text) { // nothing heard: no message, just a gentle hint
        showCap(lastReply()); setMode("idle"); ch.applyExpr(ch.idle);
        state.textContent = "Sesini alamadım. Biraz daha yakından tekrar dene ya da klavye ile yaz.";
        return;
      }
      return confirmThenSend(text);
    }
    if (mode === "speaking") { ch.stop(); showCap(lastReply()); }
    ch.listen();
    if (!dict.start()) return;
    setMode("rec"); showCap(lastReply()); ch.react("smile");
  };
  // Speech can be misheard (e.g. "Aysel de" → "Aysel teyze"): show it briefly with a "Düzelt" button before sending.
  let pendingTimer = null;
  function confirmThenSend(text) {
    setMode("confirm");
    capA.hidden = true; capU.hidden = false; capU.style.visibility = "visible";
    capU.innerHTML = `<span class="heard"></span><span class="fix-row"><button type="button" class="fix">Düzelt</button><i class="bar"></i></span>`;
    capU.querySelector(".heard").textContent = text;
    state.textContent = "Gönderiliyor… yanlış anladıysam Düzelt'e dokun";
    pendingTimer = setTimeout(() => { pendingTimer = null; capU.textContent = text; userSays(text); }, 2600);
    capU.querySelector(".fix").onclick = () => {
      clearTimeout(pendingTimer); pendingTimer = null;
      capU.textContent = text; showCap(lastReply()); setMode("idle");
      openType(); typeIn.value = text; typeIn.setSelectionRange(text.length, text.length);
      state.textContent = "Düzeltip gönder tuşuna bas";
    };
  }
  function userSays(text) {
    msgs.push({ role: "user", content: text }); saveDraft(day, key, msgs); markDirty(day, key);
    showCap(text, true);
    return ask();
  }
  side.onclick = () => {
    if (mode === "rec") { dict.abort(); setMode("idle"); showCap(lastReply()); ch.applyExpr(ch.idle); return; }
    if (typebar.hidden) openType(); else typebar.hidden = true;
  };
  typebar.onsubmit = e => {
    e.preventDefault();
    const t = typeIn.value.trim(); if (!t || mode === "thinking") return;
    typeIn.value = ""; ch.stop(); userSays(t);
  };
  $("#endBtn").onclick = async () => {
    if (!msgs.some(m => m.role === "user") && !confirm("Henüz hiçbir şey anlatmadın, bu yüzden günlük yazılamaz. Yine de çıkmak istiyor musun?")) return;
    alive = false; stopListening(); ch.stop(); dict && dict.abort(); clearInterval(tick);
    if (msgs.some(m => m.role === "user")) { const ok = await finishAndWrite(day, key, msgs); if (!ok) location.hash = "#bugun"; }
    else location.hash = "#bugun";
  };
  // Start: always a fresh greeting ("tekrar hoş geldin" if you already talked today).
  setMode("thinking");
  try {
    ch.applyExpr("happy"); showCap("…");
    const r = await ai({ action: "chat", messages: [], returning: start > 0, character: key, today: day, voice: humanVoice(), others: othersFor(day, key) });
    if (!alive) return;
    if (r.reply) { msgs.push({ role: "assistant", content: r.reply }); saveDraft(day, key, msgs); await speak(r.reply, r.expr || "happy", r.audio); }
    else setMode("idle");
  } catch (e) { showCap(""); setMode("idle"); state.textContent = e.message; }
}

// ---------- Entry ----------
// ---------- Diary lock (4-digit PIN) ----------
// The PIN guards pages from whoever holds the phone. Only a PBKDF2 hash is stored; locked pages
// are also kept out of the friends' memory on the server.
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
async function pinHash(pin, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt + S.user.id), iterations: 150000 }, key, 256);
  return b64(bits);
}
const hasPin = () => !!S.profile?.lock_hash;
const isOpen = () => !hasPin() || Date.now() < (S.unlockedUntil || 0);
// A sweet keypad sheet. Resolves with the 4 digits, or null when closed.
function pinPad({ title, sub = "", forgot = false }) {
  return new Promise(res => {
    const ov = document.createElement("div"); ov.className = "pin-ov";
    ov.innerHTML = `<div class="pin-sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="pin-lock">${I.lock}</div><h2 class="disp">${esc(title)}</h2><p class="pin-sub">${esc(sub)}</p>
      <div class="pin-dots" aria-live="polite">${"<i></i>".repeat(4)}</div>
      <div class="pin-keys">${[1,2,3,4,5,6,7,8,9].map(n => `<button type="button" data-n="${n}">${n}</button>`).join("")}
        <button type="button" class="ghost" data-x="close">Vazgeç</button><button type="button" data-n="0">0</button><button type="button" class="ghost" data-x="del" aria-label="Sil">⌫</button></div>
      ${forgot ? `<button type="button" class="pin-forgot" data-x="forgot">Şifremi unuttum</button>` : ""}</div>`;
    document.body.append(ov);
    let v = ""; const dots = $$(".pin-dots i", ov);
    const paint = () => dots.forEach((d, i) => d.classList.toggle("on", i < v.length));
    const done = r => { ov.classList.add("out"); document.removeEventListener("keydown", kb); setTimeout(() => ov.remove(), 180); res(r); };
    const press = n => { if (v.length >= 4) return; v += n; paint(); if (v.length === 4) setTimeout(() => done(v), 140); };
    ov.onclick = ev => { const b = ev.target.closest("button"); if (!b) { if (ev.target === ov) done(null); return; }
      if (b.dataset.n) press(b.dataset.n); else if (b.dataset.x === "del") { v = v.slice(0, -1); paint(); } else if (b.dataset.x === "close") done(null); else if (b.dataset.x === "forgot") done("forgot"); };
    const kb = ev => { if (/^\d$/.test(ev.key)) press(ev.key); else if (ev.key === "Backspace") { v = v.slice(0, -1); paint(); } else if (ev.key === "Escape") done(null); };
    document.addEventListener("keydown", kb);
  });
}
async function createPin() {
  const a = await pinPad({ title: "Günlük şifresi oluştur", sub: "Kilitli günlüklerini açmak için 4 haneli bir şifre seç." });
  if (!a) return false;
  const b = await pinPad({ title: "Şifreyi tekrar gir", sub: "Aynı 4 haneyi bir kez daha gir." });
  if (!b) return false;
  if (a !== b) { toast("Şifreler aynı değil, tekrar deneyelim."); return createPin(); }
  const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
  try { await saveProfile({ lock_hash: await pinHash(a, salt), lock_salt: salt }); }
  catch { toast("Şifre kaydedilemedi. Veritabanı güncellemesi (3. SQL) çalıştırıldı mı?", 6000); return false; }
  S.unlockedUntil = Date.now() + 10 * 60e3; toast("Günlük şifren hazır."); return true;
}
async function resetPin() {
  const pw = prompt("Hesap şifreni gir (giriş yaparken kullandığın şifre). Doğruysa yeni bir günlük şifresi belirleyebilirsin:");
  if (!pw) return false;
  const { error } = await sb.auth.signInWithPassword({ email: S.user.email, password: pw });
  if (error) { toast("Hesap şifresi yanlış."); return false; }
  return createPin();
}
async function unlock() {
  if (isOpen()) return true;
  for (let tries = 0; tries < 5; tries++) {
    const v = await pinPad({ title: tries ? "Yanlış şifre, tekrar dene" : "Günlüğün kilitli", sub: "4 haneli günlük şifreni gir.", forgot: true });
    if (!v) return false;
    if (v === "forgot") return resetPin();
    if (await pinHash(v, S.profile.lock_salt) === S.profile.lock_hash) { S.unlockedUntil = Date.now() + 10 * 60e3; return true; }
  }
  toast("Çok fazla deneme. Biraz sonra tekrar dene."); return false;
}

// ---------- Profile photo (Ayarlar → shown in the video call's "Sen" box) ----------
async function avatarUrl() {
  if (!S.profile?.avatar) return "";
  const [u] = await signedUrls([S.profile.avatar]);
  return u;
}
async function squareJpeg(file, size = 512) {
  let src;
  try { src = await createImageBitmap(file, { imageOrientation: "from-image" }); }
  catch { src = await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = URL.createObjectURL(file); }); }
  const w = src.width || src.naturalWidth, h = src.height || src.naturalHeight, side = Math.min(w, h);
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"); g.imageSmoothingQuality = "high";
  g.drawImage(src, (w - side) / 2, (h - side) / 2, side, side, 0, 0, size, size); // centre crop
  return new Promise(r => c.toBlob(r, "image/jpeg", .9));
}
async function setAvatar(file) {
  const blob = await squareJpeg(file);
  const path = `${S.user.id}/profile/avatar-${Date.now()}.jpg`; // new name each time: no stale cache
  const { error } = await sb.storage.from("photos").upload(path, blob, { contentType: "image/jpeg" });
  if (error) throw error;
  const old = S.profile?.avatar;
  await saveProfile({ avatar: path });
  if (old) sb.storage.from("photos").remove([old]).catch(() => {});
}
async function clearAvatar() {
  const old = S.profile?.avatar; if (!old) return;
  await saveProfile({ avatar: null });
  sb.storage.from("photos").remove([old]).catch(() => {});
}

// ---------- Photos as stickers ----------
const MAX_PHOTOS = 6;
const photoUrls = new Map(); // path → { url, exp }
async function signedUrls(paths) {
  const need = paths.filter(p => !(photoUrls.get(p)?.exp > Date.now()));
  if (need.length) {
    const { data } = await sb.storage.from("photos").createSignedUrls(need, 3600);
    (data || []).forEach(d => d.signedUrl && photoUrls.set(d.path, { url: d.signedUrl, exp: Date.now() + 50 * 60e3 }));
  }
  return paths.map(p => photoUrls.get(p)?.url || "");
}
// Phone photos are huge: shrink to a crisp 1400 px JPEG before upload (keeps it clear, ~200-400 KB).
async function shrink(file) {
  let src;
  try { src = await createImageBitmap(file, { imageOrientation: "from-image" }); }
  catch { src = await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = URL.createObjectURL(file); }); }
  const w0 = src.width || src.naturalWidth, h0 = src.height || src.naturalHeight, k = Math.min(1, 1400 / Math.max(w0, h0));
  const c = document.createElement("canvas"); c.width = Math.round(w0 * k); c.height = Math.round(h0 * k);
  const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(src, 0, 0, c.width, c.height);
  return new Promise(r => c.toBlob(r, "image/jpeg", .88));
}
async function savePhotos(day, photos) {
  const { error } = await sb.from("entries").update({ photos }).eq("day", day);
  if (error) throw error;
}
async function addPhotos(day, e, files, spot = null) {
  const photos = [...(e.photos || [])];
  const room = MAX_PHOTOS - photos.length;
  if (room <= 0) return toast(`Bir güne en fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsin.`);
  const list = [...files].slice(0, room);
  toast(list.length > 1 ? `${list.length} fotoğraf ekleniyor…` : "Fotoğraf ekleniyor…", 2500);
  for (const f of list) {
    try {
      const blob = await shrink(f);
      const path = `${S.user.id}/${day}/${crypto.randomUUID()}.jpg`;
      const { error } = await sb.storage.from("photos").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const n = photos.length, R = [-6, 5, -3, 7, -5, 3];
      if (spot?.cut) { // where you double-tapped: the text opens up there, several share the row
        const k = photos.filter(q => q.inl && q.a === spot.cut.a && q.w === spot.cut.w).length;
        photos.push({ p: path, inl: true, a: spot.cut.a, w: spot.cut.w, x: Math.max(0, Math.min(56, spot.x - 22 + k * 14)), r: R[(n + k) % 6] });
      } else if (spot) {
        const k = photos.filter(q => q.a === spot.a).length;
        photos.push({ p: path, a: spot.a, ay: spot.ay + k * 1.5, x: Math.max(0, Math.min(56, spot.x - 22 + k * 10)), r: R[(n + k) % 6] });
      } else {
        const k = photos.filter(q => q.a == null).length;
        photos.push({ p: path, x: [4, 52][k % 2], r: R[n % 6] });
      }
    } catch (err) { toast(/bucket|not found|row-level/i.test(err.message || "") ? "Fotoğraf alanı hazır değil: 3. SQL güncellemesini çalıştır." : "Bu fotoğraf eklenemedi."); }
  }
  e.photos = photos;
  try { await savePhotos(day, photos); } catch { toast("Fotoğraflar kaydedilemedi."); }
}
// stickers live on a notebook page; drag to move, tap to open big
async function openPhoto(day, e, i, rerender) {
  const [url] = await signedUrls([e.photos[i].p]);
  const ov = document.createElement("div"); ov.className = "photo-ov";
  ov.innerHTML = `<figure><img src="${url}" alt=""></figure><div class="photo-acts"><button class="btn btn-ghost" data-x="rot" type="button">Çevir</button><button class="btn btn-ghost" data-x="size" type="button">${e.photos[i].big ? "Küçült" : "Büyüt"}</button><button class="btn btn-ghost" data-x="mode" type="button">${e.photos[i].inl ? "Yazının üstüne al" : "Yazının arasına al"}</button><button class="btn btn-danger" data-x="del" type="button">Kaldır</button><button class="btn btn-dark" data-x="close" type="button">Kapat</button></div>`;
  document.body.append(ov);
  const close = () => ov.remove();
  ov.onclick = async ev => {
    const x = ev.target.closest("button")?.dataset.x; if (!x) { if (ev.target === ov) close(); return; }
    if (x === "close") return close();
    if (x === "rot") { const R = [-7, -3, 2, 6]; e.photos[i].r = R[(R.indexOf(e.photos[i].r) + 1) % R.length]; await savePhotos(day, e.photos).catch(() => {}); close(); return rerender(); }
    if (x === "mode") {
      const ph = e.photos[i], P = paras(e.body);
      if (!ph.inl) { delete ph.free; ph.top = false; ph.inl = true; if (ph.a == null || ph.a >= P.length) ph.a = P.length - 1; ph.w = ph.a >= 0 ? P[ph.a].split(/\s+/).length : 0; delete ph.ay; }
      else { delete ph.free; ph.top = true; ph.inl = false; ph.ay = 0; delete ph.w; }
      await savePhotos(day, e.photos).catch(() => {}); close(); return rerender();
    }
    if (x === "size") { e.photos[i].big = !e.photos[i].big; await savePhotos(day, e.photos).catch(() => {}); close(); return rerender(); }
    if (x === "del") {
      if (!confirm("Bu fotoğraf günlükten kaldırılsın mı?")) return;
      const [gone] = e.photos.splice(i, 1);
      await sb.storage.from("photos").remove([gone.p]).catch(() => {});
      await savePhotos(day, e.photos).catch(() => {}); close(); rerender();
    }
  };
}

// ---------- Diary notebook ----------
// A real notebook: the day's text flows across fixed-size lined pages (no long scroll).
// Phone: one page at a time. Wide screen: an open two-page spread. Turn pages by swiping,
// tapping the page edges, the arrows, or the keyboard; past the last page you're in the next day.
const paras = body => String(body || "").split(/\n{2,}|\n/).map(t => t.trim()).filter(Boolean);
function nbBlocks(day, e, photoUrls) {
  const B = [], P = paras(e.body), last = P.length - 1;
  // a photo sits after paragraph "a" (-1 = right under the title); no anchor yet = after the text
  B.push({ html: `<header class="pg-head" data-pi="-1"><div class="when">${esc(longDate(day).toLocaleUpperCase("tr"))}${e.locked ? ` <span class="lock-tag">${I.lock}kilitli</span>` : ""}</div><h1 class="disp">${esc(e.title || "Günlük")}</h1></header>` });
  // photos placed "in the text": they sit at the start of a line and the words wrap beside them
  const inl = (e.photos || []).map((ph, i) => ({ ph, i })).filter(o => o.ph.inl);
  const figs = list => list.map(({ ph, i }) => { const W = ph.big ? 58 : 42, side = (ph.x ?? 0) + W / 2 > 50 ? "r" : "l";
    return `<span class="sticker wrap ${side}" data-i="${i}" style="width:${W}%;--r:${ph.r || 0}deg"><span class="tape"></span><img src="${(photoUrls || [])[i] || ""}" alt="Günün fotoğrafı ${i + 1}" draggable="false"></span>`; }).join("");
  const cutOf = (o, n) => o.ph.a < 0 ? 0 : o.ph.a > last ? n : Math.max(0, Math.min(n, o.ph.w ?? n));
  if (last < 0 && inl.length) B.push({ html: `<div class="wrap-only" data-pi="-1">${figs(inl)}</div>` });
  P.forEach((t, i) => {
    const words = t.split(/\s+/), n = words.length;
    const mine = inl.filter(o => (o.ph.a < 0 ? 0 : Math.min(o.ph.a, last)) === i);
    const cuts = [...new Set(mine.map(o => cutOf(o, n)))].sort((x, y) => x - y);
    let prev = 0, fg = "";
    for (const c of cuts) {
      if (c > prev) { B.push({ p: words.slice(prev, c).join(" "), figs: fg, pi: i, first: i === 0 && prev === 0, cont: prev > 0, w0: prev }); prev = c; fg = ""; }
      // two or more photos at the same spot sit side by side as a little row, the words continue under them
      const here = mine.filter(o => cutOf(o, n) === c);
      fg += here.length > 1 ? `<span class="wrap-group">${figs(here)}</span>` : figs(here);
    }
    B.push({ p: words.slice(prev).join(" "), figs: fg, pi: i, first: i === 0 && prev === 0, cont: prev > 0, w0: prev });
  });
  if (e.tags?.length) B.push({ html: `<div class="tags" data-pi="${last}">${e.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` });
  B.push({ html: `<div class="pg-meta" data-pi="${last}"><img src="${flowerImg(e.mood)}" alt=""><div><div class="k">GÜNÜN ÇİÇEĞİ</div><b>${MOODS[e.mood]?.label || "Sakin"}</b></div></div>` });
  if (e.moment) B.push({ html: `<div class="pg-moment" data-pi="${last}"><div class="k">GÜNÜN ANI</div><p>${esc(e.moment)}</p></div>` });
  if (e.note) B.push({ html: `<div class="pg-note" data-pi="${last}"><img class="mini" src="${mini(e.character || charKey())}" alt=""><p><b>${NAMES[e.character || charKey()]}:</b> ${esc(e.note)}</p></div>` });
  return B;
}
// a photo row is as tall as its photo, rounded up to whole ruled lines so the text below stays on the lines
const rowH = (w, pct) => Math.ceil((w * pct / 100 + 46) / 30) * 30;
// Pour blocks into pages of the given size by measuring them in an invisible page.
// a photo beside the words takes whole ruled lines, so the writing after it stays on the lines
function fitFigs(el) {
  for (const f of el.querySelectorAll(".sticker.wrap, .wrap-group")) { if (f.parentElement.classList.contains("wrap-group")) continue; f.style.marginBottom = "0px"; const h = f.offsetHeight + 4; f.style.marginBottom = (Math.ceil((h + 4) / 30) * 30 - h) + "px"; }
}
function paginate(blocks, w, hgt, contLabel) {
  const probe = document.createElement("div"); probe.className = "nb-page probe"; probe.style.cssText = `width:${w}px;height:${hgt}px;position:fixed;left:-9999px;top:0;visibility:hidden`;
  probe.innerHTML = '<div class="nb-in"></div>'; document.body.append(probe);
  const inn = probe.firstChild, pages = [];
  const fits = () => inn.scrollHeight <= inn.clientHeight + 1;
  const newPage = () => { pages.push(inn.innerHTML); inn.innerHTML = `<div class="pg-cont">${contLabel}</div>`; };
  let pi = 0;
  let w0 = 0;
  let fg = "";
  const para = (t, cls) => `<p class="${cls}" data-pi="${pi}" data-w0="${w0}">${fg}${esc(t)}</p>`;
  const add = (t, cls) => { inn.insertAdjacentHTML("beforeend", para(t, cls)); if (fg) fitFigs(inn.lastChild); };
  for (const b of blocks) {
    if (b.p != null) {
      pi = b.pi; w0 = b.w0 || 0; fg = b.figs || "";
      let words = b.p.split(/\s+/), cls = b.first ? "first" : b.cont ? "cont" : "";
      while (words.length) {
        add(words.join(" "), cls);
        if (fits()) break;
        inn.lastChild.remove();
        // the most words of this paragraph that still fit on this page
        const most = () => { let lo = 0, hi = words.length; while (lo < hi) { const mid = (lo + hi + 1) >> 1; add(words.slice(0, mid).join(" "), cls); const ok = fits(); inn.lastChild.remove(); ok ? (lo = mid) : (hi = mid - 1); } return lo; };
        let lo = most();
        // the photo doesn't fit at the bottom: the words keep filling this page and the photo starts the next one
        if (lo === 0 && fg && inn.children.length > 1) {
          const keep = fg; fg = ""; lo = most();
          if (lo > 0) { add(words.slice(0, lo).join(" "), cls + " split"); words = words.slice(lo); w0 += lo; cls = "cont"; }
          fg = keep; newPage(); continue;
        }
        if (lo > 0) { add(words.slice(0, lo).join(" "), cls + " split"); words = words.slice(lo); w0 += lo; cls = "cont"; fg = ""; }
        newPage();
      }
      continue;
    }
    inn.insertAdjacentHTML("beforeend", b.html);
    if (b.row) inn.lastChild.style.height = rowH(inn.clientWidth, +inn.lastChild.dataset.big) + "px";
    if (!fits() && b.photos) {
      // squeeze the photo corner into the rest of this page when there's a decent amount of room
      const el = inn.lastChild, room = inn.clientHeight - el.offsetTop - 30;
      if (room >= 140) { const k = Math.max(.55, room / el.offsetHeight * .96); el.style.setProperty("--k", k.toFixed(3)); }
    }
    if (!fits() && inn.children.length > 1) { const el = inn.lastChild; el.remove(); el.style.removeProperty("--k"); newPage(); inn.append(el); }
  }
  pages.push(inn.innerHTML); probe.remove();
  return pages;
}

async function viewEntry(day) {
  const main = shell("", `<div class="entry-wrap nb-wrap" id="ew"><p class="empty">Yükleniyor…</p></div>`);
  if (writing.has(day)) { $("#ew").innerHTML = `<div class="card writing-card"><img src="${mini(localStorage.getItem(dirtyKey(day)) || charKey())}" alt=""><b>Günlüğün yazılıyor…</b><span>Birkaç saniye sürer.</span></div>`; await writing.get(day); if (!document.body.contains(main)) return; }
  const [e, days] = await Promise.all([getEntry(day), recentDays(400)]);
  if (!document.body.contains(main)) return;
  const ew = $("#ew"), isToday = day === today();
  const written = days.map(d => d.day).sort();
  const prevDay = written.filter(d => d < day).pop(), nextDay = written.find(d => d > day);
  const open = e && (!e.locked || isOpen());
  let urls = open && e.photos?.length ? await signedUrls(e.photos.map(p => p.p)) : [];
  if (!document.body.contains(main)) return;

  ew.innerHTML = `
    <div class="entry-bar">
      <a class="btn btn-ghost" href="#gunlukler">${I.book}Günlüklerim</a>
      <div class="group">
        ${open && (e.photos?.length || 0) < MAX_PHOTOS ? `<label class="icon-btn" title="Fotoğraf ekle (isteğe bağlı)" aria-label="Fotoğraf ekle">${I.photo}<input id="addPh" type="file" accept="image/*" multiple hidden></label>` : ""}
        ${e && e.id ? `<button class="icon-btn lock-btn ${e.locked ? "on" : ""}" id="lockBtn" type="button" aria-pressed="${!!e.locked}" aria-label="${e.locked ? "Kilidi kaldır" : "Bu günlüğü kilitle"}" title="${e.locked ? "Kilidi kaldır" : "Bu günlüğü kilitle"}">${e.locked ? I.lock : I.unlock}</button>` : ""}
        ${open ? `<button class="btn btn-dark" id="editBtn" type="button" style="min-height:44px" aria-label="Düzenle">${I.edit}<span class="lbl">Düzenle</span></button>` : ""}
      </div>
    </div>
    <div class="nb-stage" id="nbStage"></div>
    <div class="nb-nav"><button class="icon-btn" id="pgPrev" type="button" aria-label="Önceki sayfa">${I.back}</button><span id="pgNo"></span><button class="icon-btn" id="pgNext" type="button" aria-label="Sonraki sayfa">${I.next}</button></div>
    ${open ? `<p class="nb-hint">Satıra iki kez dokun: yaz ya da fotoğraf ekle</p>` : ""}`;
  const stage = $("#nbStage");
  let pages = [], spread = false, at = 0, busy = false;

  const special = () => {
    if (!e) return [`<div class="pg-center"><img class="pg-av" src="${mini(charKey())}" alt=""><div class="when">${esc(longDate(day).toLocaleUpperCase("tr"))}</div>
      <p class="empty">${isToday ? "Bugün için henüz günlük yok." : "Bu sayfa boş. İstersen kendin birkaç satır yazabilirsin."}</p>
      <div class="head-actions" style="justify-content:center">${isToday ? `<a class="btn btn-primary" href="#goruntulu">${I.video}Görüntülü konuş</a><a class="btn btn-ghost" href="#arama">${I.mic}Sesli konuş</a><a class="btn btn-dark" href="#sohbet">${I.chat}Mesajlaş</a>` : ""}<button class="btn btn-ghost" id="manual" type="button">${I.edit}Kendim yazayım</button></div></div>`];
    return [`<div class="pg-center"><div class="big-lock">${I.lock}</div><div class="when">${esc(longDate(day).toLocaleUpperCase("tr"))}</div>
      <h1 class="disp">Bu sayfa kilitli</h1><p class="empty">Okumak için günlük şifreni gir.</p>
      <button class="btn btn-primary" id="openLock" type="button">${I.unlock}Kilidi aç</button></div>`];
  };
  const layout = () => {
    const top = stage.getBoundingClientRect().top + window.scrollY;
    const tab = $(".tabbar"); const tabH = tab && getComputedStyle(tab).display !== "none" ? tab.offsetHeight : 0;
    const hgt = Math.max(420, Math.min(820, window.innerHeight - top - tabH - (open ? 100 : 74)));
    const W = stage.clientWidth;
    spread = W >= 840 && window.innerWidth >= 900;
    const pw = spread ? Math.min(Math.floor(W / 2), Math.round(hgt * .78)) : Math.min(W, 520);
    stage.style.height = hgt + "px";
    stage.style.setProperty("--pw", pw + "px");
    stage.classList.toggle("spread", spread);
    pages = open ? paginate(nbBlocks(day, e, urls), pw, hgt, `${esc(shortDate(day))} · devam`) : special();
    if (spread && pages.length % 2) pages.push("");
  };
  const step = () => (spread ? 2 : 1);
  const pageEl = (i, cls = "") => `<div class="nb-page ${cls} ${pages[i] === "" ? "empty-pg" : ""}" data-idx="${i}"><div class="nb-in">${pages[i] ?? ""}</div><span class="pg-num">${i < pages.length && pages[i] !== "" ? i + 1 : ""}</span></div>`;
  // ---- photos float wherever you put them, anchored to a paragraph so they stay near the same words on any screen
  const P = paras(e?.body), lastPi = P.length - 1;
  const anchorOf = ph => (ph.a == null || ph.a > lastPi ? lastPi : Math.max(-1, ph.a));
  const homeOf = ph => { const tag = `data-pi="${anchorOf(ph)}"`; const k = pages.findIndex(h => h.includes(tag)); return k < 0 ? pages.length - 1 : k; };
  const widthOf = ph => (ph.big ? 64 : 44);
  const legacyX = ph => ph.x != null ? ph.x : ph.o ? [4, 52][ph.o % 2] : ({ l: 4, c: 28, r: 52 }[ph.al || "c"] ?? 28);
  function placePhotos() {
    if (!open || !e.photos?.length) return;
    $$(".nb-page[data-idx]", stage).forEach(pg => {
      const idx = +pg.dataset.idx, inn = $(".nb-in", pg); if (!inn) return;
      $$(".sticker.wrap", inn).forEach(f => dragPhoto(f, +f.dataset.i));
      e.photos.forEach((ph, i) => {
        if (ph.inl || homeOf(ph) !== idx) return;
        const anc = $(`[data-pi="${anchorOf(ph)}"]`, inn);
        const base = anc ? anc.offsetTop : 0;
        const w = widthOf(ph), hPx = inn.clientWidth * w / 100 + 30;
        const top = ph.ay == null ? (anc ? anc.offsetTop + anc.offsetHeight + 6 : 0) : base + ph.ay * 30;
        const fig = document.createElement("figure"); fig.className = "sticker float"; fig.dataset.i = i;
        fig.style.cssText = `left:${Math.max(-2, Math.min(100 - w + 2, legacyX(ph)))}%;top:${Math.max(0, Math.min(inn.clientHeight - hPx, top))}px;width:${w}%;--r:${ph.r || 0}deg`;
        fig.innerHTML = `<span class="tape"></span><img src="${urls[i] || ""}" alt="Günün fotoğrafı ${i + 1}" draggable="false">`;
        inn.append(fig); dragPhoto(fig, i);
      });
    });
  }
  // ---- where a carried photo would land in the text: between two lines, before/after a paragraph, or next to another photo
  const textOf = p => [...p.childNodes].find(n => n.nodeType === 3);
  function lineCut(p, y) {
    const node = textOf(p); if (!node) return 0;
    const re = /\S+/g, rg = document.createRange(), lines = []; let m, k = 0;
    while ((m = re.exec(node.data))) {
      rg.setStart(node, m.index); rg.setEnd(node, m.index + m[0].length);
      const r = rg.getClientRects()[0]; if (!r) { k++; continue; }
      const L = lines[lines.length - 1];
      if (!L || r.top > L.top + 8) lines.push({ top: r.top, bottom: r.bottom, k }); else L.bottom = Math.max(L.bottom, r.bottom);
      k++;
    }
    const hit = lines.find(L => y < (L.top + L.bottom) / 2);
    return hit ? hit.k : k;
  }
  const wordsIn = p => ((textOf(p)?.data || "").match(/\S+/g) || []).length;
  function dropTarget(inn, y) {
    const els = [...inn.children].filter(el => el.matches("p[data-pi], .pg-head"));
    if (!els.length) return null;
    const before = el => el.matches(".ph-row") ? { el, pos: "join", a: +el.dataset.pi, w: +el.dataset.w }
      : el.matches(".pg-head") ? { el, pos: "after", a: -1, w: 0 }
      : { el, pos: "before", a: +el.dataset.pi, w: +el.dataset.w0 };
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (el.matches("p")) {
        if (y < r.top) return before(el);
        if (y < r.bottom) {
          const k = lineCut(el, y), n = wordsIn(el), a = +el.dataset.pi, w0 = +el.dataset.w0;
          return k <= 0 ? { el, pos: "before", a, w: w0 } : k >= n ? { el, pos: "after", a, w: w0 + n } : { el, pos: "split", a, w: w0 + k, k };
        }
      } else if (y < r.top + r.height / 2) return before(el);
    }
    const el = els[els.length - 1];
    return el.matches("p") ? { el, pos: "after", a: +el.dataset.pi, w: +el.dataset.w0 + wordsIn(el) } : before(el);
  }
  // the spot the photo would take, with the words already wrapping beside it
  function openGap(t, W, side) {
    const ph = document.createElement("span"); ph.className = `sticker wrap drop-ph ${side}`; ph.style.width = W + "%";
    ph.innerHTML = `<span class="ph-in"></span>`;
    const node = textOf(t.el);
    if (t.pos === "split") {
      const words = node.data.match(/\S+/g), p2 = document.createElement("p");
      p2.className = "cont"; p2.dataset.pi = t.a; p2.dataset.w0 = t.w; p2.append(ph, words.slice(t.k).join(" "));
      node.data = words.slice(0, t.k).join(" "); t.el.classList.add("split"); t.el.after(p2);
    } else if (t.pos === "before" || t.el.matches(".pg-head")) {
      const p = t.el.matches(".pg-head") ? t.el.nextElementSibling : t.el;
      if (p && p.matches("p")) (textOf(p) ? textOf(p).before(ph) : p.append(ph)); else t.el.after(ph);
    } else { const nx = t.el.nextElementSibling; if (nx && nx.matches("p")) (textOf(nx) ? textOf(nx).before(ph) : nx.prepend(ph)); else t.el.append(ph); }
    fitFigs(ph.parentElement);
  }
  // take the carried photo out of a page and let its words close up again
  function mend(inn, i) {
    $$(`.sticker[data-i="${i}"]`, inn).forEach(f => f.remove());
    $$("p.cont", inn).forEach(p => {
      const prev = p.previousElementSibling;
      if ($(".sticker", p) || !prev || !prev.matches("p") || prev.dataset.pi !== p.dataset.pi || +prev.dataset.w0 + wordsIn(prev) !== +p.dataset.w0) return;
      const a = textOf(prev), b2 = textOf(p);
      if (a) a.data = (a.data + " " + (b2?.data || "")).trim(); else prev.append(b2?.data || "");
      prev.classList.remove("split"); p.remove();
    });
  }
  // drag a photo anywhere; hold it at the left/right edge of the notebook to turn the page and keep carrying it
  function dragPhoto(fig, i) {
    fig.addEventListener("pointerdown", ev => {
      ev.preventDefault(); ev.stopPropagation();
      const touch = ev.pointerType !== "mouse", lift = touch ? 22 : 0;
      const r0 = fig.getBoundingClientRect(), offX = ev.clientX - r0.left, offY = ev.clientY - r0.top, sx = ev.clientX, sy = ev.clientY;
      let ghost = null, moved = false, lx = sx, ly = sy, side = 0, edgeT = null, hint = null;
      const ph0 = e.photos[i], inText = !ph0.top;
      // preview: the page as it would be without this photo, with a gap opening where it would go
      const clean = new WeakMap(); let shown = null, target = null, raf = 0;
      const pageAt = (x, y) => document.elementsFromPoint(x, y).find(el => el.classList?.contains("nb-page") && el.dataset.idx != null && !el.closest(".leaf"));
      const preview = () => {
        raf = 0; if (!ghost || !inText) return;
        if (shown && document.body.contains(shown)) shown.innerHTML = clean.get(shown); shown = null; target = null;
        const gr = ghost.getBoundingClientRect(), y = gr.top + 14;
        const pg = pageAt(lx, ly) || pageAt(gr.left + gr.width / 2, y), inn = pg && $(".nb-in", pg);
        if (!inn || pages[+pg.dataset.idx] === "") return;
        if (!clean.has(inn)) {
          mend(inn, i); clean.set(inn, inn.innerHTML);
        }
        target = dropTarget(inn, y); if (!target) return;
        const ir = inn.getBoundingClientRect(), W = ph0.big ? 58 : 42;
        target.inn = inn; target.side = (gr.left + gr.width / 2 - ir.left) / ir.width > .5 ? "r" : "l";
        openGap(target, W, target.side); shown = inn;
      };
      const pick = () => {
        if (ghost) return;
        ghost = fig.cloneNode(true); ghost.className = "sticker ghost"; ghost.style.cssText = `width:${r0.width}px;--r:${e.photos[i].r || 0}deg`;
        document.body.append(ghost); fig.style.opacity = ".25"; navigator.vibrate?.(12); place();
      };
      const place = () => { if (ghost) { ghost.style.left = (lx - offX) + "px"; ghost.style.top = (ly - offY - lift) + "px"; } };
      // holding still for a moment picks the photo up, ready to carry
      const holdT = setTimeout(pick, 280);
      // edge of the notebook: a hint fills up, then the page turns; keep holding and it keeps turning
      const clearEdge = () => { clearTimeout(edgeT); edgeT = null; hint?.remove(); hint = null; side = 0; };
      const armEdge = dir => {
        clearEdge(); side = dir;
        const sr = stage.getBoundingClientRect();
        hint = document.createElement("div"); hint.className = "edge-hint " + (dir < 0 ? "l" : "r");
        hint.style.cssText = `top:${sr.top}px;height:${sr.height}px;${dir < 0 ? `left:${sr.left}px` : `left:${sr.right - 56}px`}`;
        hint.innerHTML = `<span>${dir < 0 ? "‹" : "›"}</span><i></i>`;
        document.body.append(hint);
        edgeT = setTimeout(() => {
          const can = dir > 0 ? at + step() < pages.length : at > 0;
          if (can) { turn(dir); navigator.vibrate?.(18); }
          hint?.classList.add("done");
          edgeT = setTimeout(() => { if (side === dir) armEdge(dir); }, can ? 650 : 400);
        }, 700);
      };
      const move = m => {
        lx = m.clientX; ly = m.clientY;
        if (!moved && Math.abs(lx - sx) + Math.abs(ly - sy) < 7) return;
        moved = true; clearTimeout(holdT); pick(); place();
        const sr = stage.getBoundingClientRect(), zone = Math.max(48, sr.width * .15);
        const edge = lx < sr.left + zone ? -1 : lx > sr.right - zone ? 1 : 0;
        if (edge !== side) { if (edge) armEdge(edge); else clearEdge(); }
        if (!raf) raf = requestAnimationFrame(preview);
      };
      const tmove = t => { if (t.cancelable) t.preventDefault(); const p = t.touches[0]; if (p) move({ clientX: p.clientX, clientY: p.clientY }); };
      const tend = t => { const p = t.changedTouches[0]; up({ clientX: p ? p.clientX : lx, clientY: p ? p.clientY : ly }); };
      const end = () => { cancelAnimationFrame(raf); document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); document.removeEventListener("pointercancel", cancel); document.removeEventListener("touchmove", tmove); document.removeEventListener("touchend", tend); document.removeEventListener("touchcancel", tend); clearTimeout(holdT); clearEdge(); };
      const cancel = () => { if (touch) return; end(); ghost?.remove(); rerender(); };
      let done = false;
      const up = u => {
        if (done) return; done = true;
        end();
        if (!ghost) { openPhoto(day, e, i, rerender); return; }
        const gr = ghost.getBoundingClientRect(); ghost.remove();
        if (!moved) { fig.style.opacity = ""; return; }
        if (inText) {
          // into the text: the words make room for it right there
          if (!target) { rerender(); return; }
          const W = ph0.big ? 58 : 42;
          ph0.inl = true; ph0.a = target.a; ph0.w = target.w;
          ph0.x = target.side === "r" ? 100 - W : 0;
          delete ph0.ay; delete ph0.al; delete ph0.o; delete ph0.free; delete ph0.top;
          savePhotos(day, e.photos).catch(() => {}); rerender(); return;
        }
        // drop where the photo's middle is (the finger may be just under it)
        const cx = gr.left + gr.width / 2, cy = gr.top + Math.min(gr.height / 2, 40);
        const pg = [u.clientX, cx].flatMap(x => document.elementsFromPoint(x, x === cx ? cy : u.clientY)).find(el => el.classList?.contains("nb-page") && el.dataset.idx != null && !el.closest(".leaf"));
        const inn = pg && $(".nb-in", pg);
        if (!inn || pages[+pg.dataset.idx] === "") { rerender(); return; }
        const ir = inn.getBoundingClientRect();
        const left = Math.max(ir.left - gr.width * .25, Math.min(gr.left, ir.right - gr.width * .75));
        const topIn = Math.max(0, Math.min(gr.top - ir.top, ir.height - 40));
        // the paragraph the photo now sits next to: the last one starting above its top edge (or the first on the page)
        const blocks = $$("[data-pi]", inn); let anc = blocks[0];
        for (const b of blocks) { if (b.offsetTop <= topIn) anc = b; }
        const ph = e.photos[i];
        ph.a = anc ? +anc.dataset.pi : -1; ph.ay = Math.round(((topIn - (anc ? anc.offsetTop : 0)) / 30) * 10) / 10;
        ph.x = Math.round(((left - ir.left) / ir.width) * 1000) / 10; delete ph.al; delete ph.o;
        savePhotos(day, e.photos).catch(() => {}); rerender();
      };
      document.addEventListener("pointermove", move); document.addEventListener("pointerup", up); document.addEventListener("pointercancel", cancel);
      if (touch) { document.addEventListener("touchmove", tmove, { passive: false }); document.addEventListener("touchend", tend); document.addEventListener("touchcancel", tend); }
      try { document.documentElement.setPointerCapture(ev.pointerId); } catch {}
    });
    fig.addEventListener("click", ev => ev.stopPropagation());
    fig.addEventListener("contextmenu", ev => ev.preventDefault());
  }
  const paint = () => {
    stage.innerHTML = spread
      ? `<div class="nb-side l">${pageEl(at, "left")}</div><div class="nb-side r">${pageEl(at + 1, "right")}</div><div class="spine"></div>`
      : `<div class="nb-side one">${pageEl(at, "single")}</div>`;
    const total = pages.length;
    $("#pgNo").textContent = `${esc(shortDate(day))} · ${spread ? `${at + 1}-${Math.min(at + 2, total)}` : at + 1} / ${total}`;
    $("#pgPrev").disabled = at === 0 && !prevDay; $("#pgNext").disabled = at + step() >= total && !nextDay;
    placePhotos();
    if ($("#manual", stage)) $("#manual", stage).onclick = () => editEntry(day, { title: "", body: "", mood: "sakin", tags: [], moment: "", note: "" });
    if ($("#openLock", stage)) $("#openLock", stage).onclick = async () => { if (await unlock()) viewEntry(day); };
    S.nbAt = { day, at };
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // the page leaf turning: front is what you were reading, back is what comes next
  const turn = dir => {
    if (busy) return;
    const total = pages.length, to = at + dir * step();
    const leaveDay = to < 0 || to >= total;
    if (leaveDay && !(dir > 0 ? nextDay : prevDay)) return;
    if (reduce) { if (leaveDay) { S.nbStart = dir > 0 ? 0 : "last"; location.hash = "#gun/" + (dir > 0 ? nextDay : prevDay); } else { at = to; paint(); } return; }
    busy = true;
    const back = leaveDay ? "" : null;
    if (spread) {
      const leaf = document.createElement("div");
      leaf.className = "leaf " + (dir > 0 ? "from-r" : "from-l");
      leaf.innerHTML = dir > 0
        ? `<div class="face front">${pageEl(at + 1, "right")}</div><div class="face back">${leaveDay ? `<div class="nb-page left empty-pg"><div class="nb-in"></div></div>` : pageEl(to, "left")}</div>`
        : `<div class="face front">${pageEl(at, "left")}</div><div class="face back">${leaveDay ? `<div class="nb-page right empty-pg"><div class="nb-in"></div></div>` : pageEl(to + 1, "right")}</div>`;
      // what's revealed underneath the leaf
      const under = dir > 0 ? $(".nb-side.r", stage) : $(".nb-side.l", stage);
      under.innerHTML = leaveDay ? `<div class="nb-page ${dir > 0 ? "right" : "left"} empty-pg"><div class="nb-in"></div></div>` : pageEl(dir > 0 ? to + 1 : to, dir > 0 ? "right" : "left");
      stage.append(leaf);
    } else {
      const one = $(".nb-side.one", stage);
      if (dir > 0) { one.insertAdjacentHTML("afterbegin", leaveDay ? `<div class="nb-page single empty-pg"><div class="nb-in"></div></div>` : pageEl(to, "single")); one.lastElementChild.classList.add("leaf-out"); }
      else if (!leaveDay) { one.insertAdjacentHTML("beforeend", pageEl(to, "single leaf-in")); }
      else { one.firstElementChild.classList.add("leaf-fade"); }
    }
    setTimeout(() => {
      busy = false;
      if (leaveDay) { S.nbStart = dir > 0 ? 0 : "last"; S.nbEnter = dir; location.hash = "#gun/" + (dir > 0 ? nextDay : prevDay); return; }
      at = to; paint();
    }, spread ? 640 : 520);
    void back;
  };
  const rerender = async () => { if (open && e.photos?.length) urls = await signedUrls(e.photos.map(p => p.p)); const keep = at; layout(); at = Math.min(keep - (spread ? keep % 2 : 0), Math.max(0, pages.length - step())); paint(); };
  layout();
  if (S.nbStart === "last") at = Math.max(0, pages.length - step()); else if (S.nbAt?.day === day) at = Math.min(S.nbAt.at - (spread ? S.nbAt.at % 2 : 0), Math.max(0, pages.length - step()));
  S.nbStart = null;
  paint();
  if (S.nbEnter < 0 && !reduce) { const pg = $(".nb-side.one .nb-page, .nb-side.r .nb-page", stage); pg && pg.classList.add("enter-prev"); }
  S.nbEnter = 0;

  $("#pgPrev").onclick = () => turn(-1);
  $("#pgNext").onclick = () => turn(1);
  // double-tap a line: write something there, or put a photo there
  let lastTap = 0, lastX = 0, lastY = 0;
  stage.addEventListener("pointerup", ev => {
    if (!open || ev.target.closest("a,button,label,input,textarea,.sticker,.nb-menu,.nb-write")) return;
    const now = Date.now(), near = Math.abs(ev.clientX - lastX) < 30 && Math.abs(ev.clientY - lastY) < 30;
    if (now - lastTap < 350 && near) { lastTap = 0; spotMenu(ev); } else { lastTap = now; lastX = ev.clientX; lastY = ev.clientY; }
  });
  const spotAt = ev => {
    const page = ev.target.closest(".nb-page"); if (!page) return null;
    const inn = $(".nb-in", page), r = inn.getBoundingClientRect();
    // the last block that starts above your finger decides "after which paragraph"
    let a = -1; for (const el of $$("[data-pi]", inn)) { if (el.getBoundingClientRect().top <= ev.clientY) a = +el.dataset.pi; }
    const lineY = Math.max(0, Math.floor((ev.clientY - r.top) / 30) * 30);
    const anc = $(`[data-pi="${a}"]`, inn), ay = Math.round(((ev.clientY - r.top - (anc ? anc.offsetTop : 0)) / 30) * 10) / 10;
    const t = dropTarget(inn, ev.clientY), cut = t && { a: t.a, w: t.w };
    return { a, ay, cut, x: Math.round(Math.max(0, Math.min(100, (ev.clientX - r.left) / r.width * 100))), page, inn, lineY };
  };
  function spotMenu(ev) {
    const spot = spotAt(ev); if (!spot) return;
    $$(".nb-menu, .nb-write", stage).forEach(x => x.remove());
    const sr = stage.getBoundingClientRect();
    const m = document.createElement("div"); m.className = "nb-menu";
    m.innerHTML = `<button type="button" data-x="write">${I.edit}Buraya yaz</button><button type="button" data-x="photo">${I.photo}Buraya fotoğraf ekle</button><input type="file" accept="image/*" multiple hidden>`;
    m.style.left = Math.max(8, Math.min(sr.width - 228, ev.clientX - sr.left - 110)) + "px";
    m.style.top = Math.max(8, Math.min(sr.height - 120, ev.clientY - sr.top + 14)) + "px";
    stage.append(m);
    const close = () => { m.remove(); document.removeEventListener("pointerdown", outside, true); };
    const outside = x => { if (!m.contains(x.target)) close(); };
    setTimeout(() => document.addEventListener("pointerdown", outside, true), 0);
    const inp = $("input", m);
    m.onclick = x => {
      const b = x.target.closest("button"); if (!b) return;
      if (b.dataset.x === "photo") return inp.click();
      close(); writeAt(spot);
    };
    inp.onchange = async () => { if (!inp.files?.length) return; close(); await addPhotos(day, e, inp.files, spot.cut ? { cut: spot.cut, x: spot.x < 50 ? 22 : 78 } : { a: spot.a, ay: spot.ay, x: spot.x }); rerender(); };
  }
  // a little writing line right where you tapped; saved into the diary text after that paragraph
  function writeAt(spot) {
    // where it goes: inside the paragraph you tapped, at the sentence break nearest that line
    const P0 = paras(e.body), cut = spot.cut || { a: spot.a, w: 1e9 };
    const pa = cut.a < 0 || !P0.length ? -1 : Math.min(cut.a, P0.length - 1);
    const W0 = pa >= 0 ? P0[pa].split(/\s+/) : [];
    let k = 0;
    if (pa >= 0) {
      const want = Math.min(cut.w, W0.length), cand = [0, W0.length];
      W0.forEach((w, j) => { if (/[.!?…]["”’']?$/.test(w)) cand.push(j + 1); });
      k = cand.reduce((b, c) => Math.abs(c - want) < Math.abs(b - want) ? c : b, cand[0]);
    }
    const label = pa < 0 ? "Başlığın hemen altına" : k === 0 ? `“${esc(W0.slice(0, 5).join(" "))}…” cümlesinden önce` : `“…${esc(W0.slice(Math.max(0, k - 5), k).join(" "))}” cümlesinden sonra`;
    // a sheet above the keyboard (the page itself re-lays out when the keyboard opens, so the box can't live inside it)
    const box = document.createElement("div"); box.className = "write-sheet";
    box.innerHTML = `<div class="ws-in" role="dialog" aria-modal="true" aria-label="Günlüğe ekle">
      <div class="ws-k">${label}</div>
      <textarea rows="3" placeholder="Buraya yaz…" aria-label="Günlüğe eklenecek yazı"></textarea>
      <div class="acts"><button type="button" class="btn btn-ghost" data-x="no">Vazgeç</button><button type="button" class="btn btn-primary" data-x="ok">Ekle</button></div></div>`;
    document.body.append(box);
    const ta = $("textarea", box); ta.focus();
    ta.oninput = () => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 180) + "px"; };
    box.onclick = async x => {
      if (x.target === box) return box.remove();
      const b = x.target.closest("button"); if (!b) return;
      if (b.dataset.x === "no") return box.remove();
      const t = ta.value.trim().replace(/\s+/g, " "); if (!t) return box.remove();
      const P = paras(e.body), add = t.split(" ");
      if (pa < 0) {
        P.unshift(t);
        (e.photos || []).forEach(ph => { if (ph.a != null && ph.a >= 0) ph.a += 1; });
      } else {
        const ws = P[pa].split(/\s+/); ws.splice(k, 0, ...add); P[pa] = ws.join(" ");
        // photos in this paragraph after the new words move along with their words
        (e.photos || []).forEach(ph => { if (ph.inl && ph.a === pa && (ph.w ?? 1e9) > k && ph.w != null) ph.w += add.length; });
      }
      e.body = P.join("\n\n");
      const { error } = await sb.from("entries").update({ body: e.body, ...(e.photos?.length ? { photos: e.photos } : {}) }).eq("day", day);
      if (error) return toast("Kaydedilemedi: " + error.message);
      try { localStorage.setItem(editedKey(day), "1"); } catch {}
      box.remove(); rerender(); toast("Günlüğüne eklendi.");
    };
  }
  let tx = null, ty = 0;
  stage.addEventListener("touchstart", ev => { if (ev.target.closest(".sticker")) return; tx = ev.touches[0].clientX; ty = ev.touches[0].clientY; }, { passive: true });
  stage.addEventListener("touchend", ev => { if (tx == null) return; const dx = ev.changedTouches[0].clientX - tx, dy = ev.changedTouches[0].clientY - ty; tx = null;
    if (Math.abs(dx) > 50 && Math.abs(dy) < 60) turn(dx < 0 ? 1 : -1); }, { passive: true });
  const keys = ev => { if (ev.target.closest("input,textarea")) return; if (ev.key === "ArrowLeft") turn(-1); if (ev.key === "ArrowRight") turn(1); };
  // the keyboard opening resizes the window: don't rebuild the pages (and lose what's being typed) while writing
  let rt = null; const onResize = () => { if ($(".write-sheet")) return; clearTimeout(rt); rt = setTimeout(rerender, 160); };
  document.addEventListener("keydown", keys); window.addEventListener("resize", onResize);
  leave = () => { document.removeEventListener("keydown", keys); window.removeEventListener("resize", onResize); };

  if (!e) return;
  if ($("#editBtn")) $("#editBtn").onclick = () => editEntry(day, e);
  const addPh = $("#addPh");
  if (addPh) addPh.onchange = async () => {
    if (!addPh.files?.length) return;
    await addPhotos(day, e, addPh.files);
    S.nbAt = { day, at: 999 }; viewEntry(day); // jump to the page with the stickers
  };
  if ($("#lockBtn")) $("#lockBtn").onclick = async () => {
    if (e.locked) { if (!(await unlock())) return; }
    else if (!hasPin() && !(await createPin())) return;
    const { error } = await sb.from("entries").update({ locked: !e.locked }).eq("day", day);
    if (error) return toast("Kilit kaydedilemedi. 3. SQL güncellemesi çalıştırıldı mı?", 6000);
    toast(e.locked ? "Kilit kaldırıldı." : "Bu günlük artık kilitli.");
    if (!e.locked) S.unlockedUntil = 0; // locking closes it right away
    viewEntry(day);
  };
}
function editEntry(day, e) {
  let mood = e.mood || "sakin";
  $("#ew").innerHTML = `
    <div class="entry-bar"><a class="btn btn-ghost" href="#gun/${day}">${I.back}Vazgeç</a><button class="btn btn-primary" id="save" type="button">Kaydet</button></div>
    <div class="paper"><div class="left">
      <div class="when">${esc(longDate(day).toLocaleUpperCase("tr"))}</div>
      <div class="field"><label for="eTitle">Başlık</label><input class="input" id="eTitle" maxlength="80" value="${esc(e.title)}"></div>
      <div class="field"><label for="eBody">Günlük</label><textarea class="input" id="eBody">${esc(e.body)}</textarea></div>
      <div class="field"><label for="eMoment">Günün anı</label><input class="input" id="eMoment" maxlength="160" value="${esc(e.moment)}"></div>
    </div><div class="right">
      <div class="field"><span style="font-size:14px;font-weight:600;color:var(--soft)">Günün çiçeği</span>
        <div class="flower-pick" id="fp">${Object.entries(MOODS).map(([k, v]) => `<button type="button" data-k="${k}" aria-pressed="${k === mood}"><img src="${flowerImg(k)}" alt="">${v.label}</button>`).join("")}</div></div>
      ${e.id ? `<button class="btn btn-danger" id="del" type="button">Bu günlüğü sil</button>` : ""}
    </div></div>`;
  $$("#fp button").forEach(b => b.onclick = () => { mood = b.dataset.k; $$("#fp button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); });
  $("#save").onclick = async () => {
    const row = { user_id: S.user.id, day, title: $("#eTitle").value.trim() || "Günlük", body: $("#eBody").value.trim(), moment: $("#eMoment").value.trim(), mood };
    if (!e.id) Object.assign(row, { tags: [], summary: row.body.slice(0, 280), character: charKey() });
    const { error } = await sb.from("entries").upsert(row, { onConflict: "user_id,day" });
    if (error) return toast("Kaydedilemedi: " + error.message);
    try { localStorage.setItem(editedKey(day), "1"); } catch {}
    toast("Kaydedildi"); viewEntry(day);
  };
  const del = $("#del");
  if (del) del.onclick = async () => {
    if (!confirm("Bu günlük kalıcı olarak silinsin mi?")) return;
    if (e.photos?.length) await sb.storage.from("photos").remove(e.photos.map(p => p.p)).catch(() => {});
    const { error } = await sb.from("entries").delete().eq("day", day);
    if (error) return toast("Silinemedi: " + error.message);
    ["daysy", "ivy", "sage", "charlie"].forEach(k => localStorage.removeItem(draftKey(day, k))); toast("Silindi"); location.hash = "#takvim";
  };
}

// ---------- Monthly summary ----------
async function viewSummary(ym) {
  const now = new Date();
  let [y, m] = ym ? ym.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1]; m -= 1;
  const main = shell("#ozet", `<div class="page">
    <div class="cal-head"><h1 class="disp">Aylık özet</h1><div class="nav">
      <a class="icon-btn" href="#ozet/${iso(new Date(y, m - 1, 1)).slice(0, 7)}" aria-label="Önceki ay">${I.back}</a>
      <a class="icon-btn" href="#ozet/${iso(new Date(y, m + 1, 1)).slice(0, 7)}" aria-label="Sonraki ay">${I.next}</a></div></div>
    <div id="wr"><p class="empty">Hazırlanıyor…</p></div></div>`);
  const rows = await entriesBetween(iso(new Date(y, m, 1)), iso(new Date(y, m + 1, 0)));
  if (!document.body.contains(main)) return;
  const label = monthName(y, m);
  if (!rows.length) { $("#wr").innerHTML = `<div class="card"><p class="empty">${esc(label)} için henüz günlük yok.</p></div>`; return; }
  const counts = Object.fromEntries(Object.keys(MOODS).map(k => [k, 0]));
  rows.forEach(r => { if (counts[r.mood] !== undefined) counts[r.mood]++; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  let best = 0, run = 0, prev = null;
  rows.forEach(r => { run = prev && addDays(prev, 1) === r.day ? run + 1 : 1; best = Math.max(best, run); prev = r.day; });
  const max = Math.max(...Object.values(counts), 1);
  const mom = [...rows].reverse().find(r => r.mood === top && r.moment) || [...rows].reverse().find(r => r.moment);
  $("#wr").innerHTML = `
    <div class="wrapped" id="wcard">
      <div style="display:flex;align-items:center;gap:10px"><img src="/img/logo.png" alt="" width="32" height="32"><span class="k">DAYSAYDAY · ${esc(label.toLocaleUpperCase("tr"))}</span></div>
      <h2 class="disp">${esc(label.split(" ")[0])} çoğunlukla <em>${MOODS[top].label.toLocaleLowerCase("tr")}</em> geçti.</h2>
      <div class="stats"><div><b>${rows.length}</b><span>gün günlüğünü yazdın</span></div><div><b>${best}</b><span>günlük en uzun seri</span></div></div>
      <div class="bars" aria-label="Ayın çiçekleri">${Object.entries(counts).map(([k, n]) => `<div><span>${n}</span><i style="height:${Math.round((n / max) * 56)}px;background:${MOODS[k].color}"></i><img src="${flowerImg(k)}" alt="${MOODS[k].label}"></div>`).join("")}</div>
      ${mom ? `<div class="month-moment"><div class="k" style="color:var(--accent-dk)">AYIN ANISI · ${esc(shortDate(mom.day).toLocaleUpperCase("tr"))}</div><div class="disp" style="font-size:19px;font-weight:700;margin-top:6px">“${esc(mom.moment)}”</div></div>` : ""}
    </div>
    <div class="head-actions" style="justify-content:center;margin-top:14px"><button class="btn btn-dark" id="share" type="button">Paylaş</button></div>`;
  $("#share").onclick = async () => {
    const text = `${label}: ${rows.length} gün günlük yazdım, en uzun serim ${best} gün, ayım çoğunlukla ${MOODS[top].label.toLocaleLowerCase("tr")} geçti. Daysayday`;
    try { if (navigator.share) await navigator.share({ title: "Daysayday aylık özet", text, url: location.origin }); else { await navigator.clipboard.writeText(text + " " + location.origin); toast("Özet kopyalandı. Ekran görüntüsü alıp hikayende paylaşabilirsin!"); } } catch {}
  };
}

// ---------- Letters (time capsule) ----------
async function viewLetters() {
  const main = shell("#mektup", `<div class="page">
    <h1 class="disp">Geleceğe mektup</h1>
    <p class="empty">Kendine bir mektup yaz, seçtiğin güne kadar kilitli kalsın.</p>
    <div class="card" style="display:flex;flex-direction:column;gap:12px">
      <div class="field"><label for="lBody">Mektubun</label><textarea class="input" id="lBody" style="min-height:160px" placeholder="Sevgili gelecekteki ben…"></textarea></div>
      <div class="field"><label for="lDate">Açılacağı gün</label><input class="input" id="lDate" type="date" min="${addDays(today(), 1)}" value="${addDays(today(), 30)}"></div>
      <button class="btn btn-primary" id="lSave" type="button">Kilitle ve sakla</button>
    </div>
    <div class="list" id="letters"></div></div>`);
  const draw = async () => {
    const { data } = await sb.from("letters").select("*").order("open_on", { ascending: true });
    if (!document.body.contains(main)) return;
    const t = today();
    $("#letters").innerHTML = (data || []).map(l => l.open_on > t
      ? `<div class="letter locked">${I.lock}<div><b>${esc(longDate(l.open_on))}</b> günü açılacak<p>Yazıldığı gün: ${esc(shortDate(l.created_at.slice(0, 10)))}</p></div></div>`
      : `<div class="letter">${I.open}<div><b>${esc(shortDate(l.created_at.slice(0, 10)))} tarihli mektubun</b><p>${esc(l.body)}</p></div></div>`).join("");
  };
  $("#lSave").onclick = async () => {
    const body = $("#lBody").value.trim(), open_on = $("#lDate").value;
    if (!body) return toast("Önce mektubunu yaz.");
    if (!open_on || open_on <= today()) return toast("İleri bir tarih seç.");
    const { error } = await sb.from("letters").insert({ user_id: S.user.id, body, open_on });
    if (error) return toast("Kaydedilemedi: " + error.message);
    $("#lBody").value = ""; toast("Mektubun kilitlendi."); draw();
  };
  draw();
}

// ---------- Settings ----------
function pushSettings() {
  const sw = $("#tPush"), note = $("#pushNote"), sel = $("#pTime"), test = $("#pTest");
  sel.value = S.profile?.reminder_time || "21:00";
  sel.onchange = async () => {
    try { await saveProfile({ reminder_time: sel.value, tz: userTz() }); toast(`Hatırlatma saati ${sel.value} oldu.`); }
    catch { toast("Saat kaydedilemedi, biraz sonra tekrar dene."); }
  };
  const paint = async () => {
    const st = pushState(), on = st === "granted" && !!(await currentSub());
    sw.setAttribute("aria-checked", String(on)); test.hidden = !on;
    sw.disabled = st !== "default" && st !== "granted";
    note.hidden = !["denied", "ios-install", "unsupported"].includes(st);
    note.innerHTML = st === "denied" ? "Bu cihazda bildirim izni kapalı. Açmak için telefonun ya da tarayıcının ayarlarından Daysayday'e bildirim izni ver."
      : st === "ios-install" ? `iPhone'da bildirimler için önce Daysayday'i ana ekrana eklemelisin. <a href="/telefona-kur.html">Nasıl eklerim?</a>`
      : st === "unsupported" ? "Bu tarayıcı bildirimleri desteklemiyor." : "";
  };
  sw.onclick = async () => {
    sw.disabled = true;
    try {
      if (sw.getAttribute("aria-checked") === "true") { await disablePush(); toast("Bu cihazda hatırlatmalar kapandı."); }
      else { await enablePush(); toast(`Tamam! Akşam ${sel.value}'da haber veririm.`); }
    } catch (e) { toast(e.message === "denied" ? "Bildirim izni verilmedi." : e.message === "dismissed" ? "İzin penceresi kapandı." : "Bildirim açılamadı, biraz sonra tekrar dene."); }
    await paint();
  };
  test.onclick = async () => {
    test.disabled = true;
    const { error } = await sb.functions.invoke(PUSH_FN, { body: { action: "test" } });
    toast(error ? "Deneme gönderilemedi." : "Deneme bildirimi gönderildi, birkaç saniye içinde gelir.");
    test.disabled = false;
  };
  paint();
}
function viewSettings() {
  let pick = charKey();
  shell("#ayarlar", `<div class="page settings">
    <h1 class="disp">Ayarlar</h1>
    <section class="card"><h2 class="disp">Profil</h2>
      <div class="pp-row">
        <div class="pp" id="ppView">${I.photo}</div>
        <div class="pp-acts"><b>Profil fotoğrafın</b><span>Görüntülü konuşmada "Sen" kutusunda görünür.</span>
          <div class="head-actions"><label class="btn btn-ghost">${I.photo}<span id="ppPick">${S.profile?.avatar ? "Değiştir" : "Fotoğraf seç"}</span><input id="ppIn" type="file" accept="image/*" hidden></label>${S.profile?.avatar ? `<button class="btn btn-ghost" id="ppDel" type="button">Kaldır</button>` : ""}</div></div>
      </div>
      <div class="field"><label for="sName">Adın</label><input class="input" id="sName" maxlength="40" value="${esc(S.profile.name)}"></div>
      <div class="field"><span style="font-size:14px;font-weight:600;color:var(--soft)">Konuştuğun arkadaş</span><div class="friends" id="sFriends">${friendCards(pick)}</div></div>
      <button class="btn btn-dark" id="sSave" type="button">Kaydet</button>
    </section>
    <section class="card"><h2 class="disp">Ses</h2>
      <p class="empty" style="margin:0">Karakterlerin nasıl konuşacağını seç. Her karakterin sesi kendine özgü tondadır.</p>
      <div class="voice-opts" role="radiogroup" aria-label="Konuşma sesi">
        <button type="button" class="vopt" role="radio" data-m="blip" aria-checked="${!humanVoice()}">
          <b>Karakter sesi</b><span>Sevimli “bıdı bıdı” konuşma, altyazıyla. Varsayılan.</span><em data-test="blip">Dinle</em></button>
        <button type="button" class="vopt" role="radio" data-m="human" aria-checked="${humanVoice()}">
          <b>İnsan sesi</b><span>Yapay zekâ seslendirmesi: Daysy, Luna, Eva ve Charlie'nin her birinin kendine ait sesi var.</span><em data-test="human">Dinle</em></button>
      </div>
      <p class="empty" id="voiceNote" style="margin:0;font-size:14px" hidden></p>
      <div class="toggle"><span>Ses açık</span><button class="switch" id="tSound" role="switch" aria-checked="${S.prefs.sound}" aria-label="Ses açık"></button></div>
    </section>
    <section class="card" id="pushCard"><h2 class="disp">Akşam hatırlatması</h2>
      <p class="empty" style="margin:0">O gün henüz yazmadıysan, seçtiğin saatte Luna sana kısa bir mesaj gönderir. Serin tehlikedeyse gece 23:00'te son bir kez hatırlatır.</p>
      <div class="toggle"><span>Bu cihazda bildirimler</span><button class="switch" id="tPush" role="switch" aria-checked="false" aria-label="Bu cihazda bildirimler"></button></div>
      <div class="field"><label for="pTime">Hatırlatma saati</label><select class="input" id="pTime"><option value="18:00">18:00</option><option value="18:30">18:30</option><option value="19:00">19:00</option><option value="19:30">19:30</option><option value="20:00">20:00</option><option value="20:30">20:30</option><option value="21:00">21:00</option><option value="21:30">21:30</option><option value="22:00">22:00</option><option value="22:30">22:30</option><option value="23:00">23:00</option><option value="23:30">23:30</option></select></div>
      <p class="empty" id="pushNote" style="margin:0;font-size:14px" hidden></p>
      <button class="btn btn-ghost" id="pTest" type="button" hidden>Deneme bildirimi gönder</button>
    </section>
    <section class="card"><h2 class="disp">Günlük şifresi</h2>
      <p class="empty" style="margin:0">${hasPin() ? "Kilitlediğin günlükler bu 4 haneli şifreyle açılır. Kilitli günlükleri karakterler de okuyamaz." : "Bir günlüğü kilitlemek için 4 haneli bir şifre oluştur. Kilitli günlükleri karakterler de okuyamaz."}</p>
      <div class="head-actions">${hasPin() ? `<button class="btn btn-ghost" id="pinChange" type="button">${I.lock}Şifreyi değiştir</button><button class="btn btn-ghost" id="pinForgot" type="button">Şifremi unuttum</button>` : `<button class="btn btn-dark" id="pinNew" type="button">${I.lock}Şifre oluştur</button>`}</div>
    </section>
    <section class="card"><h2 class="disp">Telefona kur</h2>
      <p class="empty" style="margin:0">Mağaza gerekmeden telefonuna uygulama gibi kurabilirsin.</p>
      <a class="btn btn-ghost" href="/telefona-kur.html">Adım adım kurulum</a>
    </section>
    <section class="card"><h2 class="disp">Hesap</h2>
      <p class="empty" style="margin:0">${esc(S.user.email)}</p>
      <button class="btn btn-ghost" id="logout" type="button">Çıkış yap</button>
      <button class="btn btn-danger" id="delAcc" type="button">Hesabımı ve tüm günlüklerimi sil</button>
      <a href="/gizlilik.html">Gizlilik ve KVKK aydınlatma metni</a>
    </section></div>`);
  const wireS = () => $$("#sFriends .friend-card").forEach(b => b.onclick = () => {
    if (lockedPick(b.dataset.k, $("#sFriends"), k => { pick = k; wireS(); })) return;
    pick = b.dataset.k; $$("#sFriends .friend-card").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  });
  wireS();
  $("#sSave").onclick = async () => {
    const n = $("#sName").value.trim(); if (!n) return toast("Adın boş olamaz.");
    try { await saveProfile({ name: n, character: pick }); toast("Kaydedildi"); viewSettings(); } catch (e) { toast(e.message); }
  };
  const sw = (id, k) => $(id).onclick = () => { S.prefs[k] = !S.prefs[k]; savePrefs(); $(id).setAttribute("aria-checked", String(S.prefs[k])); };
  sw("#tSound", "sound");
  $$(".vopt").forEach(b => b.onclick = e => {
    if (e.target.closest("em")) return;
    S.prefs.voiceMode = b.dataset.m; savePrefs();
    $$(".vopt").forEach(x => x.setAttribute("aria-checked", String(x === b)));

  });
  $$(".vopt em").forEach(t => t.onclick = async () => {
    const human = t.dataset.test === "human", k = charKey();
    const line = { daysy: "Selaaam! Ben Daysy, sesim böyle. Bugün nasıldı?", ivy: "Ben Luna. Sesim bu. Hadi, anlat bakalım.", sage: "Merhaba canım, ben Eva. Kahveni al gel, dinliyorum.", charlie: "Selam! Ben Charlie, sesim de böyle. Anlat bakalım, bugünün filmi nasıldı?" }[k];
    let audio = null;
    if (human) {
      t.textContent = "Yükleniyor…";
      try { const r = await ai({ action: "tts", text: line, character: k, voice: true }); audio = r.audio; if (r.error === "no_tts") { $("#voiceNote").hidden = false; $("#voiceNote").textContent = "İnsan sesi henüz etkin değil (sunucuda ses anahtarı yok). Şimdilik karakter sesi kullanılıyor."; } }
      catch (e) { $("#voiceNote").hidden = false; $("#voiceNote").textContent = e.message; }
      t.textContent = "Dinle";
    }
    const box = document.createElement("div"); box.style.cssText = "position:fixed;width:1px;height:1px;overflow:hidden;left:-9999px"; document.body.append(box);
    const c = new Character(box, k); c.voiceOn = false; c.sound = true;
    c.say(line, null, null, null, audio).then(() => box.remove());
  });
  pushSettings();
  avatarUrl().then(u => { if (u && $("#ppView")) $("#ppView").innerHTML = `<img src="${u}" alt="Profil fotoğrafın">`; });
  $("#ppIn").onchange = async ev => {
    const f = ev.target.files?.[0]; if (!f) return;
    $("#ppPick").textContent = "Yükleniyor…";
    try { await setAvatar(f); toast("Profil fotoğrafın kaydedildi."); viewSettings(); }
    catch (err) { $("#ppPick").textContent = "Fotoğraf seç"; toast(/column|avatar|bucket|row-level/i.test(err.message || "") ? "Önce 3. SQL güncellemesini çalıştır." : "Fotoğraf yüklenemedi."); }
  };
  if ($("#ppDel")) $("#ppDel").onclick = async () => { try { await clearAvatar(); toast("Profil fotoğrafı kaldırıldı."); viewSettings(); } catch { toast("Kaldırılamadı."); } };
  if ($("#pinNew")) $("#pinNew").onclick = async () => { if (await createPin()) viewSettings(); };
  if ($("#pinChange")) $("#pinChange").onclick = async () => { S.unlockedUntil = 0; if (await unlock() && await createPin()) viewSettings(); };
  if ($("#pinForgot")) $("#pinForgot").onclick = async () => { if (await resetPin()) viewSettings(); };
  $("#logout").onclick = async () => { await sb.auth.signOut(); location.href = "/#tanitim"; };
  $("#delAcc").onclick = async () => {
    const ok = prompt("Bu işlem geri alınamaz. Onaylamak için SİL yaz:");
    if ((ok || "").trim().toLocaleUpperCase("tr") !== "SİL") return;
    try { await ai({ action: "delete_account" }); await sb.auth.signOut(); localStorage.clear(); location.href = "/"; }
    catch (e) { toast("Silinemedi: " + e.message); }
  };
}

boot();
