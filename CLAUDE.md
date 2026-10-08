# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

代理販売店の営業向けAIコーチング／壁打ちアプリ（Next.js 16 App Router + TypeScript）。トナーカートリッジ・フック商材・オフィス機器（複合機・シュレッダー等）の電話／訪問営業（BtoB・テレアポ主体）に特化している。4機能:

1. **ロープレ** (`/roleplay`) — AIが顧客役を演じる（6ペルソナ × 6シーン × 難易度3段階）。終了後に6軸評価・良い点・改善点・次アクション・改善トーク例をJSONで自動生成。
2. **営業相談・壁打ち** (`/consult`) — 「間に合ってますで切られる」等の突破できない場面をストリーミングチャットで相談。
3. **トークスクリプト添削** (`/script-review`) — 台本や実際の発話を貼り付けると構成ごとの評点・リスク・添削後スクリプトを返す。
4. **振り返り・成長記録** (`/history`) — ロープレ・添削結果を保存し、スコア推移と評価軸ごとの平均を可視化。

## Commands

```bash
npm run dev      # 開発サーバ起動（既定 http://localhost:3000）
npm run build    # 本番ビルド
npm run start    # 本番起動
npm run lint     # next lint
```

Node.js 22.5+ 必須（`node:sqlite` を使用するため。20系不可）。

セットアップ: `.env.local` に `ANTHROPIC_API_KEY` を設定（`.env.example` 参照）。任意で `ANTHROPIC_MODEL`（既定 `claude-sonnet-5`）と `DATABASE_PATH`（既定 `./data/coach.db`、絶対パスのみ有効）。

自動テストは存在しない。

Note: `.claude/launch.json` はポート4321でdevサーバを起動する設定（別プロジェクト sfa-crm-app が3000番を使うため）。

## Architecture

**LLM連携は `src/lib/anthropic.ts` に集約。** 2つの生成パターンのみ:
- `streamAssistantText()` — system + 会話履歴からプレーンテキストの `ReadableStream` を返す。ロープレのチャット応答・壁打ち相談で使用。API route はこの stream をそのまま `Response` の body にして返し、クライアントは `useChatStream.ts`（`src/components/`）で読む。
- `generateStructured<T>()` — `tool_choice: {type: "tool", name: ...}` を強制して単一の tool_use を取り出し、構造化JSONを得る。ロープレ評価とスクリプト添削で使用（対応する input_schema は `src/lib/prompts.ts` の `EVALUATION_TOOL_SCHEMA` / `SCRIPT_REVIEW_TOOL_SCHEMA`）。

**ドメイン定義とプロンプトは分離されている:**
- `src/lib/personas.ts` — 顧客ペルソナ（役職・人物像・口ぐせ・難易度別スタンス等）
- `src/lib/scenarios.ts` — 営業シーン（ゴール・顧客側の状況・詰まりポイント等）
- `src/lib/prompts.ts` — 上記2つを組み合わせてsystemプロンプトを構築する関数群、および壁打ち・添削の固定systemプロンプトとtool schema

新しい顧客タイプ・シーンの追加や評価軸・コーチの口調の変更は、コード全体ではなくこの3ファイルの編集で完結する設計。

**永続化は `src/lib/db.ts` に集約**（`node:sqlite` の `DatabaseSync`、追加のDBサーバー不要）。2テーブル: `roleplay_sessions`（transcript/evaluationはJSON文字列で保存）、`script_reviews`。集計用の `getStats()` がスコア推移・評価軸平均をダッシュボード（`/`）向けに算出する。

**API routes** (`src/app/api/*/route.ts`) は薄いハンドラで、リクエストのvalidation → `lib/prompts.ts` でプロンプト構築 → `lib/anthropic.ts` で生成 → （評価・添削系のみ）`lib/db.ts` に保存、という一本の流れ。ロジックをroute内に増やさず、対応する `lib/` 側に置く。

**型定義は `src/lib/types.ts` に集約**（`Evaluation`, `ScriptFeedback`, `RoleplaySessionRecord` 等）。DBの行↔レコード変換 (`rowToRoleplay` 等) もこれらの型に沿う。

すべてのUIコピー・プロンプトは日本語。
