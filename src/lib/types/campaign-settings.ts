import { BACKGROUND_SETTINGS } from "../constants/validation";

/**
 * Campaign background settings for customizing visual appearance
 */
export interface CampaignSettings {
  bg: {
    opacity: number;
    blur: number;
    expandToSidebar: boolean;
    expandToHeader: boolean;
  };
  header: {
    bgOpacity: number;
    blur: number;
  };
  sidebar: {
    bgOpacity: number;
    blur: number;
  };
  card: {
    bgOpacity: number;
    blur: number;
  };
}

/**
 * Default campaign settings values
 */
export const DEFAULT_CAMPAIGN_SETTINGS: CampaignSettings = {
  bg: {
    opacity: 0.6,
    blur: 4,
    expandToSidebar: true,
    expandToHeader: true,
  },
  header: {
    bgOpacity: BACKGROUND_SETTINGS.OPACITY.DEFAULT,
    blur: 4,
  },
  sidebar: {
    bgOpacity: BACKGROUND_SETTINGS.OPACITY.DEFAULT,
    blur: 0,
  },
  card: {
    bgOpacity: 0.6,
    blur: 8,
  },
};

/**
 * Section keys for background settings
 */
export type SettingSection = "header" | "sidebar" | "bg" | "card";
