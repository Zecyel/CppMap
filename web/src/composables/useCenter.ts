import { computed, MaybeRefOrGetter, toValue } from "vue";

export function useCenterPoint(coords: MaybeRefOrGetter<[number, number][]>) {
  return computed(() => {
    const coordsValue = toValue(coords)
    const lat = coordsValue.reduce((acc, [lat]) => acc + lat, 0) / coordsValue.length
    const lon = coordsValue.reduce((acc, [, lon]) => acc + lon, 0) / coordsValue.length
    return [lat, lon]
  })
}
