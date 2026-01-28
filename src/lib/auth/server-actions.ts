import { authConfig } from "@/lib/auth/config";
import { UnauthorizedError } from "@/lib/errors/action-errors";
import { getServerSession } from "next-auth";

export async function requireAuth(): Promise<string> {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session.user.id;
}

export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authConfig);
  return session?.user?.id ?? null;
}
