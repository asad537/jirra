import { desc, eq, inArray, max, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { activities, projects, tickets } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
const STATUSES = ["To Do", "In Progress", "In Review", "Done"] as const,
  PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const,
  TYPES = ["Task", "Bug", "Feature", "Improvement"] as const,
  ASSIGNEES = ["AK", "ZM", "SR", "HN"] as const;
const seed = [
  [
    124,
    "Invoice PDF alignment breaks on mobile",
    "Bug",
    "Urgent",
    "To Do",
    "AK",
    "Today",
    "Mobile",
  ],
  [
    118,
    "Add bulk print option to orders",
    "Feature",
    "High",
    "To Do",
    "ZM",
    "Aug 24",
    "Orders",
  ],
  [
    121,
    "Improve customer search speed",
    "Improvement",
    "Medium",
    "To Do",
    "SR",
    "Aug 28",
    "Performance",
  ],
  [
    119,
    "Payment status not syncing",
    "Bug",
    "Urgent",
    "In Progress",
    "HN",
    "Today",
    "Payments",
  ],
  [
    116,
    "Redesign order detail header",
    "Task",
    "High",
    "In Progress",
    "AK",
    "Aug 23",
    "UI",
  ],
  [
    112,
    "Add CSV import validation",
    "Feature",
    "Medium",
    "In Review",
    "ZM",
    "Aug 25",
    "Import",
  ],
  [
    109,
    "Update product tax calculations",
    "Bug",
    "High",
    "In Review",
    "SR",
    "Aug 22",
    "Billing",
  ],
  [
    104,
    "Add keyboard shortcuts",
    "Improvement",
    "Low",
    "Done",
    "HN",
    null,
    "UX",
  ],
  [101, "Migrate customer notes", "Task", "Medium", "Done", "AK", null, "Data"],
] as const;
async function actor() {
  const u = await getChatGPTUser();
  if (u) return { id: u.userId, name: u.fullName || u.email };
  if (process.env.NODE_ENV !== "production")
    return { id: "dev-user", name: "Ahmed Khan" };
  return null;
}
const valid = <T extends readonly string[]>(v: T, x: unknown): x is T[number] =>
  typeof x === "string" && v.includes(x as T[number]);
export async function GET(request: Request) {
  const a = await actor();
  if (!a)
    return Response.json({ error: "Authentication required" }, { status: 401 });
  try {
    const db = getDb();
    const projectKey = (
      new URL(request.url).searchParams.get("project") || "PF"
    ).toUpperCase();
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tickets);
    if (!Number(count))
      for (const [
        number,
        title,
        type,
        priority,
        status,
        assignee,
        dueDate,
        label,
      ] of seed)
        await db.insert(tickets).values({
          id: `PF-${number}`,
          projectKey: "PF",
          number,
          title,
          type,
          priority,
          status,
          assignee,
          dueDate,
          label,
          reporterId: "system",
          reporterName: "TaskFlow",
        });
    const ticketRows = await db
      .select()
      .from(tickets)
      .where(eq(tickets.projectKey, projectKey))
      .orderBy(desc(tickets.updatedAt), desc(tickets.number));
    const activityRows = ticketRows.length
      ? await db
          .select()
          .from(activities)
          .where(
            inArray(
              activities.ticketId,
              ticketRows.map((t) => t.id),
            ),
          )
          .orderBy(desc(activities.createdAt), desc(activities.id))
      : [];
    return Response.json(
      { tickets: ticketRows, activities: activityRows, user: a },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Database error" },
      { status: 500 },
    );
  }
}
export async function POST(request: Request) {
  const a = await actor();
  if (!a)
    return Response.json({ error: "Authentication required" }, { status: 401 });
  try {
    const b = (await request.json()) as Record<string, unknown>,
      title = typeof b.title === "string" ? b.title.trim() : "",
      projectKey =
        typeof b.projectKey === "string" ? b.projectKey.toUpperCase() : "PF";
    if (title.length < 3 || title.length > 180)
      return Response.json(
        { error: "Title must be 3–180 characters" },
        { status: 400 },
      );
    const type = valid(TYPES, b.type) ? b.type : "Task",
      priority = valid(PRIORITIES, b.priority) ? b.priority : "Medium",
      assignee = valid(ASSIGNEES, b.assignee) ? b.assignee : "AK",
      db = getDb();
    const projectExists = await db
      .select({ key: projects.key })
      .from(projects)
      .where(eq(projects.key, projectKey))
      .limit(1);
    if (!projectExists.length)
      return Response.json({ error: "Project not found" }, { status: 404 });
    const [row] = await db
        .select({ number: max(tickets.number) })
        .from(tickets)
        .where(eq(tickets.projectKey, projectKey)),
      number = (row.number || 0) + 1,
      id = `${projectKey}-${number}`;
    const [ticket] = await db
      .insert(tickets)
      .values({
        id,
        projectKey,
        number,
        title,
        description:
          typeof b.description === "string" ? b.description.slice(0, 5000) : "",
        type,
        priority,
        status: "To Do",
        assignee,
        label: "New",
        reporterId: a.id,
        reporterName: a.name,
      })
      .returning();
    await db.insert(activities).values({
      ticketId: id,
      kind: "created",
      authorId: a.id,
      authorName: a.name,
      body: "Created this ticket",
    });
    return Response.json({ ticket }, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Unable to create ticket" },
      { status: 500 },
    );
  }
}
export async function PATCH(request: Request) {
  const a = await actor();
  if (!a)
    return Response.json({ error: "Authentication required" }, { status: 401 });
  try {
    const b = (await request.json()) as Record<string, unknown>,
      id = typeof b.id === "string" ? b.id : "";
    if (!valid(STATUSES, b.status))
      return Response.json({ error: "Invalid status" }, { status: 400 });
    const db = getDb(),
      [current] = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, id))
        .limit(1);
    if (!current)
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    if (current.status === b.status) return Response.json({ ticket: current });
    const [ticket] = await db
      .update(tickets)
      .set({ status: b.status, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(tickets.id, id))
      .returning();
    await db.insert(activities).values({
      ticketId: id,
      kind: "status",
      authorId: a.id,
      authorName: a.name,
      body:
        typeof b.comment === "string" ? b.comment.trim().slice(0, 3000) : "",
      fromStatus: current.status,
      toStatus: b.status,
    });
    return Response.json({ ticket });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Unable to update ticket" },
      { status: 500 },
    );
  }
}
