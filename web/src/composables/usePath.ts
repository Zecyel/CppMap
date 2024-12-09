import { computed, MaybeRefOrGetter, toValue, watch } from "vue";
import { map, onMapMounted } from "../map";
import L from "leaflet";
import { tryOnScopeDispose } from "@vueuse/core";

export function usePath(path: MaybeRefOrGetter<L.LatLngExpression[] | null | undefined>) {
  const normalized = computed<L.LatLngExpression[]>(() => {
    const value = toValue(path);
    return value?.length && value?.length >= 2 ? value : [[0, 0]];
  })

  const polyline = new L.Polyline(normalized.value, {
    color: "blue",
    stroke: true,
  })

  onMapMounted((map) => {
    polyline.addTo(map);
  })

  watch(normalized, (path) => {
    polyline.setLatLngs(path);
    if (path.length > 1) {
      setTimeout(() => {
        map.value?.fitBounds(polyline.getBounds().pad(0.1));
      }, 30)
    }
  })

  function remove() {
    polyline.remove();
  }

  tryOnScopeDispose(remove);

  return {
    polyline,
    remove,
  }
}
