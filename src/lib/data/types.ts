/**
 * Type exports from Prisma models
 * This allows app layer to use types without importing @prisma/client
 */

import type {
  beings,
  calendars,
  campaign_settings,
  campaigns,
  images,
  quests,
} from "@prisma/client";

// Re-export types
export type Being = beings;
export type Campaign = campaigns;
export type CampaignSettings = campaign_settings;
export type Quest = quests;
export type Image = images;
export type Calendar = calendars;
