import { index, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    entityType: text("entityType").notNull(),
    entityId: text("entityId").notNull(),
    action: text("action").notNull(),
    changes: json("changes"),
    metadata: json("metadata"),
    userId: text("userId").references(() => users.id),
    campaignId: text("campaignId"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_entity_type_id_idx").on(table.entityType, table.entityId),
    index("audit_logs_user_id_idx").on(table.userId),
    index("audit_logs_campaign_id_idx").on(table.campaignId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ]
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
