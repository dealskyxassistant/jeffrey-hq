"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Nav from "@/components/Nav";

const CostChart = dynamic(() => import("@/components/CostChart"), { ssr: false });

interface AgentTableRow {
  agentId: string;
  model: string;
  todayInput: number;
  todayOutput: number;
  todayTotal: number;
  todayCostEUR: number;
  monthCostEUR: number;
}

interface CostData {
  today: {
    tokensInput: number;
    tokensOutput: number;
    tokensTotal: number;
    costEUR: number;
  };
  month: {
    costEUR: number;
  };
  chartData: { date: string; costEUR: number }[];
  agentTable: AgentTableRow[];
  modelPrices: Record<string, { input: number; output: number }>;
  usdToEur: number;
}

const AGENT_META: Record<string, { name: string; emoji: string }> = {
  main: { name: "Jeffrey", emoji: "🧠" },
  leads: { name: "Leads", emoji: "🔍" },
  copy: { name: "Copy", emoji: "✍️" },
  coding: { name: "Coding", emoji: "💻" },
  research: { name: "Research", emoji: "🔬" },
};

const MODEL_NAMES: Record<string, string> = {
  "claude-sonnet-4-6": "Claude Sonnet 4.6",
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o-mini",
};

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function formatEUR(n: number): string {
  return `€${n.toFixed(2)}`;
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    indigo: "text-indigo-600 dark:text-indigo-400",
    green: "text-green-600 dark:text-green-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
  };
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm dark:shadow-none">
      <div className={`text-3xl font-bold ${colors[color] ?? "text-gray-900 dark:text-white"}`}>
        {value}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-400 mt-1 font-medium">{label}</div>
      {sub && <div className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{sub}</div>}
    </div>
  );
}


export default function CostsPage() {
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pricesOpen, setPricesOpen] = useState(false);

  useEffect(() => {
    fetch("/api/costs")
      .then((r) => r.json())
      .then((d: CostData) => {
        setData(d);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const chartData =
    data?.chartData.map((d) => ({
      ...d,
      label: new Date(d.date).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
      }),
    })) ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Token & Kosten <span className="text-indigo-500">💰</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            API Usage Tracker · Alle Preise in EUR
          </p>
        </div>

        {loading || !data ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <div className="text-4xl mb-3">💰</div>
            <p>Lade Kostendaten...</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard
                label="Tokens heute"
                value={formatNum(data.today.tokensTotal)}
                sub={`${formatNum(data.today.tokensInput)} Input · ${formatNum(data.today.tokensOutput)} Output`}
                color="indigo"
              />
              <StatCard
                label="Kosten heute"
                value={formatEUR(data.today.costEUR)}
                sub="alle Agenten"
                color="green"
              />
              <StatCard
                label="Kosten diesen Monat"
                value={formatEUR(data.month.costEUR)}
                sub="Februar 2026"
                color="yellow"
              />
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-8 shadow-sm dark:shadow-none">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Tageskosten — letzte 14 Tage
              </h2>
              <CostChart data={chartData} />
            </div>

            {/* Agent Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden mb-6 shadow-sm dark:shadow-none">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Kosten pro Agent
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-transparent">
                      {[
                        "Agent",
                        "Modell",
                        "Input Tokens",
                        "Output Tokens",
                        "Tokens gesamt",
                        "Kosten heute",
                        "Kosten Monat",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.agentTable.map((row) => {
                      const agent = AGENT_META[row.agentId] ?? {
                        name: row.agentId,
                        emoji: "🤖",
                      };
                      return (
                        <tr
                          key={row.agentId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                        >
                          <td className="px-4 py-3 text-gray-900 dark:text-white font-medium whitespace-nowrap">
                            {agent.emoji} {agent.name}
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {MODEL_NAMES[row.model] ?? row.model}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {formatNum(row.todayInput)}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {formatNum(row.todayOutput)}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {formatNum(row.todayTotal)}
                          </td>
                          <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                            {formatEUR(row.todayCostEUR)}
                          </td>
                          <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400 font-medium whitespace-nowrap">
                            {formatEUR(row.monthCostEUR)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Collapsible Price Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
              <button
                onClick={() => setPricesOpen(!pricesOpen)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  💡 Modell-Preistabelle (Stand Feb 2026)
                </h2>
                <span className="text-gray-400 dark:text-gray-500 text-lg">
                  {pricesOpen ? "▲" : "▼"}
                </span>
              </button>
              {pricesOpen && (
                <div className="border-t border-gray-100 dark:border-gray-800 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider px-5 py-3">
                          Modell
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider px-5 py-3">
                          Input ($/1M Tokens)
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider px-5 py-3">
                          Output ($/1M Tokens)
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider px-5 py-3">
                          EUR-Faktor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {Object.entries(data.modelPrices).map(([model, prices]) => (
                        <tr
                          key={model}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                        >
                          <td className="px-5 py-3 text-gray-900 dark:text-white font-medium">
                            {MODEL_NAMES[model] ?? model}
                          </td>
                          <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                            ${prices.input.toFixed(2)}
                          </td>
                          <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                            ${prices.output.toFixed(2)}
                          </td>
                          <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                            {data.usdToEur}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-400 dark:text-gray-600 px-5 py-3">
                    USD→EUR Faktor: {data.usdToEur} (hardcoded, konfigurierbar in Settings)
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
