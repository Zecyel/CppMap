export async function fetchJson<T = any>(url: string): Promise<Awaited<T>>
export async function fetchJson<T = any>(url: string, signal: AbortSignal): Promise<Awaited<T> | undefined>
export async function fetchJson<T = any>(url: string, signal?: AbortSignal) {
  try {
    const response = await fetch(url, {
      signal,
    })
    if (response.ok) {
      return response.json() as T
    }
    throw new Error(response.statusText)
  } catch (e: any) {
    if (!e.name || e.name !== 'AbortError') {
      console.error('Failed to fetch', url, e)
      throw e
    }
  }
}
