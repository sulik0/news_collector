import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { NewsCard } from './components/NewsCard'
import { AISummary } from './components/AISummary'
import { SourceManager } from './components/sources'
import { searchNewsStream, fetchDailyKeywords, getFallbackKeywords, BriefingStage } from './services/newsService'
import { SearchResult } from './types/news'
import { Search } from 'lucide-react'

function App() {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [hotKeywords, setHotKeywords] = useState<string[]>([])
  const [hotKeywordsDate, setHotKeywordsDate] = useState<string>('')
  const [showSourceManager, setShowSourceManager] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [progressStage, setProgressStage] = useState<BriefingStage | null>(null)
  const [progressValue, setProgressValue] = useState(0)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    fetchDailyKeywords()
      .then((data) => {
        setHotKeywords(data.keywords)
        setHotKeywordsDate(data.date)
      })
      .catch(() => {
        setHotKeywords(getFallbackKeywords())
        setHotKeywordsDate(new Date().toISOString().slice(0, 10))
      })
  }, [])

  const handleSearch = async (keyword: string) => {
    setIsSearching(true)
    setSearchResult(null)
    setSearchError(null)
    setProgressStage({ stage: 'intent', label: '解析意图', progress: 0.2 })
    setProgressValue(0.2)

    try {
      const result = await searchNewsStream(keyword, (stage) => {
        setProgressStage(stage)
        setProgressValue(stage.progress)
      })
      setSearchResult(result)
    } catch (error) {
      console.error('搜索失败:', error)
      setSearchError('搜索失败，请检查服务状态或稍后重试')
    } finally {
      setIsSearching(false)
      setProgressValue(1)
    }
  }

  return (
    <div className="min-h-screen app-shell">
      <Header
        isSearching={isSearching}
        showSearch={false}
        onOpenSources={() => setShowSourceManager(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="hero-panel">
          <div className="hero-grid">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-primary uppercase">
                今日资讯
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight">
                  输入主题，生成今日智能早报
                </h2>
                <p className="mt-3 text-muted-foreground text-base md:text-lg">
                  聚合多来源资讯，AI 自动拆解意图并输出重点摘要。
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (searchInput.trim()) {
                    handleSearch(searchInput.trim())
                  }
                }}
                className="search-panel"
              >
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="例如：新能源车出口趋势、AI 芯片监管..."
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  disabled={isSearching}
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="btn-primary whitespace-nowrap"
                >
                  {isSearching ? '分析中...' : '生成早报'}
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>今日关键词</span>
                <span>{hotKeywordsDate}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {hotKeywords.map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => {
                      setSearchInput(keyword)
                      handleSearch(keyword)
                    }}
                    className="keyword-chip"
                  >
                    #{keyword}
                  </button>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                关键词每日自动刷新 · 可点击快速生成今日简报
              </div>
            </div>
          </div>
        </section>

        {(isSearching || searchResult) && (
          <section className="space-y-6 animate-fade-in">
            {isSearching && (
              <div className="progress-card">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{progressStage?.label || '正在处理'}</span>
                  <span>{Math.round(progressValue * 100)}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progressValue * 100}%` }} />
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {[
                    { stage: 'intent', label: '解析意图' },
                    { stage: 'sources', label: '抓取资讯' },
                    { stage: 'dedupe', label: '去重整理' },
                    { stage: 'summary', label: '生成简报' },
                  ].map((item) => (
                    <div
                      key={item.stage}
                      className={`stage-pill ${progressStage?.stage === item.stage ? 'stage-pill-active' : ''}`}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {searchError}
              </div>
            )}

            {isSearching ? (
              <AISummary summary="" keyword="搜索中" isLoading={true} />
            ) : searchResult && (
              <>
                <AISummary summary={searchResult.aiSummary} keyword={searchResult.keyword} />

                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="w-5 h-5 text-primary" />
                    <h2 className="font-serif text-lg font-bold text-foreground">
                      「{searchResult.keyword}」相关资讯
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      共 {searchResult.news.length} 条
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {searchResult.news.map(news => (
                      <NewsCard key={news.id} news={news} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </main>

      {/* 源管理弹窗 */}
      <SourceManager
        isOpen={showSourceManager}
        onClose={() => setShowSourceManager(false)}
      />
    </div>
  )
}

export default App
