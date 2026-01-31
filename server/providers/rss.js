import Parser from 'rss-parser'
import { normalizeItem } from '../utils/normalize.js'
import { buildSearchTerms, matchesTerms } from '../utils/filter.js'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'NewsCollector/1.0',
    'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml'
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure']
    ]
  }
})

export async function fetchRSS(source, searchPayload = {}) {
  const { url, itemLimit = 10 } = source.config || {}

  if (!url) {
    console.error(`RSS source [${source.name}] missing url`)
    return []
  }

  try {
    const feed = await parser.parseURL(url)
    const items = feed.items || []
    const terms = buildSearchTerms(searchPayload)
    const filtered = terms.length === 0
      ? items
      : items.filter((item) => {
          const haystack = [
            item.title,
            item.contentSnippet,
            item.summary,
            item.content,
          ].join(' ')
          return matchesTerms(haystack, terms)
        })

    return filtered.slice(0, itemLimit).map(item => {
      // 尝试提取图片
      let imageUrl = null
      if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) {
        imageUrl = item.enclosure.url
      } else if (item.mediaContent?.['$']?.url) {
        imageUrl = item.mediaContent['$'].url
      } else if (item.mediaThumbnail?.['$']?.url) {
        imageUrl = item.mediaThumbnail['$'].url
      }

      return normalizeItem({
        title: item.title,
        description: item.contentSnippet || item.summary || item.content,
        url: item.link,
        publishedAt: item.pubDate || item.isoDate,
        image: imageUrl
      }, {
        source: source.name || feed.title || 'RSS',
        category: source.category || 'world',
        keywords: searchPayload.keywords || []
      })
    })
  } catch (error) {
    console.error(`RSS fetch failed [${source.name}]:`, error.message)
    return []
  }
}
