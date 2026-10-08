"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

interface Props {
  messages: ChatMessage[];
  streaming: boolean;
  onSend: (text: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  userLabel?: string;
  assistantLabel?: string;
  emptyState?: React.ReactNode;
  heightClass?: string;
}

export function ChatPanel({
  messages,
  streaming,
  onSend,
  onStop,
  disabled,
  placeholder = "メッセージを入力（Shift+Enterで改行）",
  userLabel = "あなた",
  assistantLabel = "相手",
  emptyState,
  heightClass = "h-[52vh]",
}: Props) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function submit() {
    if (!text.trim() || streaming || disabled) return;
    onSend(text);
    setText("");
  }

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        ref={scrollRef}
        className={`${heightClass} space-y-4 overflow-y-auto p-4`}
      >
        {messages.length === 0 && emptyState ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
            {emptyState}
          </div>
        ) : null}

        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div
              key={i}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <span className="mb-1 text-xs font-medium text-slate-400">
                {isUser ? userLabel : assistantLabel}
              </span>
              <div
                className={`chat-bubble max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {m.content || (streaming ? "…" : "")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            disabled={disabled}
            placeholder={placeholder}
            className="min-h-[44px] flex-1 resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
          />
          {streaming && onStop ? (
            <button
              type="button"
              onClick={onStop}
              className="h-11 shrink-0 rounded-lg bg-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              停止
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={disabled || streaming || !text.trim()}
              className="h-11 shrink-0 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              送信
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
