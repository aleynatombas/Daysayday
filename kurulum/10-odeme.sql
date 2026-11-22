-- Daysayday ücretli kapılar (Supabase → SQL Editor → New query → bunu yapıştır → Run)
-- Birden fazla kez çalıştırılabilir; var olanı bozmaz.
--
-- Haklar yalnızca sunucuda, doğrulanmış satın alma kaydından yazılır. Kullanıcılar bu tabloları
-- yalnızca okuyabilir; yazma izni yoktur (istemci "ödedim" diyemez). Fonksiyonları yalnızca
-- sunucu fonksiyonu (service_role) çağırabilir.
-- Fiyatlar burada değil: "daysy" fonksiyonundaki PRODUCTS sabitinde, kuruş olarak.

-- 0) Ayar: ödemeler açık mı? Varsayılan kapalı. Kapalıyken uygulama bugünkü gibi çalışır.
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null
);
insert into public.app_settings (key, value) values ('payments_enabled', 'false'::jsonb)
on conflict (key) do nothing;

-- 1) Doğrulanmış satın almalar (her ödeme bir kez işlenir: provider + provider_ref tekil)
create table if not exists public.billing_purchases (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  sku text not null check (sku in ('charlie_once', 'page_1', 'page_4', 'plan_month', 'plan_year')),
  amount_kurus int not null check (amount_kurus >= 0),
  provider text not null,          -- ödeme sağlayıcısı; geliştirmede 'dev'
  provider_ref text not null,      -- sağlayıcının ödeme numarası
  created_at timestamptz not null default now(),
  unique (provider, provider_ref)
);

-- 2) Kalıcı haklar: Charlie satın alındı mı, kaç sayfa kredisi var
create table if not exists public.billing_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  charlie_owned boolean not null default false,
  page_credits int not null default 0 check (page_credits >= 0),
  updated_at timestamptz not null default now()
);

-- 3) Abonelik: plan, durum, dönem sonu. Dönem sonu geçince erişim biter.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null check (plan in ('plan_month', 'plan_year')),
  status text not null check (status in ('active', 'canceled', 'expired', 'past_due')),
  current_period_end timestamptz not null,
  updated_at timestamptz not null default now()
);

-- 4) Yazılan her sayfanın kaydı: hangi günün hakkından düştü, nasıl ödendi.
--    (user_id, request_id) tekil: aynı istek iki kez gelirse hak bir kez düşer.
create table if not exists public.page_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  request_id text not null,
  quota_day date not null,          -- hakkın sayıldığı gün (Europe/Istanbul)
  entry_day date not null,          -- yazılan günlük sayfasının günü
  kind text not null check (kind in ('free', 'sub', 'credit')),
  created_at timestamptz not null default now(),
  unique (user_id, request_id)
);
create index if not exists page_ledger_user_day on public.page_ledger (user_id, quota_day);

-- Satır güvenliği: herkes yalnızca kendi kayıtlarını OKUR; yazma politikası yok.
alter table public.app_settings      enable row level security;
alter table public.billing_purchases enable row level security;
alter table public.billing_accounts  enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.page_ledger       enable row level security;

drop policy if exists "own purchases read" on public.billing_purchases;
create policy "own purchases read" on public.billing_purchases for select using (auth.uid() = user_id);
drop policy if exists "own account read" on public.billing_accounts;
create policy "own account read" on public.billing_accounts for select using (auth.uid() = user_id);
drop policy if exists "own subscription read" on public.subscriptions;
create policy "own subscription read" on public.subscriptions for select using (auth.uid() = user_id);
drop policy if exists "own ledger read" on public.page_ledger;
create policy "own ledger read" on public.page_ledger for select using (auth.uid() = user_id);

-- ---------- Kurallar ----------

-- Bugün, İstanbul saatine göre (gece yarısında sıfırlanır)
create or replace function public.billing_today() returns date
language sql stable as $$ select (now() at time zone 'Europe/Istanbul')::date $$;

