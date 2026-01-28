/**
 * Constants for image upload validation
 */
export const IMAGE_UPLOAD = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  MAX_SIZE_LABEL: "5MB",
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ] as readonly string[],
} as const;

/**
 * Constants for background settings sliders
 */
export const BACKGROUND_SETTINGS = {
  OPACITY: {
    MIN: 0,
    MAX: 1,
    STEP: 0.01,
    DEFAULT: 0.9,
  },
  BLUR: {
    MIN: 0,
    MAX: 50,
    STEP: 1,
    UNIT: "px",
    DEFAULT: 10,
  },
} as const;

/**
 * Constants for widget display limits
 */
export const WIDGET_LIMITS = {
  ACTIVE_QUESTS: 5,
  RECENT_ACTIVITY: 5,
} as const;
