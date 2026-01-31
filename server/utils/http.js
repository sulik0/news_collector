export function createRetryingFetch({
  timeoutMs = 20000,
  retries = 2,
  backoffMs = 400,
} = {}) {
  return async function retryingFetch(url, options = {}) {
    let lastError
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)
      try {
        const res = await fetch(url, { ...options, signal: controller.signal })
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        return res
      } catch (error) {
        lastError = error
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)))
        }
      } finally {
        clearTimeout(timer)
      }
    }
    throw lastError
  }
}
