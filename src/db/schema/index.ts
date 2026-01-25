// Import all tables
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

// Import all types
import type { Act, NewAct } from "./acts";
import type { AuditLog, NewAuditLog } from "./audit-logs";
import type { Beat, NewBeat } from "./beats";
import type { Being, NewBeing } from "./beings";
import type { Calendar, NewCalendar } from "./calendars";
import type {
    CampaignSettings,
    NewCampaignSettings,
} from "./campaign-settings";
import type { Campaign, NewCampaign } from "./campaigns";
import type { Image, NewImage } from "./images";
import type { NewQuest, Quest } from "./quests";
import type { NewScene, Scene } from "./scenes";
import type { NewUser, User } from "./users";

// Import relations
import * as relations from "./relations";

// Re-export tables
export {
    acts,
    auditLogs,
    beats,
    beings,
    calendars,
    campaigns,
    campaignSettings,
    images,
    quests,
    scenes,
    users
};

// Re-export types
    export type {
        Act,
        AuditLog,
        Beat,
        Being,
        Calendar,
        Campaign,
        CampaignSettings,
        Image,
        NewAct,
        NewAuditLog,
        NewBeat,
        NewBeing,
        NewCalendar,
        NewCampaign,
        NewCampaignSettings,
        NewImage,
        NewQuest,
        NewScene,
        NewUser,
        Quest,
        Scene,
        User
    };

// Re-export all relations individually
export const {
  actsRelations,
  usersRelations,
  beatsRelations,
  campaignsRelations,
  beingsRelations,
  questsRelations,
  imagesRelations,
  calendarsRelations,
  campaignSettingsRelations,
  auditLogsRelations,
  scenesRelations,
} = relations;
