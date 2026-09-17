import { getDatabase } from "@/db";
import { applicationSchema } from "@/lib/application-schema";

const response = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });

export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return response({ error: "Send your application from the NEXZZA website." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return response({ error: "Send the application as JSON." }, 415);
  if (Number(request.headers.get("content-length")) > 8192) return response({ error: "Application is too large." }, 413);
  let input: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return response({ error: "Application details are missing." }, 400);
    const decoder = new TextDecoder();
    let length = 0;
    let text = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 8192) { await reader.cancel(); return response({ error: "Application is too large." }, 413); }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    input = JSON.parse(text);
  } catch { return response({ error: "We couldn’t read your application. Please try again." }, 400); }
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) return response({ error: parsed.error.issues[0].message }, 400);
  const data = parsed.data;
  if (data.website) return response({ error: "We couldn’t verify this submission. Please reload and try again." }, 400);
  try {
    const db = getDatabase();
    // A unique email makes retries safe and prevents duplicate applications.
    // There is no public read endpoint for applicants' private details.
    await db.prepare(
      "INSERT INTO applications (id, player_name, email, game, platform, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?) ON CONFLICT(email) DO NOTHING"
    ).bind(crypto.randomUUID(), data.playerName, data.email, data.game, data.platform, data.message, new Date().toISOString()).run();
    // Identical response for existing emails avoids exposing membership.
    return response({ ok: true, status: "received" }, 201);
  } catch (error) {
    console.error("Application save failed", error instanceof Error ? error.name : "DatabaseError");
    return response({ error: "Applications are temporarily unavailable. Your details are still here — please try again shortly." }, 503);
  }
}
