/*
  Warnings:

  - You are about to drop the `characters` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "characters" DROP CONSTRAINT "characters_birthCalendarId_fkey";

-- DropForeignKey
ALTER TABLE "characters" DROP CONSTRAINT "characters_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "characters" DROP CONSTRAINT "characters_imageId_fkey";

-- DropTable
DROP TABLE "characters";

-- CreateTable
CREATE TABLE "beings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "type" TEXT,
    "age" TEXT,
    "sex" TEXT,
    "pronouns" TEXT,
    "location" TEXT,
    "family" TEXT,
    "description" TEXT,
    "imageId" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "birthCalendarId" TEXT,
    "birthDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "beings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "beings_campaignId_idx" ON "beings"("campaignId");

-- CreateIndex
CREATE INDEX "beings_createdById_idx" ON "beings"("createdById");

-- CreateIndex
CREATE INDEX "beings_deletedAt_idx" ON "beings"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "beings_campaignId_slug_key" ON "beings"("campaignId", "slug");

-- AddForeignKey
ALTER TABLE "beings" ADD CONSTRAINT "beings_birthCalendarId_fkey" FOREIGN KEY ("birthCalendarId") REFERENCES "calendars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beings" ADD CONSTRAINT "beings_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beings" ADD CONSTRAINT "beings_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
