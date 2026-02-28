"use client";

import { useEffect, useState, useMemo } from "react";
import Nav from "@/components/Nav";

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

interface FunnelData {
  eingang: number;
  bereinigt: number;
  verifiziert: number;
  clay: number;
  outreach: number;
}

interface PipelineData {
  leads: Lead[];
  stats: {
    today: number;
    week: number;
    total: number;
    avgScore: number;
    lastSent: string | null;
  };
  funnel?: FunnelData;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Gerade eben";
  if (mins < 60) return `vor ${mins} Min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours}h`;
  const days = Math.floor(hours / 24);
  return `vor ${days}d`;
}

const STATUS_COLORS: Record<string, string> = {
  neu: "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  enriched: "bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  approved: "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
};

export default function PipelinePage() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("Alle");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/pipeline");
        const json = await res.json() as PipelineData;
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const categories = useMemo(() => {
    if (!data) return ["Alle"];
    const cats = Array.from(new Set(data.leads.map((l) => l.kategorie)));
    return ["Alle", ...cats];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.leads.filter((l) => {
      const matchCat = filter === "Alle" || l.kategorie === filter;
      const q = search.toLowerCase();
      const matchSearch = !q || l.firma.toLowerCase().includes(q) || l.gf.toLowerCase().includes(q) || l.stadt.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [data, filter, search]);

  function exportCSV() {
    if (!filtered.length) return;
    const header = "Firma,GF,Email,Telefon,Stadt,Status,Kategorie\n";
    const rows = filtered.map((l) =>
      [l.firma, l.gf, l.email, l.telefon, l.stadt, l.status, l.kategorie]
        .map((v) => `"${v}"`)
        .join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Lead Pipeline</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Alle Leads aus dem Recherche-Agent
              {data?.stats.lastSent && (
                <span className="ml-2 text-xs text-gray-400 dark:text-gray-600">
                  · Letzte Activity: {relativeTime(data.stats.lastSent)}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            ⬇ CSV Export ({filtered.length})
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Heute gesendet", value: loading ? "…" : String(data?.stats.today ?? 0), color: "indigo" },
            { label: "Diese Woche", value: loading ? "…" : String(data?.stats.week ?? 0), color: "purple" },
            { label: "Gesamt", value: loading ? "…" : String(data?.stats.total ?? 0), color: "gray" },
            { label: "Ø Qualitäts-Score", value: loading ? "…" : `${data?.stats.avgScore ?? 0}%`, color: "green" },
          ].map((s) => {
            const colors: Record<string, string> = {
              indigo: "text-indigo-600 dark:text-indigo-400",
              purple: "text-purple-600 dark:text-purple-400",
              green: "text-green-600 dark:text-green-400",
              gray: "text-gray-600 dark:text-gray-400",
            };
            return (
              <div key={s.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm dark:shadow-none">
                <div className={`text-2xl font-bold ${colors[s.color]}`}>{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Funnel */}
        {data?.funnel && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-8 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Lead Funnel</h2>
            <div className="flex items-end gap-2 flex-wrap">
              {[
                { label: "Eingang", value: data.funnel.eingang, color: "bg-indigo-500", pct: 100 },
                { label: "Bereinigt", value: data.funnel.bereinigt, color: "bg-purple-500", pct: Math.round((data.funnel.bereinigt / data.funnel.eingang) * 100) },
                { label: "Verifiziert", value: data.funnel.verifiziert, color: "bg-blue-500", pct: Math.round((data.funnel.verifiziert / data.funnel.eingang) * 100) },
                { label: "Clay", value: data.funnel.clay, color: "bg-cyan-500", pct: Math.round((data.funnel.clay / data.funnel.eingang) * 100) },
                { label: "Outreach", value: data.funnel.outreach, color: "bg-green-500", pct: Math.round((data.funnel.outreach / data.funnel.eingang) * 100) },
              ].map((step) => (
                <div key={step.label} className="flex-1 min-w-[80px]">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">{step.label}</div>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-full ${step.color} rounded-t`} style={{ height: `${Math.max(step.pct * 0.8, 4)}px` }} />
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{step.value}</div>
                    <div className="text-xs text-gray-400">{step.pct}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-4 shadow-sm dark:shadow-none flex flex-wrap items-center gap-3">
          <div className="flex gap-1 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === cat
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Suche Firma, GF, Stadt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-auto text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Lade Leads...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-gray-500 dark:text-gray-400 font-medium">Keine Leads gefunden</div>
              <div className="text-sm text-gray-400 dark:text-gray-600 mt-1">
                {data?.stats.total === 0
                  ? "Der Lead Research Agent hat noch keine CSV-Dateien erstellt"
                  : "Passe deine Filter an"}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    {["Firma", "GF", "Email", "Telefon", "Stadt", "Status", "Kategorie"].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((lead, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white max-w-[180px] truncate">{lead.firma}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{lead.gf || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                        {lead.email ? <a href={`mailto:${lead.email}`} className="hover:text-indigo-500 transition-colors">{lead.email}</a> : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono text-xs">{lead.telefon || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{lead.stadt || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[lead.status] ?? STATUS_COLORS["neu"]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-600 whitespace-nowrap">{lead.kategorie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="mt-3 text-xs text-gray-400 dark:text-gray-600 text-right">
            {filtered.length} Lead{filtered.length !== 1 ? "s" : ""} angezeigt
          </div>
        )}
      </main>
    </div>
  );
}
