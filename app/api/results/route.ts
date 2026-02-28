import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "results.json");

export interface Result {
  id: string;
  agentId: string;
  jobId: string | null;
  type: "leads-csv" | "copy" | "research" | "code";
  title: string;
  content: string;
  status: "new" | "approved" | "changes-requested";
  createdAt: string;
  feedback: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    let results = JSON.parse(raw) as Result[];

    const { searchParams } = req.nextUrl;
    const agentId = searchParams.get("agentId");
    const type = searchParams.get("type");
    const dateFilter = searchParams.get("date");

    if (agentId) {
      results = results.filter((r) => r.agentId === agentId);
    }
    if (type) {
      results = results.filter((r) => r.type === type);
    }
    if (dateFilter === "today") {
      const today = new Date().toISOString().slice(0, 10);
      results = results.filter((r) => r.createdAt.startsWith(today));
    } else if (dateFilter === "week") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      results = results.filter((r) => new Date(r.createdAt) >= weekAgo);
    }

    // Sort newest first
    results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error("GET /api/results error:", err);
    return NextResponse.json({ error: "Failed to read results" }, { status: 500 });
  }
}
