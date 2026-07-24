import type { ArtworkKnowledgePackage } from "../../apps/web/src/schemas/ai-content.ts";

export type PublicArtworkKnowledge = Pick<
  ArtworkKnowledgePackage,
  | "schemaVersion"
  | "packageId"
  | "artworkId"
  | "artworkRevision"
  | "imageRevision"
  | "locale"
  | "content"
  | "publication"
>;

export function toPublicArtworkKnowledge(
  knowledge: ArtworkKnowledgePackage,
): PublicArtworkKnowledge {
  return {
    schemaVersion: knowledge.schemaVersion,
    packageId: knowledge.packageId,
    artworkId: knowledge.artworkId,
    artworkRevision: knowledge.artworkRevision,
    imageRevision: knowledge.imageRevision,
    locale: knowledge.locale,
    content: knowledge.content,
    publication: knowledge.publication,
  };
}

export function toInternalDialogueMaterial(knowledge: ArtworkKnowledgePackage) {
  return {
    artworkId: knowledge.artworkId,
    artworkRevision: knowledge.artworkRevision,
    imageRevision: knowledge.imageRevision,
    locale: knowledge.locale,
    claims: knowledge.claims,
    sources: knowledge.sources,
    dialogueCues: knowledge.dialogueCues,
  };
}
