import { randomUUID } from "node:crypto";
import { getDb } from "./db";
import { crossSellTargets, getBusiness, mustBusiness } from "./businesses";
import { buildDraft, stepsFor, type Stage } from "./sequences";
import type { Channel } from "./businesses";

export type LeadStatus = "new" | "appointed" | "negotiating" | "won" | "lost";
export type OutboxStatus = "draft" | "approved" | "sent" | "skipped";

export interface Lead {
  id: string;
  businessId: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  lineId: string;
  source: string;
  status: LeadStatus;
  stage: Stage | "done";
  stageEnteredAt: string;
  notes: string;
  lostReason: string;
  unsubscribed: boolean;
  meta: Record<string, string | number>;
  createdAt: string;
}

export interface OutboxItem {
  id: string;
  leadId: string;
  stepKey: string;
  stage: Stage;
  channel: Channel;
  offerBusinessId: string | null;
  subject: string;
  body: string;
  status: OutboxStatus;
  dueAt: string;
  createdAt: string;
  sentAt: string | null;
}

export interface Activity {
  id: string;
  leadId: string;
  text: string;
  createdAt: string;
}

let ready = false;
function db() {
  const d = getDb();
  if (!ready) {
    d.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY, business_id TEXT NOT NULL, company TEXT NOT NULL,
        contact_name TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '', line_id TEXT NOT NULL DEFAULT '',
        source TEXT NOT NULL DEFAULT '', status TEXT NOT NULL, stage TEXT NOT NULL,
        stage_entered_at TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '',
        lost_reason TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS outbox (
        id TEXT PRIMARY KEY, lead_id TEXT NOT NULL, step_key TEXT NOT NULL, stage TEXT NOT NULL,
        channel TEXT NOT NULL, offer_business_id TEXT, subject TEXT NOT NULL, body TEXT NOT NULL,
        status TEXT NOT NULL, due_at TEXT NOT NULL, created_at TEXT NOT NULL, sent_at TEXT,
        UNIQUE(lead_id, step_key)
      );
      CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY, business_id TEXT NOT NULL, replaces TEXT NOT NULL DEFAULT '',
        name TEXT NOT NULL, role TEXT NOT NULL DEFAULT '', tagline TEXT NOT NULL DEFAULT '',
        rarity TEXT NOT NULL DEFAULT 'SR', move TEXT NOT NULL DEFAULT '', stage TEXT NOT NULL DEFAULT '',
        task TEXT NOT NULL DEFAULT '', skills TEXT NOT NULL DEFAULT '[]',
        image BLOB, image_mime TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL, created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY, lead_id TEXT NOT NULL, text TEXT NOT NULL, created_at TEXT NOT NULL
      );
    `);
    try { d.exec("ALTER TABLE leads ADD COLUMN meta TEXT NOT NULL DEFAULT '{}'"); } catch {}
    try { d.exec("ALTER TABLE leads ADD COLUMN unsubscribed INTEGER NOT NULL DEFAULT 0"); } catch {}
    ready = true;
  }
  return d;
}

type Row = Record<string, string | number | null>;
const s = (v: unknown) => (v == null ? "" : String(v));

function parseMeta(v: unknown): Record<string, string | number> {
  try {
    return JSON.parse(s(v) || "{}");
  } catch {
    return {};
  }
}

const toLead = (r: Row): Lead => ({
  id: s(r.id),
  businessId: s(r.business_id),
  company: s(r.company),
  contactName: s(r.contact_name),
  email: s(r.email),
  phone: s(r.phone),
  lineId: s(r.line_id),
  source: s(r.source),
  status: s(r.status) as LeadStatus,
  stage: s(r.stage) as Lead["stage"],
  stageEnteredAt: s(r.stage_entered_at),
  notes: s(r.notes),
  lostReason: s(r.lost_reason),
  unsubscribed: Number(r.unsubscribed) === 1,
  meta: parseMeta(r.meta),
  createdAt: s(r.created_at),
});

const toItem = (r: Row): OutboxItem => ({
  id: s(r.id),
  leadId: s(r.lead_id),
  stepKey: s(r.step_key),
  stage: s(r.stage) as Stage,
  channel: s(r.channel) as Channel,
  offerBusinessId: r.offer_business_id ? s(r.offer_business_id) : null,
  subject: s(r.subject),
  body: s(r.body),
  status: s(r.status) as OutboxStatus,
  dueAt: s(r.due_at),
  createdAt: s(r.created_at),
  sentAt: r.sent_at ? s(r.sent_at) : null,
});

/* ------------------------------- leads ------------------------------- */

export function listLeads(opts: { businessId?: string } = {}): Lead[] {
  const rows = opts.businessId
    ? db().prepare("SELECT * FROM leads WHERE business_id = ? ORDER BY created_at DESC").all(opts.businessId)
    : db().prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
  return (rows as Row[]).map(toLead);
}

export function getLead(id: string): Lead | null {
  const r = db().prepare("SELECT * FROM leads WHERE id = ?").get(id) as Row | undefined;
  return r ? toLead(r) : null;
}

export function logActivity(leadId: string, text: string, at = new Date().toISOString()) {
  db().prepare("INSERT INTO activities (id, lead_id, text, created_at) VALUES (?,?,?,?)").run(randomUUID(), leadId, text, at);
}

export function listActivities(leadId: string): Activity[] {
  return (db().prepare("SELECT * FROM activities WHERE lead_id = ? ORDER BY created_at DESC").all(leadId) as Row[]).map(
    (r) => ({ id: s(r.id), leadId: s(r.lead_id), text: s(r.text), createdAt: s(r.created_at) }),
  );
}

export function createLead(input: {
  businessId: string;
  company: string;
  contactName?: string;
  email?: string;
  phone?: string;
  lineId?: string;
  source?: string;
  notes?: string;
  meta?: Record<string, string | number>;
  at?: string;
}): Lead {
  mustBusiness(input.businessId);
  const id = randomUUID();
  const now = input.at ?? new Date().toISOString();
  db()
    .prepare(
      `INSERT INTO leads (id, business_id, company, contact_name, email, phone, line_id, source, status, stage, stage_entered_at, notes, meta, created_at)
       VALUES (?,?,?,?,?,?,?,?, 'new', 'A', ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.businessId,
      input.company.trim(),
      input.contactName?.trim() ?? "",
      input.email?.trim() ?? "",
      input.phone?.trim() ?? "",
      input.lineId?.trim() ?? "",
      input.source?.trim() ?? "",
      now,
      input.notes?.trim() ?? "",
      JSON.stringify(input.meta ?? {}),
      now,
    );
  logActivity(id, "リードを登録（Stage A 開始）", now);
  return getLead(id)!;
}

