import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { NewsCard } from './components/NewsCard'
import { AISummary } from './components/AISummary'
import { HotKeywords } from './components/HotKeywords'
import { searchNews, getLatestNews, getHotKeywords } from './services/newsService'
import { NewsItem, SearchResult } from './types/news'
import { Newspaper, Search, Sparkles } from 'lucide-react'

function App() {
  const [latestNews, setLatestNews] = useState<NewsItem[]>([])
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [hotKeywords] = useState<string[]>(getHotKeywords())

  useEffect(() => {
    setLatestNews(getLatestNews())
  }, [])

  const handleSearch = async (keyword: string) => {
    setIsSearching(true)
    setSearchResult(null)
    
    try {
      const result = await searchNews(keyword)
      setSearchResult(result)
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} isSearching={isSearching} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* 主内容区 */}
          <div className="lg:col-span-3 space-y-8">
            {/* 搜索结果 / AI总结 */}
            {(isSearching || searchResult) && (
              <section className="animate-fade-in">
                {isSearching ? (
                  <AISummary 
                    summary="" 
                    keyword="搜索中" 
                    isLoading={true} 
                  />
                ) : searchResult && (
                  <>
                    <AISummary 
                      summary={searchResult.aiSummary} 
                      keyword={searchResult.keyword} 
                    />
                    
                    {/* 搜索结果列表 */}
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

            {/* 最新资讯 */}
            {!searchResult && !isSearching && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Newspaper className="w-6 h-6 text-primary" />
                  <h2 className="font-serif text-xl font-bold text-foreground">今日要闻</h2>
                </div>
                
                {/* 头条新闻 */}
                {latestNews[0] && (
                  <div className="mb-6">
                    <NewsCard news={latestNews[0]} featured={true} />
                  </div>
                )}
                
                {/* 新闻列表 */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {latestNews.slice(1).map(news => (
                    <NewsCard key={news.id} news={news} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* 侧边栏 */}
          <aside className="space-y-6">
            {/* 热门关键词 */}
            <HotKeywords 
              keywords={hotKeywords} 
              onKeywordClick={handleSearch}
              currentKeyword={searchResult?.keyword}
            />
            
            {/* AI助手提示 */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-5 border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-serif font-bold text-foreground">AI 智能助手</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                输入任意关键词，AI 将为您搜索相关资讯并生成智能摘要，助您快速掌握核心信息。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['人工智能', '经济', '科技'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSearch(tag)}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    试试搜索「{tag}」
                  </button>
                ))}
              </div>
            </div>

            {/* 版权信息 */}
            <div className="text-center text-xs text-muted-foreground py-4">
              <p>资讯聚合平台 · 智能新闻助手</p>
              <p className="mt-1">© 2024 All Rights Reserved</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default App
