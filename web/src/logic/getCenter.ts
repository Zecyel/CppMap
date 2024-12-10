export function getCenter(coords: [number, number][]): [number, number] {
  const lat = coords.reduce((acc, [lat]) => acc + lat, 0) / coords.length
  const lon = coords.reduce((acc, [, lon]) => acc + lon, 0) / coords.length
  return [lat, lon]
}
