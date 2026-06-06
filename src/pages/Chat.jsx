import { useEffect, useRef, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import { Spinner } from '../components/StateViews.jsx'
import { FALLBACK_CITIES, getStats, getWeather } from '../services/api.js'
import { sendChat, hasApiKey } from '../services/claude.js'

const GREETING = {
  role: 'assistant',
  content:
    "Hi! I'm CLIA, your weather assistant. Ask me about the weather in any monitored city — I'll pull the latest data from the platform to answer. Try: “What's the weather like in Tokyo?”",
}

export default function Chat() {
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  async function handleSend(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setError(null)
    setInput('')
    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setSending(true)

    try {
      // If the question names a known city, fetch its backend data as context.
      const city = detectCity(text, FALLBACK_CITIES)
      const context = city ? await fetchCityContext(city) : null

      const reply = await sendChat(
        nextMessages.filter((m) => m !== GREETING),
        context,
      )
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err?.message || 'Failed to get a response.')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Sorry, I ran into an error reaching the assistant.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <PageHeader title="Chat" subtitle="Ask CLIA about the weather, backed by live platform data" />

      {!hasApiKey && (
        <div className="mx-6 mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 lg:mx-8">
          No <code className="font-mono">VITE_ANTHROPIC_API_KEY</code> set. Add one to your{' '}
          <code className="font-mono">.env</code> file and restart the dev server to enable chat.
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Spinner className="h-4 w-4 text-accent" />
              CLIA is thinking…
            </div>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>

      <form onSubmit={handleSend} className="border-t border-white/10 bg-white/[0.02] px-6 py-4 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            rows={1}
            placeholder="Ask about a city's weather…"
            className="max-h-40 flex-1 resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors duration-200 focus:border-amber-500/50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-xl bg-amber px-5 py-3 text-sm font-semibold text-forest-900 transition-all duration-200 hover:bg-amber-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

function Bubble({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber/15 font-display text-xs font-bold text-amber">
          C
        </div>
      )}
      <div
        className={[
          'max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed transition-all duration-200',
          isUser
            ? 'rounded-br-sm bg-amber font-medium text-forest-900'
            : 'glass rounded-bl-sm text-slate-100',
        ].join(' ')}
      >
        {content}
      </div>
    </div>
  )
}

// --- helpers ---------------------------------------------------------------

// Find the first known city named in the text (longest match wins for multi-word names).
function detectCity(text, cities) {
  const lower = text.toLowerCase()
  const matches = cities
    .filter((c) => lower.includes(String(c).toLowerCase()))
    .sort((a, b) => b.length - a.length)
  return matches[0] || null
}

async function fetchCityContext(city) {
  const [statsRes, weatherRes] = await Promise.allSettled([
    getStats(city, 7),
    getWeather(city),
  ])
  const parts = [`City: ${city}`]
  if (weatherRes.status === 'fulfilled') {
    parts.push(`Current weather: ${JSON.stringify(weatherRes.value)}`)
  }
  if (statsRes.status === 'fulfilled') {
    parts.push(`7-day stats: ${JSON.stringify(statsRes.value)}`)
  }
  return parts.join('\n')
}
