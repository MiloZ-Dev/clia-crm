import { useCallback, useEffect, useRef, useState } from 'react'
import SummaryCard from '../components/SummaryCard.jsx'
import CityCard from '../components/CityCard.jsx'
import LiveClock from '../components/LiveClock.jsx'
import { Loading, ErrorState, Empty } from '../components/StateViews.jsx'
import { FALLBACK_CITIES, getCities, getLatestWeather, getAlerts, getTotalRecords, triggerFetchAll } from '../services/api.js'

const REFRESH_MS = 5 * 60 * 1000 // auto-refresh every 5 minutes

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [fetchMsg, setFetchMsg] = useState(null)
  const firstLoad = useRef(true)

  const load = useCallback(async () => {
    if (firstLoad.current) setLoading(true)
    setError(null)
    try {
      // Resolve the monitored cities from the backend, normalizing string or
      // object entries; fall back to the local list if the endpoint is missing.
      const cityNames = await getCities()
        .then((list) => list.map((c) => (typeof c === 'string' ? c : c.name)))
        .catch(() => FALLBACK_CITIES)

      // Fetch current weather for each monitored city (cards show live temp/condition),
      // plus today's alerts and the total record count for the summary cards.
      const [withWeather, todayAlertsRes, totalRecords] = await Promise.all([
        Promise.all(
          cityNames.map(async (name) => {
            try {
              const w = await getLatestWeather(name)
              return { name, weather: w }
            } catch {
              return { name, weather: null }
            }
          }),
        ),
        getAlerts({ days: 1 }).catch(() => ({ total: 0 })),
        getTotalRecords().catch(() => '—'),
      ])

      setCities(withWeather)
      setSummary({
        cities: cityNames.length,
        recordsTotal: totalRecords,
        activeAlerts: todayAlertsRes.total ?? 0,
      })
      setLastUpdated(new Date())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
      firstLoad.current = false
    }
  }, [])

  async function handleFetchAll() {
    setFetching(true)
    setFetchMsg(null)
    try {
      await triggerFetchAll()
      setFetchMsg('success')
      await load() // reload dashboard data after fetch
    } catch {
      setFetchMsg('error')
    } finally {
      setFetching(false)
      setTimeout(() => setFetchMsg(null), 4000)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => clearInterval(id)
  }, [load])

  return (
    <div className="pb-8">
      {/* Instrument-panel header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] px-6 py-3 lg:px-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        </div>
        <div className="flex items-center gap-5">
          <LiveClock />
          <RefreshControl lastUpdated={lastUpdated} onRefresh={load} />
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleFetchAll}
              disabled={fetching}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium
                text-slate-200 transition-all duration-200
                hover:border-amber-400/50 hover:text-amber-300
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {fetching ? 'Fetching…' : 'Fetch data'}
            </button>
            {fetchMsg === 'success' && (
              <span className="text-xs text-emerald-400">✓ Data collected</span>
            )}
            {fetchMsg === 'error' && (
              <span className="text-xs text-red-400">✗ Fetch failed</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 lg:px-8">
        {loading ? (
          <Loading label="Loading dashboard…" />
        ) : error ? (
          <ErrorState error={error} onRetry={load} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryCard
                label="Cities monitored"
                value={summary?.cities ?? '—'}
                accent="blue"
                icon="🌍"
              />
              <SummaryCard
                label="Total records"
                value={summary?.recordsTotal ?? '—'}
                accent="green"
                icon="📊"
              />
              <SummaryCard
                label="Active alerts"
                value={summary?.activeAlerts ?? '—'}
                accent="red"
                icon="⚡"
                pulse={Number(summary?.activeAlerts) > 0}
              />
            </div>

            <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
              Cities
            </h2>
            {cities.length === 0 ? (
              <Empty label="No cities are being monitored yet." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cities.map((c, i) => (
                  <div key={c.name} className="animate-float-in" style={{ animationDelay: `${i * 35}ms` }}>
                    <CityCard city={c} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function RefreshControl({ lastUpdated, onRefresh }) {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-500">
      {lastUpdated && (
        <span>
          Updated{' '}
          {lastUpdated.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      )}
      <button
        onClick={onRefresh}
        className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-medium text-white/60 transition-all duration-200 hover:border-amber-500/40 hover:text-amber"
      >
        Refresh
      </button>
    </div>
  )
}
