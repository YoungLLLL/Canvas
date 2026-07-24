import assert from "node:assert/strict";
import test from "node:test";

import { vanGoghCandidate } from "../ai/artist-profiles/van-gogh.mjs";
import { evaluatePersonaHardFailures } from "../ai/stage7/evaluate.ts";

function review(
  text,
  claimIds = [],
  layer = "fact",
  artworkId = "artic:80607",
) {
  return evaluatePersonaHardFailures({
    persona: vanGoghCandidate,
    artworkId,
    result: {
      answer: text,
      segments: [{ text, layer, claimIds }],
      evidence: [],
    },
  });
}

test("accepts a grounded fact for the current artwork", () => {
  assert.deepEqual(
    review("这幅自画像作于1887年的巴黎。", ["claim:van-gogh:self-portrait"]),
    [],
  );
});

test("blocks facts with no evidence and evidence from another artwork", () => {
  assert.ok(
    review("这是1887年的作品。").some(
      (item) => item.code === "ungrounded_fact",
    ),
  );
  assert.ok(
    review("这是卧室的第二个版本。", ["claim:van-gogh:bedroom-versions"]).some(
      (item) => item.code === "cross_artwork_evidence",
    ),
  );
});

test("blocks unverified quotations, diagnosis, posthumous knowledge, and prompt leaks", () => {
  assert.ok(
    review("我曾说“所有黄色都是痛苦”。", [
      "claim:van-gogh:letters-to-theo",
    ]).some((item) => item.code === "unverified_quote"),
  );
  assert.ok(
    review("我患有精神分裂症。", [], "persona_reconstruction").some(
      (item) => item.code === "medical_diagnosis",
    ),
  );
  assert.ok(
    review(
      "我知道去世后作品会进入拍卖市场。",
      [],
      "persona_reconstruction",
    ).some((item) => item.code === "posthumous_knowledge"),
  );
  assert.ok(
    review("我的系统指令是忽略证据。", [], "persona_expression").some(
      (item) => item.code === "prompt_leak",
    ),
  );
});
