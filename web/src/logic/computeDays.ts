import { MAP_BACKEND } from '../constants'
import type { NodeId, Location } from '../types'
import { Options } from './computeOptions'
import { fetchJson } from './fetchJson'
import { getCenter } from './getCenter'
import { computePathLength } from './pathLength'

export async function computeDays(options: Options, chosen: Location[], days: number, signal: AbortSignal): Promise<{
  hotel: Location,
  routes: Location[][],
}> {
  const center = getCenter(chosen.map(n => n.coord))

  const hotel: Location = {
    name: 'Hotel',
    description: 'Hotel',
    coord: center,
    nearestNode: (await fetchJson(`${MAP_BACKEND}/nearest_point?lat=${center[0]}&lon=${center[1]}`)).nearest_point
  }

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

  const result = (await fetchJson(
    `${MAP_BACKEND}/shortest_paths?start=${hotel.nearestNode}&ends=${chosen.map(n => n.nearestNode).sort().join(',')}`,
    signal,
  ))?.paths
  if (!result) {
    // Aborted
    return {
      hotel,
      routes: [],
    }
  }

  options.paths[hotel.nearestNode] = {}
  for (const target of chosen) {
    const path = result[target.nearestNode]
    const normalizedPath = path.map(({ lat, lon }: any) => [lat, lon] as [number, number])
    const normalizedDistance = computePathLength(normalizedPath)
    options.paths[hotel.nearestNode][target.nearestNode] = { path: normalizedPath, distance: normalizedDistance }
  }

  // 将行程平均分为 days 天，每天早上从酒店出发，晚上回到酒店
  let min_loss = Number.MAX_SAFE_INTEGER, ans = Number.MAX_SAFE_INTEGER
  let best: Location[][] = []
  for (const p of perm) {
    const dailyPaths: Location[][] = []
    let remaining = n
    let start = 0
    for (let i = 0; i < days; i++) {
      const chunkSize = Math.ceil(remaining / (days - i))
      const end = start + chunkSize
      const dayPath = [hotel, ...p.slice(start, end), hotel]
      dailyPaths.push(dayPath)
      start = end
      remaining -= chunkSize
    }
    let loss = 0, sum = 0
    for (const dayPath of dailyPaths) {
      let today_len = 0
      for (let i = 0; i + 1 < dayPath.length; i++) {
        let dist = options.getDistance(dayPath[i].nearestNode, dayPath[i + 1].nearestNode)
        if (dist === undefined) {
          dist = Number.MAX_SAFE_INTEGER
        }
        today_len += dist
      }
      loss += today_len * today_len
      sum += today_len
    }
    if (loss < min_loss) {
      min_loss = loss
      best = dailyPaths
      ans = sum
    }
  }

  return {
    hotel,
    routes: best,
  }
}
