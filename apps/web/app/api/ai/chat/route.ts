import {
  assemblePersonaDialogue,
  finalizePersonaDialogue,
} from "../../../../../../ai/stage7/dialogue-assembler.mjs";
import { z } from "zod";

import { getReviewedPersonaForArtwork } from "@/src/lib/persona-openings";
import { createQwenJsonResponse, QwenRequestError, type QwenMessage } from "@/src/lib/qwen";

export const dynamic = "force-dynamic";

const chatRequestSchema = z
  .object({
    artworkId: z.string().regex(/^artic:\d+$/),
    message: z.string().trim().min(1).max(2_000),
    history: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            content: z.string().trim().min(1).max(4_000),
          })
          .strict(),
      )
      .max(10)
      .default([]),
  })
  .strict();

function alignEnglishSegments(modelOutput: unknown) {
  if (!modelOutput || typeof modelOutput !== "object") return modelOutput;
  const output = modelOutput as {
    answer?: unknown;
    englishAnswer?: unknown;
    englishSegments?: unknown;
    segments?: unknown;
  };
  if (
    typeof output.englishAnswer !== "string" ||
    !Array.isArray(output.segments) ||
    output.segments.length === 0
  ) {
    return modelOutput;
  }

  const requestedCount = output.segments.length;
  if (
    Array.isArray(output.englishSegments) &&
    output.englishSegments.length === requestedCount &&
    output.englishSegments.every((segment) => typeof segment === "string")
  ) {
    return {
      ...output,
      englishAnswer: output.englishSegments.join(""),
    };
  }

  const sentences =
    output.englishAnswer
      .match(/[^.!?]+(?:[.!?]+|$)/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) || [];
  const units =
    sentences.length >= requestedCount
      ? sentences
      : output.englishAnswer.trim().split(/\s+/).filter(Boolean);
  const aligned = Array.from({ length: requestedCount }, (_, index) => {
    const start = Math.floor((index * units.length) / requestedCount);
    const end = Math.floor(((index + 1) * units.length) / requestedCount);
    const text = units.slice(start, end).join(" ");
    return index < requestedCount - 1 && text ? `${text} ` : text;
  });
  return {
    ...output,
    englishSegments: aligned,
    englishAnswer: aligned.join(""),
  };
}

export async function POST(request: Request) {
  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "聊天请求格式无效。", code: "invalid_chat_request", retryable: false },
      { status: 400 },
    );
  }

  const persona = getReviewedPersonaForArtwork(parsed.data.artworkId);
  if (!persona) {
    return Response.json(
      {
        error: "这件作品尚未开放艺术家对话。",
        code: "persona_context_unavailable",
        retryable: false,
      },
      { status: 404 },
    );
  }

  const assembly = assemblePersonaDialogue({
    persona,
    artworkId: parsed.data.artworkId,
  });
  const messages: QwenMessage[] = [
    {
      role: "system",
      content: `${assembly.instructions}\n\n输出必须符合此 JSON Schema：${JSON.stringify(assembly.outputSchema)}`,
    },
    ...parsed.data.history,
    { role: "user", content: parsed.data.message },
  ];

  try {
    const generated = await createQwenJsonResponse(messages, (value) => value);
    const dialogue = finalizePersonaDialogue({
      assembly,
      modelOutput: alignEnglishSegments(generated.data),
      modelRevision: generated.model,
    });
    const citations = dialogue.evidence.map(
      (
        reference: {
          sourceRefId: string;
          sourceId: string;
          locator?: Record<string, string>;
          excerpt?: string;
        },
        index: number,
      ) => {
        const source = assembly.sources.find(
          (candidate: { sourceId: string }) => candidate.sourceId === reference.sourceId,
        );
        const supportText = assembly.claims
          .filter((claim: { sourceRefs: Array<{ sourceRefId: string }> }) =>
            claim.sourceRefs.some(
              (candidate) => candidate.sourceRefId === reference.sourceRefId,
            ),
          )
          .map((claim: { text: string }) => claim.text)
          .join(" ");
        return {
          number: index + 1,
          title: source?.title || reference.sourceId,
          publisher: source?.publisher || "",
          url: reference.locator?.fragmentUrl || source?.url || "",
          locator: reference.locator || {},
          excerpt: reference.excerpt || "",
          supportText,
        };
      },
    );
    const citationNumberByRefId = new Map(
      dialogue.evidence.map((reference: { sourceRefId: string }, index: number) => [
        reference.sourceRefId,
        index + 1,
      ]),
    );
    const displaySegments = dialogue.segments.map(
      (segment: { text: string; claimIds: string[] }, index: number) => {
        const citationNumbers = [
          ...new Set(
            assembly.claims
              .filter((claim: { claimId: string }) => segment.claimIds.includes(claim.claimId))
              .flatMap((claim: { sourceRefs: Array<{ sourceRefId: string }> }) =>
                claim.sourceRefs.map((reference) =>
                  citationNumberByRefId.get(reference.sourceRefId),
                ),
              )
              .filter((number: number | undefined): number is number => number !== undefined),
          ),
        ];
        return {
          chinese: segment.text,
          english: dialogue.englishSegments[index],
          citationNumbers,
        };
      },
    );
    return Response.json(
      {
        ...dialogue,
        citations,
        displaySegments,
        requestId: generated.requestId,
        usage: generated.usage,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof QwenRequestError) {
      return Response.json(
        {
          error: error.message,
          code: error.code,
          retryable: error.retryable,
        },
        { status: error.status },
      );
    }
    return Response.json(
      {
        error: "回答没有通过人格与证据校验，请重试。",
        code: "persona_response_rejected",
        retryable: true,
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 502 },
    );
  }
}
