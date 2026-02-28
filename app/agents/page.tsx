import Nav from "@/components/Nav";
import Link from "next/link";

const agents = [
  {
    id: "main",
    name: "Jeffrey",
    emoji: "🧠",
    model: "Claude Sonnet",
    role: "Orchestrator",
    skills: ["Task Planning", "Agent Routing", "Memory Management", "Cron Scheduling", "Discord Integration", "Trello Sync"],
    status: "active" as const,
    description: "Zentraler Orchestrator des Dealsky Agent Netzwerks. Koordiniert alle anderen Agenten, verwaltet den Taskboard und triagiert eingehende Anfragen.",
  },
  {
    id: "leads",
    name: "Leads",
    emoji: "🔍",
    model: "GPT-4o",
    role: "Lead Recherche",
    skills: ["Impressum Scraping", "Contact Research", "CSV Export", "Firecrawl", "Email Validation", "Phone Normalisation"],
    status: "active" as const,
    description: "Recherchiert qualifizierte B2B-Leads. Scrapt Impressumsseiten, normalisiert Kontaktdaten und exportiert saubere CSV-Listen für Outreach-Kampagnen.",
  },
  {
    id: "copy",
    name: "Copy",
    emoji: "✍️",
    model: "Claude Sonnet",
    role: "Outreach Copy",
    skills: ["Cold Email", "Follow-up Sequences", "A/B Variants", "Personalisierung", "Subject Line Testing", "CTA Optimierung"],
    status: "idle" as const,
    description: "Erstellt hochkonvertierende Outreach-Texte. Schreibt Cold Emails, Follow-up Sequenzen und A/B-Varianten mit starker Personalisierung.",
  },
  {
    id: "coding",
    name: "Coding",
    emoji: "💻",
    model: "Claude Sonnet",
    role: "Dev",
    skills: ["GitHub Repos", "Next.js", "API Development", "Debugging", "Code Review", "Deployment"],
    status: "active" as const,
    description: "Full-Stack Development Agent. Erstellt und managed GitHub Repositories, baut Next.js Apps, entwickelt APIs und deployed auf Vercel.",
  },
  {
    id: "research",
    name: "Research",
    emoji: "🔬",
    model: "GPT-4o",
    role: "Marktanalyse",
    skills: ["Competitor Analysis", "Market Trends", "Web Search", "Reports", "Industry Insights", "Pricing Intelligence"],
    status: "idle" as const,
    description: "Strategischer Research-Agent. Analysiert Wettbewerber, Markttrends und Zielgruppen. Erstellt strukturierte Reports für fundierte Entscheidungen.",
  },
];

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    dot: "bg-green-400",
  },
  idle: {
    label: "Idle",
    className: "bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    dot: "bg-yellow-400",
  },
};

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Agent Network</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {agents.filter((a) => a.status === "active").length} aktiv ·{" "}
            {agents.filter((a) => a.status === "idle").length} idle · {agents.length} gesamt
          </p>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const sc = statusConfig[agent.status];
            return (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md dark:hover:shadow-indigo-900/20 transition-all group flex flex-col gap-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {agent.emoji}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{agent.name}</div>
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

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{agent.description}</p>

                {/* Skill Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {agent.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="text-xs text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors mt-auto flex items-center gap-1">
                  Details ansehen →
                </div>
              </Link>
            );
          })}
        </div>

        {/* Model Info */}
        <div className="mt-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
            Modell-Übersicht
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-400 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Claude Sonnet</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  Jeffrey, Copy, Coding — Anthropic · Stärken: Reasoning, Coding, Langtext
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-green-400 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">GPT-4o</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  Leads, Research — OpenAI · Stärken: Web Search, Datenanalyse, Struktur
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
