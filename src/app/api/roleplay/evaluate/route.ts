import type { NextRequest } from "next/server";
import { generateStructured } from "@/lib/anthropic";
import {
  EVALUATION_SYSTEM,
  EVALUATION_TOOL_SCHEMA,
  buildEvaluationUserContent,
} from "@/lib/prompts";
import { getPersona } from "@/lib/personas";
import { getScenario } from "@/lib/scenarios";
import { createRoleplaySession } from "@/lib/db";
import type { ChatMessage, Difficulty, Evaluation } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      messages?: ChatMessage[];
      personaId?: string;
      scenarioId?: string;
      difficulty?: Difficulty;
      save?: boolean;
    };

    const { personaId, scenarioId, difficulty = "normal", save = true } = body;
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length < 2) {
      return Response.json(
        { error: "評価するには会話が短すぎます。" },
        { status: 400 },
      );
    }
    const persona = getPersona(personaId ?? "");
    const scenario = getScenario(scenarioId ?? "");
    if (!persona || !scenario) {
      return Response.json(
        { error: "persona / scenario の指定が不正です" },
        { status: 400 },
      );
    }

    const evaluation = await generateStructured<Evaluation>({
      system: EVALUATION_SYSTEM,
      userContent: buildEvaluationUserContent({
        persona,
        scenario,
        difficulty,
        transcript: messages,
      }),
      toolName: "submit_evaluation",
      toolDescription:
        "ロールプレイにおける営業担当の評価結果を提出する。すべての項目を日本語で埋めること。",
      inputSchema: EVALUATION_TOOL_SCHEMA,
      maxTokens: 3500,
    });

    let id: string | null = null;
    if (save) {
      const record = createRoleplaySession({
        personaId: persona.id,
        personaName: persona.name,
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        difficulty,
        transcript: messages,
        evaluation,
      });
      id = record.id;
    }

    return Response.json({ id, evaluation });
  } catch (e) {
    return Response.json(
      { error: (e as Error).message || "サーバーエラー" },
      { status: 500 },
    );
  }
}
