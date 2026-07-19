export const DEFAULT_TIMEOUT_MS = 10_000;

export async function fetchJson(url, { fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      headers: { accept: "application/json", "user-agent": "CanvasMuseum/0.1" },
      signal: controller.signal,
    });
    if (!response.ok) {
      const error = new Error(`上游数据源返回 ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") throw new Error("上游数据源请求超时");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function cleanText(value) {
  if (!value) return null;
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim() || null;
}

export function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== null && item !== undefined && item !== ""));
}

export function uniqueStrings(values = []) {
  return [...new Set((values || []).filter(Boolean).map(String))];
}
