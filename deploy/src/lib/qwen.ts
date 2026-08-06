const DEFAULT_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const DEFAULT_MODEL = "qwen-plus";
const MAX_MESSAGES = 13;
const MAX_TOTAL_CHARACTERS = 24_000;
const REQUEST_TIMEOUT_MS = 30_000;

export type QwenMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type QwenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type QwenJsonResult<T> = {
  data: T;
  model: string;
  requestId: string | null;
  usage: QwenUsage;
};

type QwenResponseBody = {
  id?: string;
  model?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    code?: string;
    message?: string;
  };
};

export class QwenRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;

  constructor(message: string, options: { status: number; code: string; retryable: boolean }) {
    super(message);
    this.name = "QwenRequestError";
    this.status = options.status;
    this.code = options.code;
    this.retryable = options.retryable;
  }
}

function qwenConfig() {
  const apiKey = process.env.DASHSCOPE_API_KEY?.trim();
  const baseUrl = (process.env.QWEN_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const model = process.env.QWEN_MODEL?.trim() || DEFAULT_MODEL;

  if (!apiKey) {
    throw new QwenRequestError("Qwen API key is not configured", {
      status: 503,
      code: "qwen_not_configured",
      retryable: false,
    });
  }

  let endpoint: URL;
  try {
    endpoint = new URL(`${baseUrl}/chat/completions`);
  } catch {
    throw new QwenRequestError("Qwen base URL is invalid", {
      status: 500,
      code: "qwen_invalid_base_url",
      retryable: false,
    });
  }
  if (endpoint.protocol !== "https:") {
    throw new QwenRequestError("Qwen base URL must use HTTPS", {
      status: 500,
      code: "qwen_insecure_base_url",
      retryable: false,
    });
  }

  return { apiKey, endpoint, model };
}

function prepareMessages(messages: QwenMessage[]): QwenMessage[] {
  if (messages.length === 0 || messages.length > MAX_MESSAGES) {
    throw new QwenRequestError("Qwen message count is outside the allowed range", {
      status: 400,
      code: "qwen_invalid_messages",
      retryable: false,
    });
  }

  const normalized = messages.map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }));
  if (normalized.some((message) => !message.content)) {
    throw new QwenRequestError("Qwen messages cannot be empty", {
      status: 400,
      code: "qwen_invalid_messages",
      retryable: false,
    });
  }

  const totalCharacters = normalized.reduce((sum, message) => sum + message.content.length, 0);
  if (totalCharacters > MAX_TOTAL_CHARACTERS) {
    throw new QwenRequestError("Qwen conversation is too long", {
      status: 413,
      code: "qwen_context_too_large",
      retryable: false,
    });
  }

  const jsonInstruction = "Return the response as valid JSON.";
  const systemIndex = normalized.findIndex((message) => message.role === "system");
  if (systemIndex >= 0) {
    normalized[systemIndex] = {
      ...normalized[systemIndex],
      content: `${normalized[systemIndex].content}\n${jsonInstruction}`,
    };
  } else {
    normalized.unshift({ role: "system", content: jsonInstruction });
  }
  return normalized;
}

function isRetryableStatus(status: number) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

export function getQwenStatus() {
  return {
    configured: Boolean(process.env.DASHSCOPE_API_KEY?.trim()),
    provider: "qwen" as const,
    model: process.env.QWEN_MODEL?.trim() || DEFAULT_MODEL,
  };
}

export async function createQwenJsonResponse<T>(
  messages: QwenMessage[],
  parse: (value: unknown) => T,
  options: { signal?: AbortSignal } = {},
): Promise<QwenJsonResult<T>> {
  const { apiKey, endpoint, model } = qwenConfig();
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = options.signal ? AbortSignal.any([options.signal, timeoutSignal]) : timeoutSignal;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: prepareMessages(messages),
        response_format: { type: "json_object" },
        enable_thinking: false,
      }),
      cache: "no-store",
      signal,
    });
  } catch {
    const timedOut = timeoutSignal.aborted && !options.signal?.aborted;
    throw new QwenRequestError(
      timedOut ? "Qwen request timed out" : "Qwen service could not be reached",
      {
        status: timedOut ? 504 : 502,
        code: timedOut ? "qwen_timeout" : "qwen_unreachable",
        retryable: true,
      },
    );
  }

  const body = (await response.json().catch(() => ({}))) as QwenResponseBody;
  if (!response.ok) {
    throw new QwenRequestError(body.error?.message || "Qwen request failed", {
      status: response.status,
      code: body.error?.code || "qwen_request_failed",
      retryable: isRetryableStatus(response.status),
    });
  }

  const content = body.choices?.[0]?.message?.content;
  if (!content) {
    throw new QwenRequestError("Qwen returned an empty response", {
      status: 502,
      code: "qwen_empty_response",
      retryable: true,
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new QwenRequestError("Qwen returned invalid JSON", {
      status: 502,
      code: "qwen_invalid_json",
      retryable: true,
    });
  }

  return {
    data: parse(parsed),
    model: body.model || model,
    requestId: body.id || response.headers.get("x-request-id"),
    usage: {
      inputTokens: body.usage?.prompt_tokens || 0,
      outputTokens: body.usage?.completion_tokens || 0,
      totalTokens: body.usage?.total_tokens || 0,
    },
  };
}
