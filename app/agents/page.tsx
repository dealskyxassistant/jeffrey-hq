import Nav from "@/components/Nav";
import AgentCard from "@/components/AgentCard";

const agents = [
  {
    name: "Jeffrey",
    emoji: "🧠",
    model: "Claude Sonnet",
    role: "Orchestrator",
    skills: [
      "Task Planning",
      "Agent Routing",
      "Memory Management",
      "Cron Scheduling",
      "Discord Integration",
      "Trello Sync",
    ],
    status: "active" as const,
    description:
      "Zentraler Orchestrator des Dealsky Agent Netzwerks. Koordiniert alle anderen Agenten, verwaltet den Taskboard und triagiert eingehende Anfragen.",
  },
  {
    name: "Leads",
    emoji: "🔍",
    model: "GPT-4o",
    role: "Lead Recherche",
    skills: [
      "Impressum Scraping",
      "Contact Research",
      "CSV Export",
      "Firecrawl",
      "Email Validation",
      "Phone Normalisation",
    ],
    status: "active" as const,
    description:
      "Recherchiert qualifizierte B2B-Leads. Scrapt Impressumsseiten, normalisiert Kontaktdaten und exportiert saubere CSV-Listen für Outreach-Kampagnen.",
  },
  {
    name: "Copy",
    emoji: "✍️",
    model: "Claude Sonnet",
    role: "Outreach Copy",
    skills: [
      "Cold Email",
      "Follow-up Sequences",
      "A/B Variants",
      "Personalisierung",
      "Subject Line Testing",
      "CTA Optimierung",
    ],
    status: "idle" as const,
    description:
      "Erstellt hochkonvertierende Outreach-Texte. Schreibt Cold Emails, Follow-up Sequenzen und A/B-Varianten mit starker Personalisierung.",
  },
  {
    name: "Coding",
    emoji: "💻",
    model: "Claude Sonnet",
    role: "Dev",
    skills: [
      "GitHub Repos",
      "Next.js",
      "API Development",
      "Debugging",
      "Code Review",
      "Deployment",
    ],
    status: "active" as const,
    description:
      "Full-Stack Development Agent. Erstellt und managed GitHub Repositories, baut Next.js Apps, entwickelt APIs und deployed auf Vercel.",
  },
  {
    name: "Research",
    emoji: "🔬",
    model: "GPT-4o",
    role: "Marktanalyse",
    skills: [
      "Competitor Analysis",
      "Market Trends",
      "Web Search",
      "Reports",
      "Industry Insights",
      "Pricing Intelligence",
    ],
    status: "idle" as const,
    description:
      "Strategischer Research-Agent. Analysiert Wettbewerber, Markttrends und Zielgruppen. Erstellt strukturierte Reports für fundierte Entscheidungen.",
  },
];

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Agent Network</h1>
          <p className="text-gray-400 text-sm">
            {agents.filter((a) => a.status === "active").length} aktiv ·{" "}
            {agents.filter((a) => a.status === "idle").length} idle · {agents.length} gesamt
          </p>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.name} {...agent} expanded />
          ))}
        </div>

        {/* Model Info */}
        <div className="mt-10 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
            Modell-Übersicht
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-400 shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">Claude Sonnet</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Jeffrey, Copy, Coding — Anthropic · Stärken: Reasoning, Coding, Langtext
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-green-400 shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">GPT-4o</div>
                <div className="text-xs text-gray-500 mt-0.5">
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
