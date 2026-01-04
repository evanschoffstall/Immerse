import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaigns = await prisma.campaigns.findMany({
    where: {
      ownerId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const campaign = await prisma.campaigns.create({
    data: {
      id: crypto.randomUUID(),
      name,
      slug:
        name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") +
        "-" +
        Date.now(),
      description: description || "",
      ownerId: session.user.id,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
