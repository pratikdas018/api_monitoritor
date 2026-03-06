import { connectToDatabase } from "@/lib/db";
import Project from "@/models/Project";

const DEFAULT_PROJECT_NAME = "Production APIs";
const DEFAULT_PROJECT_DESCRIPTION = "Primary production API services.";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function normalizeUserSuffix(userId: string) {
  return userId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 8);
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

async function getGloballyUniqueSlug(baseSlug: string, userId: string) {
  const safeBase = baseSlug || "project";
  const userSuffix = normalizeUserSuffix(userId) || "user";
  let sequence = 0;

  // Handle both legacy global unique(slug) and new composite unique(userId, slug).
  while (true) {
    const candidate =
      sequence === 0
        ? safeBase
        : `${safeBase}-${userSuffix}-${sequence}`;
    const collision = await Project.exists({ slug: candidate });
    if (!collision) {
      return candidate.slice(0, 100);
    }
    sequence += 1;
  }
}

export async function ensureDefaultProject(userId = "legacy") {
  await connectToDatabase();

  const existing = await Project.findOne({
    userId,
    name: DEFAULT_PROJECT_NAME,
  }).sort({ createdAt: 1 });
  if (existing) {
    return existing;
  }

  const defaultBaseSlug = slugify(DEFAULT_PROJECT_NAME) || "production-apis";
  const candidateSlug = await getGloballyUniqueSlug(defaultBaseSlug, userId);

  try {
    return await Project.create({
      userId,
      name: DEFAULT_PROJECT_NAME,
      slug: candidateSlug,
      description: DEFAULT_PROJECT_DESCRIPTION,
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }

    // Retry once for race conditions / stale unique index behavior.
    const retrySlug = await getGloballyUniqueSlug(defaultBaseSlug, userId);
    return Project.create({
      userId,
      name: DEFAULT_PROJECT_NAME,
      slug: retrySlug,
      description: DEFAULT_PROJECT_DESCRIPTION,
    });
  }
}

export async function getProjects(userId = "legacy") {
  await connectToDatabase();
  return Project.find({ userId }).sort({ createdAt: 1 }).lean();
}

export async function createProject(
  input: { name: string; description?: string },
  userId = "legacy",
) {
  await connectToDatabase();

  const normalizedName = input.name.trim();
  const existingByName = await Project.findOne({ userId, name: normalizedName }).sort({ createdAt: 1 });
  if (existingByName) {
    return existingByName;
  }

  const baseSlug = slugify(normalizedName) || "project";
  let candidate = await getGloballyUniqueSlug(baseSlug, userId);

  try {
    return await Project.create({
      userId,
      name: normalizedName,
      slug: candidate,
      description: input.description?.trim() || null,
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }

    candidate = await getGloballyUniqueSlug(baseSlug, userId);
    return Project.create({
      userId,
      name: normalizedName,
      slug: candidate,
      description: input.description?.trim() || null,
    });
  }
}
