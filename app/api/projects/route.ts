import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { projects } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

async function actor() {
  const u = await getChatGPTUser();
  if (u)
    return { id: u.userId, name: u.fullName || u.email, role: "super_admin" };
  if (process.env.NODE_ENV !== "production")
    return { id: "dev-user", name: "Ahmed Khan", role: "super_admin" };
  return null;
}
async function seed(db: ReturnType<typeof getDb>, owner: string) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(projects);
  if (!Number(count))
    await db.insert(projects).values([
      {
        key: "PF",
        name: "PrintFlow",
        description: "Order, billing and production management",
        color: "#ed9276",
        createdBy: owner,
      },
      {
        key: "HD",
        name: "HelpDesk",
        description: "Customer support and service requests",
        color: "#62a4cb",
        createdBy: owner,
      },
      {
        key: "WB",
        name: "Website Build",
        description: "Website design and development",
        color: "#55a987",
        createdBy: owner,
      },
    ]);
}
export async function GET() {
  const a = await actor();
  if (!a)
    return Response.json({ error: "Authentication required" }, { status: 401 });
  try {
    const db = getDb();
    await seed(db, a.id);
    return Response.json(
      {
        projects: await db
          .select()
          .from(projects)
          .where(eq(projects.status, "active"))
          .orderBy(asc(projects.name)),
        user: a,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Unable to load projects" },
      { status: 500 },
    );
  }
}
export async function POST(request: Request) {
  const a = await actor();
  if (!a)
    return Response.json({ error: "Authentication required" }, { status: 401 });
  try {
    const b = (await request.json()) as {
        name?: string;
        key?: string;
        description?: string;
      },
      name = b.name?.trim() || "",
      key = (b.key?.trim() || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (name.length < 3 || name.length > 80)
      return Response.json(
        { error: "Project name must be 3–80 characters" },
        { status: 400 },
      );
    if (key.length < 2 || key.length > 5)
      return Response.json(
        { error: "Project key must be 2–5 letters/numbers" },
        { status: 400 },
      );
    const db = getDb(),
      existing = await db
        .select({ key: projects.key })
        .from(projects)
        .where(eq(projects.key, key))
        .limit(1);
    if (existing.length)
      return Response.json(
        { error: "Project key already exists" },
        { status: 409 },
      );
    const [project] = await db
      .insert(projects)
      .values({
        key,
        name,
        description: b.description?.trim().slice(0, 500) || "",
        createdBy: a.id,
      })
      .returning();
    return Response.json({ project }, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Unable to create project" },
      { status: 500 },
    );
  }
}
