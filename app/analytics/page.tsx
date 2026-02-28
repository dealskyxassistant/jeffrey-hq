import Nav from "@/components/Nav";

const PREVIEW_CARDS = [
  {
    icon: "📣",
    title: "META Ads",
    description: "Performance-Daten aus Facebook & Instagram Ads. CPM, CPC, ROAS, Conversion-Rate.",
    color: "from-blue-500 to-indigo-600",
    badge: "Meta Business API",
  },
  {
    icon: "💳",
    title: "Stripe Revenue",
    description: "MRR, ARR, Churn-Rate, neue Kunden, Zahlungsfehler — live aus Stripe.",
    color: "from-purple-500 to-pink-600",
    badge: "Stripe API",
  },
  {
    icon: "🎯",
    title: "Lead Conversion",
    description: "Von Recherche bis Abschluss. Funnel-Analyse, Conversion-Rates, Outreach-Performance.",
    color: "from-green-500 to-emerald-600",
    badge: "Clay + CRM",
  },
  {
    icon: "📧",
    title: "Email Metrics",
    description: "Open-Rate, Click-Rate, Bounce-Rate für alle Outreach-Kampagnen.",
    color: "from-orange-500 to-red-500",
    badge: "Instantly / Smartlead",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Empty State */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
            📊
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Analytics Agent
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            Der Analytics Agent ist in Entwicklung. Bald hast du alle wichtigen Metriken deines Dealsky-Netzwerks auf einen Blick.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 px-4 py-2 rounded-full text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Kommt bald
          </div>
        </div>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {PREVIEW_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 opacity-70 relative overflow-hidden group"
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-5 rounded-full -translate-y-8 translate-x-8`} />

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {card.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{card.title}</h3>
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 px-2 py-0.5 rounded-full font-mono">
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{card.description}</p>
                </div>
              </div>

              {/* Connect Button */}
              <button
                disabled
                className="mt-4 w-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed border border-dashed border-gray-200 dark:border-gray-700"
              >
                🔗 Zugang verknüpfen (kommt bald)
              </button>
            </div>
          ))}
        </div>

        {/* Timeline / Roadmap hint */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Roadmap</h3>
          <p className="text-xs text-gray-400 dark:text-gray-600 leading-relaxed">
            Analytics Agent wird nach Fertigstellung der Lead Pipeline und Outreach-Automatisierung integriert.
            Geplant: Q2 2025. Du wirst benachrichtigt, sobald der Zugang verfügbar ist.
          </p>
        </div>
      </main>
    </div>
  );
}
