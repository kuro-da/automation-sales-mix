export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type Difficulty = "easy" | "normal" | "hard";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "やさしい",
  normal: "ふつう",
  hard: "むずかしい",
};

/** ロープレの評価軸 */
export interface EvaluationAxis {
  key: string;
  label: string;
  score: number; // 1-5
  comment: string;
}

export interface Evaluation {
  overallScore: number; // 0-100
  summary: string;
  axes: EvaluationAxis[];
  goods: string[];
  improvements: string[];
  nextActions: string[];
  betterTalk: string; // そのまま使える改善トーク例
}

export interface ScriptFeedbackSection {
  label: string;
  score: number; // 1-5
  comment: string;
}

export interface ScriptFeedback {
  overallScore: number; // 0-100
  summary: string;
  sections: ScriptFeedbackSection[];
  strengths: string[];
  risks: string[];
  rewrite: string; // 添削後のトークスクリプト全文
  microTips: string[];
}

export interface RoleplaySessionRecord {
  id: string;
  personaId: string;
  personaName: string;
  scenarioId: string;
  scenarioTitle: string;
  difficulty: Difficulty;
  transcript: ChatMessage[];
  evaluation: Evaluation | null;
  overallScore: number | null;
  createdAt: string;
}

export interface ScriptReviewRecord {
  id: string;
  title: string;
  scriptText: string;
  feedback: ScriptFeedback;
  overallScore: number;
  createdAt: string;
}
