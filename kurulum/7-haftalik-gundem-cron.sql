-- Daysayday: gündemi her pazartesi sabah 07:00'de (Türkiye saati) kendiliğinden yenile.
-- ÖNCE: Database → Extensions bölümünden "pg_cron" ve "pg_net" eklentilerini aç (Enable).
-- SONRA: aşağıdaki BURAYA_CRON_SECRET yazan yeri, Edge Function Secrets'a yazdığın CRON_SECRET ile değiştir
--        ve tamamını SQL Editor'de çalıştır.

select cron.unschedule('daysayday-gundem') where exists (select 1 from cron.job where jobname = 'daysayday-gundem');

select cron.schedule(
  'daysayday-gundem',
  '0 4 * * 1',            -- pazartesi 04:00 UTC = 07:00 Türkiye
  $$
  select net.http_post(
    url := 'https://gptzbqozsiktakcqafjn.supabase.co/functions/v1/gundem',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', 'BURAYA_CRON_SECRET'),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $$
);

-- Hemen bir kez denemek istersen (sonuç birkaç dakika içinde trends tablosunda görünür):
-- select net.http_post(
--   url := 'https://gptzbqozsiktakcqafjn.supabase.co/functions/v1/gundem',
--   headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', 'BURAYA_CRON_SECRET'),
--   body := '{}'::jsonb, timeout_milliseconds := 120000);
