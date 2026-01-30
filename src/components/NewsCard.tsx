import { ExternalLink, Clock, Tag } from 'lucide-react'
import { NewsItem, categoryLabels, categoryColors } from '../types/news'
import { formatRelativeTime } from '../lib/utils'

interface NewsCardProps {
  news: NewsItem
  featured?: boolean
}

export function NewsCard({ news, featured = false }: NewsCardProps) {
  if (featured) {
    return (
      <article className="news-card group relative overflow-hidden rounded-xl bg-card shadow-card">
        <div className="grid md:grid-cols-2 gap-0">
          {/* 图片区域 */}
          <div className="relative h-64 md:h-full overflow-hidden">
            {news.imageUrl ? (
              <img
                src={news.imageUrl}
                alt={news.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-4xl">📰</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r" />
          </div>
          
          {/* 内容区域 */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`tag ${categoryColors[news.category]}`}>
                  {categoryLabels[news.category]}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(news.publishedAt)}
                </span>
              </div>
              
              <h2 className="text-2xl font-serif font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                {news.title}
              </h2>
              
              <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                {news.summary}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {news.keywords.slice(0, 3).map(keyword => (
                  <span key={keyword} className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    <Tag className="w-3 h-3" />
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                来源：{news.source} · {news.author}
              </span>
              <a
                href={news.url}
                className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
              >
                阅读全文
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="news-card group bg-card rounded-lg shadow-card overflow-hidden">
      {/* 图片 */}
      {news.imageUrl && (
        <div className="relative h-44 overflow-hidden">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <span className={`tag ${categoryColors[news.category]}`}>
              {categoryLabels[news.category]}
            </span>
          </div>
        </div>
      )}
      
      {/* 内容 */}
      <div className="p-4">
        <h3 className="font-serif font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {news.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {news.summary}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{news.source}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(news.publishedAt)}
          </span>
        </div>
      </div>
    </article>
  )
}
