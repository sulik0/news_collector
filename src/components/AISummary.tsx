import { Sparkles, Bot, RefreshCw } from 'lucide-react'

interface AISummaryProps {
  summary: string
  keyword: string
  isLoading?: boolean
}

export function AISummary({ summary, keyword, isLoading = false }: AISummaryProps) {
  if (isLoading) {
    return (
      <div className="ai-summary rounded-xl p-6 bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10">
            <Bot className="w-5 h-5 text-secondary animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-foreground">AI 智能总结</h3>
            <p className="text-sm text-muted-foreground">正在分析关于「{keyword}」的资讯...</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="skeleton h-4 rounded w-full" />
          <div className="skeleton h-4 rounded w-11/12" />
          <div className="skeleton h-4 rounded w-4/5" />
          <div className="skeleton h-4 rounded w-full" />
          <div className="skeleton h-4 rounded w-3/4" />
        </div>
        
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>AI 正在处理中，请稍候...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-summary rounded-xl p-6 bg-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10">
          <Sparkles className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-foreground">AI 智能总结</h3>
          <p className="text-sm text-muted-foreground">关于「{keyword}」的资讯摘要</p>
        </div>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <div className="text-foreground whitespace-pre-line leading-relaxed">
          {summary}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        <Bot className="w-4 h-4" />
        <span>由 AI 大模型生成 · 仅供参考</span>
      </div>
    </div>
  )
}
