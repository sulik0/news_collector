function normalizeText(text) {
  return String(text || '').toLowerCase()
}

function isCJK(text) {
  return /[\u4e00-\u9fa5]/.test(text)
}

export function buildSearchTerms({ query, keywords } = {}) {
  const rawTerms = []
  if (query) rawTerms.push(query)
  if (Array.isArray(keywords)) rawTerms.push(...keywords)

  const terms = new Set()
  for (const raw of rawTerms) {
    const text = String(raw || '').trim()
    if (!text) continue
    if (isCJK(text)) {
      terms.add(text)
      continue
    }
    text
      .toLowerCase()
      .split(/[^a-z0-9+.-]+/i)
      .map((part) => part.trim())
      .filter((part) => part.length >= 2)
      .forEach((part) => terms.add(part))
  }

  return Array.from(terms)
}

export function matchesTerms(text, terms) {
  if (!terms || terms.length === 0) return true
  const normalized = normalizeText(text)
  return terms.some((term) => normalized.includes(normalizeText(term)))
}
