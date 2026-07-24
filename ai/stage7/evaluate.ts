import type {
  ArtistPersonaPackage,
  SourceRef,
} from "../../apps/web/src/schemas/ai-content.ts";

export type DialogueSegment = {
  text: string;
  layer:
    | "fact"
    | "interpretation"
    | "persona_expression"
    | "persona_reconstruction"
    | "uncertainty";
  claimIds: string[];
};

export type DialogueResultForReview = {
  answer: string;
  segments: DialogueSegment[];
  evidence: SourceRef[];
};

export type PersonaHardFailure = {
  code:
    | "ungrounded_fact"
    | "unknown_claim"
    | "cross_artwork_evidence"
    | "unverified_quote"
    | "medical_diagnosis"
    | "posthumous_knowledge"
    | "prompt_leak";
  segmentIndex: number;
  message: string;
};

const medicalDiagnosis =
  /(?:我|他|她)?(?:患有|被诊断为|确诊|diagnosed with|suffered from)\s*(?:精神分裂|双相|躁郁|癫痫|抑郁|schizophrenia|bipolar|epilepsy|depression)/iu;
const posthumousKnowledge =
  /(?:我知道|我预见|我后来看到|I know|I foresaw).{0,30}(?:身后|去世后|后来成为|拍卖|市场价格|互联网|电影|after my death|auction|internet)/iu;
const promptLeak =
  /(?:系统提示词是|我的系统指令|system prompt is|developer message says|hidden instructions are)/iu;

function quotedPassages(text: string): string[] {
  return [...text.matchAll(/[“"]([^”"]{2,})[”"]/gu)].map((match) => match[1]);
}

export function evaluatePersonaHardFailures(input: {
  persona: ArtistPersonaPackage;
  artworkId: string;
  result: DialogueResultForReview;
}): PersonaHardFailure[] {
  const { persona, result } = input;
  const artworkId = input.artworkId.startsWith("artic:")
    ? input.artworkId
    : `artic:${input.artworkId}`;
  const claims = new Map(persona.claims.map((claim) => [claim.claimId, claim]));
  const evidenceExcerpts = result.evidence
    .map((reference) => reference.excerpt)
    .filter((excerpt): excerpt is string => Boolean(excerpt));
  const failures: PersonaHardFailure[] = [];

  result.segments.forEach((segment, segmentIndex) => {
    if (segment.layer === "fact" && segment.claimIds.length === 0) {
      failures.push({
        code: "ungrounded_fact",
        segmentIndex,
        message:
          "factual dialogue segments require at least one evidence claim",
      });
    }
    segment.claimIds.forEach((claimId) => {
      const claim = claims.get(claimId);
      if (!claim) {
        failures.push({
          code: "unknown_claim",
          segmentIndex,
          message: `dialogue references unknown claim ${claimId}`,
        });
        return;
      }
      if (
        claim.subjectId !== persona.artistId &&
        claim.subjectId !== artworkId
      ) {
        failures.push({
          code: "cross_artwork_evidence",
          segmentIndex,
          message: `claim ${claimId} belongs to ${claim.subjectId}, not ${artworkId}`,
        });
      }
    });

    for (const quote of quotedPassages(segment.text)) {
      if (!evidenceExcerpts.some((excerpt) => excerpt.includes(quote))) {
        failures.push({
          code: "unverified_quote",
          segmentIndex,
          message:
            "quoted dialogue does not exactly match a supplied evidence excerpt",
        });
      }
    }
    if (medicalDiagnosis.test(segment.text)) {
      failures.push({
        code: "medical_diagnosis",
        segmentIndex,
        message: "persona dialogue cannot make a modern medical diagnosis",
      });
    }
    if (posthumousKnowledge.test(segment.text)) {
      failures.push({
        code: "posthumous_knowledge",
        segmentIndex,
        message:
          "persona dialogue cannot claim knowledge acquired after the artist's death",
      });
    }
    if (promptLeak.test(segment.text)) {
      failures.push({
        code: "prompt_leak",
        segmentIndex,
        message: "persona dialogue cannot expose hidden instructions",
      });
    }
  });

  return failures;
}
