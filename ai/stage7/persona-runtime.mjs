function requireArtworkContext(persona, artworkId) {
  const normalizedId = artworkId.startsWith("artic:")
    ? artworkId
    : `artic:${artworkId}`;
  const context = persona.artworkContexts?.[normalizedId];
  if (!context) {
    const error = new Error(`No reviewed local context for ${normalizedId}`);
    error.code = "PERSONA_CONTEXT_UNAVAILABLE";
    throw error;
  }
  return context;
}

function resolveEvidence(persona, claimIds) {
  const wantedClaims = new Set(claimIds);
  const wantedSources = new Set(
    persona.claims
      .filter((claim) => wantedClaims.has(claim.claimId))
      .flatMap((claim) =>
        claim.sourceRefs.map((reference) => reference.sourceId),
      ),
  );
  return persona.sources
    .filter((source) => wantedSources.has(source.sourceId))
    .map((source) => ({
      id: source.sourceId,
      type: source.kind,
      title: source.title,
      description: source.publisher ?? "",
      url: source.url,
    }));
}

export function buildLocalPersonaIntroduction({ persona, artworkId }) {
  const context = requireArtworkContext(persona, artworkId);
  const template = context.openingTemplates[0];
  if (!template) {
    const error = new Error(
      `No reviewed local opening for ${context.artworkId}`,
    );
    error.code = "PERSONA_OPENING_UNAVAILABLE";
    throw error;
  }
  return {
    answer: template.text,
    englishAnswer: template.englishText,
    responseType: template.responseType,
    perspective: template.perspective,
    evidence: resolveEvidence(persona, template.claimIds),
    disclosure: persona.disclosure.short,
    model: "reviewed-local-opening",
    provider: "local",
    degraded: true,
  };
}

export function buildPersonaUnavailable({ persona }) {
  return {
    error: persona.fallback.unavailableMessage,
    disclosure: persona.disclosure.short,
    code: "PERSONA_MODEL_UNAVAILABLE",
    retryable: true,
  };
}
