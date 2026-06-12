import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTokenForUser } from "@/lib/supabase";
import { resolveAppUser } from "@/lib/resolve-user";
import type { Session } from "next-auth";

export interface SessionWithToken {
  session: Session;
  accessToken: string;
}

/**
 * Returns the NextAuth session plus the decrypted GitHub access token fetched
 * server-side from Supabase. Returns null if the user is not authenticated or
 * if the token cannot be retrieved. Never exposes the token to the client.
 */
export async function getSessionWithToken(): Promise<SessionWithToken | null> {
  const session = await getServerSession(authOptions);
  if (!session?.githubId || !session?.githubLogin) return null;

  const userRow = await resolveAppUser(session.githubId, session.githubLogin);
  if (!userRow) return null;

  const accessToken = await getTokenForUser(userRow.id);
  if (!accessToken) return null;

  return { session, accessToken };
}