function skipPending(leadId: string, stage: Stage) {
  db().prepare("UPDATE outbox SET status='skipped' WHERE lead_id=? AND stage=? AND status IN ('draft','approved')").run(leadId, stage);
}

/** ステータス遷移。ステージ移行と未送信ドラフトの取り下げを一括で行う。 */
export function setStatus(leadId: string, status: LeadStatus, opts: { lostReason?: string } = {}) {
  const lead = getLead(leadId);
  if (!lead) return;
  const now = new Date().toISOString();
  const d = db();

  if (status === "appointed" || status === "negotiating") {
    if (lead.stage === "A") skipPending(leadId, "A");
    const enter = lead.stage === "B" ? lead.stageEnteredAt : now;
    d.prepare("UPDATE leads SET status=?, stage='B', stage_entered_at=? WHERE id=?").run(status, enter, leadId);
    logActivity(leadId, status === "appointed" ? "アポ獲得 → Stage B（定期フォロー）へ" : "商談中に更新");
  } else if (status === "won") {
    for (const st of ["A", "B", "C"] as Stage[]) skipPending(leadId, st);
    d.prepare("UPDATE leads SET status='won', stage='done', stage_entered_at=? WHERE id=?").run(now, leadId);
    logActivity(leadId, "成約。自動配信を停止");
  } else if (status === "lost") {
    for (const st of ["A", "B"] as Stage[]) skipPending(leadId, st);
    d.prepare("UPDATE leads SET status='lost', stage='C', stage_entered_at=?, lost_reason=? WHERE id=?").run(
      now,
      opts.lostReason ?? "",
      leadId,
    );
    logActivity(leadId, `失注${opts.lostReason ? `（${opts.lostReason}）` : ""} → Stage C（別商材アプローチ）へ`);
  } else {
    d.prepare("UPDATE leads SET status=? WHERE id=?").run(status, leadId);
  }
}

