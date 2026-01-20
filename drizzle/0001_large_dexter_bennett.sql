ALTER TABLE "beings" DROP CONSTRAINT "beings_campaignId_slug_unique";--> statement-breakpoint
ALTER TABLE "calendars" DROP CONSTRAINT "calendars_campaignId_slug_unique";--> statement-breakpoint
ALTER TABLE "quests" DROP CONSTRAINT "quests_campaignId_slug_unique";--> statement-breakpoint
DROP INDEX "audit_logs_entityType_entityId_index";--> statement-breakpoint
DROP INDEX "audit_logs_userId_index";--> statement-breakpoint
DROP INDEX "audit_logs_campaignId_index";--> statement-breakpoint
DROP INDEX "audit_logs_action_index";--> statement-breakpoint
DROP INDEX "audit_logs_createdAt_index";--> statement-breakpoint
DROP INDEX "beings_campaignId_index";--> statement-breakpoint
DROP INDEX "beings_createdById_index";--> statement-breakpoint
DROP INDEX "beings_deletedAt_index";--> statement-breakpoint
DROP INDEX "calendars_campaignId_index";--> statement-breakpoint
DROP INDEX "calendars_parentId_index";--> statement-breakpoint
DROP INDEX "calendars_createdById_index";--> statement-breakpoint
DROP INDEX "calendars_deletedAt_index";--> statement-breakpoint
DROP INDEX "campaign_settings_campaignId_index";--> statement-breakpoint
DROP INDEX "images_campaignId_index";--> statement-breakpoint
DROP INDEX "images_folderId_index";--> statement-breakpoint
DROP INDEX "images_isFolder_index";--> statement-breakpoint
DROP INDEX "images_createdById_index";--> statement-breakpoint
DROP INDEX "images_deletedAt_index";--> statement-breakpoint
DROP INDEX "quests_campaignId_index";--> statement-breakpoint
DROP INDEX "quests_createdById_index";--> statement-breakpoint
DROP INDEX "quests_deletedAt_index";--> statement-breakpoint
CREATE INDEX "audit_logs_entity_type_id_idx" ON "audit_logs" USING btree ("entityType","entityId");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "audit_logs_campaign_id_idx" ON "audit_logs" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "beings_campaign_id_idx" ON "beings" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "beings_created_by_id_idx" ON "beings" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "beings_deleted_at_idx" ON "beings" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "calendars_campaign_id_idx" ON "calendars" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "calendars_parent_id_idx" ON "calendars" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "calendars_created_by_id_idx" ON "calendars" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "calendars_deleted_at_idx" ON "calendars" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "campaign_settings_campaign_id_idx" ON "campaign_settings" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "images_campaign_id_idx" ON "images" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "images_folder_id_idx" ON "images" USING btree ("folderId");--> statement-breakpoint
CREATE INDEX "images_is_folder_idx" ON "images" USING btree ("isFolder");--> statement-breakpoint
CREATE INDEX "images_created_by_id_idx" ON "images" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "images_deleted_at_idx" ON "images" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "quests_campaign_id_idx" ON "quests" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "quests_created_by_id_idx" ON "quests" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "quests_deleted_at_idx" ON "quests" USING btree ("deletedAt");--> statement-breakpoint
ALTER TABLE "beings" ADD CONSTRAINT "beings_campaign_slug_unique" UNIQUE("campaignId","slug");--> statement-breakpoint
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_campaign_slug_unique" UNIQUE("campaignId","slug");--> statement-breakpoint
ALTER TABLE "quests" ADD CONSTRAINT "quests_campaign_slug_unique" UNIQUE("campaignId","slug");