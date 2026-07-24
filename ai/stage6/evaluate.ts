import type {
  ArtworkKnowledgePackage,
  ReviewRecord,
} from "../../apps/web/src/schemas/ai-content.ts";

export type Stage6EvaluationIssue = ReviewRecord["issues"][number];

function issue(
  code: string,
  message: string,
  path: (string | number)[],
  severity: Stage6EvaluationIssue["severity"] = "error",
): Stage6EvaluationIssue {
  return { code, message, path, severity };
}

export function evaluateStage6Candidate(
  knowledge: ArtworkKnowledgePackage,
): Stage6EvaluationIssue[] {
  const issues: Stage6EvaluationIssue[] = [];
  const claims = new Map(
    knowledge.claims.map((claim) => [claim.claimId, claim]),
  );
  const referencedClaimIds = [
    ...(knowledge.content.introduction?.claimIds ?? []),
    ...knowledge.content.tags.flatMap((tag) => tag.claimIds),
    ...knowledge.content.relations.flatMap((relation) => relation.claimIds),
    ...(knowledge.content.accessibility?.claimIds ?? []),
    ...knowledge.dialogueCues.flatMap((cue) => cue.claimIds),
  ];

  for (const claimId of new Set(referencedClaimIds)) {
    const claim = claims.get(claimId);
    if (claim && ["disputed", "rejected"].includes(claim.status)) {
      issues.push(
        issue(
          "referenced_unpublishable_claim",
          `published content cannot rely on a ${claim.status} claim`,
          [
            "claims",
            knowledge.claims.findIndex((item) => item.claimId === claimId),
            "status",
          ],
        ),
      );
    }
  }

  const cueIds = new Set<string>();
  knowledge.dialogueCues.forEach((cue, index) => {
    if (cueIds.has(cue.cueId)) {
      issues.push(
        issue("duplicate_dialogue_cue", "dialogue cue ids must be unique", [
          "dialogueCues",
          index,
          "cueId",
        ]),
      );
    }
    cueIds.add(cue.cueId);
    if (
      cue.move === "invite_observation" &&
      cue.visualEvidenceIds.length === 0
    ) {
      issues.push(
        issue(
          "ungrounded_observation_invitation",
          "observation invitations require visual evidence",
          ["dialogueCues", index, "visualEvidenceIds"],
        ),
      );
    }
  });

  if (knowledge.imageRevision === null) {
    const visualEvidenceCount = knowledge.claims.reduce(
      (count, claim) => count + claim.visualEvidence.length,
      0,
    );
    if (visualEvidenceCount > 0) {
      issues.push(
        issue(
          "visual_evidence_without_image",
          "metadata-only packages cannot contain visual evidence",
          ["claims"],
        ),
      );
    }
    if (knowledge.content.palette.length > 0) {
      issues.push(
        issue(
          "palette_without_image",
          "metadata-only packages cannot publish a generated palette",
          ["content", "palette"],
        ),
      );
    }
    if (knowledge.content.accessibility) {
      issues.push(
        issue(
          "visual_description_without_image",
          "metadata-only packages cannot publish a visual accessibility description",
          ["content", "accessibility"],
        ),
      );
    }
  }

  if (knowledge.content.palette.length > 0) {
    const total = knowledge.content.palette.reduce(
      (sum, color) => sum + color.proportion,
      0,
    );
    if (Math.abs(total - 1) > 0.02) {
      issues.push(
        issue(
          "invalid_palette_proportions",
          "palette proportions must add up to 1 ± 0.02",
          ["content", "palette"],
        ),
      );
    }
  }

  knowledge.content.tags.forEach((tag, index) => {
    if (tag.confidence === "low") {
      issues.push(
        issue(
          "low_confidence_public_tag",
          "low-confidence tags are internal candidates and cannot be published",
          ["content", "tags", index, "confidence"],
        ),
      );
    }
  });

  return issues;
}

export function applyDeterministicReview(
  knowledge: ArtworkKnowledgePackage,
): ArtworkKnowledgePackage {
  const deterministicIssues = evaluateStage6Candidate(knowledge);
  return {
    ...knowledge,
    review: {
      ...knowledge.review,
      status: deterministicIssues.some((item) => item.severity === "error")
        ? "blocked"
        : knowledge.review.status,
      issues: [...knowledge.review.issues, ...deterministicIssues],
    },
  };
}
