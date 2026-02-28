import { NextResponse } from "next/server";
import { readFile, readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const LEADS_DIR = "/Users/m1/.openclaw/workspace-leads/leads";

interface Lead {
  firma: string;
  gf: string;
  email: string;
  telefon: string;
  stadt: string;
  status: string;
  kategorie: string;
  createdAt: string;
}

function detectCategory(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("recruit")) return "Recruiting";
  if (lower.includes("neukunden") || lower.includes("outreach")) return "Neukundengewinnung";
  if (lower.includes("web") || lower.includes("design")) return "Webdesign";
  return "Sonstige";
}

function parseCSV(content: string, filename: string, fileDate: string): Lead[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const kategorie = detectCategory(filename);

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });

    const gfFirst = row["gf_vorname"] ?? row["vorname"] ?? "";
    const gfLast = row["gf_nachname"] ?? row["nachname"] ?? "";
    const gf = [gfFirst, gfLast].filter(Boolean).join(" ") || row["gf"] || "";

    // Determine status
    let status = "neu";
    if (row["status"]) {
      status = row["status"];
    } else if (row["email"] && row["telefon"]) {
      status = "enriched";
    }

    return {
      firma: row["firma"] ?? "",
      gf,
      email: row["email"] ?? "",
      telefon: row["telefon"] ?? "",
      stadt: row["stadt"] ?? "",
      status,
      kategorie,
      createdAt: fileDate,
    };
  }).filter((l) => l.firma);
}

export async function GET() {
  if (!existsSync(LEADS_DIR)) {
    return NextResponse.json({ leads: [], stats: { today: 0, week: 0, total: 0, avgScore: 0, lastSent: null } });
  }

  try {
    const files = await readdir(LEADS_DIR);
    const csvFiles = files.filter((f) => f.endsWith(".csv"));

    const allLeads: Lead[] = [];
    let lastModified: Date | null = null;

    for (const file of csvFiles) {
      const filePath = path.join(LEADS_DIR, file);
      const [content, fileStat] = await Promise.all([
        readFile(filePath, "utf-8"),
        stat(filePath),
      ]);
      const fileDate = fileStat.mtime.toISOString();
      if (!lastModified || fileStat.mtime > lastModified) {
        lastModified = fileStat.mtime;
      }
      const leads = parseCSV(content, file, fileDate);
      allLeads.push(...leads);
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;

    const today = allLeads.filter((l) => new Date(l.createdAt).getTime() >= todayStart).length;
    const week = allLeads.filter((l) => new Date(l.createdAt).getTime() >= weekStart).length;

    return NextResponse.json({
      leads: allLeads,
      stats: {
        today,
        week,
        total: allLeads.length,
        avgScore: allLeads.length > 0 ? 78 : 0, // placeholder quality score
        lastSent: lastModified?.toISOString() ?? null,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to read leads" }, { status: 500 });
  }
}
