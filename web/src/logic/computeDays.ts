type NodeId = number

export async function computeDays(chosen: NodeId[], days: number, hotel: NodeId): NodeId[][] {
  // 枚举 chosen 的每个全排列
  const n = chosen.length
  const perm: NodeId[][] = []
  const vis = Array(n).fill(false)
  const path: NodeId[] = []
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

  const dist = async (s: NodeId, t: NodeId) => {
    return 0; // calc the dist between s and t
  }

  // 将行程平均分为 days 天，每天早上从酒店出发，晚上回到酒店
  let ans = Number.MAX_SAFE_INTEGER
  let best: NodeId[][] = []
  for (const p of perm) {
    const dailyPaths: NodeId[][] = []
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
        sum += await dist(dayPath[i], dayPath[i + 1])
      }
    }
    if (sum < ans) {
      ans = sum
      best = dailyPaths
    }
  }

  return best
}
