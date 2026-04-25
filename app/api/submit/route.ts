import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body.name || !body.city || !body.state || !body.cadence || !body.description || !body.organizerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Require at least one contact link
    if (!body.website && !body.twitter && !body.nostr && !body.telegram) {
      return NextResponse.json(
        { error: "Please provide at least one contact link (website, X, Nostr, or Telegram)" },
        { status: 400 }
      );
    }

    // Very light honeypot / spam check
    if (body.name.length > 200 || body.description.length > 2000) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    // For MVP, append submission to a JSON file. Migrate to Postgres later.
    const submissionsDir = path.join(process.cwd(), "data");
    const submissionsPath = path.join(submissionsDir, "submissions.json");

    let existing: unknown[] = [];
    try {
      const contents = await fs.readFile(submissionsPath, "utf-8");
      existing = JSON.parse(contents);
    } catch {
      // File doesn't exist yet, start fresh
      existing = [];
    }

    const submission = {
      ...body,
      submittedAt: new Date().toISOString(),
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: "pending_review",
    };

    existing.push(submission);
    await fs.writeFile(submissionsPath, JSON.stringify(existing, null, 2), "utf-8");

    return NextResponse.json({ ok: true, id: submission.id });
  } catch (err) {
    console.error("Submission error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
