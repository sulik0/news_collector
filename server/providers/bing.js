import { normalizeItem, mapCategory } from '../utils/normalize.js'

const ENDPOINT = 'https://api.bing.microsoft.com/v7.0/news/search'

export async function searchBingNews({ query, language, region, timeRange, categories, keywords }) {
  const apiKey = process.env.BING_NEWS_KEY
  if (!apiKey) return []

  const params = new URLSearchParams({
    q: query,
    count: '10',
    mkt: language === 'en' ? (region || 'en-US') : 'zh-CN',
    freshness: toFreshness(timeRange),
    safeSearch: 'Moderate',
  })

  const res = await fetch(`${ENDPOINT}?${params}`, {
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
    },
  })
  if (!res.ok) return []
  const data = await res.json()
  const category = mapCategory(categories)

  return (data.value || []).map(item =>
    normalizeItem(item, {
      category,
      keywords: keywords || [],
      source: item.provider?.[0]?.name || 'Bing News',
    })
  )
}

function toFreshness(timeRange) {
  if (!timeRange) return 'Week'
  if (timeRange.includes('24')) return 'Day'
  if (timeRange.includes('30')) return 'Month'
  return 'Week'
}
