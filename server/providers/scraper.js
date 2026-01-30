import * as cheerio from 'cheerio'
import { normalizeItem } from '../utils/normalize.js'

export async function fetchScraper(source, searchPayload = {}) {
  const { url, selectors, baseUrl } = source.config || {}

  if (!url || !selectors) {
    console.error(`Scraper source [${source.name}] missing url or selectors`)
    return []
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    })

    if (!res.ok) {
      console.error(`Scraper fetch failed [${source.name}]: HTTP ${res.status}`)
      return []
    }

    const html = await res.text()
    const $ = cheerio.load(html)
    const items = []

    // 解析基础 URL
    const resolveUrl = (href) => {
      if (!href) return '#'
      if (href.startsWith('http://') || href.startsWith('https://')) {
        return href
      }
      const base = baseUrl || new URL(url).origin
      if (href.startsWith('/')) {
        return `${base}${href}`
      }
      return `${base}/${href}`
    }

    // 查找列表容器
    const $list = selectors.list ? $(selectors.list) : $('body')

    // 遍历每个条目
    $list.find(selectors.item).each((_, el) => {
      const $el = $(el)

      // 提取标题
      const title = $el.find(selectors.title).first().text().trim()
      if (!title) return // 跳过没有标题的条目

      // 提取链接
      const linkEl = $el.find(selectors.link).first()
      const href = linkEl.attr('href') || ''
      const itemUrl = resolveUrl(href)

      // 提取摘要（可选）
      let summary = ''
      if (selectors.summary) {
        summary = $el.find(selectors.summary).first().text().trim()
      }

      // 提取日期（可选）
      let publishedAt = null
      if (selectors.date) {
        const dateText = $el.find(selectors.date).first().text().trim()
        if (dateText) {
          // 尝试解析日期
          const parsed = new Date(dateText)
          if (!isNaN(parsed.getTime())) {
            publishedAt = parsed.toISOString()
          }
        }
      }

      // 提取图片（可选）
      let imageUrl = null
      if (selectors.image) {
        const imgEl = $el.find(selectors.image).first()
        imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || null
        if (imageUrl) {
          imageUrl = resolveUrl(imageUrl)
        }
      }

      items.push(normalizeItem({
        title,
        description: summary,
        url: itemUrl,
        publishedAt,
        image: imageUrl
      }, {
        source: source.name,
        category: source.category || 'world',
        keywords: searchPayload.keywords || []
      }))
    })

    return items.slice(0, 10)
  } catch (error) {
    console.error(`Scraper failed [${source.name}]:`, error.message)
    return []
  }
}
