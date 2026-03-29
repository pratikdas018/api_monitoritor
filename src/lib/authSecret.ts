let hasShownMissingAuthSecretWarning = false;

export function resolveAuthSecret() {
  const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim() ?? "";
  const authSecret = process.env.AUTH_SECRET?.trim() ?? "";
  const resolved = nextAuthSecret || authSecret;

  if (resolved) {
    // Keep both env keys aligned so all auth helpers decode the same session token.
    if (!nextAuthSecret) {
      process.env.NEXTAUTH_SECRET = resolved;
    }
    if (!authSecret) {
      process.env.AUTH_SECRET = resolved;
    }
    return resolved;
  }

  if (!hasShownMissingAuthSecretWarning) {
    hasShownMissingAuthSecretWarning = true;
    console.error("[auth] Missing NEXTAUTH_SECRET/AUTH_SECRET. Sessions may be unstable.");
  }

  return "";
}
