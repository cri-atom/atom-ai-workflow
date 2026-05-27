// Kimi 2.5 uses an OpenAI-compatible API
export async function callKimi({ model, system, message, max_tokens = 8000 }) {
  const apiKey = process.env.KIMI_API_KEY
  if (!apiKey) throw new Error('KIMI_API_KEY not set in environment')

  const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'moonshot-v1-8k',
      max_tokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: message },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Kimi API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}
