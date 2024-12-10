import { computed, MaybeRefOrGetter, toValue } from "vue";

export function useNearest<T>(options: MaybeRefOrGetter<T[]>, source: MaybeRefOrGetter<[number, number]>, getCoord: (option: T) => [number, number]) {
  return computed(() => {
    let minDistanceSquare = Infinity
    let nearest: T | undefined
    const sourceValue = toValue(source)
    for (const option of toValue(options)) {
      const coord = getCoord(option)
      const distance = (sourceValue[0] - coord[0]) ** 2 + (sourceValue[1] - coord[1]) ** 2
      if (distance < minDistanceSquare) {
        minDistanceSquare = distance
        nearest = option
      }
    }
    return nearest
  })
}
