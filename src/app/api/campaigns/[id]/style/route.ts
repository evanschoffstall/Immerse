import { authConfig } from "@/lib/db/auth";
import { prisma } from "@/lib/db/db";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaign = await prisma.campaigns.findUnique({
    where: { id },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get campaign style
  const style = await prisma.campaign_styles.findUnique({
    where: { campaignId: id },
  });

  return NextResponse.json({ style });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaign = await prisma.campaigns.findUnique({
    where: { id },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  // Update or create campaign style
  const style = await prisma.campaign_styles.upsert({
    where: { campaignId: id },
    update: {
      ...body,
      updatedAt: new Date(),
    },
    create: {
      id: crypto.randomUUID(),
      campaignId: id,
      ...body,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ style });
}
