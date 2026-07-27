const apiKey = process.env.DASHSCOPE_API_KEY?.trim();
const baseUrl = (
  process.env.QWEN_BASE_URL?.trim() || "https://dashscope.aliyuncs.com/compatible-mode/v1"
).replace(/\/+$/, "");
const model = process.env.QWEN_MODEL?.trim() || "qwen-plus";

if (!apiKey) {
  console.error("Qwen smoke failed: DASHSCOPE_API_KEY is not configured");
  process.exitCode = 1;
} else {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: 'Return valid JSON with exactly one boolean field named "ok".',
        },
        { role: "user", content: "Confirm that the API connection works." },
      ],
      response_format: { type: "json_object" },
      enable_thinking: false,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error(
      `Qwen smoke failed: status=${response.status} code=${body.error?.code || "unknown"}`,
    );
    process.exitCode = 1;
  } else {
    const content = body.choices?.[0]?.message?.content;
    let validJson = false;
    try {
      const parsed = JSON.parse(content);
      validJson = parsed?.ok === true;
    } catch {}

    if (!validJson) {
      console.error("Qwen smoke failed: the model did not return the expected JSON");
      process.exitCode = 1;
    } else {
      console.log(
        [
          "Qwen smoke passed",
          `model=${body.model || model}`,
          `inputTokens=${body.usage?.prompt_tokens || 0}`,
          `outputTokens=${body.usage?.completion_tokens || 0}`,
          `totalTokens=${body.usage?.total_tokens || 0}`,
        ].join(" "),
      );
    }
  }
}
