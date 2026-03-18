"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LOCAL_DEMO_USER_ID, SESSION_COOKIE_NAME, USER_EMAIL_COOKIE_NAME, USER_ID_COOKIE_NAME, isValidLogin, normalizeUserId } from "@/lib/auth";
import { recordActivity, upsertUserProfile } from "@/lib/activity";
import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import Monitor from "@/models/Monitor";

export type LoginState = {
  status: "idle" | "error";
  message: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/dashboard");

  if (!isValidLogin(email, password)) {
    return {
      status: "error",
      message: "Invalid email or password.",
    };
  }

  cookies().set(SESSION_COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  cookies().set(USER_ID_COOKIE_NAME, normalizeUserId(email) || LOCAL_DEMO_USER_ID, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  cookies().set(USER_EMAIL_COOKIE_NAME, normalizeUserId(email) || "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  // Backfill older monitors so production alerts can route to the logged-in mailbox.
  try {
    if (hasMongoConfig()) {
      await connectToDatabase();
      const normalizedEmail = normalizeUserId(email);
      await Monitor.updateMany(
        {
          userId: normalizedEmail || LOCAL_DEMO_USER_ID,
          $or: [
            { ownerEmail: { $exists: false } },
            { ownerEmail: null },
            { ownerEmail: "" },
            { ownerEmail: { $ne: normalizedEmail } },
          ],
        },
        { $set: { ownerEmail: normalizedEmail } },
      );
    }
  } catch (error) {
    console.warn("[auth] ownerEmail backfill skipped", error);
  }

  const normalizedEmail = normalizeUserId(email);
  await upsertUserProfile({
    authId: normalizedEmail || LOCAL_DEMO_USER_ID,
    email: normalizedEmail,
    role: "user",
    status: "active",
    touchLoginAt: true,
  }).catch(() => null);

  await recordActivity({
    userId: normalizedEmail || LOCAL_DEMO_USER_ID,
    userEmail: normalizedEmail,
    role: "user",
    action: "user_login",
    targetType: "session",
    targetId: null,
    metadata: { source: "password_login" },
  }).catch(() => null);

  redirect(nextPath.startsWith("/") ? nextPath : "/dashboard");
}
