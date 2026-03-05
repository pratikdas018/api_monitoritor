"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LOCAL_DEMO_USER_ID, SESSION_COOKIE_NAME, USER_ID_COOKIE_NAME, isValidLogin, normalizeUserId } from "@/lib/auth";

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

  redirect(nextPath.startsWith("/") ? nextPath : "/dashboard");
}