export function setUnsubscribed(leadId: string, v: boolean) {
  db().prepare("UPDATE leads SET unsubscribed=? WHERE id=?").run(v ? 1 : 0, leadId);
  if (v) {
    for (const st of ["A", "B", "C"] as Stage[]) skipPending(leadId, st);
    logActivity(leadId, "配信停止を記録（以後の配信なし）");
  } else logActivity(leadId, "配信停止を解除");
}

export function countSentToday(channel: Channel): number {
  const day = new Date().toISOString().slice(0, 10);
  return Number((db().prepare("SELECT COUNT(*) AS c FROM outbox WHERE channel=? AND status='sent' AND substr(sent_at,1,10)=?").get(channel, day) as { c: number }).c);
}

export function updateNotes(leadId: string, notes: string) {
  db().prepare("UPDATE leads SET notes=? WHERE id=?").run(notes, leadId);
}

/* ------------------------------- outbox ------------------------------- */

export function listOutbox(opts: { status?: OutboxStatus; leadId?: string } = {}): OutboxItem[] {
  const where: string[] = [];
  const args: string[] = [];
  if (opts.status) (where.push("status = ?"), args.push(opts.status));
  if (opts.leadId) (where.push("lead_id = ?"), args.push(opts.leadId));
  const sql = `SELECT * FROM outbox ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY due_at DESC`;
  return (db().prepare(sql).all(...args) as Row[]).map(toItem);
}

export function getOutboxItem(id: string): OutboxItem | null {
  const r = db().prepare("SELECT * FROM outbox WHERE id=?").get(id) as Row | undefined;
  return r ? toItem(r) : null;
}

export function setOutboxStatus(id: string, status: OutboxStatus) {
  const item = getOutboxItem(id);
  if (!item) return;
  const sentAt = status === "sent" ? new Date().toISOString() : null;
  db().prepare("UPDATE outbox SET status=?, sent_at=COALESCE(?, sent_at) WHERE id=?").run(status, sentAt, id);
  if (status === "sent") {
    logActivity(item.leadId, `${item.stepKey} を送信／実施済みに記録（${item.channel}）`);
  }
}

export function updateOutboxText(id: string, subject: string, body: string) {
  db().prepare("UPDATE outbox SET subject=?, body=? WHERE id=?").run(subject, body, id);
}

/* --------------------------- automation tick --------------------------- */

const DAY = 86_400_000;

/**
 * 期日が来たステップのドラフトを生成する（リードごとに1回1件まで）。
 * asOf を未来にずらすと、時間経過のシミュレーションができる。
 */
export function runTick(asOf: Date = new Date()): { created: number; leads: number } {
  const d = db();
  const active = (d.prepare("SELECT * FROM leads WHERE stage IN ('A','B','C') AND unsubscribed=0").all() as Row[]).map(toLead);
  let created = 0;
  for (const lead of active) {
    const biz = getBusiness(lead.businessId);
    if (!biz || lead.stage === "done") continue;
    const steps = stepsFor(lead.stage);
    const existing = new Set(
      (d.prepare("SELECT step_key FROM outbox WHERE lead_id=?").all(lead.id) as Row[]).map((r) => s(r.step_key)),
    );
    const base = new Date(lead.stageEnteredAt).getTime();
    const next = steps.find((st) => !existing.has(st.key) && base + st.dayOffset * DAY <= asOf.getTime());
    if (!next) continue;

    const channel: Channel = next.channel === "call" ? "call" : biz.primaryChannel;
    // Stage C は他事業のフック商材をローテーション（C1,C2,C3 で別商材）
    let offer = undefined;
    if (next.stage === "C") {
      const targets = crossSellTargets(biz.id);
      const idx = steps.findIndex((x) => x.key === next.key);
      offer = targets[(idx + hash(lead.id)) % targets.length];
    }
    const draft = buildDraft({ business: biz, offer, company: lead.company, contactName: lead.contactName, step: next, channel });
    const dueAt = new Date(base + next.dayOffset * DAY).toISOString();
    d.prepare(
      `INSERT INTO outbox (id, lead_id, step_key, stage, channel, offer_business_id, subject, body, status, due_at, created_at)
       VALUES (?,?,?,?,?,?,?,?, 'draft', ?, ?)`,
    ).run(randomUUID(), lead.id, next.key, next.stage, channel, offer?.id ?? null, draft.subject, draft.body, dueAt, asOf.toISOString());
    logActivity(lead.id, `${next.key}「${next.label}」のドラフトを生成`, asOf.toISOString());
    created++;
  }
  return { created, leads: active.length };
}

