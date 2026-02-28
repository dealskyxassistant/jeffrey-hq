"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  agent: string;
  description?: string;
  createdAt: string;
}

interface Tasks {
  scheduled: Task[];
  running: Task[];
  done: Task[];
}

const COLUMNS = [
  {
    key: "scheduled" as keyof Tasks,
    label: "Scheduled",
    icon: "🕐",
    color: "border-blue-800",
    headerColor: "text-blue-400",
    badgeColor: "bg-blue-900/40 text-blue-400",
  },
  {
    key: "running" as keyof Tasks,
    label: "Running",
    icon: "⚡",
    color: "border-indigo-800",
    headerColor: "text-indigo-400",
    badgeColor: "bg-indigo-900/40 text-indigo-400",
  },
  {
    key: "done" as keyof Tasks,
    label: "Done",
    icon: "✅",
    color: "border-green-800",
    headerColor: "text-green-400",
    badgeColor: "bg-green-900/40 text-green-400",
  },
];

const AGENT_EMOJIS: Record<string, string> = {
  Jeffrey: "🧠",
  Leads: "🔍",
  Copy: "✍️",
  Coding: "💻",
  Research: "🔬",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Tasks>({ scheduled: [], running: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState<string | null>(null);

  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function moveTask(id: string, fromStatus: keyof Tasks, toStatus: keyof Tasks) {
    setMoving(id);
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fromStatus, toStatus }),
      });
      if (res.ok) {
        await fetchTasks();
      }
    } catch (err) {
      console.error("Failed to move task", err);
    } finally {
      setMoving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500 text-sm">Lade Tasks...</div>
      </div>
    );
  }

  const totalTasks = tasks.scheduled.length + tasks.running.length + tasks.done.length;

  return (
    <div>
      {totalTasks === 0 && (
        <div className="text-center py-16 text-gray-500 text-sm">
          Keine Tasks vorhanden. Tasks werden via Jeffrey-Agent erstellt.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = tasks[col.key] || [];
          const nextCols = COLUMNS.slice(COLUMNS.indexOf(col) + 1);
          const prevCols = COLUMNS.slice(0, COLUMNS.indexOf(col));

          return (
            <div key={col.key} className={`bg-gray-900 border ${col.color} rounded-xl overflow-hidden`}>
              {/* Column Header */}
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{col.icon}</span>
                  <h3 className={`font-semibold text-sm ${col.headerColor}`}>{col.label}</h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.badgeColor}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="p-3 space-y-3 min-h-[200px]">
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-gray-700 text-xs">
                    Keine Tasks
                  </div>
                )}
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-all ${
                      moving === task.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-medium text-white leading-snug">{task.title}</h4>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-400">
                        {AGENT_EMOJIS[task.agent] || "🤖"} {task.agent}
                      </span>
                      <span className="text-gray-700">·</span>
                      <span className="text-xs text-gray-600">{formatDate(task.createdAt)}</span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{task.description}</p>
                    )}

                    {/* Move buttons */}
                    <div className="flex gap-1.5 flex-wrap">
                      {prevCols.map((prev) => (
                        <button
                          key={prev.key}
                          onClick={() => moveTask(task.id, col.key, prev.key)}
                          disabled={!!moving}
                          className="text-xs text-gray-500 hover:text-gray-300 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          ← {prev.label}
                        </button>
                      ))}
                      {nextCols.map((next) => (
                        <button
                          key={next.key}
                          onClick={() => moveTask(task.id, col.key, next.key)}
                          disabled={!!moving}
                          className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-800 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {next.label} →
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
