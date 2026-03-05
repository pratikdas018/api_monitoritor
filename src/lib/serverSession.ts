import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, USER_ID_COOKIE_NAME } from "@/lib/auth";

export function getSessionUserId() {
  const cookieStore = cookies();
  const hasSession = Boolean(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!hasSession) return null;

  const rawUserId = cookieStore.get(USER_ID_COOKIE_NAME)?.value ?? "";
  let userId = rawUserId.trim();
  try {
    userId = decodeURIComponent(userId);
  } catch {
    // Keep raw value if decode fails.
  }
  return userId.length > 0 ? userId : null;
}
