import { getQwenStatus } from "@/src/lib/qwen";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(getQwenStatus(), {
    headers: { "Cache-Control": "no-store" },
  });
}