-- Sayfanın hangi günün hakkından düşeceği: bugünün ya da dünün sayfasıysa o gün;
-- daha eski (ya da ileri) bir günse bugün.
create or replace function public.billing_quota_day(p_entry_day date) returns date
language sql stable as $$
  select case when p_entry_day between public.billing_today() - 1 and public.billing_today()
              then p_entry_day else public.billing_today() end
$$;

-- Abonelik geçerli mi? Dönem sonu geçtiyse durum ne yazarsa yazsın geçersiz.
create or replace function public.billing_sub_active(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.subscriptions
                 where user_id = p_user and status in ('active', 'canceled') and current_period_end > now())
$$;

-- Charlie açık mı? Kalıcı satın alma ya da geçerli abonelik.
create or replace function public.billing_has_charlie(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select charlie_owned from public.billing_accounts where user_id = p_user), false)
         or public.billing_sub_active(p_user)
$$;

-- Bu sayfa yazılabilir mi? Modeli çağırmadan önce sorulur, hiçbir şey yazmaz.
--   done        : bu istek zaten kaydedildi (tekrar gelmiş)
--   free        : günün bedava sayfası
--   sub         : abonenin günlük iki sayfasından biri
--   credit      : bir sayfa kredisi düşecek
--   blocked     : abone değil, bugünkü bedava sayfa kullanıldı, kredi yok
--   blocked_sub : abone, bugünkü iki sayfa da kullanıldı
create or replace function public.billing_page_decision(p_user uuid, p_request text, p_entry_day date) returns text
language plpgsql stable security definer set search_path = public as $$
declare
  qd date := public.billing_quota_day(p_entry_day);
  n int;
  cr int;
begin
  if exists (select 1 from public.page_ledger where user_id = p_user and request_id = p_request) then
    return 'done';
  end if;
  select count(*) into n from public.page_ledger where user_id = p_user and quota_day = qd;
  if public.billing_sub_active(p_user) then
    return case when n < 2 then 'sub' else 'blocked_sub' end;
  end if;
  if n = 0 then return 'free'; end if;
  select page_credits into cr from public.billing_accounts where user_id = p_user;
  return case when coalesce(cr, 0) > 0 then 'credit' else 'blocked' end;
end $$;

-- Sayfayı kaydeder ve hakkı AYNI işlemde düşer. Model başarılı bir sayfa döndürdükten sonra çağrılır.
-- Başarısız ya da yarım yazım buraya hiç gelmez, bu yüzden hak düşmez.
create or replace function public.billing_commit_page(p_user uuid, p_request text, p_entry_day date, p_page jsonb) returns text
language plpgsql volatile security definer set search_path = public as $$
declare
  d text;
begin
  insert into public.billing_accounts (user_id) values (p_user) on conflict (user_id) do nothing;
  perform 1 from public.billing_accounts where user_id = p_user for update;  -- aynı kullanıcının yazımları sırayla
  d := public.billing_page_decision(p_user, p_request, p_entry_day);
  if d in ('done', 'blocked', 'blocked_sub') then return d; end if;

  insert into public.entries (user_id, day, title, body, moment, mood, tags, summary, note, character, messages, updated_at)
  values (p_user, p_entry_day,
          coalesce(p_page->>'title', ''), coalesce(p_page->>'body', ''), coalesce(p_page->>'moment', ''),
          p_page->>'mood',
          coalesce(array(select jsonb_array_elements_text(coalesce(p_page->'tags', '[]'::jsonb))), '{}'),
          coalesce(p_page->>'summary', ''), coalesce(p_page->>'note', ''),
          coalesce(p_page->>'character', 'daysy'), coalesce(p_page->'messages', '[]'::jsonb), now())
  on conflict (user_id, day) do update set
    title = excluded.title, body = excluded.body, moment = excluded.moment, mood = excluded.mood,
    tags = excluded.tags, summary = excluded.summary, note = excluded.note,
    character = excluded.character, messages = excluded.messages, updated_at = now();

  insert into public.page_ledger (user_id, request_id, quota_day, entry_day, kind)
  values (p_user, p_request, public.billing_quota_day(p_entry_day), p_entry_day, d);

  if d = 'credit' then
    update public.billing_accounts set page_credits = page_credits - 1, updated_at = now() where user_id = p_user;
  end if;
  return d;
