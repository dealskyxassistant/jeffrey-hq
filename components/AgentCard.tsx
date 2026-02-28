interface AgentCardProps {
  name: string;
  emoji: string;
  model: string;
  role: string;
  skills: string[];
  status: "active" | "idle" | "error";
  description?: string;
  expanded?: boolean;
}

export default function AgentCard({
  name,
  emoji,
  model,
  role,
  skills,
  status,
  description,
  expanded = false,
}: AgentCardProps) {
  const statusConfig = {
    active: {
      label: "Aktiv",
      dot: "bg-green-400",
      badge: "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
      pulse: true,
    },
    idle: {
      label: "Idle",
      dot: "bg-yellow-400",
      badge: "bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      pulse: false,
    },
    error: {
      label: "Fehler",
      dot: "bg-red-400",
      badge: "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
      pulse: false,
    },
  };

  const cfg = statusConfig[status];
  const displaySkills = expanded ? skills : skills.slice(0, 3);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-gray-50 dark:hover:bg-gray-900/80 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
            {emoji}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-500">{role}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.badge}`}
        >
          <span className="relative flex h-1.5 w-1.5">
            {cfg.pulse && (
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75`}
              />
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cfg.dot}`} />
          </span>
          {cfg.label}
        </span>
      </div>

      {/* Model Badge */}
      <div className="mb-4">
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg font-mono">
          {model}
        </span>
      </div>

      {/* Description (expanded only) */}
      {expanded && description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{description}</p>
      )}

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {displaySkills.map((skill) => (
          <span
            key={skill}
            className="text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded-md"
          >
            {skill}
          </span>
        ))}
        {!expanded && skills.length > 3 && (
          <span className="text-xs text-gray-400 dark:text-gray-600 px-2 py-0.5">
            +{skills.length - 3} mehr
          </span>
        )}
      </div>
    </div>
  );
}
