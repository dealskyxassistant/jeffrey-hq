"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";

type ResultStatus = "new" | "approved" | "changes-requested";
type ResultType = "leads-csv" | "copy" | "research" | "code";

interface Result {
  id: string;
  agentId: string;
  jobId: string | null;
  type: ResultType;
  title: string;
  content: string;
  status: ResultStatus;
  createdAt: string;
  feedback: string | null;
}

const AGENTS = [
  { id: "main", name: "Jeffrey", emoji: "🧠" },
  { id: "leads", name: "Leads", emoji: "🔍" },
  { id: "copy", name: "Copy", emoji: "✍️" },
  { id: "coding", name: "Coding", emoji: "💻" },
  { id: "research", name: "Research", emoji: "🔬" },
];

const TYPE_LABELS: Record<ResultType, string> = {
  "leads-csv": "Lead Research",
  copy: "Outreach Copy",
  research: "Research",
  code: "Code",
};

const TYPE_COLORS: Record<ResultType, string> = {
  "leads-csv": "bg-blue-900/40 text-blue-400 border-blue-800",
  copy: "bg-purple-900/40 text-purple-400 border-purple-800",
  research: "bg-teal-900/40 text-teal-400 border-teal-800",
  code: "bg-orange-900/40 text-orange-400 border-orange-800",
};

const STATUS_CONFIG: Record<ResultStatus, { label: string; dot: string; badge: string }> = {
  new: {
    label: "Neu",
    dot: "bg-blue-400 animate-pulse",
    badge: "bg-blue-900/30 text-blue-400 border-blue-800",
  },
  approved: {
    label: "Approved",
    dot: "bg-green-400",
    badge: "bg-green-900/30 text-green-400 border-green-800",
  },
  "changes-requested": {
    label: "Changes Requested",
    dot: "bg-yellow-400",
    badge: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
  },
};

function getAgent(id: string) {
  return AGENTS.find((a) => a.id === id) ?? { id, name: id, emoji: "🤖" };
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Gerade eben";
  if (mins < 60) return `vor ${mins} Min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours}h`;
  return `vor ${Math.floor(hours / 24)}d`;
}

function CSVPreview({ content }: { content: string }) {
  const lines = content.trim().split("\n").slice(0, 6);
  const headers = lines[0]?.split(",") ?? [];
  const rows = lines.slice(1).map((l) => l.split(","));

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 mt-3">
      <table className="text-xs w-full">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-800/50">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-gray-400 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-gray-800/50 hover:bg-gray-800/30">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-gray-300 whitespace-nowrap max-w-32 truncate">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="mt-3 text-sm text-gray-300 space-y-1">
      {lines.slice(0, 8).map((line, i) => {
        if (line.startsWith("## ")) {
          return <p key={i} className="font-semibold text-white mt-2">{line.slice(3)}</p>;
        }
        if (line.startsWith("# ")) {
          return <p key={i} className="font-bold text-white text-base">{line.slice(2)}</p>;
        }
        if (line.startsWith("### ")) {
          return <p key={i} className="font-medium text-gray-200">{line.slice(4)}</p>;
        }
        if (line.startsWith("- ")) {
          return <p key={i} className="text-gray-400 pl-3">• {line.slice(2)}</p>;
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-medium text-gray-200">{line.slice(2, -2)}</p>;
        }
        if (line.trim() === "---") {
          return <hr key={i} className="border-gray-800" />;
        }
        return <p key={i} className={line ? "text-gray-400" : ""}>{line || " "}</p>;
      })}
      {lines.length > 8 && (
        <p className="text-gray-600 text-xs">... {lines.length - 8} weitere Zeilen</p>
      )}
    </div>
  );
}

