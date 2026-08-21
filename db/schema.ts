import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const tickets = sqliteTable(
  "tickets",
  {
    id: text("id").primaryKey(),
    projectKey: text("project_key").notNull().default("PF"),
    number: integer("number").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    type: text("type").notNull(),
    priority: text("priority").notNull(),
    status: text("status").notNull(),
    assignee: text("assignee").notNull(),
    reporterId: text("reporter_id").notNull(),
    reporterName: text("reporter_name").notNull(),
    dueDate: text("due_date"),
    label: text("label").notNull().default(""),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    index("idx_tickets_project_status").on(t.projectKey, t.status),
    index("idx_tickets_assignee").on(t.assignee),
  ],
);
export const activities = sqliteTable(
  "activities",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    authorId: text("author_id").notNull(),
    authorName: text("author_name").notNull(),
    body: text("body").notNull().default(""),
    fromStatus: text("from_status"),
    toStatus: text("to_status"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_activities_ticket_created").on(t.ticketId, t.createdAt)],
);
