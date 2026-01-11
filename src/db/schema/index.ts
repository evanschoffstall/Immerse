// Import all tables
import { auditLogs } from "./audit-logs";
import { beings } from "./beings";
import { calendars } from "./calendars";
import { campaignSettings } from "./campaign-settings";
import { campaigns } from "./campaigns";
import { images } from "./images";
import { quests } from "./quests";
import { users } from "./users";

// Import all types
import type { AuditLog, NewAuditLog } from "./audit-logs";
import type { Being, NewBeing } from "./beings";
import type { Calendar, NewCalendar } from "./calendars";
import type {
  CampaignSettings,
  NewCampaignSettings,
} from "./campaign-settings";
import type { Campaign, NewCampaign } from "./campaigns";
import type { Image, NewImage } from "./images";
import type { NewQuest, Quest } from "./quests";
import type { NewUser, User } from "./users";

// Import relations
import * as relations from "./relations";

// Re-export tables
export {
  auditLogs,
  beings,
  calendars,
  campaigns,
  campaignSettings,
  images,
  quests,
  users,
};

// Re-export types
export type {
  AuditLog,
  Being,
  Calendar,
  Campaign,
  CampaignSettings,
  Image,
  NewAuditLog,
  NewBeing,
  NewCalendar,
  NewCampaign,
  NewCampaignSettings,
  NewImage,
  NewQuest,
  NewUser,
  Quest,
  User,
};

// Re-export all relations individually
export const {
  usersRelations,
  campaignsRelations,
  beingsRelations,
  questsRelations,
  imagesRelations,
  calendarsRelations,
  campaignSettingsRelations,
  auditLogsRelations,
} = relations;
