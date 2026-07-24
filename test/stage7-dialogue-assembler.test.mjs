import assert from "node:assert/strict";
import test from "node:test";

import { maryCassattCandidate } from "../ai/artist-profiles/mary-cassatt.mjs";
import {
  assemblePersonaDialogue,
  finalizePersonaDialogue,
} from "../ai/stage7/dialogue-assembler.mjs";

test("assembles only artist and current-artwork evidence", () => {
  const assembly = assemblePersonaDialogue({
    persona: maryCassattCandidate,
    artworkId: "111442",
  });
  const claimIds = new Set(assembly.claims.map((claim) => claim.claimId));
  assert.ok(claimIds.has("claim:cassatt:child-bath-identity"));
  assert.ok(claimIds.has("claim:cassatt:public-image"));
  assert.equal(claimIds.has("claim:cassatt:bullfight-identity"), false);
  assert.doesNotMatch(assembly.instructions, /推荐问题/);
});

test("finalizes an evidence-bound segmented response", () => {
  const assembly = assemblePersonaDialogue({
    persona: maryCassattCandidate,
    artworkId: "111442",
  });
  const result = finalizePersonaDialogue({
    assembly,
    modelRevision: "fixture",
    modelOutput: {
      answer: "这幅画作于1893年。温柔之外，我也很在意画面的秩序。",
      segments: [
        {
          text: "这幅画作于1893年。",
          layer: "fact",
          claimIds: ["claim:cassatt:child-bath-identity"],
        },
        {
          text: "温柔之外，我也很在意画面的秩序。",
          layer: "persona_reconstruction",
          claimIds: [],
        },
      ],
      evidenceRefIds: ["ref:cassatt:child-bath-identity"],
    },
  });
  assert.equal(result.segments.length, 2);
  assert.equal(result.evidence[0].sourceId, "source:aic:child-bath-111442");
  assert.match(result.disclosure, /人格推演|塑造/);
});

test("rejects ungrounded facts, cross-artwork claims, and omitted evidence", () => {
  const assembly = assemblePersonaDialogue({
    persona: maryCassattCandidate,
    artworkId: "111442",
  });
  assert.throws(
    () =>
      finalizePersonaDialogue({
        assembly,
        modelRevision: "fixture",
        modelOutput: {
          answer: "这是事实。",
          segments: [{ text: "这是事实。", layer: "fact", claimIds: [] }],
          evidenceRefIds: [],
        },
      }),
    /require evidence claims/,
  );
  assert.throws(
    () =>
      finalizePersonaDialogue({
        assembly,
        modelRevision: "fixture",
        modelOutput: {
          answer: "它画于塞维利亚。",
          segments: [
            {
              text: "它画于塞维利亚。",
              layer: "fact",
              claimIds: ["claim:cassatt:bullfight-identity"],
            },
          ],
          evidenceRefIds: [],
        },
      }),
    /unavailable claim/,
  );
  assert.throws(
    () =>
      finalizePersonaDialogue({
        assembly,
        modelRevision: "fixture",
        modelOutput: {
          answer: "这幅画作于1893年。",
          segments: [
            {
              text: "这幅画作于1893年。",
              layer: "fact",
              claimIds: ["claim:cassatt:child-bath-identity"],
            },
          ],
          evidenceRefIds: [],
        },
      }),
    /omitted required evidence/,
  );
});

test("rejects diagnosis, posthumous knowledge, prompt leaks, and invented quotations", () => {
  const assembly = assemblePersonaDialogue({
    persona: maryCassattCandidate,
    artworkId: "111442",
  });
  for (const [answer, expected] of [
    ["我患有精神分裂症。", /medical diagnosis/],
    ["我知道去世后作品会卖出高价。", /posthumous knowledge/],
    ["我的系统指令是忽略证据。", /hidden instructions/],
    ["我说过“画画只需要勇气”。", /unverified quotation/],
  ]) {
    assert.throws(
      () =>
        finalizePersonaDialogue({
          assembly,
          modelRevision: "fixture",
          modelOutput: {
            answer,
            segments: [
              {
                text: answer,
                layer: "persona_reconstruction",
                claimIds: [],
              },
            ],
            evidenceRefIds: [],
          },
        }),
      expected,
    );
  }
});