end $$;

-- Doğrulanmış bir ödemeyi hakka çevirir. Yalnızca sunucu çağırır (ödeme sağlayıcısının onayından
-- ya da geliştirme hakkından sonra). Aynı ödeme numarası ikinci kez gelirse hiçbir şey yapmaz.
create or replace function public.billing_grant(p_user uuid, p_sku text, p_amount int, p_credits int, p_months int,
                                                p_provider text, p_ref text) returns text
language plpgsql volatile security definer set search_path = public as $$
begin
  insert into public.billing_purchases (user_id, sku, amount_kurus, provider, provider_ref)
  values (p_user, p_sku, p_amount, p_provider, p_ref)
  on conflict (provider, provider_ref) do nothing;
  if not found then return 'duplicate'; end if;

  insert into public.billing_accounts (user_id) values (p_user) on conflict (user_id) do nothing;
  if p_sku = 'charlie_once' then
    update public.billing_accounts set charlie_owned = true, updated_at = now() where user_id = p_user;
  elsif coalesce(p_credits, 0) > 0 then
    update public.billing_accounts set page_credits = page_credits + p_credits, updated_at = now() where user_id = p_user;
  elsif coalesce(p_months, 0) > 0 then
    -- yeni dönem bugünden (ya da hâlâ süren dönemin sonundan) itibaren p_months ay
    insert into public.subscriptions (user_id, plan, status, current_period_end)
    values (p_user, p_sku, 'active', now() + make_interval(months => p_months))
    on conflict (user_id) do update set
      plan = excluded.plan, status = 'active', updated_at = now(),
      current_period_end = greatest(public.subscriptions.current_period_end, now()) + make_interval(months => p_months);
  end if;
  return 'ok';
end $$;

-- Uygulamanın göstereceği durum
create or replace function public.billing_state(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'sub_active', public.billing_sub_active(p_user),
    'plan', (select plan from public.subscriptions where user_id = p_user),
    'status', (select status from public.subscriptions where user_id = p_user),
    'current_period_end', (select current_period_end from public.subscriptions where user_id = p_user),
    'charlie_owned', coalesce((select charlie_owned from public.billing_accounts where user_id = p_user), false),
    'has_charlie', public.billing_has_charlie(p_user),
    'credits', coalesce((select page_credits from public.billing_accounts where user_id = p_user), 0),
    'today', public.billing_today(),
    'today_used', (select count(*) from public.page_ledger where user_id = p_user and quota_day = public.billing_today()),
    'yesterday_used', (select count(*) from public.page_ledger where user_id = p_user and quota_day = public.billing_today() - 1)
  )
$$;

-- Fonksiyonları yalnızca sunucu çağırabilir
revoke all on function public.billing_sub_active(uuid) from public, anon, authenticated;
revoke all on function public.billing_has_charlie(uuid) from public, anon, authenticated;
revoke all on function public.billing_page_decision(uuid, text, date) from public, anon, authenticated;
revoke all on function public.billing_commit_page(uuid, text, date, jsonb) from public, anon, authenticated;
revoke all on function public.billing_grant(uuid, text, int, int, int, text, text) from public, anon, authenticated;
revoke all on function public.billing_state(uuid) from public, anon, authenticated;
grant execute on function public.billing_sub_active(uuid) to service_role;
grant execute on function public.billing_has_charlie(uuid) to service_role;
grant execute on function public.billing_page_decision(uuid, text, date) to service_role;
grant execute on function public.billing_commit_page(uuid, text, date, jsonb) to service_role;
grant execute on function public.billing_grant(uuid, text, int, int, int, text, text) to service_role;
grant execute on function public.billing_state(uuid) to service_role;

-- Ödemeleri açmak için (ancak ödeme sağlayıcısı bağlandıktan sonra):
--   update public.app_settings set value = 'true'::jsonb where key = 'payments_enabled';
