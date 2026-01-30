import { TrendingUp, Hash } from 'lucide-react'
import { cn } from '../lib/utils'

interface HotKeywordsProps {
  keywords: string[]
  onKeywordClick: (keyword: string) => void
  currentKeyword?: string
}

export function HotKeywords({ keywords, onKeywordClick, currentKeyword }: HotKeywordsProps) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-serif font-bold text-foreground">热门关键词</h3>
      </div>
      
      <div className="space-y-2">
        {keywords.map((keyword, index) => (
          <button
            key={keyword}
            onClick={() => onKeywordClick(keyword)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
              currentKeyword === keyword
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-foreground"
            )}
          >
            <span className={cn(
              "flex items-center justify-center w-6 h-6 rounded text-xs font-bold",
              index < 3 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            )}>
              {index + 1}
            </span>
            <span className="flex-1 font-medium truncate">{keyword}</span>
            <Hash className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  )
}
