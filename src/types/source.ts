export type SourceType = 'rss' | 'scraper' | 'wechat'

export interface RSSConfig {
  url: string
  itemLimit?: number
}

export interface ScraperConfig {
  url: string
  selectors: {
    list: string
    item: string
    title: string
    link: string
    summary?: string
    date?: string
    image?: string
  }
  baseUrl?: string
}

export interface WechatConfig {
  accountId: string
  rsshubInstance?: string
  itemLimit?: number
}

export interface CustomSource {
  id: string
  name: string
  type: SourceType
  enabled: boolean
  category: string
  config: RSSConfig | ScraperConfig | WechatConfig
  createdAt: string
  updatedAt: string
}

export type CreateSourceInput = Omit<CustomSource, 'id' | 'createdAt' | 'updatedAt'>

export const sourceTypeLabels: Record<SourceType, string> = {
  rss: 'RSS 订阅',
  scraper: '网页抓取',
  wechat: '微信公众号',
}

export const sourceTypeDescriptions: Record<SourceType, string> = {
  rss: '支持标准 RSS/Atom 订阅源',
  scraper: '通过 CSS 选择器抓取网页内容',
  wechat: '通过 RSSHub 订阅微信公众号',
}
