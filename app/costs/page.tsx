"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
    indigo: "text-indigo-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className={`text-3xl font-bold ${colors[color] ?? "text-white"}`}>{value}</div>
      <div className="text-sm text-gray-400 mt-1 font-medium">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
        <p className="text-gray-400">{label}</p>
        <p className="text-indigo-400 font-bold">{formatEUR(payload[0].value as number)}</p>
      </div>
    );
  }
  return null;
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

  // Format chart dates nicely
  const chartData =
    data?.chartData.map((d) => ({
      ...d,
      label: new Date(d.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
    })) ?? [];

  return (
    <div className="min-h-screen bg-gray-950">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Token & Kosten <span className="text-indigo-500">💰</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">API Usage Tracker · Alle Preise in EUR</p>
        </div>

        {loading || !data ? (
          <div className="text-center py-16 text-gray-500">
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
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">
                Tageskosten — letzte 14 Tage
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={{ stroke: "#374151" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `€${v}`}
                    width={45}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="costEUR"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: "#6366f1", r: 3 }}
                    activeDot={{ r: 5, fill: "#818cf8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Agent Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-gray-300">Kosten pro Agent</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {["Agent", "Modell", "Input Tokens", "Output Tokens", "Tokens gesamt", "Kosten heute", "Kosten Monat"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {data.agentTable.map((row) => {
                      const agent = AGENT_META[row.agentId] ?? { name: row.agentId, emoji: "🤖" };
                      return (
                        <tr key={row.agentId} className="hover:bg-gray-800/40 transition-colors">
                          <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                            {agent.emoji} {agent.name}
                          </td>
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                            {MODEL_NAMES[row.model] ?? row.model}
                          </td>
                          <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                            {formatNum(row.todayInput)}
                          </td>
                          <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                            {formatNum(row.todayOutput)}
                          </td>
                          <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                            {formatNum(row.todayTotal)}
                          </td>
                          <td className="px-4 py-3 text-green-400 font-medium whitespace-nowrap">
                            {formatEUR(row.todayCostEUR)}
                          </td>
                          <td className="px-4 py-3 text-yellow-400 font-medium whitespace-nowrap">
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
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setPricesOpen(!pricesOpen)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors"
              >
                <h2 className="text-sm font-semibold text-gray-300">
                  💡 Modell-Preistabelle (Stand Feb 2026)
                </h2>
                <span className="text-gray-500 text-lg">{pricesOpen ? "▲" : "▼"}</span>
              </button>
              {pricesOpen && (
                <div className="border-t border-gray-800 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 bg-gray-800/30">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                          Modell
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                          Input ($/1M Tokens)
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                          Output ($/1M Tokens)
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                          EUR-Faktor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {Object.entries(data.modelPrices).map(([model, prices]) => (
                        <tr key={model} className="hover:bg-gray-800/40">
                          <td className="px-5 py-3 text-white font-medium">
                            {MODEL_NAMES[model] ?? model}
                          </td>
                          <td className="px-5 py-3 text-gray-300">${prices.input.toFixed(2)}</td>
                          <td className="px-5 py-3 text-gray-300">${prices.output.toFixed(2)}</td>
                          <td className="px-5 py-3 text-gray-400">{data.usdToEur}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-600 px-5 py-3">
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
