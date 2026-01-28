import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { campaigns } from "./campaigns";

export const acts = pgTable(
  "acts",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    content: text("content"), // Rich text content (Lexical JSON)
    sortOrder: integer("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull(),
    deletedAt: timestamp("deletedAt"),
    campaignId: text("campaignId")
      .notNull()
      .references(() => campaigns.id, { onDelete: "restrict" }),
    createdById: text("createdById").notNull(),
    updatedById: text("updatedById"),
  },
  (table) => [
    unique("acts_campaign_slug_unique").on(table.campaignId, table.slug),
    index("acts_campaign_id_idx").on(table.campaignId),
    index("acts_created_by_id_idx").on(table.createdById),
    index("acts_updated_by_id_idx").on(table.updatedById),
    index("acts_deleted_at_idx").on(table.deletedAt),
  ],
);

export type Act = typeof acts.$inferSelect;
export type NewAct = typeof acts.$inferInsert;
