-- CreateTable
CREATE TABLE "campaign_settings" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "bgOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "bgBlur" INTEGER NOT NULL DEFAULT 4,
    "bgExpandToSidebar" BOOLEAN NOT NULL DEFAULT true,
    "bgExpandToHeader" BOOLEAN NOT NULL DEFAULT true,
    "headerBgOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "headerBlur" INTEGER NOT NULL DEFAULT 4,
    "sidebarBgOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "sidebarBlur" INTEGER NOT NULL DEFAULT 0,
    "cardBgOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "cardBlur" INTEGER NOT NULL DEFAULT 8,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_settings_campaignId_key" ON "campaign_settings"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_settings_campaignId_idx" ON "campaign_settings"("campaignId");

-- AddForeignKey
ALTER TABLE "campaign_settings" ADD CONSTRAINT "campaign_settings_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
