import type { DialogueCue } from "../../apps/web/src/schemas/ai-content.ts";

export type DialogueCueUsage = {
  uses: number;
  lastUsedTurn: number;
};

export type DialoguePlannerInput = {
  cues: DialogueCue[];
  userMessage: string;
  personaId: string;
  turn: number;
  mode: "direct_answer" | "exploration" | "open";
  usage: Record<string, DialogueCueUsage | undefined>;
  previousAssistantAskedQuestion?: boolean;
};

export type DialogueCueSelection = {
  cue: DialogueCue;
  score: number;
  matchedIntent: string;
  reason: "topic_match";
};

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function latinTokens(value: string): Set<string> {
  return new Set(normalize(value).match(/[\p{L}\p{N}]+/gu) ?? []);
}

function cjkBigrams(value: string): Set<string> {
  const characters = [...normalize(value).replace(/[^\p{Script=Han}]/gu, "")];
  const grams = new Set<string>();
  for (let index = 0; index < characters.length - 1; index += 1) {
    grams.add(`${characters[index]}${characters[index + 1]}`);
  }
  return grams;
}

function overlap(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 || right.size === 0) return 0;
  let matches = 0;
  for (const item of left) if (right.has(item)) matches += 1;
  return matches / Math.min(left.size, right.size);
}

export function dialogueIntentScore(message: string, intent: string): number {
  const normalizedMessage = normalize(message);
  const normalizedIntent = normalize(intent);
  if (!normalizedMessage || !normalizedIntent) return 0;
  if (
    normalizedMessage.includes(normalizedIntent) ||
    normalizedIntent.includes(normalizedMessage)
  ) {
    return 1;
  }
  return Math.max(
    overlap(latinTokens(normalizedMessage), latinTokens(normalizedIntent)),
    overlap(cjkBigrams(normalizedMessage), cjkBigrams(normalizedIntent)),
  );
}

function cueIsAvailable(
  cue: DialogueCue,
  input: DialoguePlannerInput,
): boolean {
  if (cue.status !== "verified") return false;
  if (
    cue.compatiblePersonaIds.length > 0 &&
    !cue.compatiblePersonaIds.includes(input.personaId)
  ) {
    return false;
  }
  if (input.turn < cue.delivery.minimumTurn) return false;

  const usage = input.usage[cue.cueId];
  if (usage?.uses && usage.uses >= cue.delivery.maxUsesPerConversation) {
    return false;
  }
  if (usage && input.turn - usage.lastUsedTurn <= cue.delivery.cooldownTurns) {
    return false;
  }
  if (cue.delivery.requiresUserInitiation && !input.userMessage.trim()) {
    return false;
  }
  if (input.previousAssistantAskedQuestion && cue.move === "ask_follow_up") {
    return false;
  }
  if (
    input.mode === "direct_answer" &&
    ["ask_follow_up", "invite_observation"].includes(cue.move)
  ) {
    return false;
  }
  return true;
}

export function selectDialogueCue(
  input: DialoguePlannerInput,
): DialogueCueSelection | null {
  const candidates: DialogueCueSelection[] = [];

  for (const cue of input.cues) {
    if (!cueIsAvailable(cue, input)) continue;
    let score = 0;
    let matchedIntent = "";
    for (const intent of cue.triggerIntents) {
      const intentScore = dialogueIntentScore(input.userMessage, intent);
      if (intentScore > score) {
        score = intentScore;
        matchedIntent = intent;
      }
    }
    if (score < 0.34) continue;

    const confidenceBonus = cue.confidence === "high" ? 0.08 : 0;
    const movePenalty =
      cue.move === "ask_follow_up"
        ? 0.08
        : cue.move === "invite_observation"
          ? 0.03
          : 0;
    candidates.push({
      cue,
      score: Math.min(1, score + confidenceBonus - movePenalty),
      matchedIntent,
      reason: "topic_match",
    });
  }

  return (
    candidates.sort((left, right) => {
      const scoreDifference = right.score - left.score;
      if (scoreDifference !== 0) return scoreDifference;
      return (
        Number(right.cue.delivery.requiresUserInitiation) -
        Number(left.cue.delivery.requiresUserInitiation)
      );
    })[0] ?? null
  );
}

export function recordDialogueCueUse(
  usage: DialoguePlannerInput["usage"],
  cueId: string,
  turn: number,
): DialoguePlannerInput["usage"] {
  const previous = usage[cueId];
  return {
    ...usage,
    [cueId]: {
      uses: (previous?.uses ?? 0) + 1,
      lastUsedTurn: turn,
    },
  };
}