function hash(str: string): number {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/* ------------------------------- 集計 ------------------------------- */

export interface BusinessStat {
  businessId: string;
  total: number;
  byStage: Record<"A" | "B" | "C" | "won", number>;
  pendingDrafts: number;
}

export function getBusinessStats(): BusinessStat[] {
  const leads = listLeads();
  const outbox = listOutbox({ status: "draft" });
  const leadBiz = new Map(leads.map((l) => [l.id, l.businessId]));
  const ids = new Set(leads.map((l) => l.businessId));
  return [...ids].map((businessId) => {
    const mine = leads.filter((l) => l.businessId === businessId);
    return {
      businessId,
      total: mine.length,
      byStage: {
        A: mine.filter((l) => l.stage === "A").length,
        B: mine.filter((l) => l.stage === "B").length,
        C: mine.filter((l) => l.stage === "C").length,
        won: mine.filter((l) => l.status === "won").length,
      },
      pendingDrafts: outbox.filter((o) => leadBiz.get(o.leadId) === businessId).length,
    };
  });
}

/* ------------------------------- デモ ------------------------------- */

export function seedDemo() {
  const now = Date.now();
  const ago = (days: number) => new Date(now - days * DAY).toISOString();
  const demo: Parameters<typeof createLead>[0][] = [
    { businessId: "oa", company: "株式会社サンプル商事", contactName: "山田", email: "yamada@example.com", source: "展示会", at: ago(6) },
    { businessId: "oa", company: "鈴木工業", contactName: "鈴木", phone: "03-0000-0000", source: "テレアポ", at: ago(1) },
    { businessId: "agency", company: "ABC販売", contactName: "佐藤", email: "sato@example.com", source: "紹介", at: ago(3) },
    { businessId: "web", company: "田中デザイン", contactName: "田中", email: "tanaka@example.com", source: "問い合わせ", at: ago(10) },
    { businessId: "food", company: "ヤマト運輸 営業所", contactName: "幹事 高橋", lineId: "takahashi_line", source: "近隣", at: ago(4) },
    { businessId: "sports", company: "株式会社ヘルスケア工房", contactName: "人事 中村", email: "nakamura@example.com", source: "健康経営セミナー", at: ago(2) },
  ];
  for (const x of demo) createLead(x);
  runTick();
}

/* --------------------------- ゲームHUD（世界ごとの成長） --------------------------- */

export interface WorldStats {
  leads: number;
  drafts: number;
  sent: number;
  won: number;
  xp: number;
  level: number;
  levelProgress: number; // 0-100
  rank: "C" | "B" | "A" | "S";
  streak: number; // 連続活動日数（今日を含む）
}

const RANKS: WorldStats["rank"][] = ["C", "B", "A", "S"];

/** 経験値: リード登録3 / 承認待ちドラフト生成1 / 送信・実施5 / 成約50。事業ごとに計算する。 */
export function getWorldStats(businessId?: string): WorldStats {
  const leads = listLeads(businessId ? { businessId } : {});
  const ids = new Set(leads.map((l) => l.id));
  const items = listOutbox().filter((o) => ids.has(o.leadId));
  const sentItems = items.filter((o) => o.status === "sent");
  const won = leads.filter((l) => l.status === "won").length;
  const drafts = items.filter((o) => o.status === "draft").length;
  const xp = leads.length * 3 + items.length + sentItems.length * 5 + won * 50;
  const level = Math.floor(xp / 40) + 1;
  const days = new Set<string>();
  for (const o of sentItems) if (o.sentAt) days.add(o.sentAt.slice(0, 10));
  let streak = 0;
  for (let i = 0; ; i++) {
    const day = new Date(Date.now() - i * DAY).toISOString().slice(0, 10);
    if (days.has(day)) streak++;
    else if (i === 0) continue;
    else break;
  }
  return {
    leads: leads.length,
    drafts,
    sent: sentItems.length,
    won,
    xp,
    level,
    levelProgress: Math.round(((xp % 40) / 40) * 100),
    rank: RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 3))],
    streak,
  };
}

