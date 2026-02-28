"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

interface AgentDef {
  id: string;
  name: string;
  emoji: string;
  model: string;
  role: string;
  skills: string[];
}

interface Job {
  id: string;
  name: string;
  agentId: string;
  lastRunAt: string | null;
  lastStatus: string;
  active: boolean;
}

interface Result {
  id: string;
  agentId: string;
  title: string;
  content: string;
  createdAt: string;
  status: string;
}

interface AgentLiveData {
  status: "active" | "running" | "idle";
  lastJob: Job | null;
  lastResult: Result | null;
}

const AGENT_DEFS: AgentDef[] = [
  {
    id: "main",
    name: "Jeffrey",
    emoji: "🧠",
    model: "Claude Sonnet",
    role: "Orchestrator",
    skills: ["Task Planning", "Agent Routing", "Memory Management", "Cron Scheduling"],
  },
  {
    id: "leads",
    name: "Leads",
    emoji: "🔍",
    model: "GPT-4o",
    role: "Lead Recherche",
    skills: ["Impressum Scraping", "Contact Research", "CSV Export", "Firecrawl"],
  },
  {
    id: "copy",
    name: "Copy",
    emoji: "✍️",
    model: "Claude Sonnet",
    role: "Outreach Copy",
    skills: ["Cold Email", "Follow-up Sequences", "A/B Variants", "Personalisierung"],
  },
  {
    id: "coding",
    name: "Coding",
    emoji: "💻",
    model: "Claude Sonnet",
    role: "Dev",
    skills: ["GitHub Repos", "Next.js", "API Development", "Debugging"],
  },
  {
    id: "research",
    name: "Research",
    emoji: "🔬",
    model: "GPT-4o",
    role: "Marktanalyse",
    skills: ["Competitor Analysis", "Market Trends", "Web Search", "Reports"],
  },
];

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Gerade eben";
  if (mins < 60) return `vor ${mins} Min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours}h`;
  return `vor ${Math.floor(hours / 24)}d`;
}

