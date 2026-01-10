import { auditRepository } from "@/lib/data/repositories/audit";

/**
 * Generate a simple diff between two objects (deprecated - use auditRepository directly)
 */
function generateDiff(oldData: any, newData: any): Record<string, any> {
  const changes: Record<string, any> = {};

  // Check for changed or new fields
  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      changes[key] = {
        old: oldData[key],
        new: newData[key],
      };
    }
  }

  // Check for removed fields
  for (const key in oldData) {
    if (!(key in newData) && oldData[key] !== undefined) {
      changes[key] = {
        old: oldData[key],
        new: undefined,
      };
    }
  }

  return changes;
}

// Deprecated: Use auditRepository directly
export const createAuditLog = async (params: {
  entityType: string;
  entityId: string;
  action: "create" | "update" | "delete" | "restore";
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  userId?: string;
  campaignId?: string;
}) => {
  // Map to appropriate repository method
  switch (params.action) {
    case "create":
      return auditRepository.logCreate(
        params.entityType,
        params.entityId,
        params.changes,
        params.userId,
        params.campaignId,
        params.metadata
      );
    case "update":
      return auditRepository.logUpdate(
        params.entityType,
        params.entityId,
        {},
        params.changes || {},
        params.userId,
        params.campaignId,
        params.metadata
      );
    case "delete":
      return auditRepository.logDelete(
        params.entityType,
        params.entityId,
        params.changes,
        params.userId,
        params.campaignId,
        params.metadata
      );
    case "restore":
      return auditRepository.logRestore(
        params.entityType,
        params.entityId,
        params.changes,
        params.userId,
        params.campaignId,
        params.metadata
      );
  }
};

/**
 * Log a create action
 */
export async function logCreate(
  entityType: string,
  entityId: string,
  data: any,
  userId?: string,
  campaignId?: string,
  metadata?: Record<string, any>
) {
  return auditRepository.logCreate(
    entityType,
    entityId,
    data,
    userId,
    campaignId,
    metadata
  );
}

/**
 * Log an update action with diff
 */
export async function logUpdate(
  entityType: string,
  entityId: string,
  oldData: any,
  newData: any,
  userId?: string,
  campaignId?: string,
  metadata?: Record<string, any>
) {
  return auditRepository.logUpdate(
    entityType,
    entityId,
    oldData,
    newData,
    userId,
    campaignId,
    metadata
  );
}

/**
 * Log a delete action
 */
export async function logDelete(
  entityType: string,
  entityId: string,
  data: any,
  userId?: string,
  campaignId?: string,
  metadata?: Record<string, any>
) {
  return auditRepository.logDelete(
    entityType,
    entityId,
    data,
    userId,
    campaignId,
    metadata
  );
}

/**
 * Log a restore action
 */
export async function logRestore(
  entityType: string,
  entityId: string,
  data: any,
  userId?: string,
  campaignId?: string,
  metadata?: Record<string, any>
) {
  return auditRepository.logRestore(
    entityType,
    entityId,
    data,
    userId,
    campaignId,
    metadata
  );
}

/**
 * Get audit logs for an entity
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: string,
  options: {
    limit?: number;
    userId?: string;
    action?: string;
  } = {}
) {
  return auditRepository.getEntityAuditLogs(entityType, entityId, options);
}
