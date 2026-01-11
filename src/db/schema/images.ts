import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { campaigns } from "./campaigns";

export const images = pgTable(
  "images",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    ext: text("ext").notNull(),
    size: integer("size").notNull(),
    width: integer("width"),
    height: integer("height"),
    focusX: integer("focusX"),
    focusY: integer("focusY"),
    isFolder: boolean("isFolder").notNull().default(false),
    isDefault: boolean("isDefault").notNull().default(false),
    visibility: integer("visibility").notNull().default(0),
    campaignId: text("campaignId")
      .notNull()
      .references(() => campaigns.id, { onDelete: "restrict" }),
    folderId: text("folderId"),
    createdById: text("createdById").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull(),
    deletedAt: timestamp("deletedAt"),
  },
  (table) => [
    index("images_campaign_id_idx").on(table.campaignId),
    index("images_folder_id_idx").on(table.folderId),
    index("images_is_folder_idx").on(table.isFolder),
    index("images_created_by_id_idx").on(table.createdById),
    index("images_deleted_at_idx").on(table.deletedAt),
  ]
);

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
