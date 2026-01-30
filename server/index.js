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
import { buildIntentPrompt, buildSummaryPrompt } from './prompts.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

// 检查 LLM API Key 是否配置
function checkLLMConfig() {
  const apiKey = process.env.LLM_API_KEY || process.env.GLM_API_KEY
  return !!apiKey
}

app.post('/api/briefing', async (req, res) => {
  try {
    // 检查 API Key 配置
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

    const results = await Promise.all([
      searchNewsAPI(searchPayload),
      searchGNews(searchPayload),
      searchBingNews(searchPayload),
    ])

    const combined = dedupeNews(results.flat())
    const fallback = combined.length === 0
      ? [normalizeItem({ title: '暂无匹配新闻', description: '请调整关键词或配置新闻数据源。', url: '#', publishedAt: new Date().toISOString() }, { source: '系统', category: 'world' })]
      : combined

    const summaryMessages = buildSummaryPrompt(searchPayload, fallback)
    const summaryText = await chatCompletion({ messages: summaryMessages, temperature: 0.3 })

    res.json({
      intent: searchPayload,
      news: fallback,
      briefing: summaryText,
      searchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'failed to generate briefing' })
  }
})

const port = process.env.SERVER_PORT || 8787
app.listen(port, () => {
  console.log(`server listening on ${port}`)
})
