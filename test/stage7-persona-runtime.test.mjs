import assert from "node:assert/strict";
import test from "node:test";
import { vanGoghCandidate } from "../ai/artist-profiles/van-gogh.mjs";
import {
  buildLocalPersonaIntroduction,
  buildPersonaUnavailable,
} from "../ai/stage7/persona-runtime.mjs";

test("returns a deterministic claim-backed local opening without an API key", () => {
  const first = buildLocalPersonaIntroduction({
    persona: vanGoghCandidate,
    artworkId: "28560",
  });
  const second = buildLocalPersonaIntroduction({
    persona: vanGoghCandidate,
    artworkId: "artic:28560",
  });

  assert.deepEqual(first, second);
  assert.equal(first.provider, "local");
  assert.equal(first.degraded, true);
  assert.equal(first.responseType, "imagined_response");
  assert.equal(first.perspective, "retrospective");
  assert.match(first.answer, /三十六岁/);
  assert.match(first.englishAnswer, /thirty-six/);
  assert.ok(
    first.evidence.some((source) => source.id === "source:vangoghletters:705"),
  );
  assert.match(first.disclosure, /数字化身|塑造/);
});

test("does not invent a generic opening for an unknown artwork", () => {
  assert.throws(
    () =>
      buildLocalPersonaIntroduction({
        persona: vanGoghCandidate,
        artworkId: "999999",
      }),
    (error) => error.code === "PERSONA_CONTEXT_UNAVAILABLE",
  );
});

test("returns a transparent unavailable payload for live dialogue", () => {
  const result = buildPersonaUnavailable({ persona: vanGoghCandidate });
  assert.equal(result.code, "PERSONA_MODEL_UNAVAILABLE");
  assert.equal(result.retryable, true);
  assert.match(result.error, /暂时无法连接/);
});
