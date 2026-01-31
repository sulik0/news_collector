const KEYWORD_POOL = [
  '人工智能',
  'AIGC',
  '半导体',
  '云计算',
  '芯片出口',
  '机器人',
  '自动驾驶',
  '量子计算',
  '新能源车',
  '光伏储能',
  '低空经济',
  '新型电池',
  '宏观经济',
  '通胀预期',
  '货币政策',
  '房地产',
  '消费复苏',
  '制造业景气',
  '跨境电商',
  '出海品牌',
  '数字人民币',
  '数据要素',
  '网络安全',
  '开源生态',
  '空间互联网',
  '卫星通信',
  '脑机接口',
  '生物医药',
  'mRNA',
  '医疗器械',
  '教育科技',
  '文旅复苏',
  '电影票房',
  '体育赛事',
  '社会热点',
  '国际局势',
  '航天任务',
  '大模型',
  '智能制造',
  '供应链',
  '算力基础设施',
  'ChatGPT',
  '国产替代',
  '并购重组',
  '港股',
  '美股科技股',
  '人民币汇率',
  '黄金',
  '原油',
  '碳中和'
]

const STOPWORDS_EN = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'will', 'over',
  'news', 'report', 'reports', 'update', 'live', 'about', 'after', 'amid',
  'ahead', 'what', 'when', 'where', 'why', 'how', 'says', 'said', 'more',
  'than', 'its', 'their', 'them', 'they', 'your', 'you', 'are', 'was', 'were',
  'has', 'have', 'had', 'new', 'latest', 'top', 'big', 'as', 'at', 'in', 'on',
  'to', 'of', 'a', 'an', 'by'
])

const STOPWORDS_CN = new Set([
  '今日', '最新', '报道', '消息', '新闻', '公布', '官方', '最新消息', '透露',
  '关于', '如何', '为何', '以及', '继续', '正在', '宣布', '成为', '启动', '关注',
  '新增', '影响', '全球', '中国', '美国', '欧洲', '国内', '国际', '市场', '公司',
  '股市', '投资', '经济', '行业', '业务', '计划', '项目', '发布', '回应'
])

function hashDate(dateStr) {
  let hash = 0
  for (let i = 0; i < dateStr.length; i += 1) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getDailyKeywords(date = new Date()) {
  const dateStr = date.toISOString().slice(0, 10)
  const count = 6
  const startIndex = hashDate(dateStr) % KEYWORD_POOL.length
  const keywords = Array.from({ length: count }, (_, idx) => {
    return KEYWORD_POOL[(startIndex + idx) % KEYWORD_POOL.length]
  })

  return { date: dateStr, keywords }
}

export function buildTrendingKeywords(items, limit = 6) {
  const counter = new Map()

  for (const item of items || []) {
    const title = String(item?.title || '').trim()
    if (!title) continue

    const tokens = new Set()
    const cjkMatches = title.match(/[\u4e00-\u9fa5]{2,}/g) || []
    for (const segment of cjkMatches) {
      const clean = segment.replace(/[·•—–（）()【】[\]《》<>]/g, '')
      if (clean.length < 2) continue
      for (let len = 2; len <= 4; len += 1) {
        if (clean.length < len) continue
        for (let i = 0; i <= clean.length - len; i += 1) {
          const token = clean.slice(i, i + len)
          if (STOPWORDS_CN.has(token)) continue
          tokens.add(token)
        }
      }
    }

    const englishMatches = title.toLowerCase().match(/[a-z0-9][a-z0-9.+-]{2,}/g) || []
    for (const word of englishMatches) {
      if (STOPWORDS_EN.has(word)) continue
      tokens.add(word)
    }

    for (const token of tokens) {
      const weight = token.length >= 4 ? 2 : 1
      counter.set(token, (counter.get(token) || 0) + weight)
    }
  }

  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token)
    .filter((token) => token.length >= 2)
    .slice(0, limit)
}
