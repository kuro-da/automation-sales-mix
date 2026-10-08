import type { NextRequest } from "next/server";
import { generateStructured } from "@/lib/anthropic";
import {
  SCRIPT_REVIEW_SYSTEM,
  SCRIPT_REVIEW_TOOL_SCHEMA,
  buildScriptReviewUserContent,
} from "@/lib/prompts";
import { createScriptReview } from "@/lib/db";
import type { ScriptFeedback } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      title?: string;
      scriptText?: string;
      context?: string;
      save?: boolean;
    };

    const title = (body.title ?? "").trim() || "無題のスクリプト";
    const scriptText = (body.scriptText ?? "").trim();
    const save = body.save ?? true;

    if (scriptText.length < 15) {
      return Response.json(
        { error: "添削対象のスクリプトを入力してください。" },
        { status: 400 },
      );
    }

    const feedback = await generateStructured<ScriptFeedback>({
      system: SCRIPT_REVIEW_SYSTEM,
      userContent: buildScriptReviewUserContent({
        title,
        scriptText,
        context: body.context?.trim() || undefined,
      }),
      toolName: "submit_script_feedback",
      toolDescription:
        "営業トークスクリプトの添削結果を提出する。すべての項目を日本語で埋めること。",
      inputSchema: SCRIPT_REVIEW_TOOL_SCHEMA,
      maxTokens: 3500,
    });

    let id: string | null = null;
    if (save) {
      const record = createScriptReview({ title, scriptText, feedback });
      id = record.id;
    }

    return Response.json({ id, feedback });
  } catch (e) {
    return Response.json(
      { error: (e as Error).message || "サーバーエラー" },
      { status: 500 },
    );
  }
}
