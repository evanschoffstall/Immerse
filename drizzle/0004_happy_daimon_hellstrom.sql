ALTER TABLE "campaigns" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
CREATE INDEX "acts_updated_by_id_idx" ON "acts" USING btree ("updatedById");--> statement-breakpoint
CREATE INDEX "beats_updated_by_id_idx" ON "beats" USING btree ("updatedById");--> statement-breakpoint
CREATE INDEX "beings_updated_by_id_idx" ON "beings" USING btree ("updatedById");--> statement-breakpoint
CREATE INDEX "quests_updated_by_id_idx" ON "quests" USING btree ("updatedById");--> statement-breakpoint
CREATE INDEX "scenes_updated_by_id_idx" ON "scenes" USING btree ("updatedById");