/* ------------------------ とことん871 候補の取り込み ------------------------ */

interface TokotonLead {
  company: string;
  area: string;
  city: string;
  type: string;
  brand: string;
  evidence: string;
  source_url: string;
  phone: string;
  contact: string;
  score: number;
  rank: string;
  status: string;
  action: string;
}

/**
 * 既存「とことん871 AI営業オフィス」の候補を精肉ワールドに取り込む（同名は重複登録しない）。
 * 取り込んだ候補は「公式確認前」。実在・連絡先は人が確認してから営業に使う。
 */
export function importTokotonLeads(data: { leads: TokotonLead[] }): number {
  const exists = new Set(listLeads({ businessId: "meat" }).map((l) => l.company));
  let n = 0;
  for (const x of data.leads) {
    if (exists.has(x.company)) continue;
    const lead = createLead({
      businessId: "meat",
      company: x.company,
      phone: x.phone,
      source: "とことん871 AI営業オフィス",
      notes: `提案角度: ${x.action}`,
      meta: {
        area: x.area,
        city: x.city,
        type: x.type,
        brand: x.brand,
        evidence: x.evidence,
        sourceUrl: x.source_url,
        contactRoute: x.contact,
        score: x.score,
        rank: x.rank,
        verified: "no",
      },
    });
    if (x.status === "商談化") setStatus(lead.id, "appointed");
    n++;
  }
  return n;
}

/** そのワールド（事業）の直近の活動（お知らせ欄用） */
export function listBusinessActivities(businessId: string, limit = 7): (Activity & { company: string })[] {
  const rows = db()
    .prepare(
      `SELECT a.*, l.company AS company FROM activities a JOIN leads l ON l.id = a.lead_id
       WHERE l.business_id = ? ORDER BY a.created_at DESC LIMIT ?`,
    )
    .all(businessId, limit) as Row[];
  return rows.map((r) => ({ id: s(r.id), leadId: s(r.lead_id), text: s(r.text), createdAt: s(r.created_at), company: s(r.company) }));
}

/* ---------------------- キャラクター登録（ワールドごと） ---------------------- */

export interface CharacterRecord {
  id: string;
  businessId: string;
  replaces: string; // 置き換える既存6役のID。空なら追加メンバー
  name: string;
  role: string;
  tagline: string;
  rarity: "SSR" | "SR";
  move: string;
  stage: string;
  task: string;
  skills: { name: string; level: number }[];
  hasImage: boolean;
  updatedAt: string;
}

const toCharacter = (r: Row): CharacterRecord => {
  let skills: CharacterRecord["skills"] = [];
  try {
    skills = JSON.parse(s(r.skills));
  } catch {}
  return {
    id: s(r.id),
    businessId: s(r.business_id),
    replaces: s(r.replaces),
    name: s(r.name),
    role: s(r.role),
    tagline: s(r.tagline),
    rarity: s(r.rarity) === "SSR" ? "SSR" : "SR",
    move: s(r.move),
    stage: s(r.stage),
    task: s(r.task),
    skills,
    hasImage: Number(r.has_image) === 1,
    updatedAt: s(r.updated_at),
  };
};

const CHAR_COLS = "id, business_id, replaces, name, role, tagline, rarity, move, stage, task, skills, updated_at, (image IS NOT NULL) AS has_image";

export function listCharacters(businessId: string): CharacterRecord[] {
  return (db().prepare(`SELECT ${CHAR_COLS} FROM characters WHERE business_id=? ORDER BY created_at ASC`).all(businessId) as Row[]).map(toCharacter);
}

export function getCharacter(id: string): CharacterRecord | null {
  const r = db().prepare(`SELECT ${CHAR_COLS} FROM characters WHERE id=?`).get(id) as Row | undefined;
  return r ? toCharacter(r) : null;
}

export function getCharacterImage(id: string): { data: Uint8Array; mime: string } | null {
  const r = db().prepare("SELECT image, image_mime FROM characters WHERE id=? AND image IS NOT NULL").get(id) as { image: Uint8Array; image_mime: string } | undefined;
  return r ? { data: r.image, mime: r.image_mime } : null;
}

export interface CharacterInput {
  name: string;
  role: string;
  replaces: string;
  tagline: string;
  rarity: "SSR" | "SR";
  move: string;
  stage: string;
  task: string;
  skills: { name: string; level: number }[];
  image?: { data: Uint8Array; mime: string };
}