function AgentCard({
  agent,
  liveData,
  onRunJob,
}: {
  agent: AgentDef;
  liveData: AgentLiveData;
  onRunJob: (agentId: string) => void;
}) {
  const { status, lastJob, lastResult } = liveData;
  const isRunning = lastJob?.lastStatus === "running";

  const statusConfig = {
    active: {
      label: "Active",
      className: "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
      dot: "bg-green-400",
    },
    running: {
      label: "Running",
      className: "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      dot: "bg-indigo-400 animate-pulse",
    },
    idle: {
      label: "Idle",
      className: "bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      dot: "bg-yellow-400",
    },
  };

  const sc = isRunning ? statusConfig.running : statusConfig[status];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xl">
            {agent.emoji}
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm">{agent.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">{agent.role}</div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${sc.className}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          {sc.label}
        </span>
      </div>

      {/* Model */}
      <div className="text-xs text-gray-400 dark:text-gray-600 font-mono">{agent.model}</div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1">
        {agent.skills.slice(0, 3).map((s) => (
          <span key={s} className="text-[10px] text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
            {s}
          </span>
        ))}
      </div>

      {/* Last Output */}
      {lastResult && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 text-xs">
          <div className="text-gray-400 dark:text-gray-500 mb-1">Letzter Output · {relativeTime(lastResult.createdAt)}</div>
          <div className="text-gray-700 dark:text-gray-300 line-clamp-2">{lastResult.content.split("\n")[0]}</div>
        </div>
      )}

      {/* Last Job */}
      {lastJob && (
        <div className="text-xs text-gray-500">
          <span className="text-gray-400 dark:text-gray-600">Letzter Job: </span>
          <span className="text-gray-600 dark:text-gray-400 truncate">{lastJob.name}</span>
          {lastJob.lastRunAt && (
            <span className="text-gray-400 dark:text-gray-600"> · {relativeTime(lastJob.lastRunAt)}</span>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={() => onRunJob(agent.id)}
          className="flex-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800/40 px-3 py-1.5 rounded-lg transition-all text-center"
        >
          ▶ Run Job
        </button>
        <Link
          href={`/inbox?agentId=${agent.id}`}
          className="flex-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-all text-center"
        >
          📬 Inbox
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [jobsRes, resultsRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/results"),
      ]);
      const [jobsData, resultsData] = await Promise.all([
        jobsRes.json() as Promise<Job[]>,
        resultsRes.json() as Promise<Result[]>,
      ]);
      setJobs(jobsData);
      setResults(resultsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    const interval = setInterval(() => void loadData(), 30000);
    return () => clearInterval(interval);
  }, []);

  function getLiveData(agentId: string): AgentLiveData {
    const agentJobs = jobs.filter((j) => j.agentId === agentId && j.active);
    const lastJob =
      agentJobs.sort((a, b) =>
        (b.lastRunAt ?? "").localeCompare(a.lastRunAt ?? "")
      )[0] ?? null;
    const agentResults = results.filter((r) => r.agentId === agentId);
    const lastResult = agentResults[0] ?? null;
    const isRunning = lastJob?.lastStatus === "running";
    const hasJobs = agentJobs.length > 0;
    const status: "active" | "running" | "idle" = isRunning
      ? "running"
      : hasJobs
      ? "active"
      : "idle";
    return { status, lastJob, lastResult };
  }

  async function handleRunJob(agentId: string) {
    const agentJobs = jobs.filter((j) => j.agentId === agentId && j.active);
    if (agentJobs.length === 0) {
      window.location.href = "/jobs";
      return;
    }
    const job = agentJobs[0];
    await fetch(`/api/jobs/${job.id}/run`, { method: "POST" });
    await loadData();
  }

  const cronJobs = [
    { name: "Lead Batch Scraper", agent: "Leads 🔍", cadence: "Täglich 09:00", next: "Morgen 09:00 Uhr", status: "active" },
    { name: "Outreach Email Blast", agent: "Copy ✍️", cadence: "Mo + Do 10:00", next: "Mo 10:00 Uhr", status: "active" },
    { name: "Market Research Digest", agent: "Research 🔬", cadence: "Wöchentlich Mo", next: "Mo 08:00 Uhr", status: "active" },
    { name: "Task Board Cleanup", agent: "Jeffrey 🧠", cadence: "Täglich 23:00", next: "Heute 23:00 Uhr", status: "active" },
    { name: "GitHub Sync Check", agent: "Coding 💻", cadence: "Alle 4h", next: "In 2h 14min", status: "paused" },
  ];

  const activeCount = AGENT_DEFS.filter((a) => getLiveData(a.id).status === "active").length;
  const runningCount = AGENT_DEFS.filter((a) => getLiveData(a.id).status === "running").length;
  const newResultsCount = results.filter((r) => r.status === "new").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Mission Control <span className="text-indigo-500">↗</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Dealsky AI Agent Network · Live Dashboard
              {!loading && (
                <span className="ml-2 text-xs text-gray-400 dark:text-gray-600">· Auto-refresh alle 30s</span>
              )}
            </p>
          </div>
          {newResultsCount > 0 && (
            <Link
              href="/inbox"
              className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              📬 {newResultsCount} neue Results
            </Link>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Aktive Agenten" value={activeCount.toString()} color="indigo" />
          <StatCard label="Running" value={runningCount.toString()} color="green" />
          <StatCard label="Neue Results" value={newResultsCount.toString()} color="yellow" />
          <StatCard label="Total Agenten" value={AGENT_DEFS.length.toString()} color="gray" />
        </div>

        {/* Agents Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Agent Network</h2>
            <Link href="/agents" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
              Alle anzeigen →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">Lade...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {AGENT_DEFS.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  liveData={getLiveData(agent.id)}
                  onRunJob={(id) => void handleRunJob(id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Cron Jobs Section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cron Jobs</h2>
            <Link href="/jobs" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
              Job Center →
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-transparent">
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider px-6 py-3">Job</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider px-6 py-3">Agent</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Kadenz</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Nächster Run</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {cronJobs.map((job, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{job.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{job.agent}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{job.cadence}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{job.next}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === "active"
                          ? "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                          : "bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${job.status === "active" ? "bg-green-400" : "bg-yellow-400"}`} />
                        {job.status === "active" ? "Aktiv" : "Pausiert"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    indigo: "text-indigo-600 dark:text-indigo-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    green: "text-green-600 dark:text-green-400",
    gray: "text-gray-600 dark:text-gray-400",
  };
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm dark:shadow-none">
      <div className={`text-2xl font-bold ${colors[color] ?? "text-gray-900 dark:text-white"}`}>{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{label}</div>
    </div>
  );
}
