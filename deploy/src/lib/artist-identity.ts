export type ArtistAttributionType =
  | "attributed_to"
  | "possibly_by"
  | "workshop_of"
  | "studio_of"
  | "circle_of"
  | "follower_of"
  | "school_of"
  | "after"
  | "manner_of"
  | "formerly_attributed_to";

const ATTRIBUTION_PREFIXES: Array<{
  type: ArtistAttributionType;
  pattern: RegExp;
}> = [
  { type: "formerly_attributed_to", pattern: /^formerly\s+attributed\s+to\s+/i },
  { type: "attributed_to", pattern: /^attributed\s+to\s+/i },
  { type: "possibly_by", pattern: /^(?:possibly|probably)\s+by\s+/i },
  { type: "workshop_of", pattern: /^workshop\s+of\s+/i },
  { type: "studio_of", pattern: /^studio\s+of\s+/i },
  { type: "circle_of", pattern: /^circle\s+of\s+/i },
  { type: "follower_of", pattern: /^follower\s+of\s+/i },
  { type: "school_of", pattern: /^school\s+of\s+/i },
  { type: "manner_of", pattern: /^manner\s+of\s+/i },
  { type: "after", pattern: /^after\s+/i },
];

function oneLine(value: string) {
  return value.split(/\r?\n/)[0]?.trim() || value.trim();
}

function stripDetails(value: string) {
  return oneLine(value)
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
}

function attributionFrom(value: string) {
  for (const prefix of ATTRIBUTION_PREFIXES) {
    if (prefix.pattern.test(value)) {
      return {
        attributionType: prefix.type,
        canonicalName: value.replace(prefix.pattern, "").trim(),
      };
    }
  }
  return { attributionType: null, canonicalName: value };
}

export function normalizeArtistIdentity(display: string, preferredCanonicalName?: string | null) {
  const displayBase = stripDetails(display);
  const preferredBase = preferredCanonicalName ? stripDetails(preferredCanonicalName) : "";
  const displayAttribution = attributionFrom(displayBase);
  const preferredAttribution = preferredBase ? attributionFrom(preferredBase) : null;
  const canonicalName =
    preferredAttribution?.canonicalName || displayAttribution.canonicalName || displayBase;
  const parentheticalDetails = oneLine(display)
    .match(/\(([^)]*)\)\s*$/)?.[1]
    ?.trim();
  const multilineDetails = display.split(/\r?\n/).slice(1).join(", ").trim();

  return {
    display,
    canonicalName,
    attributionType:
      displayAttribution.attributionType ?? preferredAttribution?.attributionType ?? null,
    details: parentheticalDetails || multilineDetails,
  };
}