export function saveCharacter(businessId: string, input: CharacterInput, id?: string): string {
  const now = new Date().toISOString();
  const skills = JSON.stringify(input.skills);
  if (id && getCharacter(id)) {
    db()
      .prepare("UPDATE characters SET replaces=?, name=?, role=?, tagline=?, rarity=?, move=?, stage=?, task=?, skills=?, updated_at=? WHERE id=?")
      .run(input.replaces, input.name, input.role, input.tagline, input.rarity, input.move, input.stage, input.task, skills, now, id);
    if (input.image) db().prepare("UPDATE characters SET image=?, image_mime=? WHERE id=?").run(input.image.data, input.image.mime, id);
    return id;
  }
  const nid = randomUUID();
  db()
    .prepare(
      `INSERT INTO characters (id, business_id, replaces, name, role, tagline, rarity, move, stage, task, skills, image, image_mime, updated_at, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(nid, businessId, input.replaces, input.name, input.role, input.tagline, input.rarity, input.move, input.stage, input.task, skills, input.image?.data ?? null, input.image?.mime ?? "", now, now);
  return nid;
}

export function removeCharacter(id: string) {
  db().prepare("DELETE FROM characters WHERE id=?").run(id);
}

/* ---------------------- ワールドのサムネイル画像（差し替え） ---------------------- */

/** 画像を差し替えたワールドの更新時刻（キャッシュ回避用のバージョン）。未設定のワールドは含まれない。 */
export function listWorldArtVersions(): Record<string, string> {
  db().exec("CREATE TABLE IF NOT EXISTS world_art (business_id TEXT PRIMARY KEY, image BLOB NOT NULL, image_mime TEXT NOT NULL, updated_at TEXT NOT NULL)");
  const rows = db().prepare("SELECT business_id, updated_at FROM world_art").all() as Row[];
  return Object.fromEntries(rows.map((r) => [s(r.business_id), s(r.updated_at)]));
}

export function getWorldArtImage(businessId: string): { data: Uint8Array; mime: string } | null {
  const r = db().prepare("SELECT image, image_mime FROM world_art WHERE business_id=?").get(businessId) as { image: Uint8Array; image_mime: string } | undefined;
  return r ? { data: r.image, mime: r.image_mime } : null;
}

export function saveWorldArt(businessId: string, data: Uint8Array, mime: string) {
  listWorldArtVersions(); // テーブルを確実に作る
  db()
    .prepare("INSERT INTO world_art (business_id, image, image_mime, updated_at) VALUES (?,?,?,?) ON CONFLICT(business_id) DO UPDATE SET image=excluded.image, image_mime=excluded.image_mime, updated_at=excluded.updated_at")
    .run(businessId, data, mime, new Date().toISOString());
}

export function clearWorldArt(businessId: string) {
  listWorldArtVersions();
  db().prepare("DELETE FROM world_art WHERE business_id=?").run(businessId);
}

/* -------------------- ワールド名の上書き（設定から変更） -------------------- */

export interface WorldOverride {
  title: string; // 和名（ポスター・ヘッダーの見出し）
  name: string; // 事業名
}

function ensureOverrides() {
  db().exec("CREATE TABLE IF NOT EXISTS world_overrides (business_id TEXT PRIMARY KEY, title TEXT NOT NULL DEFAULT '', name TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL)");
}

export function listWorldOverrides(): Record<string, WorldOverride> {
  ensureOverrides();
  const rows = db().prepare("SELECT business_id, title, name FROM world_overrides").all() as Row[];
  return Object.fromEntries(rows.map((r) => [s(r.business_id), { title: s(r.title), name: s(r.name) }]));
}

export function saveWorldOverride(businessId: string, title: string, name: string) {
  ensureOverrides();
  db()
    .prepare("INSERT INTO world_overrides (business_id, title, name, updated_at) VALUES (?,?,?,?) ON CONFLICT(business_id) DO UPDATE SET title=excluded.title, name=excluded.name, updated_at=excluded.updated_at")
    .run(businessId, title, name, new Date().toISOString());
}

export function clearWorldOverride(businessId: string) {
  ensureOverrides();
  db().prepare("DELETE FROM world_overrides WHERE business_id=?").run(businessId);
}
