import { normalizeItem, mapCategory } from '../utils/normalize.js'

const ENDPOINT = 'https://gnews.io/api/v4/search'

export async function searchGNews({ query, language, region, timeRange, categories, keywords }) {
  const apiKey = process.env.GNEWS_KEY
  if (!apiKey) return []

  const params = new URLSearchParams({
    q: query,
    lang: language || 'zh',
    country: region || 'cn',
    max: '10',
    apikey: apiKey,
  })

  const from = buildFromDate(timeRange)
  if (from) params.set('from', from)

  const res = await fetch(`${ENDPOINT}?${params}`)
  if (!res.ok) return []
  const data = await res.json()
  const category = mapCategory(categories)

  return (data.articles || []).map(item =>
    normalizeItem(item, {
      category,
      keywords: keywords || [],
      source: item.source?.name || 'GNews',
    })
  )
}

function buildFromDate(timeRange) {
  if (!timeRange) return null
  const now = Date.now()
  const days = timeRange.includes('24') ? 1 : timeRange.includes('30') ? 30 : timeRange.includes('7') ? 7 : null
  if (!days) return null
  return new Date(now - days * 24 * 60 * 60 * 1000).toISOString()
}
