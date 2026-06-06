import { useEffect, useState } from 'react'

// Ticking wall clock for the dashboard header.
export default function LiveClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const date = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="text-right">
      <div className="font-data text-xl font-medium tabular-nums tracking-tight text-white">
        {time}
      </div>
      <div className="text-[11px] text-white/30">{date}</div>
    </div>
  )
}
