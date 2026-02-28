"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Nav from "@/components/Nav";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface AgentDetail {
  id: string;
  name: string;
  emoji: string;
  model: string;
  role: string;
  soul: string;
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

type Tab = "overview" | "jobs" | "results" | "skills";

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

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [agentRes, jobsRes, resultsRes] = await Promise.all([
          fetch(`/api/agents/${id}`),
          fetch("/api/jobs"),
          fetch("/api/results"),
        ]);
        const [agentData, jobsData, resultsData] = await Promise.all([
          agentRes.json() as Promise<AgentDetail>,
          jobsRes.json() as Promise<Job[]>,
          resultsRes.json() as Promise<Result[]>,
        ]);
        setAgent(agentData);
        setJobs(jobsData.filter((j) => j.agentId === id));
        setResults(resultsData.filter((r) => r.agentId === id).slice(0, 10));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Nav />
        <div className="flex items-center justify-center h-64 text-gray-400">Lade Agent...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Nav />
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-gray-400">Agent nicht gefunden</div>
          <Link href="/agents" className="text-indigo-500 hover:underline text-sm">← Zurück</Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "jobs", label: "Jobs", count: jobs.length },
    { id: "results", label: "Results", count: results.length },
    { id: "skills", label: "Skills", count: agent.skills.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Nav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/agents" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            ← Agenten
          </Link>
        </div>

        {/* Hero */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-4xl">
                {agent.emoji}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{agent.name}</h1>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{agent.role}</div>
                <div className="text-xs text-gray-400 dark:text-gray-600 font-mono mt-1">{agent.model}</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Active
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1.5 shadow-sm dark:shadow-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {t.label}
              {t.count != null && t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "overview" && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm dark:shadow-none">
            {agent.soul ? (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:rounded prose-code:px-1 prose-strong:text-gray-900 dark:prose-strong:text-white">
                <ReactMarkdown>{agent.soul}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                <div className="text-4xl mb-3">📄</div>
                <div>Keine SOUL.md gefunden</div>
              </div>
            )}
          </div>
        )}

        {tab === "jobs" && (
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center text-gray-400 dark:text-gray-600 shadow-sm dark:shadow-none">
                <div className="text-4xl mb-3">🎯</div>
                <div>Keine Jobs für diesen Agent</div>
                <Link href="/jobs" className="mt-3 inline-block text-sm text-indigo-500 hover:underline">Job erstellen →</Link>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm dark:shadow-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{job.name}</div>
                      {job.lastRunAt && (
                        <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">Letzter Run: {relativeTime(job.lastRunAt)}</div>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                      job.lastStatus === "success"
                        ? "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                        : job.lastStatus === "running"
                        ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                        : job.lastStatus === "error"
                        ? "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                    }`}>
                      {job.lastStatus || "idle"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "results" && (
          <div className="space-y-3">
            {results.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center text-gray-400 dark:text-gray-600 shadow-sm dark:shadow-none">
                <div className="text-4xl mb-3">📬</div>
                <div>Keine Results vorhanden</div>
              </div>
            ) : (
              results.map((result) => (
                <div key={result.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm dark:shadow-none">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{result.title}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        result.status === "new"
                          ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      }`}>
                        {result.status}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-600">{relativeTime(result.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{result.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "skills" && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm dark:shadow-none">
            {agent.skills.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                <div className="text-4xl mb-3">🛠️</div>
                <div>Keine Skills gefunden</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {agent.skills.map((skill) => (
                  <div key={skill} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3">
                    <span className="text-lg">🛠️</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{skill}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-600">Skill-Modul</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
