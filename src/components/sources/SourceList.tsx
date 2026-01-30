import { CustomSource } from '../../types/source'
import { SourceCard } from './SourceCard'

interface SourceListProps {
  sources: CustomSource[]
  loading: boolean
  onToggle: (id: string, enabled: boolean) => void
  onEdit: (source: CustomSource) => void
  onDelete: (id: string) => void
}

export function SourceList({ sources, loading, onToggle, onEdit, onDelete }: SourceListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (sources.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500">暂无自定义新闻源</p>
        <p className="text-sm text-gray-400 mt-1">点击上方按钮添加 RSS、网页或公众号订阅</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <SourceCard
          key={source.id}
          source={source}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
