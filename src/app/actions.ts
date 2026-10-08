"use server";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getClient, hasApiKey, MODEL } from "@/lib/anthropic";
import { getBusiness } from "@/lib/businesses";
import { STAFF } from "@/lib/staff";
import { CAST } from "@/lib/cast";
import {
  createLead,
  getLead,
  getOutboxItem,
  runTick,
  seedDemo,
  setOutboxStatus,
  setStatus,
  updateNotes,
  logActivity,
  setUnsubscribed,
  countSentToday,
  updateOutboxText,
  listLeads,
  importTokotonLeads,
  saveCharacter,
  listCharacters,
  saveWorldArt,
  saveWorldOverride,
  clearWorldOverride,
  clearWorldArt,
  removeCharacter,
  type LeadStatus,
  type OutboxStatus,
} from "@/lib/crm";

import tokoton from "@/data/tokoton-leads.json";
import { getMailConfig, sendMail, verifySmtp } from "@/lib/mailer";

const str = (f: FormData, k: string) => String(f.get(k) ?? "");

export async function addLeadAction(form: FormData) {
  const company = str(form, "company").trim();
  if (!company) return;
  const lead = createLead({
    businessId: str(form, "businessId"),
    company,
    contactName: str(form, "contactName"),
    email: str(form, "email"),
    phone: str(form, "phone"),
    lineId: str(form, "lineId"),
    source: str(form, "source"),
    notes: str(form, "notes"),
  });
  runTick();
  revalidatePath("/", "layout");
  redirect(`/leads/${lead.id}`);
}

export async function setStatusAction(form: FormData) {
  const id = str(form, "leadId");
  setStatus(id, str(form, "status") as LeadStatus, { lostReason: str(form, "lostReason") });
  revalidatePath("/", "layout");
}

export async function saveNotesAction(form: FormData) {
  updateNotes(str(form, "leadId"), str(form, "notes"));
  revalidatePath(`/leads/${str(form, "leadId")}`);
}

export async function outboxStatusAction(form: FormData) {
  setOutboxStatus(str(form, "id"), str(form, "status") as OutboxStatus);
  revalidatePath("/", "layout");
}

export async function saveOutboxAction(form: FormData) {
  updateOutboxText(str(form, "id"), str(form, "subject"), str(form, "body"));
  revalidatePath("/", "layout");
}

/** 日数を進めて自動配信エンジンを実行（0なら現在時刻）。1回で各リード最大1件を生成。 */
export async function runTickAction(form: FormData) {
  const days = Math.max(0, Math.min(120, Number(str(form, "days")) || 0));
  const times = days > 0 ? 6 : 1; // 滞留ステップを順に拾う
  for (let i = 0; i < times; i++) runTick(new Date(Date.now() + days * 86_400_000));
  revalidatePath("/", "layout");
}

export async function seedDemoAction() {
  if (listLeads().length === 0) seedDemo();
  importTokotonLeads(tokoton);
  revalidatePath("/", "layout");
}

/** 既存ドラフトをAIで自然な文面に清書する。キー未設定・失敗時は何も変えない。 */
export async function aiRewriteAction(form: FormData) {
  const id = str(form, "id");
  const item = getOutboxItem(id);
  if (!item || !hasApiKey()) return;
  const lead = getLead(item.leadId);
  const biz = lead && getBusiness(lead.businessId);
  if (!lead || !biz) return;
  try {
    const res = await getClient().messages.create({
      model: MODEL,
      max_tokens: 1200,
      temperature: 0.5,
      system:
        "あなたは日本のBtoB／BtoC営業文面の編集者です。与えられたドラフトを、相手の立場に立った自然で簡潔な日本語に清書します。事実や条件を新たに作らないこと。売り込み感を抑え、返信しやすい一言のCTAで締めます。出力は「件名: ...」の1行目に続けて本文のみ。架電タスクの場合は箇条書きのトークメモとして整形。",
      messages: [
        {
          role: "user",
          content: `事業: ${biz.name}\nチャネル: ${item.channel}\n相手: ${lead.company} ${lead.contactName}\n備考: ${lead.notes || "なし"}\n\n件名: ${item.subject}\n${item.body}`,
        },
      ],
    });
    const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    const m = text.match(/^件名[:：]\s*(.+)\n+([\s\S]*)$/);
    if (m) updateOutboxText(id, m[1].trim(), m[2].trim());
    else if (text) updateOutboxText(id, item.subject, text);
  } catch {
    /* 失敗時は元の文面を維持 */
  }
  revalidatePath("/", "layout");
}

