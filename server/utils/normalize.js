import crypto from 'crypto'

const CATEGORY_MAP = {
  tech: 'tech',
  technology: 'tech',
  科技: 'tech',
  finance: 'finance',
  business: 'finance',
  财经: 'finance',
  economy: 'finance',
  society: 'society',
  社会: 'society',
  entertainment: 'entertainment',
  娱乐: 'entertainment',
  sports: 'sports',
  体育: 'sports',
  world: 'world',
  international: 'world',
  国际: 'world',
}

export function mapCategory(categories = []) {
  for (const raw of categories) {
    const key = String(raw || '').toLowerCase()
    if (CATEGORY_MAP[key]) return CATEGORY_MAP[key]
  }
  return 'world'
}

export function createId(input) {
  return crypto.createHash('sha1').update(input).digest('hex')
}

export function normalizeItem(item, fallback = {}) {
  const title = item.title || item.name || fallback.title || '未命名新闻'
  const url = item.url || item.link || fallback.url || '#'
  const publishedAt = item.publishedAt || item.datePublished || item.published_at || fallback.publishedAt || new Date().toISOString()
  const sourceName = item.source?.name || item.source || item.provider || fallback.source || '未知来源'

  return {
    id: createId(`${title}-${url}`),
    title,
    summary: item.description || item.summary || fallback.summary || '',
    content: item.content || item.snippet || item.description || '',
    source: sourceName,
    author: item.author || fallback.author || sourceName,
    category: fallback.category || 'world',
    imageUrl: item.image?.thumbnail?.contentUrl || item.imageUrl || item.image || null,
    publishedAt: new Date(publishedAt).toISOString(),
    url,
    keywords: fallback.keywords || [],
  }
}
