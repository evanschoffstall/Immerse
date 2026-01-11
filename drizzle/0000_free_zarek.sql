CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"entityType" text NOT NULL,
	"entityId" text NOT NULL,
	"action" text NOT NULL,
	"changes" json,
	"metadata" json,
	"userId" text,
	"campaignId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beings" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"title" text,
	"type" text,
	"age" text,
	"sex" text,
	"pronouns" text,
	"location" text,
	"family" text,
	"description" text,
	"imageId" text,
	"isPrivate" boolean DEFAULT false NOT NULL,
	"birthCalendarId" text,
	"birthDate" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"deletedAt" timestamp,
	"campaignId" text NOT NULL,
	"createdById" text NOT NULL,
	"updatedById" text,
	CONSTRAINT "beings_campaignId_slug_unique" UNIQUE("campaignId","slug")
);
--> statement-breakpoint
CREATE TABLE "calendars" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"date" text,
	"months" json,
	"weekdays" json,
	"years" json,
	"seasons" json,
	"moons" json,
	"weekNames" json,
	"monthAliases" json,
	"suffix" text,
	"format" text,
	"hasLeapYear" boolean DEFAULT false NOT NULL,
	"leapYearAmount" integer,
	"leapYearMonth" integer,
	"leapYearOffset" integer,
	"leapYearStart" integer,
	"startOffset" integer DEFAULT 0 NOT NULL,
	"skipYearZero" boolean DEFAULT false NOT NULL,
	"showBirthdays" boolean DEFAULT true NOT NULL,
	"parameters" json,
	"isPrivate" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"deletedAt" timestamp,
	"parentId" text,
	"campaignId" text NOT NULL,
	"createdById" text NOT NULL,
	"updatedById" text,
	CONSTRAINT "calendars_campaignId_slug_unique" UNIQUE("campaignId","slug")
);
--> statement-breakpoint
CREATE TABLE "campaign_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"campaignId" text NOT NULL,
	"bgOpacity" real DEFAULT 0.6 NOT NULL,
	"bgBlur" integer DEFAULT 4 NOT NULL,
	"bgExpandToSidebar" boolean DEFAULT true NOT NULL,
	"bgExpandToHeader" boolean DEFAULT true NOT NULL,
	"headerBgOpacity" real DEFAULT 0 NOT NULL,
	"headerBlur" integer DEFAULT 4 NOT NULL,
	"sidebarBgOpacity" real DEFAULT 0 NOT NULL,
	"sidebarBlur" integer DEFAULT 0 NOT NULL,
	"cardBgOpacity" real DEFAULT 0.6 NOT NULL,
	"cardBlur" integer DEFAULT 8 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "campaign_settings_campaignId_unique" UNIQUE("campaignId")
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"backgroundImage" text,
	"visibility" text DEFAULT 'private' NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ownerId" text NOT NULL,
	CONSTRAINT "campaigns_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"ext" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"focusX" integer,
	"focusY" integer,
	"isFolder" boolean DEFAULT false NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"visibility" integer DEFAULT 0 NOT NULL,
	"campaignId" text NOT NULL,
	"folderId" text,
	"createdById" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "quests" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" text,
	"description" text,
	"date" text,
	"image" text,
	"location" text,
	"status" text DEFAULT 'active',
	"isPrivate" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"deletedAt" timestamp,
	"campaignId" text NOT NULL,
	"createdById" text NOT NULL,
	"updatedById" text,
	CONSTRAINT "quests_campaignId_slug_unique" UNIQUE("campaignId","slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL,
	"avatar" text,
	"emailVerified" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beings" ADD CONSTRAINT "beings_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_settings" ADD CONSTRAINT "campaign_settings_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quests" ADD CONSTRAINT "quests_campaignId_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_entityType_entityId_index" ON "audit_logs" USING btree ("entityType","entityId");--> statement-breakpoint
CREATE INDEX "audit_logs_userId_index" ON "audit_logs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "audit_logs_campaignId_index" ON "audit_logs" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "audit_logs_action_index" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_createdAt_index" ON "audit_logs" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "beings_campaignId_index" ON "beings" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "beings_createdById_index" ON "beings" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "beings_deletedAt_index" ON "beings" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "calendars_campaignId_index" ON "calendars" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "calendars_parentId_index" ON "calendars" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "calendars_createdById_index" ON "calendars" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "calendars_deletedAt_index" ON "calendars" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "campaign_settings_campaignId_index" ON "campaign_settings" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "images_campaignId_index" ON "images" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "images_folderId_index" ON "images" USING btree ("folderId");--> statement-breakpoint
CREATE INDEX "images_isFolder_index" ON "images" USING btree ("isFolder");--> statement-breakpoint
CREATE INDEX "images_createdById_index" ON "images" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "images_deletedAt_index" ON "images" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "quests_campaignId_index" ON "quests" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "quests_createdById_index" ON "quests" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "quests_deletedAt_index" ON "quests" USING btree ("deletedAt");