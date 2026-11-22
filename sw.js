// Basit çevrimdışı kabuk: uygulama dosyalarını önbelleğe alır, veriyi her zaman ağdan çeker.
const CACHE = "daysayday-v60";
const SHELL = ["/", "/app/", "/app/app.css?v=2611212223", "/app/app.js?v=2611212223", "/app/character.js?v=2611212223", "/config.js", "/img/logo.png", "/img/luna-head.png",
  "/img/flower-mutlu.svg", "/img/flower-sakin.svg", "/img/flower-heyecanli.svg", "/img/flower-yorgun.svg", "/img/flower-huzunlu.svg", "/img/flower-gergin.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});

// Akşam hatırlatmaları: sunucudan gelen bildirimi göster, dokununca sohbeti aç
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : "" }; }
  const k = ["daysy", "ivy", "sage", "charlie"].includes(d.char) ? d.char : "daysy";
  e.waitUntil(self.registration.showNotification(d.title || "Daysayday", {
    body: d.body || "Bugün nasıldı? Biraz konuşalım mı?",
    icon: `/img/notif-${k}.png`, badge: "/img/notif-badge.png",
    tag: d.tag || "dsd-hatirlatma", data: { url: d.url || "/app/#sohbet" },
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/app/#sohbet", self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    const open = list.find(c => c.url.startsWith(self.location.origin + "/app/"));
    if (open) return open.focus().then(c => c && c.navigate ? c.navigate(url).catch(() => c) : c);
    return self.clients.openWindow(url);
  }));
});
