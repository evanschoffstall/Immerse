import { ApiHandler, ApiHandlerConfig } from "@/lib/api/handler";

/**
 * Resource registration metadata
 */
export interface ResourceRegistration {
  name: string;
  handler: ApiHandler;
  enabled: boolean;
  description?: string;
}

/**
 * Global resource registry
 * Single source of truth for all campaign resources
 */
class ResourceRegistry {
  private resources = new Map<string, ResourceRegistration>();

  /**
   * Register a resource with its handler
   */
  register(name: string, config: ApiHandlerConfig, description?: string) {
    const handler = new ApiHandler(config);
    this.resources.set(name, {
      name,
      handler,
      enabled: true,
      description,
    });
  }

  /**
   * Get a resource handler by name
   */
  get(name: string): ResourceRegistration | undefined {
    return this.resources.get(name);
  }

  /**
   * Check if resource exists and is enabled
   */
  has(name: string): boolean {
    const resource = this.resources.get(name);
    return !!resource && resource.enabled;
  }

  /**
   * Get all registered resources
   */
  all(): ResourceRegistration[] {
    return Array.from(this.resources.values());
  }

  /**
   * Get all enabled resources
   */
  enabled(): ResourceRegistration[] {
    return this.all().filter((r) => r.enabled);
  }

  /**
   * Enable a resource
   */
  enable(name: string) {
    const resource = this.resources.get(name);
    if (resource) {
      resource.enabled = true;
    }
  }

  /**
   * Disable a resource
   */
  disable(name: string) {
    const resource = this.resources.get(name);
    if (resource) {
      resource.enabled = false;
    }
  }

  /**
   * Unregister a resource
   */
  unregister(name: string) {
    this.resources.delete(name);
  }

  /**
   * Clear all resources
   */
  clear() {
    this.resources.clear();
  }
}

/**
 * Singleton instance
 */
export const resourceRegistry = new ResourceRegistry();

/**
 * Helper to check if a resource name is valid
 */
export function isValidResource(name: string): boolean {
  return resourceRegistry.has(name);
}

/**
 * Helper to get all valid resource names
 */
export function getResourceNames(): string[] {
  return resourceRegistry.enabled().map((r) => r.name);
}
