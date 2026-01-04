/**
 * Base classes for campaign-scoped resources
 *
 * Usage:
 * 1. Create repository class extending CampaignResourceRepository
 * 2. Create service class extending CampaignResourceService
 * 3. Override hooks for resource-specific logic
 */
export {
  CampaignResourceRepository,
  type BaseListQuery,
} from "./CampaignResourceRepository";
export {
  CampaignResourceService,
  type PaginationResponse,
} from "./CampaignResourceService";
