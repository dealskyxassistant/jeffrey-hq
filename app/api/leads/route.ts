import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const dataDir = isVercel ? "/tmp/jeffrey-hq-data" : path.join(process.cwd(), "data");
const leadsFile = path.join(dataDir, "leads.json");

async function getLeads() {
  await mkdir(dataDir, { recursive: true });
  if (!existsSync(leadsFile)) return [];
  const raw = await readFile(leadsFile, "utf-8");
  return JSON.parse(raw);
}

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json(leads);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = process.env.HQ_PASSWORD;
  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { filename, csvContent, totalLeads, approvedLeads, rejectedLeads, qaReport, date } = body;

    const leads = await getLeads();
    leads.unshift({
      id: Date.now().toString(),
      filename,
      csvContent,
      totalLeads,
      approvedLeads,
      rejectedLeads,
      qaReport,
      date: date || new Date().toISOString(),
    });

    await writeFile(leadsFile, JSON.stringify(leads, null, 2));
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
