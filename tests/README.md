# Testler

Ödeme kapısı ve hak sistemi (`kurulum/10-odeme.sql` + `kurulum/2-edge-function-daysy.ts`) için testler.

| Dosya | Ne yapar |
|---|---|
| `stub.sql` | Supabase'in `auth` şemasını ve rollerini yerel Postgres'te taklit eder |
| `test.sql` | 52 SQL testi: karar fonksiyonu, atomik kayıt, idempotens, kota günü, abonelik süresi, RLS yetkileri |
| `fakedb.mjs` | `supabase-js`'in kullanılan kısmını `psql` üzerinden taklit eder |
| `harness.mjs` | Gerçek Edge Function kodunu Node'da çalıştırır, model çağrısını sahte `fetch` ile karşılar ve sayar |
| `e2e.mjs` | 28 uçtan uca test: kapı modelden önce mi, hak doğru anda mı düşüyor, aynı istek tekrar gelince ne oluyor |

## Çalıştırma

Yerel bir Postgres 16+ ve Node 20+ yeterli:

```bash
PGHOST=localhost PGPORT=5432 PGUSER=postgres ./tests/calistir.sh
```

Gerçek bir yapay zekâ ya da ödeme servisine istek gitmez.
