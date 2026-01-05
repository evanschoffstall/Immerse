import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
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

  // Get campaign stats
  const stats = {
    characters: 0,
    locations: 0,
    quests: 0,
    notes: 0,
  };

  // Return format expected by frontend
  return NextResponse.json({
    hasCharacters: stats.characters > 0,
    hasLocations: stats.locations > 0,
    stats,
  });
}
