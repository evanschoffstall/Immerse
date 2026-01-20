import {
  boolean,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { campaigns } from "./campaigns";

export const campaignSettings = pgTable(
  "campaign_settings",
  {
    id: text("id").primaryKey(),
    campaignId: text("campaignId")
      .notNull()
      .unique()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    bgOpacity: real("bgOpacity").notNull().default(0.6),
    bgBlur: integer("bgBlur").notNull().default(4),
    bgExpandToSidebar: boolean("bgExpandToSidebar").notNull().default(true),
    bgExpandToHeader: boolean("bgExpandToHeader").notNull().default(true),
    headerBgOpacity: real("headerBgOpacity").notNull().default(0.0),
    headerBlur: integer("headerBlur").notNull().default(4),
    sidebarBgOpacity: real("sidebarBgOpacity").notNull().default(0.0),
    sidebarBlur: integer("sidebarBlur").notNull().default(0),
    cardBgOpacity: real("cardBgOpacity").notNull().default(0.6),
    cardBlur: integer("cardBlur").notNull().default(8),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => [index("campaign_settings_campaign_id_idx").on(table.campaignId)]
);

export type CampaignSettings = typeof campaignSettings.$inferSelect;
export type NewCampaignSettings = typeof campaignSettings.$inferInsert;
