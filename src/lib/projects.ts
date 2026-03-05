import { connectToDatabase } from "@/lib/db";
import Project from "@/models/Project";

const DEFAULT_PROJECT_NAME = "Production APIs";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export async function ensureDefaultProject(userId = "legacy") {
  await connectToDatabase();

  const existing = await Project.findOne({
    userId,
    slug: slugify(DEFAULT_PROJECT_NAME),
  });
  if (existing) {
    return existing;
  }

  return Project.create({
    userId,
    name: DEFAULT_PROJECT_NAME,
    slug: slugify(DEFAULT_PROJECT_NAME),
    description: "Primary production API services.",
  });
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

  const baseSlug = slugify(input.name);
  let candidate = baseSlug;
  let sequence = 1;

  while (await Project.exists({ userId, slug: candidate })) {
    sequence += 1;
    candidate = `${baseSlug}-${sequence}`;
  }

  return Project.create({
    userId,
    name: input.name.trim(),
    slug: candidate,
    description: input.description?.trim() || null,
  });
}
