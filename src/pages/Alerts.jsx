import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import { Loading, ErrorState, Empty } from '../components/StateViews.jsx'
import { getAlerts } from '../services/api.js'
import { pick, fmtNum, fmtDateTime, alertStyle } from '../utils/format.js'

const DAY_OPTIONS = [
  { value: 1, label: 'Last 24 hours' },
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
]

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [days, setDays] = useState(7)
  const [cityFilter, setCityFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAlerts({ days })
      setAlerts(normalizeAlerts(data))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    load()
  }, [load])

  // Client-side city text filter on top of the server's `days` window.
  const filtered = useMemo(() => {
    const q = cityFilter.trim().toLowerCase()
    if (!q) return alerts
    return alerts.filter((a) => String(a.city).toLowerCase().includes(q))
  }, [alerts, cityFilter])

  return (
    <div>
      <PageHeader title="Alerts" subtitle="Threshold breaches across monitored cities">
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">
          {filtered.length} {filtered.length === 1 ? 'alert' : 'alerts'}
        </span>
      </PageHeader>

      <div className="px-6 py-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder="Filter by city…"
            className="w-56 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors duration-200 focus:border-amber-500/50"
          />
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none transition-colors duration-200 focus:border-amber-500/50"
          >
            {DAY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Legend />
        </div>

        {loading ? (
          <Loading label="Loading alerts…" />
        ) : error ? (
          <ErrorState error={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <Empty label="No alerts match your filters. 🎉" />
        ) : (
          <AlertsTable alerts={filtered} />
        )}
      </div>
    </div>
  )
}

function AlertsTable({ alerts }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-slate-400">
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium text-right">Value</th>
              <th className="px-4 py-3 font-medium text-right">Threshold</th>
              <th className="px-4 py-3 font-medium">Recorded at</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a, i) => {
              const style = alertStyle(a.alert_type)
              return (
                <tr
                  key={a.id ?? i}
                  className="border-b border-white/5 transition-colors duration-200 last:border-0 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/city/${encodeURIComponent(a.city)}`}
                      className="font-medium text-slate-100 hover:text-accent"
                    >
                      {a.city}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ${style.chip}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {a.alert_type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${style.text}`}>
                    {fmtNum(a.value, '', 1)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400">
                    {fmtNum(a.threshold, '', 1)}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{fmtDateTime(a.recorded_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Legend() {
  const items = [
    { type: 'temperature', label: 'Temperature' },
    { type: 'wind', label: 'Wind' },
    { type: 'uv', label: 'UV' },
    { type: 'precipitation', label: 'Precipitation' },
  ]
  return (
    <div className="ml-auto flex flex-wrap items-center gap-3 text-xs text-slate-400">
      {items.map((it) => (
        <span key={it.type} className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${alertStyle(it.type).dot}`} />
          {it.label}
        </span>
      ))}
    </div>
  )
}

function normalizeAlerts(data) {
  const rows = Array.isArray(data) ? data : data?.alerts || data?.data || []
  if (!Array.isArray(rows)) return []
  return rows.map((r) => ({
    id: pick(r, ['id', '_id']),
    city: pick(r, ['city', 'name'], 'Unknown'),
    alert_type: pick(r, ['alert_type', 'type', 'category'], 'other'),
    value: pick(r, ['value', 'reading', 'measured_value']),
    threshold: pick(r, ['threshold', 'limit']),
    recorded_at: pick(r, ['recorded_at', 'timestamp', 'created_at', 'time']),
  }))
}
