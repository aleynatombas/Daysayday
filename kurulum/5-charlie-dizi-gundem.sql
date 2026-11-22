-- Daysayday: Charlie'nin dizi/film hafızası ve gündem listesi
-- Supabase → SQL Editor'e yapıştırıp Run de. Bir kez çalıştırman yeterli.

-- 1) Kullanıcının sevdiği / izlediği dizi ve filmler (günlük yazılırken kendiliğinden dolar)
alter table public.profiles add column if not exists favorites jsonb not null default '[]'::jsonb;

-- 2) Gündem listesi: Charlie'nin "şu sıralar konuşulanlar" bilgisi.
--    Bunu sen güncellersin (Table Editor → trends). Uygulama yalnızca active = true olanları,
--    en yeniden başlayarak 15 tanesini okur. Eskiyenleri silmek yerine active'i false yapabilirsin.
create table if not exists public.trends (
  id bigserial primary key,
  text text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.trends enable row level security;
-- Politika yok: kullanıcılar bu tabloyu okuyamaz/yazamaz, yalnızca sunucu (Edge Function) okur.

-- Örnek satır (istersen sil, kendi gündemini ekle):
-- insert into public.trends (text) values
--   ('X dizisinin final bölümü herkesin konuştuğu konu, sonu tartışma yarattı'),
--   ('TikTok''ta şu ses akımı dönüyor: ...');
