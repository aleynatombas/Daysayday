-- Daysayday veritabanı (Supabase → SQL Editor → New query → bunu yapıştır → Run)
-- Birden fazla kez çalıştırılabilir; var olanı bozmaz.

-- 1) Profil: isim, seçilen karakter, hatırlatma saati
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  character text not null default 'daysy' check (character in ('daysy', 'ivy', 'sage', 'charlie')),
  reminder_time text default '21:30',
  created_at timestamptz not null default now()
);

-- 2) Günlük sayfaları: her kullanıcı için günde bir sayfa
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  day date not null,
  title text not null default '',
  body text not null default '',
  moment text default '',
  mood text check (mood in ('mutlu', 'sakin', 'heyecanli', 'yorgun', 'huzunlu', 'gergin')),
  tags text[] default '{}',
  summary text default '',          -- karakterin hafızası için kısa özet
  note text default '',             -- karakterin kullanıcıya küçük notu
  character text default 'daysy',
  messages jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day)
);
create index if not exists entries_user_day on public.entries (user_id, day desc);

-- 3) Geleceğe mektup (zaman kapsülü)
create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  body text not null,
  open_on date not null,
  created_at timestamptz not null default now()
);

-- 4) Yapay zekâ kullanım kaydı (limit ve maliyet takibi; yalnızca sunucu fonksiyonu yazar)
create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete cascade,
  kind text not null,
  input_tokens int default 0,
  output_tokens int default 0,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_user_time on public.ai_usage (user_id, created_at desc);
create index if not exists ai_usage_time on public.ai_usage (created_at desc);

-- Satır güvenliği: herkes yalnızca kendi kayıtlarını görür
alter table public.profiles enable row level security;
alter table public.entries  enable row level security;
alter table public.letters  enable row level security;
alter table public.ai_usage enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own entries" on public.entries;
create policy "own entries" on public.entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own letters" on public.letters;
create policy "own letters" on public.letters for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "read own usage" on public.ai_usage;
create policy "read own usage" on public.ai_usage for select
  using (auth.uid() = user_id);
-- ai_usage'a ekleme yalnızca service role ile (Edge Function) yapılır; istemcide yazma izni yok.

-- updated_at otomatik
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists entries_touch on public.entries;
create trigger entries_touch before update on public.entries
  for each row execute function public.touch_updated_at();
