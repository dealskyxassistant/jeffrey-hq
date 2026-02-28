import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Result } from "../route";

const DATA_PATH = path.join(process.cwd(), "data", "results.json");

async function readResults(): Promise<Result[]> {
  const raw = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as Result[];
}

async function writeResults(results: Result[]): Promise<void> {
  await writeFile(DATA_PATH, JSON.stringify(results, null, 2), "utf-8");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const results = await readResults();
    const idx = results.findIndex((r) => r.id === params.id);

    if (idx === -1) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const body = await req.json() as Partial<Result>;
    results[idx] = { ...results[idx], ...body, id: results[idx].id };
    await writeResults(results);

    return NextResponse.json(results[idx]);
  } catch (err) {
    console.error("PATCH /api/results/[id] error:", err);
    return NextResponse.json({ error: "Failed to update result" }, { status: 500 });
  }
}
