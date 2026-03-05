import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, USER_ID_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  cookies().set(SESSION_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
  });
  cookies().set(USER_ID_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