function back(form: FormData, msg: string): never {
  const path = str(form, "back") || "/outbox";
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}msg=${encodeURIComponent(msg)}`);
}

/** 承認済みのメールを自社SMTPから送る。承認・宛先・配信停止・1日の上限を必ず確認する。 */
export async function sendEmailAction(form: FormData) {
  const item = getOutboxItem(str(form, "id"));
  if (!item || item.channel !== "email") back(form, "メールのアイテムが見つかりません");
  const lead = getLead(item!.leadId);
  if (!lead) back(form, "リードが見つかりません");
  if (item!.status !== "approved") back(form, "先に「承認」してから送信してください");
  if (lead!.unsubscribed) back(form, "このリードは配信停止です");
  if (!lead!.email) back(form, "リードのメールアドレスが未登録です");
  const cfg = getMailConfig();
  if (cfg.mode !== "dry" && countSentToday("email") >= cfg.dailyLimit) back(form, `本日の送信上限（${cfg.dailyLimit}通）に達しました`);

  const r = await sendMail({ to: lead!.email, subject: item!.subject, body: item!.body });
  if (r.ok && r.sent) setOutboxStatus(item!.id, "sent");
  else logActivity(lead!.id, `${item!.stepKey}: ${r.message}`);
  revalidatePath("/", "layout");
  back(form, r.message);
}

export async function unsubscribeAction(form: FormData) {
  setUnsubscribed(str(form, "leadId"), str(form, "value") === "1");
  revalidatePath("/", "layout");
}

export async function verifySmtpAction() {
  const r = await verifySmtp();
  redirect(`/integrations?msg=${encodeURIComponent(r.message)}&ok=${r.ok ? 1 : 0}`);
}

/** 既存「とことん871 AI営業オフィス」の候補を精肉ワールドへ取り込む（同名は重複しない）。 */
export async function importTokotonAction() {
  const n = importTokotonLeads(tokoton);
  runTick();
  revalidatePath("/", "layout");
  const msg = n > 0 ? `${n}件の候補を取り込みました（公式確認前）` : "新しい候補はありません（取り込み済み）";
  redirect(`/b/meat?msg=${encodeURIComponent(msg)}`);
}

/** 「自動AP開始」: 期日が来たステップのドラフトを今すぐ生成し、そのワールドへ戻る。 */
export async function autoRunAction(form: FormData) {
  const r = runTick();
  revalidatePath("/", "layout");
  const id = str(form, "businessId");
  const msg = r.created > 0 ? `${r.created}件のドラフトを作成しました。配信キューで確認してください` : "新しく作成するドラフトはありません（期日待ち）";
  redirect(`/b/${id}?msg=${encodeURIComponent(msg)}`);
}

/* ---------------------- キャラクター登録（ワールドごと） ---------------------- */

const MAX_IMAGE = 3 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function charBack(form: FormData, msg: string): never {
  redirect(`/b/${str(form, "businessId")}/characters?msg=${encodeURIComponent(msg)}`);
}

export async function saveCharacterAction(form: FormData) {
  const businessId = str(form, "businessId");
  const name = str(form, "name").trim();
  if (!getBusiness(businessId)) charBack(form, "ワールドが見つかりません");
  if (!name) charBack(form, "名前を入力してください");

  let image: { data: Uint8Array; mime: string } | undefined;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    if (!IMAGE_TYPES.includes(file.type)) charBack(form, "画像は PNG / JPEG / WebP / GIF にしてください");
    if (file.size > MAX_IMAGE) charBack(form, "画像は3MB以下にしてください");
    image = { data: new Uint8Array(await file.arrayBuffer()), mime: file.type };
  }

  const skills = [1, 2, 3]
    .map((i) => ({ name: str(form, `skill${i}`).trim(), level: Math.max(0, Math.min(100, Number(str(form, `level${i}`)) || 80)) }))
    .filter((k) => k.name);
  const replaces = str(form, "replaces");
  saveCharacter(
    businessId,
    {
      name,
      role: str(form, "role").trim(),
      replaces: ["scout", "analyzer", "planner", "writer", "manager", "reviewer"].includes(replaces) ? replaces : "",
      tagline: str(form, "tagline").trim(),
      rarity: str(form, "rarity") === "SSR" ? "SSR" : "SR",
      move: str(form, "move").trim(),
      stage: str(form, "stage").trim(),
      task: str(form, "task").trim(),
      skills,
      image,
    },
    str(form, "id") || undefined,
  );
  revalidatePath("/", "layout");
  charBack(form, `「${name}」を登録しました`);
}

export async function deleteCharacterAction(form: FormData) {
  removeCharacter(str(form, "id"));
  revalidatePath("/", "layout");
  charBack(form, "キャラクターの登録を解除しました（既存のAI社員に戻ります）");
}

/* ---------------------- ワールドのサムネイル画像 ---------------------- */

const MAX_ART = 5 * 1024 * 1024;

export async function saveWorldArtAction(form: FormData) {
  const id = str(form, "businessId");
  const back = (msg: string): never => redirect(`/b/${id}/settings?msg=${encodeURIComponent(msg)}`);
  if (!getBusiness(id)) back("ワールドが見つかりません");
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) back("画像を選んでください");
  const f = file as File;
  if (!IMAGE_TYPES.includes(f.type)) back("画像は PNG / JPEG / WebP / GIF にしてください");
  if (f.size > MAX_ART) back("画像は5MB以下にしてください");
  saveWorldArt(id, new Uint8Array(await f.arrayBuffer()), f.type);
  revalidatePath("/", "layout");
  back("サムネイル画像を設定しました");
}

export async function clearWorldArtAction(form: FormData) {
  const id = str(form, "businessId");
  clearWorldArt(id);
  revalidatePath("/", "layout");
  redirect(`/b/${id}/settings?msg=${encodeURIComponent("標準のイラストに戻しました")}`);
}

/* ---------------------- 画像の一括取込（ChatGPTなどで作った画像） ---------------------- */

type ArtResult = { ok: true; label: string } | { ok: false; reason: string };

/** 1ファイルを取り込む。ファイル名は {ワールドID}_{役割ID} または {ワールドID}_thumb。理由つきで結果を返す。 */
function applyArtFile(name: string, mime: string, size: number, data: Uint8Array): ArtResult {
  const m = name.toLowerCase().match(/^([a-z0-9]+)_([a-z]+).(png|jpe?g|webp|gif)$/);
  if (!m) return { ok: false, reason: `${name}（ファイル名が規則と違います。例: oa_scout.png / oa_thumb.png）` };
  const biz = getBusiness(m[1]);
  if (!biz) return { ok: false, reason: `${name}（ワールドID「${m[1]}」は登録されていません）` };
  if (!IMAGE_TYPES.includes(mime)) return { ok: false, reason: `${name}（画像形式が未対応です）` };

  if (m[2] === "thumb") {
    if (size > MAX_ART) return { ok: false, reason: `${name}（5MBを超えています）` };
    saveWorldArt(biz.id, data, mime);
    return { ok: true, label: `${biz.short}のサムネイル` };
  }
  const st = STAFF.find((s) => s.id === m[2]);
  if (!st) return { ok: false, reason: `${name}（役割ID「${m[2]}」が不明です）` };
  if (size > MAX_IMAGE) return { ok: false, reason: `${name}（3MBを超えています）` };
  const cast = CAST[biz.id]?.[st.id];
  const existing = listCharacters(biz.id).find((c) => c.replaces === st.id);
  saveCharacter(
    biz.id,
    {
      name: existing?.name || cast?.name || st.name,
      role: existing?.role || st.role,
      replaces: st.id,
      tagline: existing?.tagline || cast?.tagline || st.tagline,
      rarity: existing?.rarity ?? st.rarity,
      move: existing?.move || cast?.move || st.move,
      stage: existing?.stage || st.stage,
      task: existing?.task || st.task(biz),
      skills: existing && existing.skills.length > 0 ? existing.skills : st.skills,
      image: { data, mime },
    },
    existing?.id,
  );
  return { ok: true, label: `${biz.short}／${cast?.name || st.name}` };
}

function reportImport(done: string[], skipped: string[]): never {
  revalidatePath("/", "layout");
  const msg = `取り込み完了：${done.length}件${skipped.length ? `｜スキップ ${skipped.length}件：${skipped.join("、")}` : ""}`;
  redirect(`/import-art?msg=${encodeURIComponent(msg)}&ok=${done.length > 0 ? 1 : 0}`);
}

/**
 * 選択した画像を一括反映する。キャラは既存6役の見た目を置き換える
 * （名前・必殺技などは既存の登録内容、なければ標準のまま）。
 */
export async function bulkImportArtAction(form: FormData) {
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const done: string[] = [];
  const skipped: string[] = [];
  for (const f of files) {
    const r = applyArtFile(f.name, f.type, f.size, new Uint8Array(await f.arrayBuffer()));
    if (r.ok) done.push(r.label);
    else skipped.push(r.reason);
  }
  reportImport(done, skipped);
}

/** プロジェクト内の assets/import フォルダ（取り込み用に変換済みのコピー）から一括取り込み。 */
export async function importFromFolderAction() {
  const dir = join(process.cwd(), "assets", "import");
  const done: string[] = [];
  const skipped: string[] = [];
  const mimeOf: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };
  for (const name of existsSync(dir) ? readdirSync(dir).sort() : []) {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (!mimeOf[ext]) continue;
    const buf = readFileSync(join(dir, name));
    const r = applyArtFile(name, mimeOf[ext], buf.length, new Uint8Array(buf));
    if (r.ok) done.push(r.label);
    else skipped.push(r.reason);
  }
  reportImport(done, skipped);
}

/* ---------------------- ワールド名の変更 ---------------------- */

export async function saveWorldNameAction(form: FormData) {
  const id = str(form, "businessId");
  if (getBusiness(id)) saveWorldOverride(id, str(form, "title").trim().slice(0, 40), str(form, "name").trim().slice(0, 60));
  revalidatePath("/", "layout");
  redirect(`/b/${id}/settings?msg=${encodeURIComponent("ワールド名を保存しました")}`);
}

export async function clearWorldNameAction(form: FormData) {
  const id = str(form, "businessId");
  clearWorldOverride(id);
  revalidatePath("/", "layout");
  redirect(`/b/${id}/settings?msg=${encodeURIComponent("標準の名前に戻しました")}`);
}
