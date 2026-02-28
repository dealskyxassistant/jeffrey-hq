import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync, readdirSync } from "fs";
import path from "path";

const WORKSPACE_MAP: Record<string, string> = {
  main: "/Users/m1/.openclaw/workspace",
  leads: "/Users/m1/.openclaw/workspace-leads",
  copy: "/Users/m1/.openclaw/workspace-copy",
  coding: "/Users/m1/.openclaw/workspace-coding",
  research: "/Users/m1/.openclaw/workspace-research",
};

const AGENT_META: Record<string, { name: string; emoji: string; model: string; role: string }> = {
  main: { name: "Jeffrey", emoji: "🧠", model: "Claude Sonnet", role: "Orchestrator" },
  leads: { name: "Leads", emoji: "🔍", model: "GPT-4o", role: "Lead Recherche" },
  copy: { name: "Copy", emoji: "✍️", model: "Claude Sonnet", role: "Outreach Copy" },
  coding: { name: "Coding", emoji: "💻", model: "Claude Sonnet", role: "Dev" },
  research: { name: "Research", emoji: "🔬", model: "GPT-4o", role: "Marktanalyse" },
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const workspace = WORKSPACE_MAP[id];
  const meta = AGENT_META[id];

  if (!workspace || !meta) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  // Read SOUL.md
  let soul = "";
  const soulPath = path.join(workspace, "SOUL.md");
  if (existsSync(soulPath)) {
    soul = await readFile(soulPath, "utf-8");
  }

  // List skills
  const skillsDir = path.join(workspace, "skills");
  let skills: string[] = [];
  if (existsSync(skillsDir)) {
    try {
      skills = readdirSync(skillsDir);
    } catch {
      skills = [];
    }
  }

  return NextResponse.json({
    id,
    ...meta,
    soul,
    skills,
  });
}
