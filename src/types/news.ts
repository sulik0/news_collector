export interface NewsItem {
  id: string
  title: string
  summary: string
  content: string
  source: string
  author: string
  category: 'tech' | 'finance' | 'society' | 'entertainment' | 'sports' | 'world'
  imageUrl?: string
  publishedAt: string
  url: string
  keywords: string[]
}

export interface SearchResult {
  keyword: string
  news: NewsItem[]
  aiSummary: string
  searchedAt: string
}

export const categoryLabels: Record<string, string> = {
  tech: '科技',
  finance: '财经',
  society: '社会',
  entertainment: '娱乐',
  sports: '体育',
  world: '国际',
}

export const categoryColors: Record<string, string> = {
  tech: 'tag-tech',
  finance: 'tag-finance',
  society: 'tag-society',
  entertainment: 'tag-entertainment',
  sports: 'tag-tech',
  world: 'tag-finance',
}
