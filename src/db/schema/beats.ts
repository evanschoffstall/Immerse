import {
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { scenes } from "./scenes";

export const beats = pgTable(
  "beats",
  {
    id: text("id").primaryKey(),
    text: text("text").notNull(), // Simple text field
    timestamp: timestamp("timestamp").notNull(), // Timestamp for the beat
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull(),
    deletedAt: timestamp("deletedAt"),
    sceneId: text("sceneId")
      .notNull()
      .references(() => scenes.id, { onDelete: "cascade" }),
    createdById: text("createdById").notNull(),
    updatedById: text("updatedById"),
  },
  (table) => [
    index("beats_scene_id_idx").on(table.sceneId),
    index("beats_timestamp_idx").on(table.timestamp),
    index("beats_created_by_id_idx").on(table.createdById),
    index("beats_deleted_at_idx").on(table.deletedAt),
  ]
);

export type Beat = typeof beats.$inferSelect;
export type NewBeat = typeof beats.$inferInsert;
