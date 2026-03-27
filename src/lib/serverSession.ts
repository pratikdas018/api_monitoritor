import { auth } from "@/lib/auth";

function normalizeEmail(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

export async function getSessionUserId() {
  const session = await auth();
  if (!session?.user) return null;

  // Use email as our tenant key so monitors/projects stay scoped per mailbox.
  const email = normalizeEmail(session.user.email);
  if (email) return email;

  const id = session.user.id?.trim();
  return id && id.length > 0 ? id : null;
}

export async function getSessionUserEmail() {
  const session = await auth();
  return normalizeEmail(session?.user?.email);
}
