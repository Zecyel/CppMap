export async function fetchJson<T = any>(url: string, fallback?: () => T) {
  const response = await fetch(url)
  if (!response.ok) {
    if (fallback) {
      return fallback()
    }
    throw new Error(response.statusText)
  }
  return response.json() as T
}
