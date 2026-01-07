import { prisma } from "@/lib/db/prisma";

/**
 * Generate a simple diff between two objects
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

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: {
  entityType: string;
  entityId: string;
  action: "create" | "update" | "delete" | "restore";
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  userId?: string;
  campaignId?: string;
}) {
  const id = crypto.randomUUID();

  return await prisma.audit_logs.create({
    data: {
      id,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      changes: params.changes || undefined,
      metadata: params.metadata || undefined,
      userId: params.userId || null,
      campaignId: params.campaignId || null,
    },
  });
}

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
  return createAuditLog({
    entityType,
    entityId,
    action: "create",
    changes: { created: data },
    metadata,
    userId,
    campaignId,
  });
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
  const changes = generateDiff(oldData, newData);

  return createAuditLog({
    entityType,
    entityId,
    action: "update",
    changes,
    metadata,
    userId,
    campaignId,
  });
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
  return createAuditLog({
    entityType,
    entityId,
    action: "delete",
    changes: { deleted: data },
    metadata,
    userId,
    campaignId,
  });
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
  return createAuditLog({
    entityType,
    entityId,
    action: "restore",
    changes: { restored: data },
    metadata,
    userId,
    campaignId,
  });
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
  const where: any = {
    entityType,
    entityId,
  };

  if (options.userId) where.userId = options.userId;
  if (options.action) where.action = options.action;

  return await prisma.audit_logs.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options.limit || 50,
  });
}
