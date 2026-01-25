import { relations } from "drizzle-orm";
// Import tables using relative paths to avoid circular dependency through index.ts
import { acts } from "./acts";
import { auditLogs } from "./audit-logs";
import { beats } from "./beats";
import { beings } from "./beings";
import { calendars } from "./calendars";
import { campaignSettings } from "./campaign-settings";
import { campaigns } from "./campaigns";
import { images } from "./images";
import { quests } from "./quests";
import { scenes } from "./scenes";
import { users } from "./users";

// All relations defined in one place to avoid circular dependencies
// NOTE: This file must be imported AFTER all table files in index.ts

export const usersRelations = relations(users, ({ many }) => ({
  campaigns: many(campaigns),
  auditLogs: many(auditLogs),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  owner: one(users, {
    fields: [campaigns.ownerId],
    references: [users.id],
  }),
  beings: many(beings),
  quests: many(quests),
  images: many(images),
  calendars: many(calendars),
  acts: many(acts),
  settings: one(campaignSettings),
}));

export const beingsRelations = relations(beings, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [beings.campaignId],
    references: [campaigns.id],
  }),
  image: one(images, {
    fields: [beings.imageId],
    references: [images.id],
  }),
  birthCalendar: one(calendars, {
    fields: [beings.birthCalendarId],
    references: [calendars.id],
  }),
}));

export const questsRelations = relations(quests, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [quests.campaignId],
    references: [campaigns.id],
  }),
}));

export const imagesRelations = relations(images, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [images.campaignId],
    references: [campaigns.id],
  }),
  folder: one(images, {
    fields: [images.folderId],
    references: [images.id],
    relationName: "imageFolder",
  }),
  children: many(images, { relationName: "imageFolder" }),
  beings: many(beings),
}));

export const calendarsRelations = relations(calendars, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [calendars.campaignId],
    references: [campaigns.id],
  }),
  parent: one(calendars, {
    fields: [calendars.parentId],
    references: [calendars.id],
    relationName: "calendarParent",
  }),
  children: many(calendars, { relationName: "calendarParent" }),
  beings: many(beings),
}));

export const campaignSettingsRelations = relations(
  campaignSettings,
  ({ one }) => ({
    campaign: one(campaigns, {
      fields: [campaignSettings.campaignId],
      references: [campaigns.id],
    }),
  })
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const actsRelations = relations(acts, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [acts.campaignId],
    references: [campaigns.id],
  }),
  scenes: many(scenes),
}));

export const scenesRelations = relations(scenes, ({ one, many }) => ({
  act: one(acts, {
    fields: [scenes.actId],
    references: [acts.id],
  }),
  beats: many(beats),
}));

export const beatsRelations = relations(beats, ({ one }) => ({
  scene: one(scenes, {
    fields: [beats.sceneId],
    references: [scenes.id],
  }),
}));
