
export function computePathLength(path: [number, number][]): number {
  let distance = 0
  for (let i = 1; i < path.length; i++) {
    const [lat1, lon1] = path[i - 1]
    const [lat2, lon2] = path[i]
    distance += haversineDistance(lat1, lon1, lat2, lon2)
  }
  return distance
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
