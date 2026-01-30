export function dedupeNews(items) {
  const seen = new Set()
  const result = []
  for (const item of items) {
    const key = (item.url || item.title || '').toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }
  return result
}
