/**
 * Time-related constants
 * Centralized time conversion constants for consistent calculations
 */
export const TIME_CONSTANTS = {
  /** Milliseconds per second */
  MS_PER_SECOND: 1000,

  /** Milliseconds per minute */
  MS_PER_MINUTE: 1000 * 60,

  /** Milliseconds per hour */
  MS_PER_HOUR: 1000 * 60 * 60,

  /** Milliseconds per day */
  MS_PER_DAY: 1000 * 60 * 60 * 24,

  /** Number of days threshold for showing relative date strings (e.g., "3 days ago") */
  DAYS_THRESHOLD_FOR_RELATIVE_DATE: 7,
} as const;
