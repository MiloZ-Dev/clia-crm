# CLIA Web

A modern React + Vite frontend for the **CLIA** climate-intelligence platform. It
consumes a FastAPI backend (default `http://localhost:8000`) and ships a dark,
data-focused weather dashboard.

## Features

| Route | Page | Highlights |
|-------|------|-----------|
| `/` | **Dashboard** | Summary cards (cities monitored, total records, active alerts) + live city grid. Auto-refreshes every 5 minutes; manual **Refresh** and **Fetch data** (trigger a backend collection) controls in the header. |
| `/city/:name` | **City detail** | Current conditions, 7-day temperature/humidity line chart (Recharts), 5-day forecast, and an on-demand **AI Agricultural Analysis** panel (Claude-powered risk assessment, trend, risk factors & recommendations for farmers). |
| `/alerts` | **Alerts** | Filterable table (by city + time window) with color-coded alert types. |
| `/chat` | **Chat** | Full-page assistant powered by the Anthropic Claude API, grounded in live CLIA data. |
| `/settings` | **Settings** | Scheduler controls (edit fetch interval, pause/resume, last-run status), manual fetch & CSV export, and an environment-config reference. |

## Tech stack

- React 18 + Vite
- Tailwind CSS (dark theme, utility classes only)
- React Router v6
- Recharts
- Axios (backend calls)
- `@anthropic-ai/sdk` (browser-side Claude calls)

## Getting started

```bash
npm install
cp .env.example .env   # then edit values
npm run dev
```

Open http://localhost:5173.

## Environment variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_URL` | Base URL of the FastAPI backend | `http://localhost:8000` |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key for the Chat page | _(required for chat)_ |

> ⚠️ **Security note:** the Chat page calls the Anthropic API directly from the
> browser, which exposes the API key to end users. This is acceptable for local
> development or trusted environments only. For production, proxy these calls
> through your backend and remove the key from the frontend bundle.

## Expected backend endpoints

The service layer ([src/services/api.js](src/services/api.js)) calls:

- `GET /cities` — list of monitored cities (name strings or `{ name }` objects); falls back to a local list if unavailable
- `GET /weather/{city}` — live current weather (City detail page)
- `GET /weather/latest/{city}` — latest persisted record for a city (Dashboard city grid)
- `GET /weather/history/{city}?start=&end=`
- `GET /stats/{city}?days=7`
- `GET /stats/total` — total record count for the dashboard (`{ total }`, `{ count }`, `{ records }`, or a plain number)
- `GET /predict/{city}?days=5` — N-day forecast (`{ city, days, predictions: [{ date, temperature, humidity, wind_speed, precipitation }] }`)
- `GET /analyze/{city}` — AI agricultural climate analysis for the City detail page (`{ summary, forecast_insight, agricultural_risk, trend, alert, risk_factors[], recommendations[], confidence, data_points_analyzed, data_sources[], generated_at }`)
- `GET /alerts?city=&days=` — returns `{ total, limit, offset, alerts }`; the dashboard reads `total` for the active-alerts count
- `POST /weather/fetch_all` — trigger a backend collection for all monitored cities (Dashboard "Fetch data" + Settings)
- `GET /export` — CSV export, opened directly in a new tab from Settings
- `GET /scheduler/status` — current scheduler config & run info (`fetch_interval_minutes`, `csv_export_time`, `is_enabled`, `next_run`, `last_run_at`, `last_run_status`); Settings falls back to a static note if absent
- `PATCH /scheduler/config` — update scheduler config (`{ fetch_interval_minutes }`, `{ is_enabled }`) from Settings

All response normalizers are defensive about field names, so minor schema
differences are tolerated.

## Build

```bash
npm run build
npm run preview
```
