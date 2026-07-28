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
      englishAnswer:
        "I painted this work in 1893. Beyond tenderness, I also cared about the order of the composition.",
      englishSegments: [
        "I painted this work in 1893. ",
        "Beyond tenderness, I also cared about the order of the composition.",
      ],
      responseType: "imagined_response",
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
  assert.equal(result.responseType, "imagined_response");
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
          englishAnswer: "This is a fact.",
          englishSegments: ["This is a fact."],
          responseType: "evidence_based",
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
          englishAnswer: "It was painted in Seville.",
          englishSegments: ["It was painted in Seville."],
          responseType: "evidence_based",
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
          englishAnswer: "This work was painted in 1893.",
          englishSegments: ["This work was painted in 1893."],
          responseType: "evidence_based",
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

test("rejects diagnosis, prompt leaks, and invented quotations", () => {
  const assembly = assemblePersonaDialogue({
    persona: maryCassattCandidate,
    artworkId: "111442",
  });
  for (const [answer, expected] of [
    ["我患有精神分裂症。", /medical diagnosis/],
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
            englishAnswer: answer,
            englishSegments: [answer],
            responseType: "imagined_response",
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

test("allows modern speculation when it is labeled as imagined", () => {
  const assembly = assemblePersonaDialogue({
    persona: maryCassattCandidate,
    artworkId: "111442",
  });
  const answer =
    "这些机器可以制造图像，但判断一幅画是否成立，仍需要一双有主见的眼睛。";
  const result = finalizePersonaDialogue({
    assembly,
    modelRevision: "fixture",
    modelOutput: {
      answer,
      englishAnswer:
        "These machines can make images, but deciding whether a painting holds together still requires a discerning eye.",
      englishSegments: [
        "These machines can make images, but deciding whether a painting holds together still requires a discerning eye.",
      ],
      responseType: "imagined_response",
      segments: [
        {
          text: answer,
          layer: "persona_reconstruction",
          claimIds: [],
        },
      ],
      evidenceRefIds: [],
    },
  });
  assert.equal(result.responseType, "imagined_response");
});
