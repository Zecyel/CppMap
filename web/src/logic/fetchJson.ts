export async function fetchJson<T = any>(url: string, init?: RequestInit, fallback?: () => T) {
  const response = await fetch(url, init)
  if (!response.ok) {
    if (fallback) {
      return fallback()
    }
    throw new Error(response.statusText)
  }
  return response.json() as T
}
