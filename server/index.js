import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { chatCompletion } from './utils/llm.js'
import { safeJsonParse } from './utils/safeJson.js'
import { dedupeNews } from './utils/dedupe.js'
import { normalizeItem } from './utils/normalize.js'
import { searchNewsAPI } from './providers/newsapi.js'
import { searchGNews } from './providers/gnews.js'
import { searchBingNews } from './providers/bing.js'
import { fetchRSS } from './providers/rss.js'
import { fetchScraper } from './providers/scraper.js'
import { fetchWechat } from './providers/wechat.js'
import { getDailyKeywords, buildTrendingKeywords } from './utils/keywords.js'
import * as sourceService from './services/sourceService.js'
import { buildIntentPrompt, buildSummaryPrompt } from './prompts.js'

dotenv.config({ path: new URL('./.env', import.meta.url) })

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const keywordCache = {
  date: '',
  keywords: [],
}

async function runWithLimit(items, limit, handler) {
  const results = []
  let index = 0
  const workerCount = Math.max(1, Math.min(limit, items.length))

  const workers = Array.from({ length: workerCount }, async () => {
    while (index < items.length) {
      const current = items[index]
      index += 1
      results.push(await handler(current))
    }
  })

  await Promise.allSettled(workers)
  return results
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

// 今日关键词
app.get('/api/keywords', async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10)
  if (keywordCache.date === today && keywordCache.keywords.length > 0) {
    return res.json({ date: keywordCache.date, keywords: keywordCache.keywords })
  }

  try {
    const customSources = await sourceService.getEnabledSources()
    const results = await runWithLimit(customSources, 4, async (source) => {
      try {
        return await fetchCustomSource(source, { keywords: [] })
      } catch (error) {
        console.warn(`Keywords source failed: ${source.name || source.id}`, error?.message || error)
        return []
      }
    })

    const items = results.flat().slice(0, 120)

    const keywords = buildTrendingKeywords(items, 8)
    if (keywords.length === 0) {
      const fallback = getDailyKeywords()
      keywordCache.date = fallback.date
      keywordCache.keywords = fallback.keywords
    } else {
      keywordCache.date = today
      keywordCache.keywords = keywords
    }

    return res.json({ date: keywordCache.date, keywords: keywordCache.keywords })
  } catch (error) {
    console.error('Failed to build keywords:', error)
    const fallback = getDailyKeywords()
    keywordCache.date = fallback.date
    keywordCache.keywords = fallback.keywords
    return res.json({ date: keywordCache.date, keywords: keywordCache.keywords })
  }
})

// ==================== 源管理 API ====================

// 获取所有源
app.get('/api/sources', async (_req, res) => {
  try {
    const sources = await sourceService.getAllSources()
    res.json(sources)
  } catch (error) {
    console.error('Failed to get sources:', error)
    res.status(500).json({ error: 'failed to get sources' })
  }
})

// 创建新源
app.post('/api/sources', async (req, res) => {
  try {
    const source = await sourceService.createSource(req.body)
    res.json(source)
  } catch (error) {
    console.error('Failed to create source:', error)
    res.status(500).json({ error: 'failed to create source' })
  }
})

// 更新源
app.put('/api/sources/:id', async (req, res) => {
  try {
    const source = await sourceService.updateSource(req.params.id, req.body)
    res.json(source)
  } catch (error) {
    console.error('Failed to update source:', error)
    if (error.message === 'Source not found') {
      return res.status(404).json({ error: 'source not found' })
    }
    res.status(500).json({ error: 'failed to update source' })
  }
})

// 删除源
app.delete('/api/sources/:id', async (req, res) => {
  try {
    await sourceService.deleteSource(req.params.id)
    res.json({ ok: true })
  } catch (error) {
    console.error('Failed to delete source:', error)
    if (error.message === 'Source not found') {
      return res.status(404).json({ error: 'source not found' })
    }
    res.status(500).json({ error: 'failed to delete source' })
  }
})

// 切换源启用状态
app.patch('/api/sources/:id/toggle', async (req, res) => {
  try {
    const { enabled } = req.body
    const source = await sourceService.toggleSource(req.params.id, enabled)
    res.json(source)
  } catch (error) {
    console.error('Failed to toggle source:', error)
    res.status(500).json({ error: 'failed to toggle source' })
  }
})

// ==================== 自定义源抓取辅助函数 ====================

async function fetchCustomSource(source, searchPayload) {
  switch (source.type) {
    case 'rss':
      return fetchRSS(source, searchPayload)
    case 'scraper':
      return fetchScraper(source, searchPayload)
    case 'wechat':
      return fetchWechat(source, searchPayload)
    default:
      console.warn(`Unknown source type: ${source.type}`)
      return []
  }
}

