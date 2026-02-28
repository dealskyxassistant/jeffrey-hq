import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Job } from "../route";

const DATA_PATH = path.join(process.cwd(), "data", "jobs.json");

async function readJobs(): Promise<Job[]> {
  const raw = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as Job[];
}

async function writeJobs(jobs: Job[]): Promise<void> {
  await writeFile(DATA_PATH, JSON.stringify(jobs, null, 2), "utf-8");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobs = await readJobs();
    const idx = jobs.findIndex((j) => j.id === params.id);

    if (idx === -1) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const body = await req.json() as Partial<Job>;
    jobs[idx] = { ...jobs[idx], ...body, id: jobs[idx].id };
    await writeJobs(jobs);

    return NextResponse.json(jobs[idx]);
  } catch (err) {
    console.error("PATCH /api/jobs/[id] error:", err);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobs = await readJobs();
    const idx = jobs.findIndex((j) => j.id === params.id);

    if (idx === -1) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    jobs.splice(idx, 1);
    await writeJobs(jobs);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/jobs/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
