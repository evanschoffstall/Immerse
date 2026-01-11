import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { campaigns } from "./campaigns";

export const beings = pgTable(
  "beings",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    title: text("title"),
    type: text("type"),
    age: text("age"),
    sex: text("sex"),
    pronouns: text("pronouns"),
    location: text("location"),
    family: text("family"),
    description: text("description"),
    imageId: text("imageId"),
    isPrivate: boolean("isPrivate").notNull().default(false),
    birthCalendarId: text("birthCalendarId"),
    birthDate: text("birthDate"),
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
    unique("beings_campaign_slug_unique").on(table.campaignId, table.slug),
    index("beings_campaign_id_idx").on(table.campaignId),
    index("beings_created_by_id_idx").on(table.createdById),
    index("beings_deleted_at_idx").on(table.deletedAt),
  ]
);

export type Being = typeof beings.$inferSelect;
export type NewBeing = typeof beings.$inferInsert;
