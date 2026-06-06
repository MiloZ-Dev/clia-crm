export default function SummaryCard({ label, value, sub, accent = 'accent', icon, pulse = false }) {
  const themes = {
    accent: { text: 'text-amber', ring: 'ring-amber/20' },
    blue: { text: 'text-frost', ring: 'ring-frost/20' },
    frost: { text: 'text-frost', ring: 'ring-frost/20' },
    emerald: { text: 'text-emerald-400', ring: 'ring-emerald-400/20' },
    green: { text: 'text-emerald-400', ring: 'ring-emerald-400/20' },
    red: { text: 'text-red-400', ring: 'ring-red-400/20' },
    amber: { text: 'text-amber', ring: 'ring-amber/20' },
  }
  const t = themes[accent] || themes.accent
  const Icon = ICONS[accent] || ICONS.default

  return (
    <div className="rounded-xl border border-white/[0.07] bg-forest-800/70 p-4 transition-colors duration-200 hover:border-white/15">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] ring-1 ${t.ring} ${t.text} ${
            pulse ? 'animate-pulse-glow' : ''
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="stat-label">{label}</p>
          <p className={`mt-1 font-display text-4xl font-bold leading-none tracking-tight ${t.text}`}>
            {value}
          </p>
          {sub && <p className="mt-1 text-[11px] text-white/30">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

// Minimalist stroke icons keyed by the card's accent role.
const baseProps = {
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const ICONS = {
  // Cities monitored → globe
  blue: (props) => (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </svg>
  ),
  frost: (props) => ICONS.blue(props),
  // Records → data bars
  green: (props) => (
    <svg {...baseProps} {...props}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  emerald: (props) => ICONS.green(props),
  // Active alerts → bolt
  red: (props) => (
    <svg {...baseProps} {...props}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
  amber: (props) => (
    <svg {...baseProps} {...props}>
      <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  ),
  default: (props) => (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
}
