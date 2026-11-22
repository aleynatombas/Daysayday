#!/usr/bin/env bash
# Ödeme katmanı testleri: yerel bir Postgres (16+) ve Node (20+) gerekir.
# Bağlantı: PGHOST / PGPORT / PGUSER ortam değişkenleri (varsayılan: /tmp/pg, 5499, postgres).
set -euo pipefail
cd "$(dirname "$0")"
export PGHOST="${PGHOST:-/tmp/pg}" PGPORT="${PGPORT:-5499}" PGUSER="${PGUSER:-postgres}" PGDATABASE="${PGDATABASE:-daysayday_test}"
Q="psql -v ON_ERROR_STOP=1 -q"
psql -d postgres -q -c "drop database if exists $PGDATABASE" -c "create database $PGDATABASE"
$Q -f stub.sql >/dev/null 2>&1                       # Supabase'in auth şeması ve rolleri için küçük taklit
for f in 1-veritabani 4-charlie 5-charlie-dizi-gundem 10-odeme; do $Q -f ../kurulum/$f.sql >/dev/null 2>&1; done
$Q -v ON_ERROR_STOP=0 -f ../kurulum/3-kilit-ve-fotograf.sql >/dev/null 2>&1 || true   # storage kısmı yerelde yok, tablolar kurulur
echo "— SQL testleri"; $Q -f test.sql | tee /dev/stderr | grep -c '^OK'
echo "— Uçtan uca testler (gerçek Edge Function kodu, sahte model)"; node e2e.mjs
