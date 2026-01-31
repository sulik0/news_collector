import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import {
  CustomSource,
  CreateSourceInput,
  SourceType,
  RSSConfig,
  ScraperConfig,
  WechatConfig,
  sourceTypeLabels,
  sourceTypeDescriptions,
} from '../../types/source'
import { categoryLabels } from '../../types/news'

interface SourceFormProps {
  source?: CustomSource | null
  onSubmit: (data: CreateSourceInput) => void
  onCancel: () => void
}

const defaultRSSConfig: RSSConfig = {
  url: '',
  itemLimit: 10,
}

const defaultScraperConfig: ScraperConfig = {
  url: '',
  selectors: {
    list: '',
    item: '',
    title: '',
    link: '',
  },
}

const defaultWechatConfig: WechatConfig = {
  accountId: '',
  rsshubInstance: 'https://rsshub.app',
  itemLimit: 10,
}

export function SourceForm({ source, onSubmit, onCancel }: SourceFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<SourceType>('rss')
  const [category, setCategory] = useState('tech')
  const [enabled, setEnabled] = useState(true)
  const [config, setConfig] = useState<RSSConfig | ScraperConfig | WechatConfig>(defaultRSSConfig)
  const skipNextTypeReset = useRef(false)

  useEffect(() => {
    if (source) {
      skipNextTypeReset.current = true
      setName(source.name)
      setType(source.type)
      setCategory(source.category)
      setEnabled(source.enabled)
      setConfig(source.config)
    }
  }, [source])

  useEffect(() => {
    if (skipNextTypeReset.current) {
      skipNextTypeReset.current = false
      return
    }
    // 切换类型时重置配置
    switch (type) {
      case 'rss':
        setConfig(defaultRSSConfig)
        break
      case 'scraper':
        setConfig(defaultScraperConfig)
        break
      case 'wechat':
        setConfig(defaultWechatConfig)
        break
    }
  }, [type, source])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      type,
      category,
      enabled,
      config,
    })
  }

  const renderConfigFields = () => {
    switch (type) {
      case 'rss':
        const rssConfig = config as RSSConfig
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RSS 订阅地址 <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={rssConfig.url}
                onChange={(e) => setConfig({ ...rssConfig, url: e.target.value })}
                className="input"
                placeholder="https://example.com/feed.xml"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                获取条数
              </label>
              <input
                type="number"
                value={rssConfig.itemLimit || 10}
                onChange={(e) => setConfig({ ...rssConfig, itemLimit: parseInt(e.target.value) || 10 })}
                className="input"
                min={1}
                max={50}
              />
            </div>
          </>
        )

      case 'scraper':
        const scraperConfig = config as ScraperConfig
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目标网页 URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={scraperConfig.url}
                onChange={(e) => setConfig({ ...scraperConfig, url: e.target.value })}
                className="input"
                placeholder="https://example.com/news"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                基础 URL（用于相对链接）
              </label>
              <input
                type="url"
                value={scraperConfig.baseUrl || ''}
                onChange={(e) => setConfig({ ...scraperConfig, baseUrl: e.target.value })}
                className="input"
                placeholder="https://example.com"
              />
            </div>
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">CSS 选择器配置</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">列表容器</label>
                  <input
                    type="text"
                    value={scraperConfig.selectors.list}
                    onChange={(e) => setConfig({
                      ...scraperConfig,
                      selectors: { ...scraperConfig.selectors, list: e.target.value }
                    })}
                    className="input text-sm"
                    placeholder=".news-list"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    条目选择器 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={scraperConfig.selectors.item}
                    onChange={(e) => setConfig({
                      ...scraperConfig,
                      selectors: { ...scraperConfig.selectors, item: e.target.value }
                    })}
                    className="input text-sm"
                    placeholder=".news-item"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    标题选择器 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={scraperConfig.selectors.title}
                    onChange={(e) => setConfig({
                      ...scraperConfig,
                      selectors: { ...scraperConfig.selectors, title: e.target.value }
                    })}
                    className="input text-sm"
                    placeholder=".title, h2 a"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    链接选择器 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={scraperConfig.selectors.link}
                    onChange={(e) => setConfig({
                      ...scraperConfig,
                      selectors: { ...scraperConfig.selectors, link: e.target.value }
                    })}
                    className="input text-sm"
                    placeholder="a"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">摘要选择器</label>
                  <input
                    type="text"
                    value={scraperConfig.selectors.summary || ''}
                    onChange={(e) => setConfig({
                      ...scraperConfig,
                      selectors: { ...scraperConfig.selectors, summary: e.target.value }
                    })}
                    className="input text-sm"
                    placeholder=".summary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">日期选择器</label>
                  <input
                    type="text"
                    value={scraperConfig.selectors.date || ''}
                    onChange={(e) => setConfig({
                      ...scraperConfig,
                      selectors: { ...scraperConfig.selectors, date: e.target.value }
                    })}
                    className="input text-sm"
                    placeholder=".date, time"
                  />
                </div>
              </div>
            </div>
          </>
        )

      case 'wechat':
        const wechatConfig = config as WechatConfig
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                公众号 ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={wechatConfig.accountId}
                onChange={(e) => setConfig({ ...wechatConfig, accountId: e.target.value })}
                className="input"
                placeholder="公众号的 biz 参数或名称"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                可在公众号文章链接中找到 __biz= 参数
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RSSHub 实例
              </label>
              <input
                type="url"
                value={wechatConfig.rsshubInstance || 'https://rsshub.app'}
                onChange={(e) => setConfig({ ...wechatConfig, rsshubInstance: e.target.value })}
                className="input"
                placeholder="https://rsshub.app"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                获取条数
              </label>
              <input
                type="number"
                value={wechatConfig.itemLimit || 10}
                onChange={(e) => setConfig({ ...wechatConfig, itemLimit: parseInt(e.target.value) || 10 })}
                className="input"
                min={1}
                max={50}
              />
            </div>
          </>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">
            {source ? '编辑新闻源' : '添加新闻源'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              源名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="如：阮一峰的网络日志"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              源类型
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['rss', 'scraper', 'wechat'] as SourceType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    type === t
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{sourceTypeLabels[t]}</div>
                  <div className="text-xs text-gray-500 mt-1">{sourceTypeDescriptions[t]}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              默认分类
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">源配置</h3>
            <div className="space-y-3">
              {renderConfigFields()}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="enabled" className="text-sm text-gray-700">
              立即启用此源
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 btn btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="flex-1 btn btn-primary">
              {source ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
