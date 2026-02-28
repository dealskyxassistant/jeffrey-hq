import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { getDataPath } from "@/lib/dataPath";

export interface Job {
  id: string;
  name: string;
  agentId: string;
  description: string;
  skill: string;
  schedule: "daily" | "3x-daily" | "weekly" | "monthly" | "once";
  time: string;
  active: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  lastStatus: "scheduled" | "running" | "done" | "failed" | "review-needed";
  createdAt: string;
}

async function readJobs(): Promise<Job[]> {
  try {
    const p = await getDataPath("jobs.json");
    const raw = await readFile(p, "utf-8");
    return JSON.parse(raw) as Job[];
  } catch {
    return [];
  }
}

async function writeJobs(jobs: Job[]): Promise<void> {
  const p = await getDataPath("jobs.json");
  await writeFile(p, JSON.stringify(jobs, null, 2), "utf-8");
}

export async function GET() {
  const jobs = await readJobs();
  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<Job>;
    const jobs = await readJobs();
    const newJob: Job = {
      id: randomUUID(),
      name: body.name ?? "Neuer Job",
      agentId: body.agentId ?? "main",
      description: body.description ?? "",
      skill: body.skill ?? "",
      schedule: body.schedule ?? "daily",
      time: body.time ?? "09:00",
      active: body.active ?? true,
      lastRunAt: null,
      nextRunAt: body.nextRunAt ?? null,
      lastStatus: "scheduled",
      createdAt: new Date().toISOString(),
    };
    jobs.push(newJob);
    await writeJobs(jobs);
    return NextResponse.json(newJob, { status: 201 });
  } catch (err) {
    console.error("POST /api/jobs error:", err);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
