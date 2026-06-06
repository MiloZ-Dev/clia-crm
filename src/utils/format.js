// Small, defensive formatting + lookup helpers shared across pages.
// The backend shape isn't guaranteed, so every getter tolerates missing fields.

/** Pull the first defined value among several candidate keys on an object. */
export function pick(obj, keys, fallback = undefined) {
  if (!obj) return fallback
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k]
  }
  return fallback
}

export function fmtTemp(v) {
  if (v === undefined || v === null || Number.isNaN(Number(v))) return '—'
  return `${Math.round(Number(v))}°`
}

export function fmtNum(v, unit = '', digits = 0) {
  if (v === undefined || v === null || Number.isNaN(Number(v))) return '—'
  const n = Number(v)
  return `${digits ? n.toFixed(digits) : Math.round(n)}${unit}`
}

export function fmtDate(value, opts = { month: 'short', day: 'numeric' }) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString(undefined, opts)
}

export function fmtDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Temperature → visual theme (gradient + glow), matching weather-app bands.
// Thresholds are in °C. `glow` is an rgba string for box-shadow / --glow.
export function tempTheme(temp) {
  const t = Number(temp)
  if (temp === undefined || temp === null || Number.isNaN(t)) {
    return {
      gradient: 'from-slate-600 to-slate-800',
      glow: 'rgba(148, 163, 184, 0.45)',
      accentText: 'text-slate-200',
      band: 'unknown',
    }
  }
  if (t < 10) {
    return {
      gradient: 'from-blue-600 to-indigo-800',
      glow: 'rgba(79, 110, 247, 0.6)',
      accentText: 'text-blue-100',
      band: 'cold',
    }
  }
  if (t < 20) {
    return {
      gradient: 'from-teal-500 to-blue-600',
      glow: 'rgba(45, 212, 191, 0.55)',
      accentText: 'text-teal-50',
      band: 'cool',
    }
  }
  if (t <= 30) {
    return {
      gradient: 'from-orange-500 to-amber-500',
      glow: 'rgba(249, 159, 28, 0.6)',
      accentText: 'text-amber-50',
      band: 'warm',
    }
  }
  return {
    gradient: 'from-red-500 to-orange-500',
    glow: 'rgba(248, 92, 60, 0.65)',
    accentText: 'text-red-50',
    band: 'hot',
  }
}

// Map a free-text weather condition to an emoji glyph.
export function conditionGlyph(condition = '') {
  const c = String(condition).toLowerCase()
  if (/thunder|storm/.test(c)) return '⛈️'
  if (/snow|sleet|ice/.test(c)) return '❄️'
  if (/rain|drizzle|shower/.test(c)) return '🌧️'
  if (/cloud|overcast/.test(c)) return '☁️'
  if (/fog|mist|haze/.test(c)) return '🌫️'
  if (/clear|sun/.test(c)) return '☀️'
  if (/wind/.test(c)) return '💨'
  return '🌡️'
}

// Color theme per alert type (used by the Alerts page + badges).
export const ALERT_STYLES = {
  temperature: { dot: 'bg-red-500', text: 'text-red-300', ring: 'ring-red-500/30', chip: 'bg-red-500/15 text-red-300 ring-red-500/30' },
  wind: { dot: 'bg-blue-500', text: 'text-blue-300', ring: 'ring-blue-500/30', chip: 'bg-blue-500/15 text-blue-300 ring-blue-500/30' },
  uv: { dot: 'bg-yellow-400', text: 'text-yellow-300', ring: 'ring-yellow-400/30', chip: 'bg-yellow-400/15 text-yellow-200 ring-yellow-400/30' },
  precipitation: { dot: 'bg-cyan-400', text: 'text-cyan-300', ring: 'ring-cyan-400/30', chip: 'bg-cyan-400/15 text-cyan-200 ring-cyan-400/30' },
}

export function alertStyle(type = '') {
  const key = String(type).toLowerCase()
  return (
    ALERT_STYLES[key] || {
      dot: 'bg-slate-400',
      text: 'text-slate-300',
      ring: 'ring-slate-400/30',
      chip: 'bg-slate-400/15 text-slate-300 ring-slate-400/30',
    }
  )
}
