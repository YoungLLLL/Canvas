import assert from "node:assert/strict";
import test from "node:test";

import {
  recordDialogueCueUse,
  selectDialogueCue,
} from "../ai/stage7/dialogue-planner.ts";

const spatialCue = {
  cueId: "cue:bedroom:space",
  artworkId: "artic:28560",
  locale: "zh",
  topic: "space",
  triggerIntents: ["房间为什么看起来有点歪", "透视", "家具角度"],
  claimIds: ["claim:space"],
  visualEvidenceIds: ["visual:floor"],
  compatiblePersonaIds: ["persona:van-gogh"],
  move: "invite_observation",
  transitionHint: "先回答，再自然提到床沿和地板线条。",
  delivery: {
    minimumTurn: 2,
    cooldownTurns: 4,
    maxUsesPerConversation: 1,
    requiresUserInitiation: true,
  },
  confidence: "high",
  status: "verified",
};

const colorCue = {
  ...spatialCue,
  cueId: "cue:bedroom:color",
  topic: "color",
  triggerIntents: ["颜色", "蓝色", "黄色"],
  claimIds: ["claim:color"],
  visualEvidenceIds: ["visual:color"],
  move: "mention",
  transitionHint: "只在用户谈到颜色时提及。",
};

function input(overrides = {}) {
  return {
    cues: [spatialCue, colorCue],
    userMessage: "这个房间为什么看起来有一点歪？",
    personaId: "persona:van-gogh",
    turn: 3,
    mode: "exploration",
    usage: {},
    ...overrides,
  };
}

test("selects one relevant dialogue cue without exposing it as a question list", () => {
  const selected = selectDialogueCue(input());
  assert.equal(selected?.cue.cueId, spatialCue.cueId);
  assert.equal(selected?.reason, "topic_match");
});

test("does not inject an unrelated dialogue cue", () => {
  assert.equal(
    selectDialogueCue(input({ userMessage: "这件作品是哪一年画的？" })),
    null,
  );
});

test("respects persona compatibility and minimum turn", () => {
  assert.equal(selectDialogueCue(input({ personaId: "persona:monet" })), null);
  assert.equal(selectDialogueCue(input({ turn: 1 })), null);
});

test("respects cooldown and maximum uses", () => {
  const usage = recordDialogueCueUse({}, spatialCue.cueId, 3);
  assert.equal(selectDialogueCue(input({ turn: 5, usage })), null);
  assert.deepEqual(usage[spatialCue.cueId], { uses: 1, lastUsedTurn: 3 });
});

test("direct answers do not append observation invitations or follow-up questions", () => {
  assert.equal(selectDialogueCue(input({ mode: "direct_answer" })), null);
});
