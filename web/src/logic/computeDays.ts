import type { NodeId, Location } from '../types'
import { Options } from './computeOptions'
import { fetchJson } from './fetchJson'
import { computePathLength } from './pathLength'

export async function computeDays(options: Options, chosen: Location[], days: number, hotel: Location): Promise<Location[][]> {
  // 枚举 chosen 的每个全排列
  const n = chosen.length
  const perm: Location[][] = []
  const vis = Array(n).fill(false)
  const path: Location[] = []
  const dfs = (u: number) => {
    if (u === n) {
      perm.push([...path])
      return
    }
    for (let i = 0; i < n; i++) {
      if (!vis[i]) {
        vis[i] = true
        path.push(chosen[i])
        dfs(u + 1)
        path.pop()
        vis[i] = false
      }
    }
  }
  dfs(0)

  const paths: Record<NodeId, { path: [number, number][], distance: number }> = {}
  const result = (await fetchJson(
    `http://localhost:18080/shortest_paths?start=${hotel.nearestNode}&end=${chosen.map(n => n.nearestNode).join(',')}`,
  )).paths
  for (const target of chosen) {
    const path = result[target.nearestNode]
    const normalizedPath = path.map(({ lat, lon }: any) => [lat, lon] as [number, number])
    const normalizedDistance = computePathLength(normalizedPath)
    paths[target.nearestNode] = { path: normalizedPath, distance: normalizedDistance }
  }

  function getDistance(u: NodeId, v: NodeId): number {
    if (u === hotel.nearestNode) return paths[v].distance
    if (v === hotel.nearestNode) return paths[u].distance
    return options.paths[u][v].distance || options.paths[v][u].distance
  }

  // 将行程平均分为 days 天，每天早上从酒店出发，晚上回到酒店
  let ans = Number.MAX_SAFE_INTEGER
  let best: Location[][] = []
  for (const p of perm) {
    const dailyPaths: Location[][] = []
    const chunkSize = Math.ceil(n / days)
    for (let i = 0; i < days; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, n)
      const dayPath = [hotel, ...p.slice(start, end), hotel]
      dailyPaths.push(dayPath)
    }
    let sum = 0
    for (const dayPath of dailyPaths) {
      for (let i = 0; i + 1 < dayPath.length; i++) {
        sum += getDistance(dayPath[i].nearestNode, dayPath[i + 1].nearestNode)
      }
    }
    if (sum < ans) {
      ans = sum
      best = dailyPaths
    }
  }

  return best
}
