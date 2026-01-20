CREATE TABLE "acts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"content" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"deletedAt" timestamp,
	"campaignId" text NOT NULL,
	"createdById" text NOT NULL,
	"updatedById" text,
	CONSTRAINT "acts_campaign_slug_unique" UNIQUE("campaignId","slug")
);
--> statement-breakpoint
CREATE TABLE "beats" (
	"id" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"deletedAt" timestamp,
	"sceneId" text NOT NULL,
	"createdById" text NOT NULL,
	"updatedById" text
);
--> statement-breakpoint
CREATE TABLE "scenes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"content" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"deletedAt" timestamp,
	"actId" text NOT NULL,
	"createdById" text NOT NULL,
	"updatedById" text,
	CONSTRAINT "scenes_act_slug_unique" UNIQUE("actId","slug")
);
--> statement-breakpoint
ALTER TABLE "acts" ADD CONSTRAINT "acts_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beats" ADD CONSTRAINT "beats_sceneId_scenes_id_fk" FOREIGN KEY ("sceneId") REFERENCES "public"."scenes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_actId_acts_id_fk" FOREIGN KEY ("actId") REFERENCES "public"."acts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "acts_campaign_id_idx" ON "acts" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "acts_created_by_id_idx" ON "acts" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "acts_deleted_at_idx" ON "acts" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "beats_scene_id_idx" ON "beats" USING btree ("sceneId");--> statement-breakpoint
CREATE INDEX "beats_timestamp_idx" ON "beats" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "beats_created_by_id_idx" ON "beats" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "beats_deleted_at_idx" ON "beats" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "scenes_act_id_idx" ON "scenes" USING btree ("actId");--> statement-breakpoint
CREATE INDEX "scenes_created_by_id_idx" ON "scenes" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "scenes_deleted_at_idx" ON "scenes" USING btree ("deletedAt");