// 检查 LLM API Key 是否配置
function checkLLMConfig() {
  const apiKey = process.env.LLM_API_KEY || process.env.GLM_API_KEY
  return !!apiKey
}

async function generateBriefing(userInput, onStage) {
  onStage?.({ stage: 'intent', label: '解析意图', progress: 0.2 })
  const intentMessages = buildIntentPrompt(userInput)
  const intentText = await chatCompletion({ messages: intentMessages, temperature: 0.2 })
  const intent =
    safeJsonParse(intentText) ||
    {
      query: userInput,
      categories: [],
      timeRange: '7d',
      language: 'zh',
      region: 'CN',
      keywords: [],
    }

  const searchPayload = {
    query: intent.query || userInput,
    categories: intent.categories || [],
    timeRange: intent.timeRange || '7d',
    language: intent.language || 'zh',
    region: intent.region || 'CN',
    keywords: intent.keywords || [],
  }

  onStage?.({ stage: 'sources', label: '抓取资讯', progress: 0.55 })
  const customSources = await sourceService.getEnabledSources()

  const builtinProviders = [
    { name: 'newsapi', run: () => searchNewsAPI(searchPayload) },
    { name: 'gnews', run: () => searchGNews(searchPayload) },
    { name: 'bing', run: () => searchBingNews(searchPayload) },
  ]

  const builtinResults = await Promise.allSettled(
    builtinProviders.map(async (provider) => {
      try {
        return await provider.run()
      } catch (error) {
        console.warn(`Provider failed: ${provider.name}`, error?.message || error)
        return []
      }
    })
  )

  const customResults = await runWithLimit(customSources, 4, async (source) => {
    try {
      return await fetchCustomSource(source, searchPayload)
    } catch (error) {
      console.warn(`Custom source failed: ${source.name || source.id}`, error?.message || error)
      return []
    }
  })

  const flattenedBuiltin = builtinResults
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value)
    .flat()

  const flattenedCustom = customResults.flat()

  onStage?.({ stage: 'dedupe', label: '去重整理', progress: 0.75 })
  const combined = dedupeNews([
    ...flattenedBuiltin,
    ...flattenedCustom
  ])
  const fallback = combined.length === 0
    ? [normalizeItem({ title: '暂无匹配新闻', description: '请调整关键词或配置新闻数据源。', url: '#', publishedAt: new Date().toISOString() }, { source: '系统', category: 'world' })]
    : combined

  onStage?.({ stage: 'summary', label: '生成简报', progress: 0.9 })
  const summaryMessages = buildSummaryPrompt(searchPayload, fallback)
  const summaryText = await chatCompletion({ messages: summaryMessages, temperature: 0.3 })

  return {
    intent: searchPayload,
    news: fallback,
    briefing: summaryText,
    searchedAt: new Date().toISOString(),
  }
}

app.post('/api/briefing', async (req, res) => {
  try {
    if (!checkLLMConfig()) {
      return res.status(503).json({
        error: 'LLM 服务未配置',
        message: '请在 server/.env 文件中配置 LLM_API_KEY',
        hint: '获取 API Key: https://open.bigmodel.cn'
      })
    }

    const userInput = String(req.body?.query || '').trim()
    if (!userInput) {
      return res.status(400).json({ error: 'query is required' })
    }

    const result = await generateBriefing(userInput)
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'failed to generate briefing' })
  }
})

app.get('/api/briefing/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  if (!checkLLMConfig()) {
    sendEvent('server-error', {
      error: 'LLM 服务未配置',
      message: '请在 server/.env 文件中配置 LLM_API_KEY',
      hint: '获取 API Key: https://open.bigmodel.cn'
    })
    res.end()
    return
  }

  const userInput = String(req.query?.query || '').trim()
  if (!userInput) {
    sendEvent('server-error', { error: 'query is required' })
    res.end()
    return
  }

  let closed = false
  req.on('close', () => {
    closed = true
  })

  try {
    const result = await generateBriefing(userInput, (stage) => {
      if (!closed) sendEvent('stage', stage)
    })

    if (!closed) {
      sendEvent('done', result)
      res.end()
    }
  } catch (error) {
    if (!closed) {
      console.error(error)
      sendEvent('server-error', { error: 'failed to generate briefing' })
      res.end()
    }
  }
})

const port = process.env.SERVER_PORT || 8787
app.listen(port, () => {
  console.log(`server listening on ${port}`)
})
