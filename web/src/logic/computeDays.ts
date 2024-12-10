// import { useCenterPoint } from '../composables/useCenter'
import { MAP_BACKEND } from '../constants'
import type { NodeId, Location } from '../types'
import { Options } from './computeOptions'
import { fetchJson } from './fetchJson'
import { computePathLength } from './pathLength'

export async function computeDays(options: Options, chosen: Location[], days: number, hotel: Location, signal: AbortSignal): Promise<Location[][]> {
  console.log('compute Days with options:', options, 'chosen:', chosen, 'days:', days)

  // const center = useCenterPoint(chosen.map(n => n.coord))

  // const hotel: Location = {
  //   name: 'Hotel',
  //   description: 'Hotel',
  //   coord: [center.value[0], center.value[1]],
  //   nearestNode: (await fetchJson(`${MAP_BACKEND}/nearest_point?lat=${center.value[0]}&lon=${center.value[1]}`)).nearest_point
  // }
  // console.log('hotel', hotel)

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
  console.log('perm', perm)

  const paths: Record<NodeId, { path: [number, number][], distance: number }> = {}
  const result = (await fetchJson(
    `${MAP_BACKEND}/shortest_paths?start=${hotel.nearestNode}&ends=${chosen.map(n => n.nearestNode).join(',')}`,
    { signal },
  )).paths
  for (const target of chosen) {
    const path = result[target.nearestNode]
    const normalizedPath = path.map(({ lat, lon }: any) => [lat, lon] as [number, number])
    const normalizedDistance = computePathLength(normalizedPath)
    paths[target.nearestNode] = { path: normalizedPath, distance: normalizedDistance }
  }

  console.log(result)
  function getDistance(u: NodeId, v: NodeId): number {
    console.log('getting dist', u, v)
    if (u === v) return 0
    if (u === hotel.nearestNode) return paths[v].distance
    if (v === hotel.nearestNode) return paths[u].distance
    return options.paths[u][v].distance || options.paths[v][u].distance
  }

  // 将行程平均分为 days 天，每天早上从酒店出发，晚上回到酒店
  let ans = Number.MAX_SAFE_INTEGER
  let best: Location[][] = []
  for (const p of perm) {
    console.log('calculating', p)
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
    console.log(dailyPaths)
    let sum = 0
    for (const dayPath of dailyPaths) {
      for (let i = 0; i + 1 < dayPath.length; i++) {
        let dist = getDistance(dayPath[i].nearestNode, dayPath[i + 1].nearestNode)
        console.log('dist=', dist)
        if (dist === undefined) {
          dist = Number.MAX_SAFE_INTEGER
          console.log('met undefined!')
        }
        sum += dist
      }
    }
    console.log('sum=', sum)
    if (sum < ans) {
      ans = sum
      best = dailyPaths
    }
  }
  console.log('best', best)

  return best
}
