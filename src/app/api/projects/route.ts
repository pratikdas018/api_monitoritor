import { NextRequest, NextResponse } from "next/server";

import { ensurePayloadUserMatch, requireUserId } from "@/lib/apiAuth";
import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import { createProject } from "@/lib/projects";
import { createProjectSchema } from "@/lib/validators";
import Project from "@/models/Project";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (!hasMongoConfig()) {
      return NextResponse.json({ projects: [] }, { status: 200 });
    }

    const auth = requireUserId(request);
    if (auth.error) {
      return auth.error;
    }

    await connectToDatabase();
    const projects = await Project.find({ userId: auth.userId }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("[api/projects] GET failed", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!hasMongoConfig()) {
      return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
    }

    const auth = requireUserId(request);
    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();
    const payloadMismatch = ensurePayloadUserMatch(body?.userId, auth.userId as string);
    if (payloadMismatch) {
      return payloadMismatch;
    }

    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid project payload" },
        { status: 400 },
      );
    }

    const project = await createProject(parsed.data, auth.userId as string);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("[api/projects] POST failed", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
