-- Daysayday güncellemesi: günlük kilidi + fotoğraf çıkartmaları + profil fotoğrafı
-- Supabase → SQL Editor → New query → bunu yapıştır → Run. Birden fazla kez çalıştırılabilir.

-- 1) Günlük şifresi (4 haneli PIN). Şifrenin kendisi değil, PBKDF2 özeti saklanır.
alter table public.profiles add column if not exists lock_hash text;
alter table public.profiles add column if not exists lock_salt text;
alter table public.profiles add column if not exists avatar text;   -- profil fotoğrafının depodaki yolu

-- 2) Kilitli gün ve günlüğe eklenen fotoğraflar
alter table public.entries add column if not exists locked boolean not null default false;
alter table public.entries add column if not exists photos jsonb not null default '[]'::jsonb;

-- 3) Fotoğraflar için özel (herkese kapalı) depolama alanı, dosya başına en fazla 5 MB
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Herkes yalnızca kendi klasörünü (kullanıcı-kimliği/...) görebilir ve değiştirebilir
drop policy if exists "photos own read" on storage.objects;
create policy "photos own read" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos own insert" on storage.objects;
create policy "photos own insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos own update" on storage.objects;
create policy "photos own update" on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos own delete" on storage.objects;
create policy "photos own delete" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
