// Minimal stand-in for supabase-js backed by the local Postgres (psql). Enough for the daysy function.
import { execFileSync } from "node:child_process";
const PSQL = ["-h", process.env.PGHOST || "/tmp/pg", "-p", process.env.PGPORT || "5499", "-U", process.env.PGUSER || "postgres", "-d", process.env.PGDATABASE || "t", "-At", "-v", "ON_ERROR_STOP=1", "-c"];
export function sql(q) { return execFileSync("psql", [...PSQL, q], { encoding: "utf8" }).trim(); }
const lit = v => v === null || v === undefined ? "null" : typeof v === "number" ? String(v) : typeof v === "boolean" ? String(v)
  : typeof v === "object" ? `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb` : `'${String(v).replace(/'/g, "''")}'`;
class Q {
  constructor(table, uid) { this.t = table; this.uid = uid; this.w = []; this.op = "select"; this.cols = "*"; }
  select(c = "*", o = {}) { this.cols = c; this.count = o.count; this.head = o.head; return this; }
  eq(c, v) { this.w.push(`${c} = ${lit(v)}`); return this; }
  gte(c, v) { this.w.push(`${c} >= ${lit(v)}`); return this; }
  lte(c, v) { this.w.push(`${c} <= ${lit(v)}`); return this; }
  order(c, o = {}) { this.ord = `${c} ${o.ascending === false ? "desc" : "asc"}`; return this; }
  limit(n) { this.lim = n; return this; }
  maybeSingle() { this.single = true; return this; }
  insert(obj) { this.op = "insert"; this.obj = obj; return this; }
  update(obj) { this.op = "update"; this.obj = obj; return this; }
  where() { const w = [...this.w]; if (this.uid) w.push(this.t === "profiles" ? `id = '${this.uid}'` : `user_id = '${this.uid}'`); return w.length ? " where " + w.join(" and ") : ""; }
  run() {
    try {
      if (this.op === "insert") { const k = Object.keys(this.obj); sql(`insert into ${this.t} (${k.join(",")}) values (${k.map(x => lit(this.obj[x])).join(",")})`); return { data: null, error: null }; }
      if (this.op === "update") { sql(`update ${this.t} set ${Object.entries(this.obj).map(([k, v]) => `${k} = ${lit(v)}`).join(",")}${this.where()}`); return { data: null, error: null }; }
      if (this.head) return { count: Number(sql(`select count(*) from ${this.t}${this.where()}`)), data: null, error: null };
      const q = `select coalesce(json_agg(x), '[]') from (select ${this.cols} from ${this.t}${this.where()}${this.ord ? " order by " + this.ord : ""}${this.lim ? " limit " + this.lim : ""}) x`;
      const rows = JSON.parse(sql(q));
      return { data: this.single ? (rows[0] ?? null) : rows, error: null };
    } catch (e) { return { data: null, error: { message: String(e.stderr || e.message) } }; }
  }
  then(res, rej) { try { res(this.run()); } catch (e) { rej(e); } }
}
export function createClient(_url, key, opts = {}) {
  const auth = opts.global?.headers?.Authorization || "";
  const uid = auth.replace("Bearer ", "") || null;
  const asUser = key === "anon";
  return {
    auth: { getUser: async () => ({ data: { user: uid ? { id: uid } : null } }), admin: { deleteUser: async () => ({}) } },
    from: t => new Q(t, asUser ? uid : null),
    storage: { from: () => ({ list: async () => ({ data: [] }), remove: async () => ({}) }) },
    rpc: async (fn, args) => {
      try {
        const a = Object.entries(args).map(([k, v]) => `${k} => ${lit(v)}${k === "p_entry_day" ? "::date" : ""}`).join(", ");
        const out = sql(`select to_jsonb(${fn}(${a}))`);
        return { data: out === "" ? null : JSON.parse(out), error: null };
      } catch (e) { return { data: null, error: { message: String(e.stderr || e.message) } }; }
    },
  };
}
