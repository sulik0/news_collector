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

export function getLatestNews(): NewsItem[] {
  return []
}

export function getNewsByCategory(_category: string): NewsItem[] {
  return []
}

export function getHotKeywords(): string[] {
  return ['人工智能', '新能源', '量子计算', '经济政策', 'C919', 'Vision Pro', '春节档', 'GPT-5']
}
