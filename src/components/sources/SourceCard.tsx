import { Rss, Globe, MessageCircle, ToggleLeft, ToggleRight, Trash2, Edit } from 'lucide-react'
import { CustomSource, sourceTypeLabels } from '../../types/source'
import { categoryLabels } from '../../types/news'

interface SourceCardProps {
  source: CustomSource
  onToggle: (id: string, enabled: boolean) => void
  onEdit: (source: CustomSource) => void
  onDelete: (id: string) => void
}

const typeIcons: Record<string, React.ElementType> = {
  rss: Rss,
  scraper: Globe,
  wechat: MessageCircle,
}

export function SourceCard({ source, onToggle, onEdit, onDelete }: SourceCardProps) {
  const Icon = typeIcons[source.type] || Globe

  const getConfigSummary = () => {
    if (source.type === 'rss') {
      const config = source.config as { url: string }
      return config.url
    }
    if (source.type === 'scraper') {
      const config = source.config as { url: string }
      return config.url
    }
    if (source.type === 'wechat') {
      const config = source.config as { accountId: string }
      return `公众号: ${config.accountId}`
    }
    return ''
  }

  return (
    <div className={`card p-4 ${!source.enabled ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${source.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">{source.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
                {sourceTypeLabels[source.type]}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 whitespace-nowrap">
                {categoryLabels[source.category] || source.category}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 truncate" title={getConfigSummary()}>
              {getConfigSummary()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onToggle(source.id, !source.enabled)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title={source.enabled ? '禁用' : '启用'}
          >
            {source.enabled ? (
              <ToggleRight size={20} className="text-green-500" />
            ) : (
              <ToggleLeft size={20} className="text-gray-400" />
            )}
          </button>
          <button
            onClick={() => onEdit(source)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="编辑"
          >
            <Edit size={18} className="text-gray-500" />
          </button>
          <button
            onClick={() => onDelete(source.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
            title="删除"
          >
            <Trash2 size={18} className="text-red-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
