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
    githubAccessToken?: string | null;
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

function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

function resolveAuthBaseUrl() {
  const explicit = process.env.NEXTAUTH_URL?.trim() || process.env.AUTH_URL?.trim() || "";
  const normalizedExplicit = explicit ? normalizeBaseUrl(explicit) : "";
  const isProduction = process.env.NODE_ENV === "production";
  const hasLocalhost =
    normalizedExplicit.includes("localhost") || normalizedExplicit.includes("127.0.0.1");

  // In production, prefer explicit non-localhost value.
  if (isProduction && normalizedExplicit && !hasLocalhost) {
    return normalizedExplicit;
  }

  // Vercel stable production domain is safest for OAuth callbacks.
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || "";
  if (isProduction && vercelProduction) {
    return `https://${normalizeBaseUrl(vercelProduction).replace(/^https?:\/\//, "")}`;
  }

  // Fallback to current Vercel deployment domain.
  const vercelRuntime = process.env.VERCEL_URL?.trim() || "";
  if (isProduction && vercelRuntime) {
    return `https://${normalizeBaseUrl(vercelRuntime).replace(/^https?:\/\//, "")}`;
  }

  if (normalizedExplicit) {
    return normalizedExplicit;
  }

  return "http://localhost:3000";
}

const resolvedAuthBaseUrl = resolveAuthBaseUrl();
if (resolvedAuthBaseUrl && process.env.NEXTAUTH_URL !== resolvedAuthBaseUrl) {
  process.env.NEXTAUTH_URL = resolvedAuthBaseUrl;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Route users to our custom App Router login page.
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Use request host/proxy headers safely on Vercel and reverse proxies.
  trustHost: true,
  secret: readEnv("NEXTAUTH_SECRET"),
  // Ensure secure auth cookies in production.
  useSecureCookies: process.env.NODE_ENV === "production",
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
      // Keep GitHub access token only in JWT (server-side use), never in session payload.
      if (account?.provider === "github" && typeof account.access_token === "string") {
        token.githubAccessToken = account.access_token;
      }

      token.role = token.role ?? "user";
      token.status = token.status ?? "active";
      token.provider = token.provider ?? null;
      token.githubAccessToken = token.githubAccessToken ?? null;
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
