-- Daysayday: dördüncü arkadaş Charlie
-- Supabase → SQL Editor'e yapıştırıp Run de. Bir kez çalıştırman yeterli.
-- Profilde seçilebilen karakter listesine 'charlie' eklenir.

alter table public.profiles drop constraint if exists profiles_character_check;
alter table public.profiles
  add constraint profiles_character_check
  check (character in ('daysy', 'ivy', 'sage', 'charlie'));
