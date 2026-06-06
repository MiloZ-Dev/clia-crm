import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import { Spinner } from '../components/StateViews.jsx'
import {
  API_URL,
  triggerFetchAll,
  getSchedulerStatus,
  updateSchedulerConfig,
} from '../services/api.js'
import { fmtDateTime } from '../utils/format.js'

export default function Settings() {
  console.log('Settings page rendering')
  return (
    <div className="pb-8">
      <PageHeader title="Settings" subtitle="Scheduler & system configuration" />

      <div className="space-y-8 px-6 py-6 lg:px-8">
        <SchedulerStatus />
        <ManualActions />
        <EnvReference />
      </div>
    </div>
  )
}

// --- Section 1: scheduler status -------------------------------------------

function SchedulerStatus() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [intervalValue, setIntervalValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)
  const [toggling, setToggling] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getSchedulerStatus()
      setStatus(data)
      setMissing(false)
      const iv = pick(data, ['fetch_interval_minutes', 'interval_minutes'])
      if (iv != null) setIntervalValue(String(iv))
    } catch {
      setMissing(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isEnabled = !!pick(status, ['is_enabled'])
  const exportTime = pick(status, ['csv_export_time', 'export_time'])
  const nextRun = pick(status, ['next_run', 'next_scheduled_run', 'next', 'next_fetch'])
  const lastRunAt = pick(status, ['last_run_at', 'last_run'])
  const lastRunStatus = pick(status, ['last_run_status', 'last_status'])

  async function handleSaveInterval() {
    setSaving(true)
    setSaveMsg(null)
    try {
      await updateSchedulerConfig({ fetch_interval_minutes: Number(intervalValue) })
      setSaveMsg('success')
      await load()
    } catch {
      setSaveMsg('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }

  async function handleToggle() {
    setToggling(true)
    try {
      await updateSchedulerConfig({ is_enabled: !isEnabled })
      await load()
    } catch {
      // leave state unchanged; the unflipped toggle signals the failure
    } finally {
      setToggling(false)
    }
  }

  return (
    <Section title="Scheduler status">
      {loading ? (
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Spinner className="h-4 w-4 text-accent" />
          Loading scheduler status…
        </div>
      ) : missing ? (
        <p className="text-sm text-white/50">Scheduler config is set via environment variables.</p>
      ) : (
        <div className="space-y-6">
          {/* Editable controls */}
          <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
            <div>
              <label htmlFor="fetch-interval" className="stat-label">
                Fetch interval
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="fetch-interval"
                  type="number"
                  min="1"
                  max="1440"
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(e.target.value)}
                  className="w-24 rounded-lg border border-white/10 bg-forest-800 px-3 py-1.5 font-data text-sm text-black outline-none transition-colors duration-200 focus:border-amber-400/50"
                />
                <span className="text-xs text-white/40">min</span>
                <button
                  onClick={handleSaveInterval}
                  disabled={saving}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 transition-all duration-200 hover:border-amber-500/40 hover:text-amber disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                {saveMsg === 'success' && (
                  <span className="text-xs text-emerald-400">✓ Saved</span>
                )}
                {saveMsg === 'error' && <span className="text-xs text-red-400">✗ Error</span>}
              </div>
            </div>

            <div>
              <span className="stat-label">Scheduler</span>
              <div className="mt-1">
                <button
                  onClick={handleToggle}
                  disabled={toggling}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                    isEnabled
                      ? 'border-red-400/40 text-red-300 hover:bg-red-400/10'
                      : 'border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/10'
                  }`}
                >
                  {isEnabled ? '⏸ Pause scheduler' : '▶ Resume scheduler'}
                </button>
              </div>
            </div>
          </div>

          {/* Read-only stat cards */}
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatusItem label="CSV export time" value={exportTime ?? '—'} />
            <StatusItem label="Next scheduled run" value={fmt(nextRun)} />
          </dl>

          {/* Last run info */}
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatusItem label="Last run" value={lastRunAt ? fmtDateTime(lastRunAt) : 'Never'} />
            <div className="rounded-lg border border-white/[0.06] bg-forest-700 p-4">
              <dt className="stat-label">Status</dt>
              <dd className="mt-1">
                <RunBadge status={lastRunStatus} />
              </dd>
            </div>
          </dl>
        </div>
      )}
    </Section>
  )
}

function RunBadge({ status }) {
  const s = status ? String(status).toLowerCase() : null
  const styles = {
    success: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30',
    error: 'bg-red-400/15 text-red-300 ring-red-400/30',
  }
  const cls = styles[s] || 'bg-white/5 text-white/50 ring-white/15'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}
    >
      {s || '—'}
    </span>
  )
}

function StatusItem({ label, value }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-forest-700 p-4">
      <dt className="stat-label">{label}</dt>
      <dd className="mt-1 font-data text-lg text-white">{value}</dd>
    </div>
  )
}

// --- Section 2: manual actions ---------------------------------------------

function ManualActions() {
  const [fetching, setFetching] = useState(false)
  const [fetchMsg, setFetchMsg] = useState(null)

  async function handleFetchAll() {
    setFetching(true)
    setFetchMsg(null)
    try {
      await triggerFetchAll()
      setFetchMsg('success')
    } catch {
      setFetchMsg('error')
    } finally {
      setFetching(false)
      setTimeout(() => setFetchMsg(null), 4000)
    }
  }

  function handleExport() {
    window.open(API_URL + '/export', '_blank')
  }

  return (
    <Section title="Manual actions">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleFetchAll}
          disabled={fetching}
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium
            text-slate-200 transition-all duration-200
            hover:border-amber-400/50 hover:text-amber-300
            disabled:cursor-not-allowed disabled:opacity-40"
        >
          {fetching ? 'Fetching…' : 'Fetch all cities now'}
        </button>
        <button
          onClick={handleExport}
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium
            text-slate-200 transition-all duration-200
            hover:border-amber-400/50 hover:text-amber-300"
        >
          Export CSV
        </button>
        {fetchMsg === 'success' && (
          <span className="text-xs text-emerald-400">✓ Fetch triggered</span>
        )}
        {fetchMsg === 'error' && <span className="text-xs text-red-400">✗ Fetch failed</span>}
      </div>
    </Section>
  )
}

// --- Section 3: environment config reference -------------------------------

const ENV_VARS = [
  { name: 'FETCH_INTERVAL_MINUTES', behavior: 'How often data is collected (default 30)' },
  { name: 'CSV_EXPORT_TIME', behavior: 'Daily CSV export time (default 23:59)' },
  { name: 'WEATHER_API_KEY', behavior: '•••••• (never shown)' },
  { name: 'ANTHROPIC_API_KEY', behavior: '•••••• (never shown)' },
]

function EnvReference() {
  return (
    <Section title="Environment config reference">
      <div className="overflow-hidden rounded-xl border border-white/[0.07]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-slate-400">
                <th className="px-4 py-3 font-medium">Variable</th>
                <th className="px-4 py-3 font-medium">Current behavior</th>
              </tr>
            </thead>
            <tbody>
              {ENV_VARS.map((v) => (
                <tr key={v.name} className="border-b border-white/5 bg-forest-700 last:border-0">
                  <td className="px-4 py-3 font-data text-amber-300">{v.name}</td>
                  <td className="px-4 py-3 font-data text-white/70">{v.behavior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-3 text-xs text-white/30">
        These values are read-only here — change them via environment variables and restart the
        backend.
      </p>
    </Section>
  )
}

// --- shared helpers --------------------------------------------------------

function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
        {title}
      </h2>
      <div className="card p-6">{children}</div>
    </section>
  )
}

function pick(obj, keys) {
  if (!obj) return undefined
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k]
  }
  return undefined
}

function fmt(value) {
  if (value === undefined || value === null || value === '') return '—'
  const d = new Date(value)
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return String(value)
}
