import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Loading, ErrorState, Empty } from '../components/StateViews.jsx'
import { getWeather, getHistory, getForecast, getAnalysis } from '../services/api.js'
import { pick, fmtTemp, fmtNum, fmtDate, conditionGlyph } from '../utils/format.js'

export default function CityDetail() {
  const { name } = useParams()
  const city = decodeURIComponent(name)

  const [weather, setWeather] = useState(null)
  const [history, setHistory] = useState([])
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [analysis, setAnalysis] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  async function handleAnalyze(forceRefresh = false) {
    setAnalysisOpen(true)
    if (analysis && !forceRefresh) return // don't re-fetch if already loaded (unless forced)
    setAnalysisLoading(true)
    setAnalysisError(null)
    try {
      const data = await getAnalysis(city)
      setAnalysis(data)
    } catch (err) {
      setAnalysisError(err?.response?.data?.detail || err?.message || 'Analysis failed')
    } finally {
      setAnalysisLoading(false)
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // History endpoint takes an inclusive ISO date range — last 7 days.
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 7)
      const toISO = (d) => d.toISOString().slice(0, 10)

      const [w, hist, fc] = await Promise.allSettled([
        getWeather(city),
        getHistory(city, toISO(start), toISO(end)),
        getForecast(city, 5),
      ])
      if (w.status === 'fulfilled') setWeather(w.value)
      else if (w.status === 'rejected') throw w.reason

      setHistory(hist.status === 'fulfilled' ? normalizeHistory(hist.value) : [])
      setForecast(fc.status === 'fulfilled' ? normalizeForecast(fc.value) : [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [city])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <div className="border-b border-white/[0.06] px-6 py-4 lg:px-8">
        <Link
          to="/"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors duration-200 hover:text-amber"
        >
          <span aria-hidden>←</span> Back to dashboard
        </Link>
        <h1 className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight text-white">
          {city}
          <span className="text-3xl">
            {conditionGlyph(pick(weather, ['condition', 'description', 'weather'], ''))}
          </span>
        </h1>
      </div>

      <div className="px-6 py-6 lg:px-8">
        {loading ? (
          <Loading label={`Loading ${city}…`} />
        ) : error ? (
          <ErrorState error={error} onRetry={load} />
        ) : (
          <div className="space-y-8">
            <CurrentWeather weather={weather} />
            <HistoryChart data={history} />
            <Forecast data={forecast} />
            <AIAnalysis
              analysis={analysis}
              loading={analysisLoading}
              error={analysisError}
              open={analysisOpen}
              onAnalyze={handleAnalyze}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function CurrentWeather({ weather }) {
  const temp = pick(weather, ['temperature', 'temp', 'temp_c'])
  const feels = pick(weather, ['feels_like', 'feelslike', 'apparent_temperature'])
  const humidity = pick(weather, ['humidity'])
  const wind = pick(weather, ['wind', 'wind_speed', 'windspeed'])
  const pressure = pick(weather, ['pressure'])
  const uv = pick(weather, ['uv', 'uv_index', 'uvi'])
  const condition = pick(weather, ['condition', 'description', 'weather'], '')

  const stats = [
    { label: 'Feels like', value: fmtTemp(feels) },
    { label: 'Humidity', value: fmtNum(humidity, '%') },
    { label: 'Wind', value: fmtNum(wind, ' km/h') },
    { label: 'Pressure', value: fmtNum(pressure, ' hPa') },
    { label: 'UV index', value: fmtNum(uv) },
  ]

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-br from-forest-700 to-forest-900">
      <div className="flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <div className="text-7xl">{conditionGlyph(condition)}</div>
          <div>
            <div className="font-data text-7xl font-bold tracking-tighter text-white">
              {fmtTemp(temp)}
            </div>
            {condition && (
              <div className="mt-1 text-sm font-medium capitalize text-white/50">{condition}</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-data text-[10px] uppercase tracking-widest text-white/40">
                {s.label}
              </div>
              <div className="mt-0.5 font-data text-lg text-white">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HistoryChart({ data }) {
  return (
    <section className="card p-6">
      <h2 className="mb-1 font-display text-lg font-bold text-white">Last 7 days</h2>
      <p className="mb-4 text-xs text-white/40">Temperature &amp; humidity trend</p>
      {data.length === 0 ? (
        <Empty label="No historical records for this city." />
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2733" />
              <XAxis dataKey="date" stroke="#ffffff20" fontSize={12} tickLine={false} />
              <YAxis
                yAxisId="left"
                stroke="#ffffff20"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                unit="°"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#ffffff20"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  background: '#0e1117',
                  border: '1px solid #1e2733',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0',
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                name="Temp (°)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                name="Humidity (%)"
                stroke="#a5b4fc"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

function Forecast({ data }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-bold text-white">5-day forecast</h2>
      {data.length === 0 ? (
        <Empty label="No forecast available." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {data.map((d, i) => (
            <div key={i} className="glow-hover card p-3 text-center">
              <div className="font-data text-[10px] uppercase tracking-widest text-white/40">
                {fmtDate(d.date)}
              </div>
              <div className="my-2 text-3xl">{conditionGlyph(d.condition)}</div>
              <div className="font-data text-2xl font-bold text-white">{fmtTemp(d.high)}</div>
              {d.low !== undefined && (
                <div className="font-data text-xs text-white/40">
                  {d.lowLabel === 'humidity' ? `${Math.round(d.low)}% hum` : `${fmtTemp(d.low)} low`}
                </div>
              )}
              {d.condition && (
                <div className="mt-1 truncate text-[11px] capitalize text-white/40">
                  {d.condition}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function AIAnalysis({ analysis, loading, error, open, onAnalyze }) {
  // Risk badge colors
  const riskColors = {
    bajo:    'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30',
    medio:   'bg-amber-400/15 text-amber-200 ring-amber-400/30',
    alto:    'bg-orange-500/15 text-orange-300 ring-orange-500/30',
    crítico: 'bg-red-500/15 text-red-300 ring-red-500/30',
  }
  const trendIcons = {
    mejorando:  '↑',
    estable:    '→',
    empeorando: '↓',
  }
  const trendColors = {
    mejorando:  'text-emerald-400',
    estable:    'text-amber-300',
    empeorando: 'text-red-400',
  }

  return (
    <section>
      {/* Trigger button — always visible */}
      {!open && (
        <button
          onClick={() => onAnalyze()}
          className="flex w-full items-center justify-between rounded-xl border border-amber/30
            bg-amber/5 px-6 py-4 text-left transition-all duration-200
            hover:border-amber/50 hover:bg-amber/10"
        >
          <div>
            <p className="font-display text-base font-bold text-white">
              🤖 AI Agricultural Analysis
            </p>
            <p className="mt-0.5 text-xs text-white/40">
              Powered by Claude — risk assessment &amp; recommendations for farmers
            </p>
          </div>
          <span className="ml-4 shrink-0 rounded-lg bg-amber/10 px-3 py-1.5 text-xs font-semibold text-amber ring-1 ring-amber/30">
            Analyze →
          </span>
        </button>
      )}

      {/* Panel — visible after clicking */}
      {open && (
        <div className="card overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                🤖 AI Agricultural Analysis
              </h2>
              <p className="mt-0.5 text-xs text-white/40">Powered by Claude</p>
            </div>
            <button
              onClick={() => onAnalyze(true)}
              disabled={loading}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs
                font-medium text-white/50 transition-colors duration-200
                hover:border-amber/40 hover:text-amber disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? 'Analyzing…' : 'Refresh'}
            </button>
          </div>

          <div className="p-6">
            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber/30 border-t-amber" />
                <p className="text-sm text-white/40">Claude is analyzing climate data…</p>
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
                <p className="text-sm font-medium text-red-300">Analysis failed</p>
                <p className="mt-1 text-xs text-red-400/80">{error}</p>
              </div>
            )}

            {/* Result */}
            {!loading && !error && analysis && (
              <div className="space-y-6">
                {/* Alert banner — only shown when non-null */}
                {analysis.alert && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
                    <span className="mt-0.5 text-lg">⚠️</span>
                    <p className="text-sm font-medium text-red-200">{analysis.alert}</p>
                  </div>
                )}

                {/* Summary + risk/trend row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Summary — spans 2 cols on sm+ */}
                  <div className="sm:col-span-2 rounded-xl border border-white/[0.07] bg-forest-800/60 p-5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">Summary</p>
                    <p className="text-sm leading-relaxed text-slate-200">{analysis.summary}</p>
                    {analysis.forecast_insight && (
                      <>
                        <p className="mb-1 mt-4 text-[10px] font-semibold uppercase tracking-widest text-white/40">Forecast insight</p>
                        <p className="text-sm leading-relaxed text-slate-300">{analysis.forecast_insight}</p>
                      </>
                    )}
                  </div>

                  {/* Risk + trend column */}
                  <div className="flex flex-col gap-4">
                    <div className="rounded-xl border border-white/[0.07] bg-forest-800/60 p-5">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">Agricultural risk</p>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold capitalize ring-1 ${riskColors[analysis.agricultural_risk] || 'bg-white/5 text-white/60 ring-white/20'}`}>
                        {analysis.agricultural_risk ?? '—'}
                      </span>
                    </div>
                    <div className="rounded-xl border border-white/[0.07] bg-forest-800/60 p-5">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">Trend</p>
                      <span className={`font-display text-2xl font-bold ${trendColors[analysis.trend] || 'text-white'}`}>
                        {trendIcons[analysis.trend] ?? '—'}{' '}
                        <span className="text-base font-semibold capitalize">{analysis.trend}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Risk factors + Recommendations */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Array.isArray(analysis.risk_factors) && analysis.risk_factors.length > 0 && (
                    <div className="rounded-xl border border-white/[0.07] bg-forest-800/60 p-5">
                      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">Risk factors</p>
                      <ul className="space-y-2">
                        {analysis.risk_factors.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="mt-0.5 text-orange-400 shrink-0">▸</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
                    <div className="rounded-xl border border-white/[0.07] bg-forest-800/60 p-5">
                      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">Recommendations</p>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="mt-0.5 text-emerald-400 shrink-0">✓</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer metadata */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-white/[0.06] pt-4 text-[11px] text-white/30">
                  {analysis.confidence && (
                    <span>Confidence: <span className="text-white/50 capitalize">{analysis.confidence}</span></span>
                  )}
                  {analysis.data_points_analyzed && (
                    <span>Data points: <span className="text-white/50">{analysis.data_points_analyzed}</span></span>
                  )}
                  {Array.isArray(analysis.data_sources) && (
                    <span>Sources: <span className="text-white/50">{analysis.data_sources.join(', ')}</span></span>
                  )}
                  {analysis.generated_at && (
                    <span className="ml-auto">
                      Generated: <span className="text-white/50">{new Date(analysis.generated_at).toLocaleTimeString()}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

// --- normalizers -----------------------------------------------------------

function normalizeHistory(data) {
  const rows = Array.isArray(data)
    ? data
    : data?.history || data?.records || data?.data || data?.stats || []
  if (!Array.isArray(rows)) return []
  return rows
    .map((r) => ({
      date: fmtDate(pick(r, ['date', 'recorded_at', 'timestamp', 'day'])),
      temperature: numeric(pick(r, ['temperature', 'temp', 'avg_temp', 'temp_c'])),
      humidity: numeric(pick(r, ['humidity', 'avg_humidity'])),
    }))
    .filter((r) => r.temperature !== null || r.humidity !== null)
}

function normalizeForecast(data) {
  // Backend returns { predictions: [{date, temperature, humidity, wind_speed, precipitation}] }
  const rows = Array.isArray(data)
    ? data
    : data?.predictions || data?.forecast || data?.data || data?.days || []
  if (!Array.isArray(rows)) return []
  return rows.map((r) => ({
    date: pick(r, ['date', 'day', 'timestamp']),
    high: pick(r, ['temperature', 'high', 'temp_high', 'max_temp', 'temp']),
    low: pick(r, ['humidity', 'low', 'temp_low', 'min_temp']),   // show humidity as secondary stat
    lowLabel: r.humidity !== undefined ? 'humidity' : 'low',
    condition: pick(r, ['condition', 'description', 'weather'], ''),
    wind_speed: r.wind_speed,
    precipitation: r.precipitation,
  }))
}

function numeric(v) {
  if (v === undefined || v === null || v === '' || Number.isNaN(Number(v))) return null
  return Number(v)
}
