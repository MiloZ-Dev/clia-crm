import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

// Used only when GET /cities is unavailable — the cities the backend monitors.
export const FALLBACK_CITIES = [
  'Bogota',
  'London',
  'Tokyo',
  'New York',
  'Sydney',
  'Buenos Aires',
  'Cairo',
  'Mumbai',
  'Paris',
  'Berlin',
  'Toronto',
  'Mexico City',
  'Dubai',
  'Seoul',
  'Lagos',
]

// ---------------------------------------------------------------------------
// Backend endpoints (FastAPI @ VITE_API_URL)
// ---------------------------------------------------------------------------

/** List of monitored cities (array of name strings, or objects with `.name`). */
export async function getCities() {
  const { data } = await api.get('/cities')
  return data
}

/** Total record count from the database. */
export async function getTotalRecords() {
  const { data } = await api.get('/stats/total')
  // normalize: accept { total, count, records } or a plain number
  if (typeof data === 'number') return data
  return data?.total ?? data?.count ?? data?.records ?? '—'
}

/** Trigger a backend fetch of fresh weather data for all monitored cities. */
export async function triggerFetchAll() {
  const { data } = await api.post('/weather/fetch_all')
  return data
}

/** Current scheduler configuration & next-run info. */
export async function getSchedulerStatus() {
  const { data } = await api.get('/scheduler/status')
  return data
}

/** Patch the scheduler config (e.g. fetch interval, enabled state). */
export async function updateSchedulerConfig(payload) {
  const { data } = await api.patch('/scheduler/config', payload)
  return data
}

/** Current weather for a single city. */
export async function getWeather(city) {
  const { data } = await api.get(`/weather/${encodeURIComponent(city)}`)
  return data
}

/** Latest persisted weather record for a single city. */
export async function getLatestWeather(city) {
  const { data } = await api.get(`/weather/latest/${encodeURIComponent(city)}`)
  return data
}

/** Aggregate stats for a city over `days`. */
export async function getStats(city, days = 7) {
  const { data } = await api.get(`/stats/${encodeURIComponent(city)}`, {
    params: { days },
  })
  return data
}

/** Historical records for a city between two ISO dates (inclusive). */
export async function getHistory(city, start, end) {
  const { data } = await api.get(`/weather/history/${encodeURIComponent(city)}`, {
    params: { start, end },
  })
  return data
}

/** N-day forecast for a city. */
export async function getForecast(city, days = 5) {
  const { data } = await api.get(`/predict/${encodeURIComponent(city)}`, {
    params: { days },
  })
  return data
}

/** All alerts, optionally filtered by city and time window. */
export async function getAlerts({ city, days = 7 } = {}) {
  const params = { days }
  if (city) params.city = city
  const { data } = await api.get('/alerts', { params })
  return data // { total, limit, offset, alerts }
}

/** AI agricultural climate analysis for a single city. */
export async function getAnalysis(city) {
  const { data } = await api.get(`/analyze/${encodeURIComponent(city)}`)
  return data
}

export default api
