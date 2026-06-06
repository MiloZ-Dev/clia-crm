import { Link } from 'react-router-dom'
import { pick, fmtTemp, fmtNum, conditionGlyph } from '../utils/format.js'

// Single temperature-band dot color (no full-card gradients — too noisy in a grid).
function tempDot(temp) {
  const t = Number(temp)
  if (temp === undefined || temp === null || Number.isNaN(t)) return 'bg-white/30'
  if (t < 10) return 'bg-blue-400'
  if (t < 20) return 'bg-teal-400'
  if (t <= 30) return 'bg-amber-400'
  return 'bg-red-500'
}

export default function CityCard({ city }) {
  // Accept either a plain string or an object with embedded weather.
  const name = typeof city === 'string' ? city : pick(city, ['name', 'city'], 'Unknown')
  const weather = typeof city === 'string' ? null : pick(city, ['weather', 'current'], city)

  const temp = pick(weather, ['temperature', 'temp', 'temp_c'])
  const condition = pick(weather, ['condition', 'description', 'weather'], '')
  const humidity = pick(weather, ['humidity'])

  return (
    <Link
      to={`/city/${encodeURIComponent(name)}`}
      className="glow-hover group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-forest-800 px-5 py-4 transition-all duration-200 hover:translate-x-0.5 hover:border-amber-500/40"
    >
      {/* Condition glyph */}
      <span className="text-2xl leading-none">{conditionGlyph(condition)}</span>

      {/* City + condition */}
      <div className="min-w-0">
        <div className="flex items-center">
          <h3 className="truncate font-display text-base font-bold text-white">{name}</h3>
          <span className={`ml-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${tempDot(temp)}`} />
        </div>
        {condition && (
          <p className="truncate text-[11px] capitalize text-white/40">{condition}</p>
        )}
      </div>

      <div className="ml-auto flex items-baseline gap-3">
        {humidity !== undefined && humidity !== null && (
          <span className="text-xs text-white/40">{fmtNum(humidity, '%')}</span>
        )}
        <span className="font-data text-3xl font-bold tracking-tight text-white">
          {fmtTemp(temp)}
        </span>
      </div>
    </Link>
  )
}
