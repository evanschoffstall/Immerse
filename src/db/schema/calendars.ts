import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { campaigns } from "./campaigns";

export const calendars = pgTable(
  "calendars",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    image: text("image"),
    date: text("date"),
    months: json("months"),
    weekdays: json("weekdays"),
    years: json("years"),
    seasons: json("seasons"),
    moons: json("moons"),
    weekNames: json("weekNames"),
    monthAliases: json("monthAliases"),
    suffix: text("suffix"),
    format: text("format"),
    hasLeapYear: boolean("hasLeapYear").notNull().default(false),
    leapYearAmount: integer("leapYearAmount"),
    leapYearMonth: integer("leapYearMonth"),
    leapYearOffset: integer("leapYearOffset"),
    leapYearStart: integer("leapYearStart"),
    startOffset: integer("startOffset").notNull().default(0),
    skipYearZero: boolean("skipYearZero").notNull().default(false),
    showBirthdays: boolean("showBirthdays").notNull().default(true),
    parameters: json("parameters"),
    isPrivate: boolean("isPrivate").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull(),
    deletedAt: timestamp("deletedAt"),
    parentId: text("parentId"),
    campaignId: text("campaignId")
      .notNull()
      .references(() => campaigns.id, { onDelete: "restrict" }),
    createdById: text("createdById").notNull(),
    updatedById: text("updatedById"),
  },
  (table) => [
    unique("calendars_campaign_slug_unique").on(table.campaignId, table.slug),
    index("calendars_campaign_id_idx").on(table.campaignId),
    index("calendars_parent_id_idx").on(table.parentId),
    index("calendars_created_by_id_idx").on(table.createdById),
    index("calendars_deleted_at_idx").on(table.deletedAt),
  ]
);

export type Calendar = typeof calendars.$inferSelect;
export type NewCalendar = typeof calendars.$inferInsert;
