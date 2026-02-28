"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";

type Schedule = "daily" | "3x-daily" | "weekly" | "monthly" | "once";
type JobStatus = "scheduled" | "running" | "done" | "failed" | "review-needed";

interface Job {
  id: string;
  name: string;
  agentId: string;
  description: string;
  skill: string;
  schedule: Schedule;
  time: string;
  active: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  lastStatus: JobStatus;
  createdAt: string;
}

const AGENTS = [
  { id: "main", name: "Jeffrey", emoji: "🧠" },
  { id: "leads", name: "Leads", emoji: "🔍" },
  { id: "copy", name: "Copy", emoji: "✍️" },
  { id: "coding", name: "Coding", emoji: "💻" },
  { id: "research", name: "Research", emoji: "🔬" },
];

const SCHEDULE_LABELS: Record<Schedule, string> = {
  daily: "Täglich",
  "3x-daily": "3x täglich",
  weekly: "Wöchentlich",
  monthly: "Monatlich",
  once: "Einmalig",
};

const STATUS_CONFIG: Record<JobStatus, { label: string; className: string; dot: string }> = {
  scheduled: {
    label: "Scheduled",
    className: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    dot: "bg-gray-400",
  },
  running: {
    label: "Running",
    className: "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700",
    dot: "bg-indigo-400 animate-pulse",
  },
  done: {
    label: "Done",
    className: "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    dot: "bg-green-400",
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    dot: "bg-red-400",
  },
  "review-needed": {
    label: "Review Needed",
    className: "bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    dot: "bg-yellow-400",
  },
};

function getAgent(id: string) {
  return AGENTS.find((a) => a.id === id) ?? { id, name: id, emoji: "🤖" };
}

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

function formatNext(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday)
    return `Heute ${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`;
  return (
    d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) +
    " " +
    d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
  );
}

const EMPTY_FORM = {
  name: "",
  agentId: "leads",
  description: "",
  skill: "",
  schedule: "daily" as Schedule,
  time: "09:00",
  active: true,
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "by-agent" | "history">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [runningIds, setRunningIds] = useState<Set<string>>(new Set());

  async function loadJobs() {
    try {
      const res = await fetch("/api/jobs");
      const data = (await res.json()) as Job[];
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadJobs();
  }, []);

  function openNew() {
    setEditingJob(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(job: Job) {
    setEditingJob(job);
    setForm({
      name: job.name,
      agentId: job.agentId,
      description: job.description,
      skill: job.skill,
      schedule: job.schedule,
      time: job.time,
      active: job.active,
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingJob) {
        await fetch(`/api/jobs/${editingJob.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setShowModal(false);
      await loadJobs();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Job wirklich löschen?")) return;
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    await loadJobs();
  }

  async function handleRunNow(id: string) {
    setRunningIds((prev) => new Set(prev).add(id));
    await fetch(`/api/jobs/${id}/run`, { method: "POST" });
    await loadJobs();
    setRunningIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const displayedJobs =
    tab === "history" ? jobs.filter((j) => j.lastRunAt !== null) : jobs;

  const agentsWithJobs =
    tab === "by-agent"
      ? AGENTS.filter((a) => displayedJobs.some((j) => j.agentId === a.id))
      : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Job Center <span className="text-indigo-500">🎯</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Wiederkehrende Aufgaben für das Agent Network
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + New Job
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-fit border border-gray-200 dark:border-gray-800">
          {(["all", "by-agent", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === t
                  ? "bg-white dark:bg-indigo-600 text-gray-900 dark:text-white shadow-sm dark:shadow-none"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {t === "all" ? "All Jobs" : t === "by-agent" ? "By Agent" : "History"}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <div className="text-4xl mb-3">⏳</div>
            <p>Lade Jobs...</p>
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-400">Keine Jobs gefunden</p>
            <p className="text-sm mt-1 text-gray-500">Erstelle deinen ersten Job mit "New Job"</p>
          </div>
        ) : tab === "by-agent" ? (
          <div className="space-y-8">
            {agentsWithJobs.map((agent) => (
              <div key={agent.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{agent.emoji}</span>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{agent.name}</h2>
                  <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {displayedJobs.filter((j) => j.agentId === agent.id).length} Jobs
                  </span>
                </div>
                <div className="grid gap-3">
                  {displayedJobs
                    .filter((j) => j.agentId === agent.id)
                    .map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onRun={handleRunNow}
                        running={runningIds.has(job.id)}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {displayedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={openEdit}
                onDelete={handleDelete}
                onRun={handleRunNow}
                running={runningIds.has(job.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl dark:shadow-none">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingJob ? "Job bearbeiten" : "Neuer Job"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Job Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="z.B. Lead Research DACH"
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Agent
                </label>
                <select
                  value={form.agentId}
                  onChange={(e) => setForm({ ...form, agentId: e.target.value })}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                >
                  {AGENTS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.emoji} {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Beschreibung / Prompt
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Was soll der Agent tun?"
                  rows={4}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 resize-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Skill (optional)
                </label>
                <input
                  type="text"
                  value={form.skill}
                  onChange={(e) => setForm({ ...form, skill: e.target.value })}
                  placeholder="z.B. firecrawl-scraper"
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Kadenz
                  </label>
                  <select
                    value={form.schedule}
                    onChange={(e) => setForm({ ...form, schedule: e.target.value as Schedule })}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                  >
                    {Object.entries(SCHEDULE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Uhrzeit
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Aktiv</span>
                <button
                  onClick={() => setForm({ ...form, active: !form.active })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    form.active ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                      form.active ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={saving || !form.name}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JobCard({
  job,
  onEdit,
  onDelete,
  onRun,
  running,
}: {
  job: Job;
  onEdit: (j: Job) => void;
  onDelete: (id: string) => void;
  onRun: (id: string) => void;
  running: boolean;
}) {
  const agent = getAgent(job.agentId);
  const status = running ? "running" : job.lastStatus;
  const sc = STATUS_CONFIG[status];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors shadow-sm dark:shadow-none">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
          {agent.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{job.name}</h3>
                {!job.active && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    Inaktiv
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 line-clamp-1">
                {job.description}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${sc.className}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
            <span>🔄 {SCHEDULE_LABELS[job.schedule]} · {job.time}</span>
            <span>▶ Letzter: {relativeTime(job.lastRunAt)}</span>
            <span className="hidden sm:block">⏭ Nächster: {formatNext(job.nextRunAt)}</span>
            {job.skill && (
              <span className="hidden md:block text-indigo-500 dark:text-indigo-400/70">
                🔧 {job.skill}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => void onRun(job.id)}
          disabled={running}
          className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800/40 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
        >
          {running ? "⏳ Running..." : "▶ Run Now"}
        </button>
        <button
          onClick={() => onEdit(job)}
          className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => void onDelete(job.id)}
          className="text-xs text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
