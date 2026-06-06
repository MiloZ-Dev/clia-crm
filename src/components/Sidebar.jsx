import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: SunCloudIcon, end: true },
  { to: '/alerts', label: 'Alerts', icon: BoltIcon },
  { to: '/chat', label: 'Chat', icon: ChatIcon },
  { to: '/settings', label: 'Settings', icon: GearIcon },
]

export default function Sidebar() {
  return (
    <aside className="relative flex w-16 shrink-0 flex-col items-center border-r border-white/[0.06] bg-forest-800/60 backdrop-blur-md">
      {/* Monogram logo */}
      <div className="flex h-16 w-full items-center justify-center border-b border-white/[0.06]">
        <span className="font-display text-2xl font-bold text-amber">C</span>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-2 py-4">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'group relative flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-amber/10 text-amber'
                  : 'text-white/45 hover:bg-white/5 hover:text-white/80',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {/* Active left border */}
                <span
                  className={`absolute left-[-10px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-amber transition-opacity duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <Icon className="h-5 w-5" />
                {/* Hover tooltip */}
                <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md border border-white/10 bg-forest-700 px-2 py-1 text-xs text-slate-200 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

function SunCloudIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="8" cy="8" r="3.2" />
      <path strokeLinecap="round" d="M8 1.8v1.4M8 12.8v1.4M1.8 8h1.4M12.8 8h1.4M3.6 3.6l1 1M11.4 11.4l1 1M3.6 12.4l1-1M11.4 4.6l1-1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19.5h8.5a3 3 0 100-6 4.2 4.2 0 00-8-1" />
    </svg>
  )
}

function BoltIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  )
}

function ChatIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  )
}

function GearIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94
        1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083
        .22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125
        1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008
        .378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}
