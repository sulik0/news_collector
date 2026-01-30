import { fetchRSS } from './rss.js'

/**
 * 通过 RSSHub 将微信公众号转为 RSS
 * RSSHub 文档: https://docs.rsshub.app/routes/social-media#wei-xin
 * 
 * 支持的路由格式:
 * - /wechat/mp/homepage/:biz - 公众号主页（需要 biz 参数）
 * - /wechat/mp/msgalbum/:biz/:aid - 合集
 * - /wechat/mp/latest/:biz - 最新文章
 */
export async function fetchWechat(source, searchPayload = {}) {
  const { accountId, rsshubInstance = 'https://rsshub.app' } = source.config || {}

  if (!accountId) {
    console.error(`Wechat source [${source.name}] missing accountId`)
    return []
  }

  // 构建 RSSHub URL
  // 使用 latest 路由，更稳定
  const rssUrl = `${rsshubInstance.replace(/\/$/, '')}/wechat/mp/latest/${accountId}`

  // 复用 RSS Provider
  return fetchRSS({
    ...source,
    config: {
      url: rssUrl,
      itemLimit: source.config?.itemLimit || 10
    }
  }, searchPayload)
}
