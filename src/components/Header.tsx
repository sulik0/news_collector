import { Search, Newspaper, Sparkles, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'

interface HeaderProps {
  onSearch: (keyword: string) => void
  isSearching: boolean
}

export function Header({ onSearch, isSearching }: HeaderProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const keyword = formData.get('keyword') as string
    if (keyword.trim()) {
      onSearch(keyword.trim())
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-card shadow-nav">
      {/* 顶部红色条 */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 主导航 */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Newspaper className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">资讯聚合</h1>
              <p className="text-xs text-muted-foreground">智能新闻助手</p>
            </div>
          </div>

          {/* 搜索框 */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                name="keyword"
                placeholder="输入关键词搜索资讯，AI为您智能总结..."
                className="search-input pl-12 pr-24"
                disabled={isSearching}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <button
                type="submit"
                disabled={isSearching}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm",
                  isSearching && "opacity-70 cursor-not-allowed"
                )}
              >
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    搜索中
                  </span>
                ) : (
                  '搜索'
                )}
              </button>
            </div>
          </form>

          {/* 右侧信息 */}
          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* 分类导航 */}
        <nav className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
          {[
            { name: '热点', icon: TrendingUp },
            { name: '科技' },
            { name: '财经' },
            { name: '社会' },
            { name: '国际' },
            { name: '娱乐' },
            { name: '体育' },
          ].map((item, index) => (
            <button
              key={item.name}
              className={cn(
                "flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                index === 0 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.name}
            </button>
          ))}
          <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />
        </nav>
      </div>
    </header>
  )
}
