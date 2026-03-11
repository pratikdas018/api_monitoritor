import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, USER_EMAIL_COOKIE_NAME, USER_ID_COOKIE_NAME } from "@/lib/auth";

function looksLikeEmail(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 6 || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function decodeCookieValue(value: string) {
  let decoded = value.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Keep raw value if decode fails.
  }
  return decoded.trim();
}

export function getSessionUserId() {
  const cookieStore = cookies();
  const hasSession = Boolean(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!hasSession) return null;

  const rawUserId = cookieStore.get(USER_ID_COOKIE_NAME)?.value ?? "";
  const userId = decodeCookieValue(rawUserId);
  return userId.length > 0 ? userId : null;
}

export function getSessionUserEmail() {
  const cookieStore = cookies();
  const hasSession = Boolean(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!hasSession) return null;

  const rawEmail = cookieStore.get(USER_EMAIL_COOKIE_NAME)?.value ?? "";
  const email = decodeCookieValue(rawEmail);
  if (email && looksLikeEmail(email)) {
    return email.toLowerCase();
  }

  // Email/password flow uses userId=email; allow that as a fallback.
  const userId = getSessionUserId();
  if (userId && looksLikeEmail(userId)) {
    return userId.toLowerCase();
  }

  return null;
}
