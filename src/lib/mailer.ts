import nodemailer from "nodemailer";

/**
 * 自社メール送信（SMTP）。設定は .env.local のみで行い、パスワードは画面に出さない。
 * MAIL_MODE: dry（既定・送らず記録のみ）/ test（MAIL_TEST_TO にだけ送る）/ live（リード宛に実送信）
 */
export type MailMode = "dry" | "test" | "live";

export interface MailConfig {
  mode: MailMode;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  fromName: string;
  replyTo: string;
  testTo: string;
  dailyLimit: number;
  footer: string[];
}

export function getMailConfig(): MailConfig {
  const e = process.env;
  const mode = (e.MAIL_MODE ?? "dry").toLowerCase();
  return {
    mode: mode === "live" || mode === "test" ? mode : "dry",
    host: e.SMTP_HOST?.trim() ?? "",
    port: Number(e.SMTP_PORT) || 587,
    secure: e.SMTP_SECURE === "true",
    user: e.SMTP_USER?.trim() ?? "",
    pass: e.SMTP_PASS ?? "",
    from: e.MAIL_FROM?.trim() ?? "",
    fromName: e.MAIL_FROM_NAME?.trim() || "メディアブレイン 営業担当",
    replyTo: e.MAIL_REPLY_TO?.trim() ?? "",
    testTo: e.MAIL_TEST_TO?.trim() ?? "",
    dailyLimit: Number(e.MAIL_DAILY_LIMIT) || 30,
    footer: (e.MAIL_FOOTER ?? "").split("|").map((x) => x.trim()).filter(Boolean),
  };
}

/** 接続に必要な項目が揃っているか（揃っていない項目名を返す） */
export function missingConfig(c: MailConfig = getMailConfig()): string[] {
  const miss: string[] = [];
  if (!c.host) miss.push("SMTP_HOST");
  if (!c.user) miss.push("SMTP_USER");
  if (!c.pass) miss.push("SMTP_PASS");
  if (!c.from) miss.push("MAIL_FROM");
  if (c.mode === "test" && !c.testTo) miss.push("MAIL_TEST_TO");
  return miss;
}

function transport(c: MailConfig) {
  return nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.secure,
    auth: { user: c.user, pass: c.pass },
  });
}

export async function verifySmtp(): Promise<{ ok: boolean; message: string }> {
  const c = getMailConfig();
  const miss = missingConfig({ ...c, mode: "live" });
  if (miss.length) return { ok: false, message: `未設定: ${miss.join(", ")}` };
  try {
    await transport(c).verify();
    return { ok: true, message: "SMTPに接続できました" };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** 本文に配信停止の案内と会社情報（特定電子メール法の表示事項）を付ける */
export function withFooter(body: string, c: MailConfig = getMailConfig()): string {
  const lines = [
    "",
    "――――――――――――――――――",
    "今後このようなご案内が不要な場合は、このメールに「配信停止」とご返信ください。以後お送りしません。",
    ...c.footer,
  ];
  return body + "\n" + lines.join("\n");
}

export interface SendResult {
  ok: boolean;
  sent: boolean; // 実際に送信した（dry は false）
  message: string;
}

export async function sendMail(input: { to: string; subject: string; body: string }): Promise<SendResult> {
  const c = getMailConfig();
  const text = withFooter(input.body, c);

  if (c.mode === "dry") {
    return { ok: true, sent: false, message: "ドライラン：送信はしていません（MAIL_MODE=test または live で送信）" };
  }
  const miss = missingConfig(c);
  if (miss.length) return { ok: false, sent: false, message: `メール設定が未完了です: ${miss.join(", ")}` };

  const to = c.mode === "test" ? c.testTo : input.to;
  try {
    await transport(c).sendMail({
      from: { name: c.fromName, address: c.from },
      to,
      replyTo: c.replyTo || undefined,
      subject: c.mode === "test" ? `[TEST] ${input.subject}` : input.subject,
      text,
    });
    return { ok: true, sent: c.mode === "live", message: c.mode === "test" ? `テスト送信しました（${to}）` : `送信しました（${to}）` };
  } catch (e) {
    return { ok: false, sent: false, message: `送信失敗: ${(e as Error).message}` };
  }
}
