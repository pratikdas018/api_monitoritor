import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider: string | null;
      role: "user" | "admin";
      status: "active" | "suspended" | "deleted";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string | null;
    role?: "user" | "admin";
    status?: "active" | "suspended" | "deleted";
  }
}

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`[auth] Missing required environment variable: ${name}`);
    return "";
  }
  return value;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Route users to our custom App Router login page.
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: readEnv("NEXTAUTH_SECRET"),
  // JWT sessions work well with App Router, middleware, and server actions.
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: readEnv("GOOGLE_CLIENT_ID"),
      clientSecret: readEnv("GOOGLE_CLIENT_SECRET"),
    }),
    GitHub({
      clientId: readEnv("GITHUB_CLIENT_ID"),
      clientSecret: readEnv("GITHUB_CLIENT_SECRET"),
      authorization: {
        params: {
          scope: "read:user repo",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        console.error("[auth] signIn denied: provider did not return an email");
        return false;
      }

      const provider = account?.provider ?? "unknown";
      const email = normalizeEmail(user.email);
      const name = user.name?.trim() || email.split("@")[0] || "User";
      const image = user.image ?? null;
      const authId = typeof user.id === "string" && user.id.trim() ? user.id : null;

      try {
        await connectToDatabase();

        const update: Record<string, unknown> = {
          email,
          name,
          image,
          provider,
          lastLoginAt: new Date(),
        };

        if (authId) {
          update.authId = authId;
        }

        await User.findOneAndUpdate(
          { email },
          {
            $set: update,
            $setOnInsert: {
              role: "user",
              status: "active",
            },
            $addToSet: {
              providers: provider,
            },
          },
          { upsert: true, new: true },
        );

        return true;
      } catch (error) {
        console.error("[auth] Failed to persist user profile during sign-in", error);
        return false;
      }
    },
    async jwt({ token, account }) {
      if (account?.provider) {
        token.provider = account.provider;
      }

      token.role = token.role ?? "user";
      token.status = token.status ?? "active";
      token.provider = token.provider ?? null;
      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        return session;
      }

      session.user.id = typeof token.sub === "string" ? token.sub : "";
      session.user.provider = typeof token.provider === "string" ? token.provider : null;
      session.user.role = token.role === "admin" ? "admin" : "user";
      session.user.status =
        token.status === "suspended" || token.status === "deleted" ? token.status : "active";

      return session;
    },
  },
});
