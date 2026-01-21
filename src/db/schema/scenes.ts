import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { acts } from "./acts";

export const scenes = pgTable(
  "scenes",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    content: text("content"), // Rich text content (Lexical JSON)
    sortOrder: integer("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull(),
    deletedAt: timestamp("deletedAt"),
    actId: text("actId")
      .notNull()
      .references(() => acts.id, { onDelete: "cascade" }),
    createdById: text("createdById").notNull(),
    updatedById: text("updatedById"),
  },
  (table) => [
    unique("scenes_act_slug_unique").on(table.actId, table.slug),
    index("scenes_act_id_idx").on(table.actId),
    index("scenes_created_by_id_idx").on(table.createdById),
    index("scenes_deleted_at_idx").on(table.deletedAt),
  ],
);

export type Scene = typeof scenes.$inferSelect;
export type NewScene = typeof scenes.$inferInsert;
