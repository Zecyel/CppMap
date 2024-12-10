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

  // 枚举 chosen 的每个全排列
  const n = chosen.length
  const perm: Location[][] = []
  const vis = Array(n).fill(false)
  const path: Location[] = []
  let min_loss = Number.MAX_SAFE_INTEGER, ans = Number.MAX_SAFE_INTEGER
  let best: Location[][] = []

  const dfs = (u: number, currentLoss: number, currentSum: number) => {
    if (u === n) {
      if (currentLoss < min_loss) {
        min_loss = currentLoss
        best = []
        let remaining = n
        let start = 0
        for (let i = 0; i < days; i++) {
          const chunkSize = Math.ceil(remaining / (days - i))
          const end = start + chunkSize
          const dayPath = [hotel, ...path.slice(start, end), hotel]
          best.push(dayPath)
          start = end
          remaining -= chunkSize
        }
        ans = currentSum
      }
      return
    }
    for (let i = 0; i < n; i++) {
      if (!vis[i]) {
        vis[i] = true
        path.push(chosen[i])
        let newLoss = currentLoss
        let newSum = currentSum
        if (u > 0) {
          const dist = options.getDistance(path[u - 1].nearestNode, chosen[i].nearestNode) || Number.MAX_SAFE_INTEGER
          newSum += dist
          newLoss += dist * dist
        }
        if (newLoss < min_loss) {
          dfs(u + 1, newLoss, newSum)
        }
        path.pop()
        vis[i] = false
      }
    }
  }
  dfs(0, 0, 0)

  return {
    hotel,
    routes: best,
  }
}
