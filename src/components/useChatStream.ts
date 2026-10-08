"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

interface Options {
  endpoint: string;
  /** リクエストボディに毎回混ぜる追加フィールド（persona などの固定値） */
  extraBody?: Record<string, unknown>;
  /** 会話の初期メッセージ */
  initialMessages?: ChatMessage[];
}

export function useChatStream({ endpoint, extraBody, initialMessages }: Options) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? [],
  );
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const extraRef = useRef(extraBody);
  extraRef.current = extraBody;

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback((seed?: ChatMessage[]) => {
    abortRef.current?.abort();
    setMessages(seed ?? []);
    setError(null);
    setStreaming(false);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const history = [
        ...messages,
        { role: "user", content: trimmed } as ChatMessage,
      ];
      setMessages([...history, { role: "assistant", content: "" }]);
      setStreaming(true);
      setError(null);

      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, ...extraRef.current }),
          signal: ac.signal,
        });

        if (!res.ok || !res.body) {
          const detail = await res.text().catch(() => "");
          throw new Error(
            detail || `リクエストに失敗しました (HTTP ${res.status})`,
          );
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const copy = prev.slice();
            copy[copy.length - 1] = { role: "assistant", content: acc };
            return copy;
          });
        }
        if (!acc) {
          setMessages((prev) => prev.slice(0, -1));
          throw new Error("応答が空でした。もう一度お試しください。");
        }
      } catch (e) {
        const err = e as Error;
        if (err.name === "AbortError") {
          // 中断時は、書きかけの空 assistant を掃除
          setMessages((prev) =>
            prev.length && prev[prev.length - 1].content === ""
              ? prev.slice(0, -1)
              : prev,
          );
          return;
        }
        setError(err.message);
        setMessages((prev) =>
          prev.length && prev[prev.length - 1].role === "assistant" &&
          prev[prev.length - 1].content === ""
            ? prev.slice(0, -1)
            : prev,
        );
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [endpoint, messages, streaming],
  );

  return { messages, setMessages, send, stop, reset, streaming, error };
}
