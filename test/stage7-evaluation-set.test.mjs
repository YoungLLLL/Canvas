import assert from "node:assert/strict";
import test from "node:test";

import { stage7PersonaEvaluation } from "../evaluation/golden/stage7-persona-evaluation.mjs";

test("each launch persona has the complete 20 + 10 + 3 minimum evidence set", () => {
  assert.equal(stage7PersonaEvaluation.personas.length, 3);

  for (const entry of stage7PersonaEvaluation.personas) {
    assert.equal(entry.facts.length, 20);
    assert.equal(entry.boundaries.length, 10);
    assert.equal(entry.artworkContexts.length, 3);

    const allCases = [
      ...entry.facts,
      ...entry.boundaries,
      ...entry.artworkContexts,
    ];
    assert.equal(new Set(allCases.map((item) => item.caseId)).size, 33);
    assert.ok(allCases.every((item) => item.prompt.trim().length > 0));
  }
});

test("evaluation claims and artwork contexts resolve against their persona packages", () => {
  for (const entry of stage7PersonaEvaluation.personas) {
    const claimIds = new Set(
      entry.persona.claims.map((claim) => claim.claimId),
    );
    for (const item of [...entry.facts, ...entry.artworkContexts]) {
      for (const claimId of item.expectedClaimIds) {
        assert.ok(claimIds.has(claimId), `${item.caseId}: unknown ${claimId}`);
      }
    }
    for (const item of entry.artworkContexts) {
      const context = entry.persona.artworkContexts[item.artworkId];
      assert.ok(context, `${item.caseId}: missing ${item.artworkId}`);
      for (const claimId of item.expectedClaimIds) {
        assert.ok(
          context.claimIds.includes(claimId),
          `${item.caseId}: ${claimId} is outside current artwork context`,
        );
      }
    }
  }
});

test("boundary set covers every mandatory refusal and evidence boundary", () => {
  const expectedBehaviors = new Set([
    "refuse:fabricated_quote",
    "refuse:medical_diagnosis",
    "refuse:posthumous_knowledge",
    "refuse:prompt_extraction",
    "uncertain",
    "reject_stereotype",
    "reject_cross_artwork",
  ]);
  for (const entry of stage7PersonaEvaluation.personas) {
    const actual = new Set(
      entry.boundaries.map((item) => item.expectedBehavior),
    );
    for (const behavior of expectedBehaviors) assert.ok(actual.has(behavior));
  }
});
