import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { activities, tickets } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
export async function POST(request: Request) {
  const u = await getChatGPTUser(),
    a = u
      ? { id: u.userId, name: u.fullName || u.email }
      : process.env.NODE_ENV !== "production"
        ? { id: "dev-user", name: "Ahmed Khan" }
        : null;
  if (!a)
    return Response.json({ error: "Authentication required" }, { status: 401 });
  try {
    const b = (await request.json()) as { ticketId?: string; body?: string },
      ticketId = b.ticketId?.trim() || "",
      text = b.body?.trim() || "";
    if (!text || text.length > 3000)
      return Response.json(
        { error: "Comment must be 1–3000 characters" },
        { status: 400 },
      );
    const db = getDb(),
      [ticket] = await db
        .select({ id: tickets.id })
        .from(tickets)
        .where(eq(tickets.id, ticketId))
        .limit(1);
    if (!ticket)
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    const [activity] = await db
      .insert(activities)
      .values({
        ticketId,
        kind: "comment",
        authorId: a.id,
        authorName: a.name,
        body: text,
      })
      .returning();
    await db
      .update(tickets)
      .set({ updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(tickets.id, ticketId));
    return Response.json({ activity }, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Unable to add comment" },
      { status: 500 },
    );
  }
}
