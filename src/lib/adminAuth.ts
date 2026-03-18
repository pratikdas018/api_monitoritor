import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE_NAME = "apm_admin_session";
const ADMIN_SESSION_TTL_SECONDS = Number(process.env.ADMIN_SESSION_TTL_SECONDS ?? "28800");

type AdminRole = "admin";

export type AdminSession = {
  email: string;
  role: AdminRole;
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function encodeBase64Url(value: string) {
  return bytesToBase64(encoder.encode(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function encodeBytesBase64Url(bytes: Uint8Array) {
  return bytesToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return decoder.decode(base64ToBytes(`${normalized}${padding}`));
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function getAdminSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "change-this-admin-session-secret"
  );
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getAdminSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function signPayload(encodedPayload: string) {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(encodedPayload));
  return encodeBytesBase64Url(new Uint8Array(signature));
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getExpectedAdminEmail() {
  return normalizeEmail(process.env.ADMIN_LOGIN_EMAIL ?? "");
}

export function getExpectedAdminPassword() {
  return process.env.ADMIN_LOGIN_PASSWORD ?? "";
}

export function isValidAdminCredentials(email: string, password: string) {
  const expectedEmail = getExpectedAdminEmail();
  const expectedPassword = getExpectedAdminPassword();
  if (!expectedEmail || !expectedPassword) return false;
  return normalizeEmail(email) === expectedEmail && password === expectedPassword;
}

export async function createAdminSessionToken(email: string) {
  const session: AdminSession = {
    email: normalizeEmail(email),
    role: "admin",
    exp: Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(session));
  const signature = await signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string): Promise<AdminSession | null> {
  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) return null;

  const expectedSignature = await signPayload(encodedPayload);
  if (!constantTimeEqual(providedSignature, expectedSignature)) {
    return null;
  }

  try {
    const decoded = decodeBase64Url(encodedPayload);
    const parsed = JSON.parse(decoded) as AdminSession;
    if (parsed.role !== "admin") return null;
    if (!parsed.email || typeof parsed.email !== "string") return null;
    if (!parsed.exp || Date.now() > parsed.exp) return null;
    return {
      email: normalizeEmail(parsed.email),
      role: "admin",
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

export async function getAdminSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? "";
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export async function getAdminSessionFromCookies() {
  const token = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value ?? "";
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export async function requireAdminRequest(request: NextRequest) {
  const admin = await getAdminSessionFromRequest(request);
  if (!admin) {
    return {
      admin: null,
      error: NextResponse.json({ error: "Unauthorized: admin login required" }, { status: 401 }),
    };
  }

  return { admin, error: null as NextResponse | null };
}
