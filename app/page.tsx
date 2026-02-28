import Nav from "@/components/Nav";
import AgentCard from "@/components/AgentCard";
import Link from "next/link";

const agents = [
  {
    name: "Jeffrey",
    emoji: "🧠",
    model: "Claude Sonnet",
    role: "Orchestrator",
    skills: ["Task Planning", "Agent Routing", "Memory Management", "Cron Scheduling"],
    status: "active" as const,
  },
  {
    name: "Leads",
    emoji: "🔍",
    model: "GPT-4o",
    role: "Lead Recherche",
    skills: ["Impressum Scraping", "Contact Research", "CSV Export", "Firecrawl"],
    status: "active" as const,
  },
  {
    name: "Copy",
    emoji: "✍️",
    model: "Claude Sonnet",
    role: "Outreach Copy",
    skills: ["Cold Email", "Follow-up Sequences", "A/B Variants", "Personalisierung"],
    status: "idle" as const,
  },
  {
    name: "Coding",
    emoji: "💻",
    model: "Claude Sonnet",
    role: "Dev",
    skills: ["GitHub Repos", "Next.js", "API Development", "Debugging"],
    status: "active" as const,
  },
  {
    name: "Research",
    emoji: "🔬",
    model: "GPT-4o",
    role: "Marktanalyse",
    skills: ["Competitor Analysis", "Market Trends", "Web Search", "Reports"],
    status: "idle" as const,
  },
];

const cronJobs = [
  { name: "Lead Batch Scraper", agent: "Leads 🔍", cadence: "Täglich 09:00", next: "Morgen 09:00 Uhr", status: "active" },
  { name: "Outreach Email Blast", agent: "Copy ✍️", cadence: "Mo + Do 10:00", next: "Mo 10:00 Uhr", status: "active" },
  { name: "Market Research Digest", agent: "Research 🔬", cadence: "Wöchentlich Mo", next: "Mo 08:00 Uhr", status: "active" },
  { name: "Task Board Cleanup", agent: "Jeffrey 🧠", cadence: "Täglich 23:00", next: "Heute 23:00 Uhr", status: "active" },
  { name: "GitHub Sync Check", agent: "Coding 💻", cadence: "Alle 4h", next: "In 2h 14min", status: "paused" },
];

export default function DashboardPage() {
  const activeCount = agents.filter((a) => a.status === "active").length;
  const idleCount = agents.filter((a) => a.status === "idle").length;

  return (
    <div className="min-h-screen bg-gray-950">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Mission Control <span className="text-indigo-500">↗</span>
          </h1>
          <p className="text-gray-400 text-sm">Dealsky AI Agent Network · Live Dashboard</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Aktive Agenten" value={activeCount.toString()} color="indigo" />
          <StatCard label="Idle Agenten" value={idleCount.toString()} color="yellow" />
          <StatCard label="Cron Jobs" value={cronJobs.filter(c => c.status === "active").length.toString()} color="green" />
          <StatCard label="Total Agenten" value={agents.length.toString()} color="gray" />
        </div>

        {/* Agents Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-white">Agent Network</h2>
            <Link href="/agents" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Alle anzeigen →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {agents.map((agent) => (
              <AgentCard key={agent.name} {...agent} />
            ))}
          </div>
        </section>

        {/* Cron Jobs Section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-white">Cron Jobs</h2>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
              {cronJobs.filter(c => c.status === "active").length} aktiv
            </span>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Job</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Agent</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Kadenz</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Nächster Run</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {cronJobs.map((job, i) => (
                  <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{job.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{job.agent}</td>
                    <td className="px-6 py-4 text-sm text-gray-400 hidden sm:table-cell">{job.cadence}</td>
                    <td className="px-6 py-4 text-sm text-gray-400 hidden md:table-cell">{job.next}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === "active"
                          ? "bg-green-900/40 text-green-400 border border-green-800"
                          : "bg-yellow-900/40 text-yellow-400 border border-yellow-800"
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
    indigo: "text-indigo-400",
    yellow: "text-yellow-400",
    green: "text-green-400",
    gray: "text-gray-400",
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className={`text-2xl font-bold ${colors[color] || "text-white"}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
