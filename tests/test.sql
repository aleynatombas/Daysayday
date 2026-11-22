\set ON_ERROR_STOP 1
\pset format unaligned
\pset tuples_only on
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a','a@x'), ('00000000-0000-0000-0000-00000000000b','b@x'), ('00000000-0000-0000-0000-00000000000c','c@x');
\set A '\'00000000-0000-0000-0000-00000000000a\''
\set B '\'00000000-0000-0000-0000-00000000000b\''
\set C '\'00000000-0000-0000-0000-00000000000c\''
create temp table r (n serial, test text, got text, want text);
create function pg_temp.chk(t text, got text, want text) returns void language sql as $$ insert into r(test,got,want) values (t,got,want) $$;
-- page body used by every commit
\set PG '\'{"title":"T","body":"B","mood":"mutlu","tags":["a","b"],"summary":"s","note":"n","character":"daysy","messages":{"daysy":[{"role":"user","content":"x"}]}}\'::jsonb'

-- 1) abone değil: ilk sayfa bedava, ikincisi kapalı (modele gitmez)
select pg_temp.chk('A ilk sayfa karar', billing_page_decision(:A,'r1',billing_today()), 'free');
select pg_temp.chk('A ilk sayfa kayıt', billing_commit_page(:A,'r1',billing_today(),:PG), 'free');
select pg_temp.chk('A sayfa entries tablosunda', (select title||'/'||array_to_string(tags,',') from entries where user_id=:A and day=billing_today()), 'T/a,b');
select pg_temp.chk('A ikinci sayfa karar', billing_page_decision(:A,'r2',billing_today()), 'blocked');
select pg_temp.chk('A ikinci sayfa kayıt denemesi', billing_commit_page(:A,'r2',billing_today(),:PG), 'blocked');
select pg_temp.chk('A kapalı denemede defter satırı', (select count(*)::text from page_ledger where user_id=:A), '1');
-- 2) aynı istek iki kez: bir kez düşer
select pg_temp.chk('A aynı istek tekrar', billing_commit_page(:A,'r1',billing_today(),:PG), 'done');
select pg_temp.chk('A defter hâlâ 1', (select count(*)::text from page_ledger where user_id=:A), '1');
-- 3) dört sayfalık paket dört kredi yazar, bir kredi düşer
select pg_temp.chk('A page_4 hakkı', billing_grant(:A,'page_4',14900,4,0,'dev','p1'), 'ok');
select pg_temp.chk('A kredi 4', (select page_credits::text from billing_accounts where user_id=:A), '4');
select pg_temp.chk('A aynı ödeme ikinci kez', billing_grant(:A,'page_4',14900,4,0,'dev','p1'), 'duplicate');
select pg_temp.chk('A kredi hâlâ 4', (select page_credits::text from billing_accounts where user_id=:A), '4');
select pg_temp.chk('A ikinci sayfa krediyle karar', billing_page_decision(:A,'r2',billing_today()), 'credit');
-- başarısız yazım: model hata verdi, commit çağrılmadı → hak düşmez
select pg_temp.chk('A başarısız yazımdan sonra kredi', (select page_credits::text from billing_accounts where user_id=:A), '4');
select pg_temp.chk('A ikinci sayfa krediyle kayıt', billing_commit_page(:A,'r2',billing_today(),:PG), 'credit');
select pg_temp.chk('A kredi 3', (select page_credits::text from billing_accounts where user_id=:A), '3');
select pg_temp.chk('A krediyle tekrar aynı istek', billing_commit_page(:A,'r2',billing_today(),:PG), 'done');
select pg_temp.chk('A kredi hâlâ 3', (select page_credits::text from billing_accounts where user_id=:A), '3');
select pg_temp.chk('A page_1 hakkı', billing_grant(:A,'page_1',4900,1,0,'dev','p2'), 'ok');
select pg_temp.chk('A page_1 bir kredi yazar (3→4)', (select page_credits::text from billing_accounts where user_id=:A), '4');
-- dünün sayfası dünün hakkından düşer (bugünkünü yemez)
select pg_temp.chk('C dünün sayfası', billing_commit_page(:C,'y1',billing_today()-1,:PG), 'free');
select pg_temp.chk('C bugünün sayfası yine bedava', billing_page_decision(:C,'t1',billing_today()), 'free');
select pg_temp.chk('C eski gün bugünden düşer', billing_quota_day(billing_today()-5)::text, billing_today()::text);

