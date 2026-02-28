import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "usage.json");

const MODEL_PRICES: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
};

const USD_TO_EUR = 0.92;

interface AgentUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

interface DayEntry {
  date: string;
  agents: Record<string, AgentUsage>;
}

interface UsageData {
  daily: DayEntry[];
}

function calcCostUSD(model: string, inputTokens: number, outputTokens: number): number {
  const prices = MODEL_PRICES[model] ?? { input: 3.0, output: 15.0 };
  return (inputTokens / 1_000_000) * prices.input + (outputTokens / 1_000_000) * prices.output;
}

export async function GET() {
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw) as UsageData;
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = today.slice(0, 7); // YYYY-MM

    let todayTokensInput = 0;
    let todayTokensOutput = 0;
    let todayCostUSD = 0;
    let monthCostUSD = 0;

    // Per-agent aggregation for today and month
    const agentStats: Record<
      string,
      {
        model: string;
        todayInput: number;
        todayOutput: number;
        monthInput: number;
        monthOutput: number;
      }
    > = {};

    // Chart data: last 14 days
    const chartData: { date: string; costEUR: number }[] = [];

    for (const day of data.daily) {
      let dayCostUSD = 0;

      for (const [agentId, usage] of Object.entries(day.agents)) {
        const cost = calcCostUSD(usage.model, usage.inputTokens, usage.outputTokens);
        dayCostUSD += cost;

        if (!agentStats[agentId]) {
          agentStats[agentId] = {
            model: usage.model,
            todayInput: 0,
            todayOutput: 0,
            monthInput: 0,
            monthOutput: 0,
          };
        }

        if (day.date === today) {
          todayTokensInput += usage.inputTokens;
          todayTokensOutput += usage.outputTokens;
          todayCostUSD += cost;
          agentStats[agentId].todayInput += usage.inputTokens;
          agentStats[agentId].todayOutput += usage.outputTokens;
          agentStats[agentId].model = usage.model;
        }

        if (day.date.startsWith(currentMonth)) {
          monthCostUSD += cost;
          agentStats[agentId].monthInput += usage.inputTokens;
          agentStats[agentId].monthOutput += usage.outputTokens;
        }
      }

      chartData.push({
        date: day.date,
        costEUR: Math.round(dayCostUSD * USD_TO_EUR * 100) / 100,
      });
    }

    // Build per-agent table rows
    const agentTable = Object.entries(agentStats).map(([agentId, stats]) => ({
      agentId,
      model: stats.model,
      todayInput: stats.todayInput,
      todayOutput: stats.todayOutput,
      todayTotal: stats.todayInput + stats.todayOutput,
      todayCostEUR:
        Math.round(
          calcCostUSD(stats.model, stats.todayInput, stats.todayOutput) *
            USD_TO_EUR *
            100
        ) / 100,
      monthCostEUR:
        Math.round(
          calcCostUSD(stats.model, stats.monthInput, stats.monthOutput) *
            USD_TO_EUR *
            100
        ) / 100,
    }));

    return NextResponse.json({
      today: {
        tokensInput: todayTokensInput,
        tokensOutput: todayTokensOutput,
        tokensTotal: todayTokensInput + todayTokensOutput,
        costEUR: Math.round(todayCostUSD * USD_TO_EUR * 100) / 100,
      },
      month: {
        costEUR: Math.round(monthCostUSD * USD_TO_EUR * 100) / 100,
      },
      chartData,
      agentTable,
      modelPrices: MODEL_PRICES,
      usdToEur: USD_TO_EUR,
    });
  } catch (err) {
    console.error("GET /api/costs error:", err);
    return NextResponse.json({ error: "Failed to read usage data" }, { status: 500 });
  }
}
