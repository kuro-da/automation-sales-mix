import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { randomUUID } from "node:crypto";
import type {
  ChatMessage,
  Difficulty,
  Evaluation,
  RoleplaySessionRecord,
  ScriptFeedback,
  ScriptReviewRecord,
} from "./types";

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;

  const configured = process.env.DATABASE_PATH?.trim();
  const dbPath =
    configured && isAbsolute(configured)
      ? configured
      : join(process.cwd(), "data", "portal.db");
  mkdirSync(dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS roleplay_sessions (
      id             TEXT PRIMARY KEY,
      persona_id     TEXT NOT NULL,
      persona_name   TEXT NOT NULL,
      scenario_id    TEXT NOT NULL,
      scenario_title TEXT NOT NULL,
      difficulty     TEXT NOT NULL,
      transcript     TEXT NOT NULL,
      evaluation     TEXT,
      overall_score  INTEGER,
      created_at     TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS script_reviews (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      script_text   TEXT NOT NULL,
      feedback      TEXT NOT NULL,
      overall_score INTEGER NOT NULL,
      created_at    TEXT NOT NULL
    );
  `);

  _db = db;
  return db;
}

/* ----------------------------- ロープレ記録 ----------------------------- */

interface RoleplayRow {
  id: string;
  persona_id: string;
  persona_name: string;
  scenario_id: string;
  scenario_title: string;
  difficulty: string;
  transcript: string;
  evaluation: string | null;
  overall_score: number | null;
  created_at: string;
}

function rowToRoleplay(r: RoleplayRow): RoleplaySessionRecord {
  return {
    id: r.id,
    personaId: r.persona_id,
    personaName: r.persona_name,
    scenarioId: r.scenario_id,
    scenarioTitle: r.scenario_title,
    difficulty: r.difficulty as Difficulty,
    transcript: JSON.parse(r.transcript) as ChatMessage[],
    evaluation: r.evaluation ? (JSON.parse(r.evaluation) as Evaluation) : null,
    overallScore: r.overall_score,
    createdAt: r.created_at,
  };
}

export function createRoleplaySession(input: {
  personaId: string;
  personaName: string;
  scenarioId: string;
  scenarioTitle: string;
  difficulty: Difficulty;
  transcript: ChatMessage[];
  evaluation: Evaluation | null;
}): RoleplaySessionRecord {
  const db = getDb();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO roleplay_sessions
       (id, persona_id, persona_name, scenario_id, scenario_title, difficulty, transcript, evaluation, overall_score, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.personaId,
    input.personaName,
    input.scenarioId,
    input.scenarioTitle,
    input.difficulty,
    JSON.stringify(input.transcript),
    input.evaluation ? JSON.stringify(input.evaluation) : null,
    input.evaluation ? Math.round(input.evaluation.overallScore) : null,
    createdAt,
  );
  return getRoleplaySession(id)!;
}

export function getRoleplaySession(id: string): RoleplaySessionRecord | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM roleplay_sessions WHERE id = ?")
    .get(id) as RoleplayRow | undefined;
  return row ? rowToRoleplay(row) : null;
}

export function listRoleplaySessions(limit = 50): RoleplaySessionRecord[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM roleplay_sessions ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as RoleplayRow[];
  return rows.map(rowToRoleplay);
}

/* --------------------------- スクリプト添削記録 --------------------------- */

interface ScriptRow {
  id: string;
  title: string;
  script_text: string;
  feedback: string;
  overall_score: number;
  created_at: string;
}

function rowToScript(r: ScriptRow): ScriptReviewRecord {
  return {
    id: r.id,
    title: r.title,
    scriptText: r.script_text,
    feedback: JSON.parse(r.feedback) as ScriptFeedback,
    overallScore: r.overall_score,
    createdAt: r.created_at,
  };
}

export function createScriptReview(input: {
  title: string;
  scriptText: string;
  feedback: ScriptFeedback;
}): ScriptReviewRecord {
  const db = getDb();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO script_reviews (id, title, script_text, feedback, overall_score, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.title,
    input.scriptText,
    JSON.stringify(input.feedback),
    Math.round(input.feedback.overallScore),
    createdAt,
  );
  return getScriptReview(id)!;
}

export function getScriptReview(id: string): ScriptReviewRecord | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM script_reviews WHERE id = ?")
    .get(id) as ScriptRow | undefined;
  return row ? rowToScript(row) : null;
}

export function listScriptReviews(limit = 50): ScriptReviewRecord[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM script_reviews ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as ScriptRow[];
  return rows.map(rowToScript);
}

/* -------------------------------- 集計 -------------------------------- */

export interface CoachStats {
  totalRoleplays: number;
  evaluatedRoleplays: number;
  totalScriptReviews: number;
  avgRoleplayScore: number | null;
  recentAvgRoleplayScore: number | null; // 直近5件
  scoreTrend: { createdAt: string; score: number; scenarioTitle: string }[];
  axisAverages: { key: string; label: string; avg: number }[];
}

export function getStats(): CoachStats {
  const sessions = listRoleplaySessions(200).filter((s) => s.evaluation);
  const scriptCount = (
    getDb().prepare("SELECT COUNT(*) AS c FROM script_reviews").get() as {
      c: number;
    }
  ).c;
  const allRoleplayCount = (
    getDb().prepare("SELECT COUNT(*) AS c FROM roleplay_sessions").get() as {
      c: number;
    }
  ).c;

  const scores = sessions
    .map((s) => s.overallScore)
    .filter((n): n is number => typeof n === "number");

  const avg =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

  const recent = scores.slice(0, 5);
  const recentAvg =
    recent.length > 0
      ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length)
      : null;

  const trend = sessions
    .slice(0, 12)
    .reverse()
    .map((s) => ({
      createdAt: s.createdAt,
      score: s.overallScore ?? 0,
      scenarioTitle: s.scenarioTitle,
    }));

  const axisBuckets = new Map<string, { label: string; sum: number; n: number }>();
  for (const s of sessions) {
    for (const a of s.evaluation?.axes ?? []) {
      const b = axisBuckets.get(a.key) ?? { label: a.label, sum: 0, n: 0 };
      b.sum += a.score;
      b.n += 1;
      b.label = a.label;
      axisBuckets.set(a.key, b);
    }
  }
  const axisAverages = [...axisBuckets.entries()].map(([key, b]) => ({
    key,
    label: b.label,
    avg: Math.round((b.sum / b.n) * 10) / 10,
  }));

  return {
    totalRoleplays: allRoleplayCount,
    evaluatedRoleplays: sessions.length,
    totalScriptReviews: scriptCount,
    avgRoleplayScore: avg,
    recentAvgRoleplayScore: recentAvg,
    scoreTrend: trend,
    axisAverages,
  };
}