-- 4) abone: günde iki sayfa, kredi düşmez, üçüncüsü kapalı
select pg_temp.chk('B aylık abonelik', billing_grant(:B,'plan_month',49900,0,1,'dev','m1'), 'ok');
select pg_temp.chk('B ay sonu', (select (current_period_end::date - now()::date between 28 and 31)::text from subscriptions where user_id=:B), 'true');
select pg_temp.chk('B 1. sayfa', billing_commit_page(:B,'s1',billing_today(),:PG), 'sub');
select pg_temp.chk('B 2. sayfa', billing_commit_page(:B,'s2',billing_today(),:PG), 'sub');
select pg_temp.chk('B 3. sayfa karar', billing_page_decision(:B,'s3',billing_today()), 'blocked_sub');
select pg_temp.chk('B 3. sayfa kayıt', billing_commit_page(:B,'s3',billing_today(),:PG), 'blocked_sub');
select pg_temp.chk('B kredisi düşmedi', (select page_credits::text from billing_accounts where user_id=:B), '0');
-- 5) Charlie: abonelikle açık, dönem bitince kapanır; kalıcı satın alma kalır
select pg_temp.chk('B Charlie abonelikle', billing_has_charlie(:B)::text, 'true');
update subscriptions set current_period_end = now() - interval '1 minute' where user_id=:B;
select pg_temp.chk('B süre doldu: abonelik', billing_sub_active(:B)::text, 'false');
select pg_temp.chk('B süre doldu: Charlie kapandı', billing_has_charlie(:B)::text, 'false');
select pg_temp.chk('B süre doldu: gün bir bedava sayfaya iner', billing_page_decision(:B,'s4',billing_today()), 'blocked');
select pg_temp.chk('A Charlie yok', billing_has_charlie(:A)::text, 'false');
select pg_temp.chk('A Charlie satın alma', billing_grant(:A,'charlie_once',14900,0,0,'dev','c1'), 'ok');
select pg_temp.chk('A Charlie kalıcı', billing_has_charlie(:A)::text, 'true');
select pg_temp.chk('A Charlie aboneliksiz de açık', billing_sub_active(:A)::text || '/' || billing_has_charlie(:A)::text, 'false/true');
-- abonelik bitip Charlie'yi ayrıca alan: abonelik bitince de Charlie kalır
select pg_temp.chk('C aylık', billing_grant(:C,'plan_month',49900,0,1,'dev','m2'), 'ok');
select pg_temp.chk('C Charlie de aldı', billing_grant(:C,'charlie_once',14900,0,0,'dev','c2'), 'ok');
update subscriptions set current_period_end = now() - interval '1 minute' where user_id=:C;
select pg_temp.chk('C abonelik bitti, Charlie kaldı', billing_has_charlie(:C)::text, 'true');
-- 6) yıllık kayıt on iki aylık dönem açar
select pg_temp.chk('B yıllık', billing_grant(:B,'plan_year',499000,0,12,'dev','y1'), 'ok');
select pg_temp.chk('B yıllık dönem sonu', (select (current_period_end - now() between interval '364 days' and interval '366 days')::text from subscriptions where user_id=:B), 'true');
select pg_temp.chk('B yıllık plan adı', (select plan||'/'||status from subscriptions where user_id=:B), 'plan_year/active');
-- 7) gün İstanbul gece yarısında sıfırlanır
select pg_temp.chk('İstanbul günü', billing_today()::text, ((now() at time zone 'Europe/Istanbul')::date)::text);
-- 8) durum özeti
select pg_temp.chk('A durum', (select (s->>'credits')||'/'||(s->>'has_charlie')||'/'||(s->>'today_used') from (select billing_state(:A) s) x), '4/true/2');

-- 9) istemci hak yazamaz, fonksiyonları çağıramaz, yalnız kendi kaydını okur
grant usage on schema public to authenticated; grant select, insert, update on all tables in schema public to authenticated;
grant all on r to authenticated; grant usage, select, update on sequence r_n_seq to authenticated;
set role authenticated; select set_config('request.jwt.sub', '00000000-0000-0000-0000-00000000000b', false);
select pg_temp.chk('istemci: başkasının hesabını göremez', (select count(*)::text from billing_accounts where user_id=:A), '0');
select pg_temp.chk('istemci: kendi aboneliğini okur', (select count(*)::text from subscriptions), '1');
do $$ begin insert into billing_accounts(user_id, page_credits) values ('00000000-0000-0000-0000-00000000000b', 99) on conflict (user_id) do update set page_credits = 99; raise exception 'yazabildi'; exception when insufficient_privilege or others then if sqlerrm = 'yazabildi' then raise; end if; end $$;
select pg_temp.chk('istemci: kredi yazamadı', 'ok', 'ok');
do $$ begin perform billing_grant('00000000-0000-0000-0000-00000000000b','page_4',0,4,0,'dev','hack'); raise exception 'cagirdi'; exception when insufficient_privilege then null; end $$;
select pg_temp.chk('istemci: billing_grant çağıramadı', 'ok', 'ok');
do $$ begin perform billing_commit_page('00000000-0000-0000-0000-00000000000b','h',current_date,'{}'); raise exception 'cagirdi'; exception when insufficient_privilege then null; end $$;
select pg_temp.chk('istemci: billing_commit_page çağıramadı', 'ok', 'ok');
reset role;
select pg_temp.chk('B kredisi hâlâ 0', (select page_credits::text from billing_accounts where user_id=:B), '0');
select format('%s %-48s got=%-14s want=%s', case when got is not distinct from want then 'OK  ' else 'FAIL' end, test, got, want) from r order by n;
