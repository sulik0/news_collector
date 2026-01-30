const DEFAULT_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4'

function getConfig() {
  const apiKey = process.env.LLM_API_KEY || process.env.GLM_API_KEY
  const baseUrl = process.env.LLM_BASE_URL || DEFAULT_BASE_URL
  const model = process.env.LLM_MODEL || process.env.GLM_MODEL || 'glm-4.7'
  return { apiKey, baseUrl, model }
}

export async function chatCompletion({ messages, temperature = 0.3 }) {
  const { apiKey, baseUrl, model } = getConfig()
  if (!apiKey) {
    throw new Error('LLM_API_KEY/GLM_API_KEY is required')
  }

  const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LLM request failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  return data?.choices?.[0]?.message?.content || ''
}
