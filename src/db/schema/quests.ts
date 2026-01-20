import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { campaigns } from "./campaigns";

export const quests = pgTable(
  "quests",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    type: text("type"),
    description: text("description"),
    date: text("date"),
    image: text("image"),
    location: text("location"),
    status: text("status").default("active"),
    isPrivate: boolean("isPrivate").notNull().default(false),
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
    unique("quests_campaign_slug_unique").on(table.campaignId, table.slug),
    index("quests_campaign_id_idx").on(table.campaignId),
    index("quests_created_by_id_idx").on(table.createdById),
    index("quests_deleted_at_idx").on(table.deletedAt),
  ]
);

export type Quest = typeof quests.$inferSelect;
export type NewQuest = typeof quests.$inferInsert;
