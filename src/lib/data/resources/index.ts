/**
 * Central resource registration
 * Import this file to register all campaign resources
 * This eliminates the need for manual resource imports in route handlers
 */

// Import resource configurations (which auto-register)
import "./beings";
import "./quests";

// Re-export registry utilities for convenience
export {
  getResourceNames,
  isValidResource,
  resourceRegistry,
} from "@/lib/data/resources/registry";

// Re-export resource operations for direct use
export * from "./beings";
export * from "./quests";
