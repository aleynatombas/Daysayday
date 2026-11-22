-- Daysayday · Akşam hatırlatma bildirimleri (web push)
-- SQL Editor'de BİR KEZ çalıştır. Sonra 9-edge-function-hatirlatici.ts'i "hatirlatici" adıyla deploy et,
-- en alttaki zamanlayıcıyı da BURAYA_CRON_SECRET yerine kendi CRON_SECRET'ını yazarak çalıştır.

-- 0) Zamanlayıcı eklentileri (açıksa bir şey değişmez)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 1) Profil ayarları: hatırlatma açık mı, saat kaç, kullanıcının saat dilimi, son gönderim
alter table public.profiles add column if not exists remind_on boolean not null default true;
alter table public.profiles add column if not exists tz text not null default 'Europe/Istanbul';
alter table public.profiles add column if not exists last_push_on date;
alter table public.profiles add column if not exists last_push_kind text;
alter table public.profiles alter column reminder_time set default '21:00';
-- uygulama bu saati daha önce hiç kullanmadı: eski varsayılanı yeni varsayılana çek
update public.profiles set reminder_time = '21:00' where reminder_time is null or reminder_time = '21:30';

-- 2) Bildirim abonelikleri: her cihaz/tarayıcı için bir satır
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  p256dh text not null,
  auth text not null,
  ua text default '',
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;

drop policy if exists "kendi aboneligini gor" on public.push_subscriptions;
drop policy if exists "kendi aboneligini ekle" on public.push_subscriptions;
drop policy if exists "kendi aboneligini guncelle" on public.push_subscriptions;
drop policy if exists "kendi aboneligini sil" on public.push_subscriptions;
create policy "kendi aboneligini gor" on public.push_subscriptions for select using (auth.uid() = user_id);
create policy "kendi aboneligini ekle" on public.push_subscriptions for insert with check (auth.uid() = user_id);
create policy "kendi aboneligini guncelle" on public.push_subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kendi aboneligini sil" on public.push_subscriptions for delete using (auth.uid() = user_id);

-- 3) Zamanlayıcı: her 15 dakikada bir hatırlatıcıyı çalıştır (pg_cron ve pg_net zaten açık)
--    Fonksiyonun adresi farklıysa (Supabase başka bir ad verdiyse) "hatirlatici" kısmını o adla değiştir.
select cron.unschedule('daysayday-hatirlatici') where exists (select 1 from cron.job where jobname = 'daysayday-hatirlatici');
select cron.schedule(
  'daysayday-hatirlatici',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://gptzbqozsiktakcqafjn.supabase.co/functions/v1/hatirlatici',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', 'BURAYA_CRON_SECRET'),
    body := '{"action":"tick"}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
