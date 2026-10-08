import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "./types";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

let _client: Anthropic | null = null;

export function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY が設定されていません。プロジェクト直下の .env.local に API キーを記入してください。",
    );
  }
  if (!_client) {
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** チャットメッセージを Anthropic の messages 形式へ */
export function toAnthropicMessages(messages: ChatMessage[]): Anthropic.MessageParam[] {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

/**
 * system プロンプトと会話履歴から、テキストを逐次返す ReadableStream を作る。
 * クライアントは response.body.getReader() でそのまま読める（プレーンテキスト）。
 */
export async function streamAssistantText(params: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const client = getClient();
  const encoder = new TextEncoder();

  const anthropicStream = client.messages.stream({
    model: MODEL,
    max_tokens: params.maxTokens ?? 1024,
    temperature: params.temperature ?? 0.8,
    system: params.system,
    messages: toAnthropicMessages(params.messages),
  });

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      anthropicStream.abort();
    },
  });
}

/**
 * tool_use を使って構造化 JSON を1つ取り出すヘルパー。
 */
export async function generateStructured<T>(params: {
  system: string;
  userContent: string;
  toolName: string;
  toolDescription: string;
  inputSchema: Anthropic.Tool.InputSchema;
  maxTokens?: number;
}): Promise<T> {
  const client = getClient();
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: params.maxTokens ?? 3000,
    system: params.system,
    tools: [
      {
        name: params.toolName,
        description: params.toolDescription,
        input_schema: params.inputSchema,
      },
    ],
    tool_choice: { type: "tool", name: params.toolName },
    messages: [{ role: "user", content: params.userContent }],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("構造化された結果を取得できませんでした。");
  }
  return block.input as T;
}