function ResultCard({ result, onUpdate }: { result: Result; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(result.feedback ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const agent = getAgent(result.agentId);
  const sc = STATUS_CONFIG[result.status];
  const tc = TYPE_COLORS[result.type];

  async function approve() {
    setSubmitting(true);
    await fetch(`/api/results/${result.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    setSubmitting(false);
    onUpdate();
  }

  async function requestChanges() {
    setSubmitting(true);
    await fetch(`/api/results/${result.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "changes-requested", feedback }),
    });
    setSubmitting(false);
    setShowFeedback(false);
    onUpdate();
  }

  function download() {
    const ext = result.type === "leads-csv" ? "csv" : result.type === "code" ? "txt" : "md";
    const blob = new Blob([result.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title.replace(/\s+/g, "-")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyContent() {
    void navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`bg-gray-900 border rounded-xl p-4 transition-colors ${
      result.status === "new" ? "border-indigo-800/50" : "border-gray-800"
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-lg flex-shrink-0 relative">
          {agent.emoji}
          {result.status === "new" && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-gray-900" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs text-gray-500">{agent.name} · {relativeTime(result.createdAt)}</span>
              <h3 className="font-medium text-white text-sm mt-0.5">{result.title}</h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${tc}`}>
                {TYPE_LABELS[result.type]}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${sc.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mt-3 pl-12">
        {result.type === "leads-csv" ? (
          <CSVPreview content={result.content} />
        ) : result.type === "copy" || result.type === "research" ? (
          <div>
            {expanded ? (
              <MarkdownPreview content={result.content} />
            ) : (
              <MarkdownPreview content={result.content.split("\n").slice(0, 3).join("\n")} />
            )}
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-3 font-mono text-xs text-gray-400 mt-2">
            {(expanded ? result.content : result.content.split("\n").slice(0, 5).join("\n"))
              .split("\n")
              .map((line, i) => (
                <p key={i}>{line}</p>
              ))}
          </div>
        )}

        {result.content.split("\n").length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-indigo-400 hover:text-indigo-300 mt-2"
          >
            {expanded ? "▲ Weniger anzeigen" : "▼ Mehr anzeigen"}
          </button>
        )}

        {/* Feedback display */}
        {result.feedback && (
          <div className="mt-3 bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-3">
            <p className="text-xs text-yellow-400 font-medium mb-1">💬 Feedback:</p>
            <p className="text-xs text-yellow-300/80">{result.feedback}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {result.status !== "approved" && (
            <button
              onClick={() => void approve()}
              disabled={submitting}
              className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 bg-green-900/20 hover:bg-green-900/40 border border-green-800/40 px-3 py-1.5 rounded-lg transition-all"
            >
              ✅ Approve
            </button>
          )}
          {result.status !== "changes-requested" && (
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 bg-yellow-900/20 hover:bg-yellow-900/40 border border-yellow-800/40 px-3 py-1.5 rounded-lg transition-all"
            >
              🔄 Request Changes
            </button>
          )}
          {(result.type === "copy" || result.type === "research") && (
            <button
              onClick={copyContent}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-all"
            >
              {copied ? "✓ Kopiert!" : "📋 Copy"}
            </button>
          )}
          <button
            onClick={download}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-all"
          >
            📥 Download
          </button>
        </div>

        {/* Feedback textarea */}
        {showFeedback && (
          <div className="mt-3 space-y-2">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Was soll geändert werden?"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => void requestChanges()}
                disabled={submitting || !feedback.trim()}
                className="text-xs bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg"
              >
                Absenden
              </button>
              <button
                onClick={() => setShowFeedback(false)}
                className="text-xs text-gray-400 hover:text-gray-200 bg-gray-800 px-3 py-1.5 rounded-lg"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InboxPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  async function loadResults() {
    const params = new URLSearchParams();
    if (agentFilter) params.set("agentId", agentFilter);
    if (typeFilter) params.set("type", typeFilter);
    if (dateFilter) params.set("date", dateFilter);
    const res = await fetch(`/api/results?${params.toString()}`);
    const data = await res.json() as Result[];
    setResults(data);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    void loadResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentFilter, typeFilter, dateFilter]);

  const newCount = results.filter((r) => r.status === "new").length;

  return (
    <div className="min-h-screen bg-gray-950">
      <Nav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">
              Inbox <span className="text-indigo-500">📬</span>
            </h1>
            {newCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {newCount} neu
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">Agent Outputs & Results Feed</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Alle Agenten</option>
            {AGENTS.map((a) => (
              <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Alle Typen</option>
            <option value="leads-csv">Lead CSV</option>
            <option value="copy">Copy</option>
            <option value="research">Research</option>
            <option value="code">Code</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Alle Zeit</option>
            <option value="today">Heute</option>
            <option value="week">Diese Woche</option>
          </select>
          {(agentFilter || typeFilter || dateFilter) && (
            <button
              onClick={() => { setAgentFilter(""); setTypeFilter(""); setDateFilter(""); }}
              className="text-xs text-gray-500 hover:text-gray-300 bg-gray-800 px-3 py-1.5 rounded-lg"
            >
              ✕ Filter löschen
            </button>
          )}
        </div>

        {/* Feed */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">📬</div>
            <p>Lade Results...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-medium text-gray-400">Keine Results gefunden</p>
            <p className="text-sm mt-1">Die Agenten haben noch nichts geliefert</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((r) => (
              <ResultCard key={r.id} result={r} onUpdate={() => void loadResults()} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
