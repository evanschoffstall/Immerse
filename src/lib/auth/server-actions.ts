import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function requireAuth(): Promise<string> {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authConfig);
  return session?.user?.id ?? null;
}
