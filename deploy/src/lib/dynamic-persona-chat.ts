import { z } from "zod";

import type { ArtistProfile } from "@/src/components/chat-prototype";
import type { Artwork } from "@/src/schemas/catalog";

export type DynamicChatCitation = {
  number: number;
  title: string;
  publisher: string;
  url: string;
  locator: Record<string, string>;
  excerpt: string;
  supportText: string;
};

const dynamicDialogueSchema = z
  .object({
    answer: z.string().trim().min(1).max(4_000),
    englishAnswer: z.string().trim().min(1).max(4_000),
    responseType: z.literal("imagined_response"),
    segments: z
      .array(
        z
          .object({
            chinese: z.string().trim().min(1).max(2_000),
            english: z.string().trim().min(1).max(2_000),
            citationNumbers: z.array(z.number().int().positive()).max(4),
          })
          .strict(),
      )
      .min(1)
      .max(4),
  })
  .strict();

export type DynamicDialogue = z.infer<typeof dynamicDialogueSchema>;

function cleanArtistName(artwork: Artwork) {
  return (artwork.artist?.name || artwork.display.artistDisplay)
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
}

export function hasNamedArtist(artwork: Artwork) {
  const artist = cleanArtistName(artwork);
  return Boolean(
    artwork.artist &&
    artist &&
    !/^(?:unknown artist|artist unknown|anonymous|unknown|佚名|无名氏)$/i.test(artist),
  );
}

function museumSupportText(artwork: Artwork) {
  return [
    `${artwork.display.title} is recorded by the Art Institute of Chicago as a work by ${artwork.display.artistDisplay}.`,
    artwork.display.dateDisplay ? `The recorded date is ${artwork.display.dateDisplay}.` : "",
    artwork.display.mediumDisplay ? `The recorded medium is ${artwork.display.mediumDisplay}.` : "",
    artwork.description?.text || "",
  ]
    .filter(Boolean)
    .join(" ");
}

function profileSupportText(profile: ArtistProfile) {
  return [
    `${profile.name} (${profile.life})`,
    `Associated styles: ${profile.style.map(({ english }) => english).join(", ")}.`,
    `Recurring subjects: ${profile.subjects.map(({ english }) => english).join(", ")}.`,
    profile.legacy.english,
  ]
    .filter(Boolean)
    .join(" ");
}

