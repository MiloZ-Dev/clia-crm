// Shared loading / error / empty states so pages stay consistent.

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  )
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
      <Spinner className="h-5 w-5 text-accent" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  const message =
    error?.response?.data?.detail || error?.message || 'Something went wrong.'
  return (
    <div className="card mx-auto my-10 max-w-md p-6 text-center">
      <div className="mb-2 text-2xl">⚠️</div>
      <p className="text-sm font-medium text-slate-200">Couldn’t load data</p>
      <p className="mt-1 text-xs text-slate-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-accent/15 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/25"
        >
          Retry
        </button>
      )}
    </div>
  )
}

export function Empty({ label = 'Nothing to show yet.' }) {
  return (
    <div className="py-16 text-center text-sm text-slate-500">{label}</div>
  )
}
