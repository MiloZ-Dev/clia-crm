import Anthropic from '@anthropic-ai/sdk'

// NOTE: Calling the Anthropic API directly from the browser exposes your API key
// to anyone who opens the app. This is fine for local development / trusted use,
// but for production you should proxy these calls through your backend instead.
// `dangerouslyAllowBrowser` sets the `anthropic-dangerous-direct-browser-access`
// header so the request passes CORS.

export const CLAUDE_MODEL = 'claude-sonnet-4-6'

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

export const hasApiKey = Boolean(apiKey)

const client = hasApiKey
  ? new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  : null

export const SYSTEM_PROMPT = `You are CLIA, a knowledgeable weather and climate assistant.
You have access to live data from the CLIA monitoring platform, which tracks weather
across multiple cities. When the user asks about a specific city, recent weather data
for that city is provided to you as context inside <clia_data> tags — use it to give
accurate, specific answers. Reference concrete numbers (temperature, humidity, wind,
trends) when the data is available. If no data is provided for a city, answer from
general knowledge and say the live data wasn't available. Be concise, friendly, and
data-focused.`

/**
 * Send the conversation to Claude and return the assistant's reply text.
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages
 * @param {string} [context] Optional CLIA data block to prepend to the latest user turn.
 */
export async function sendChat(messages, context) {
  if (!client) {
    throw new Error(
      'Missing VITE_ANTHROPIC_API_KEY. Add it to your .env file to enable chat.',
    )
  }

  // Inject the fetched backend data as context on the most recent user message.
  const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }))
  if (context && apiMessages.length > 0) {
    const last = apiMessages[apiMessages.length - 1]
    if (last.role === 'user') {
      last.content = `<clia_data>\n${context}\n</clia_data>\n\n${last.content}`
    }
  }

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: apiMessages,
  })

  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
}
