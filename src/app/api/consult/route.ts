import type { NextRequest } from "next/server";
import { streamAssistantText } from "@/lib/anthropic";
import { CONSULT_SYSTEM } from "@/lib/prompts";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { messages?: ChatMessage[] };
    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("messages が必要です", { status: 400 });
    }

    const stream = await streamAssistantText({
      system: CONSULT_SYSTEM,
      messages,
      maxTokens: 1400,
      temperature: 0.5,
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
