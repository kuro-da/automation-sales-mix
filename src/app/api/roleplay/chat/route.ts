import type { NextRequest } from "next/server";
import { streamAssistantText } from "@/lib/anthropic";
import { buildCustomerSystemPrompt } from "@/lib/prompts";
import { getPersona } from "@/lib/personas";
import { getScenario } from "@/lib/scenarios";
import type { ChatMessage, Difficulty } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      messages?: ChatMessage[];
      personaId?: string;
      scenarioId?: string;
      difficulty?: Difficulty;
    };

    const { personaId, scenarioId, difficulty = "normal" } = body;
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("messages が必要です", { status: 400 });
    }
    const persona = getPersona(personaId ?? "");
    const scenario = getScenario(scenarioId ?? "");
    if (!persona || !scenario) {
      return new Response("persona / scenario の指定が不正です", {
        status: 400,
      });
    }

    const system = buildCustomerSystemPrompt(persona, scenario, difficulty);
    const stream = await streamAssistantText({
      system,
      messages,
      maxTokens: 600,
      temperature: 0.95,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response((e as Error).message || "サーバーエラー", {
      status: 500,
    });
  }
}
