import { computed, MaybeRefOrGetter, toValue } from "vue";

export function usePathLength(path: MaybeRefOrGetter<[number, number][]>) {
  return computed(() => {
    const pathValue = toValue(path)
    let distance = 0
    for (let i = 1; i < pathValue.length; i++) {
      const [lat1, lon1] = [pathValue[i - 1].lat, pathValue[i - 1].lon]
      const [lat2, lon2] = [pathValue[i].lat, pathValue[i].lon]
      distance += haversineDistance(lat1, lon1, lat2, lon2)
    }
    return distance
  })
}