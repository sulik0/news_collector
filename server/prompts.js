export function buildIntentPrompt(userInput) {
  return [
    {
      role: 'system',
      content:
        '你是新闻助理，需要把用户输入解析为结构化搜索意图。输出严格 JSON，包含 fields: query, categories, timeRange, language, region, keywords。不要添加多余文字。',
    },
    {
      role: 'user',
      content: `用户输入：${userInput}`,
    },
  ]
}

export function buildSummaryPrompt(intent, items) {
  const sources = items
    .slice(0, 20)
    .map((item, idx) => `${idx + 1}. ${item.title} (${item.source}) ${item.url}`)
    .join('\n')

  return [
    {
      role: 'system',
      content:
        '你是新闻早报编辑，请根据提供的新闻列表生成一份中文早报。要求：\n1. 纯文本输出，不要 Markdown。\n2. 先给出 3-5 条要点摘要，每条一行。\n3. 再给出“参考来源”段落，列出 5-10 条引用链接，每条一行，格式：标题 - 链接。\n4. 保持客观简洁。',
    },
    {
      role: 'user',
      content: `搜索意图：${JSON.stringify(intent)}\n\n新闻列表：\n${sources}`,
    },
  ]
}