function createCitations(artwork: Artwork, profile?: ArtistProfile | null) {
  const citations: DynamicChatCitation[] = [
    {
      number: 1,
      title: artwork.display.title,
      publisher: "The Art Institute of Chicago",
      url: artwork.source.recordUrl,
      locator: { artworkId: artwork.sourceId },
      excerpt: artwork.description?.text || "",
      supportText: museumSupportText(artwork),
    },
  ];
  const profileSource = profile?.sources?.find((source) => /^https:\/\//.test(source.url));
  if (profile && profileSource) {
    citations.push({
      number: 2,
      title: `${profile.name} biography`,
      publisher: profileSource.label,
      url: profileSource.url,
      locator: { artist: profile.name },
      excerpt: "",
      supportText: profileSupportText(profile),
    });
  }
  return citations;
}

function personaContext(artwork: Artwork, profile?: ArtistProfile | null) {
  const artistName = cleanArtistName(artwork);
  const profileText = profile
    ? [
        `Artist profile: ${profile.name} / ${profile.localizedName}.`,
        `Life and place: ${profile.life}; ${profile.country} / ${profile.localizedCountry}.`,
        `Styles: ${profile.style
          .map(({ english, chinese }) => `${english} / ${chinese}`)
          .join(", ")}.`,
        `Subjects: ${profile.subjects
          .map(({ english, chinese }) => `${english} / ${chinese}`)
          .join(", ")}.`,
        `Legacy summary: ${profile.legacy.english} / ${profile.legacy.chinese}.`,
      ].join("\n")
    : "No separate artist biography is available. Do not invent biographical facts or a distinctive speaking manner.";
  return [
    `Artist: ${artistName}`,
    `Museum artist display: ${artwork.display.artistDisplay}`,
    profileText,
    "",
    `Current artwork: ${artwork.display.title}`,
    `Date: ${artwork.display.dateDisplay || "not supplied"}`,
    `Medium: ${artwork.display.mediumDisplay || "not supplied"}`,
    `Dimensions: ${artwork.display.dimensionsDisplay || "not supplied"}`,
    `Classification: ${artwork.classification.artworkTypeTitle}`,
    `Museum description: ${artwork.description?.text || "not supplied"}`,
  ].join("\n");
}

export function buildDynamicPersonaAssembly(artwork: Artwork, profile?: ArtistProfile | null) {
  if (!hasNamedArtist(artwork)) return null;
  const citations = createCitations(artwork, profile);
  const availableCitationNumbers = citations.map(({ number }) => number);
  return {
    citations,
    instructions: `You are producing an explicitly imagined conversation with a historical artist.

Universal rules:
- Answer in the first person as a restrained imaginative reconstruction, never as a real communication with the deceased artist.
- Use only the supplied artist and artwork context for factual claims.
- Never invent biography, intentions, events, quotations, relationships, dates, techniques, or provenance.
- Separate observation and interpretation from fact. When context is insufficient, say so plainly.
- Discuss the user's modern hypothetical as a hypothetical; do not claim the artist actually encountered it.
- Keep the answer focused on the current artwork unless the user asks more broadly.
- Produce natural Chinese and English versions with the same meaning.
- Split the answer into 1 to 4 aligned bilingual segments.
- Citation 1 supports museum artwork facts. Citation 2, when available, supports artist-profile facts.
- Interpretive or hypothetical segments may have no citation. Factual segments must cite the relevant supplied source.
- The responseType must always be "imagined_response".

Available citation numbers: ${availableCitationNumbers.join(", ")}

Grounded context:
${personaContext(artwork, profile)}

Return exactly this JSON shape:
{
  "answer": "complete Chinese answer",
  "englishAnswer": "complete English answer",
  "responseType": "imagined_response",
  "segments": [
    {
      "chinese": "Chinese segment",
      "english": "matching English segment",
      "citationNumbers": [1]
    }
  ]
}`,
  };
}

export function parseDynamicDialogue(value: unknown, maxCitationNumber: number) {
  const dialogue = dynamicDialogueSchema.parse(value);
  if (
    dialogue.segments.some((segment) =>
      segment.citationNumbers.some((number) => number > maxCitationNumber),
    )
  ) {
    throw new Error("Dynamic dialogue referenced an unavailable citation");
  }
  const chinese = dialogue.segments.map((segment) => segment.chinese).join("");
  const english = dialogue.segments.map((segment) => segment.english).join(" ");
  return {
    ...dialogue,
    answer: chinese,
    englishAnswer: english,
  };
}

export function buildDynamicPersonaOpening(artwork: Artwork, profile?: ArtistProfile | null) {
  if (!hasNamedArtist(artwork)) return undefined;
  const artist = cleanArtistName(artwork);
  const date = artwork.display.dateDisplay;
  const citations = createCitations(artwork, profile);
  const chinese = `我是${artist}的想象性声音。关于《${artwork.display.title}》，我们可以从${
    date ? `馆藏记录的年代“${date}”、` : ""
  }画面、材料和你此刻的观看感受谈起。`;
  const english = `I am an imagined voice for ${artist}. We can approach ${artwork.display.title} through ${
    date ? `its recorded date (${date}), ` : ""
  }its appearance, materials, and your experience of looking.`;
  return {
    chinese,
    english,
    responseType: "imagined_response" as const,
    citations,
    segments: [
      {
        chinese,
        english,
        citationNumbers: [1],
      },
    ],
  };
}
