import { NewsItem, SearchResult } from '../types/news'

type BriefingResponse = {
  intent: {
    query: string
    categories: string[]
    timeRange: string
    language: string
    region: string
    keywords: string[]
  }
  news: NewsItem[]
  briefing: string
  searchedAt: string
}

export type BriefingStage = {
  stage: 'intent' | 'sources' | 'dedupe' | 'summary'
  label: string
  progress: number
}

export async function searchNews(keyword: string): Promise<SearchResult> {
  const res = await fetch('/api/briefing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: keyword }),
  })

  if (!res.ok) {
    throw new Error('failed to fetch briefing')
  }

  const data: BriefingResponse = await res.json()

  return {
    keyword: data.intent.query || keyword,
    news: data.news,
    aiSummary: data.briefing,
    searchedAt: data.searchedAt,
  }
}

export function searchNewsStream(
  keyword: string,
  onStage?: (stage: BriefingStage) => void
): Promise<SearchResult> {
  return new Promise((resolve, reject) => {
    const url = `/api/briefing/stream?query=${encodeURIComponent(keyword)}`
    const es = new EventSource(url)
    let finished = false

    const finish = (error?: Error) => {
      if (finished) return
      finished = true
      es.close()
      if (error) reject(error)
    }

    es.addEventListener('stage', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as BriefingStage
        onStage?.(data)
      } catch {
        // ignore malformed stage
      }
    })

    es.addEventListener('done', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as BriefingResponse
        resolve({
          keyword: data.intent.query || keyword,
          news: data.news,
          aiSummary: data.briefing,
          searchedAt: data.searchedAt,
        })
      } catch {
        finish(new Error('failed to fetch briefing'))
        return
      }
      finish()
    })

    es.addEventListener('server-error', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data)
        finish(new Error(data?.error || 'failed to fetch briefing'))
      } catch {
        finish(new Error('failed to fetch briefing'))
      }
    })

    es.onerror = () => {
      finish(new Error('failed to fetch briefing'))
    }
  })
}

export function getLatestNews(): NewsItem[] {
  return []
}

export function getNewsByCategory(_category: string): NewsItem[] {
  return []
}

export async function fetchDailyKeywords(): Promise<{ date: string; keywords: string[] }> {
  try {
    const res = await fetch('/api/keywords')
    if (!res.ok) {
      throw new Error('failed to fetch keywords')
    }
    return res.json()
  } catch {
    return { date: new Date().toISOString().slice(0, 10), keywords: getFallbackKeywords() }
  }
}

export function getFallbackKeywords(): string[] {
  return ['人工智能', '新能源车', '量子计算', '经济政策', '芯片出口', '大模型']
}
