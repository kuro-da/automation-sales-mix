# 営業コーチAI（代理販売店向け）

トナーカートリッジ・フック商材・オフィス機器の電話／訪問営業に特化した、AIコーチング＆壁打ちアプリ。

## 機能

| 機能 | 説明 |
| --- | --- |
| **ロープレ** | AIが顧客役（総務／経理／情シス／社長／受付など6タイプ）。6シーン × 難易度3段階。終了後に6軸評価・良かった点・改善点・次アクション・改善トーク例を自動生成。 |
| **営業相談（壁打ち）** | 「間に合ってますで切られる」「リースがある」など突破できない場面を相談。その場で使える切り返しを提案。 |
| **トークスクリプト添削** | 台本や実際に話した内容を貼り付け → 構成ごとの評点・切られるリスク・添削後スクリプト。 |
| **振り返り・成長記録** | ロープレ評価・添削結果を保存し、スコア推移と評価軸ごとの平均を可視化。 |

## セットアップ

前提: Node.js 22.5 以上（`node:sqlite` を使用。推奨 20 系ではなく **22.5+ / 24**）。

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
```

`.env.local` を編集し、Anthropic の API キーを設定:

```
ANTHROPIC_API_KEY=sk-ant-xxxx
ANTHROPIC_MODEL=claude-sonnet-5     # 任意
DATABASE_PATH=./data/coach.db       # 任意
```

## 起動

```bash
npm run dev
```

http://localhost:3000 を開く。

本番ビルド:

```bash
npm run build
npm run start
```

## データの保存

SQLite ファイル（既定: `./data/coach.db`）に保存されます。追加のDBサーバーは不要です。
リセットしたい場合は `data/` 内の `coach.db*` を削除してください。

## 構成

```
src/
  app/
    page.tsx                  ダッシュボード
    roleplay/page.tsx         ロープレ（設定 → 会話 → 評価）
    consult/page.tsx          営業相談（壁打ち）
    script-review/page.tsx    スクリプト添削
    history/page.tsx          振り返り一覧
    history/[id]/page.tsx     ロープレ詳細（会話 log + 評価）
    api/
      roleplay/chat           顧客役の応答（ストリーミング）
      roleplay/evaluate       ロープレ評価（構造化 JSON）＋保存
      consult                 壁打ちの応答（ストリーミング）
      script-review           スクリプト添削（構造化 JSON）＋保存
  lib/
    anthropic.ts   Anthropic クライアント / ストリーム / 構造化生成
    personas.ts    顧客ペルソナ定義
    scenarios.ts   営業シーン定義
    prompts.ts     system プロンプトと JSON スキーマ
    db.ts          node:sqlite による永続化
    types.ts       型定義
  components/      UI（チャット、評価カード、可視化など）
```

## カスタマイズの勘所

- 顧客タイプを増やす: `src/lib/personas.ts` に追記
- 営業シーンを増やす: `src/lib/scenarios.ts` に追記
- 評価軸・講評の観点を変える: `src/lib/prompts.ts` の `EVALUATION_*`
- コーチの口調・方針: `src/lib/prompts.ts` の `CONSULT_SYSTEM`
