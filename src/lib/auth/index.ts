import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { AuthOptions, Session } from "next-auth";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const authConfig: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 [AUTH] Authorize called with:", {
          email: credentials?.email,
        });

        if (!credentials?.email || !credentials?.password) {
          console.error("❌ [AUTH] Missing email or password");
          return null;
        }

        // Query Prisma database
        const user = await prisma.users.findUnique({
          where: { email: credentials.email as string },
        });

        console.log("🔐 [AUTH] User lookup result:", {
          found: !!user,
          hasPassword: !!user?.password,
          email: user?.email,
        });

        if (!user || !user.password) {
          console.error("❌ [AUTH] User not found or no password");
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        console.log("🔐 [AUTH] Password match:", passwordMatch);

        if (!passwordMatch) {
          console.error("❌ [AUTH] Password mismatch");
          return null;
        }

        console.log("✅ [AUTH] Authentication successful for:", user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `${
        process.env.NODE_ENV === "production" ? "__Secure-" : ""
      }next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authConfig);

export { handler };
