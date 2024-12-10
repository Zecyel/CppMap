import { computed, MaybeRefOrGetter, toValue, watch } from "vue";
import L from "leaflet";
import { tryOnScopeDispose } from "@vueuse/core";
import { useMap } from "./useMap";

export function usePath(path: MaybeRefOrGetter<L.LatLngExpression[] | null | undefined>) {
  const { map } = useMap();

  const normalized = computed<L.LatLngExpression[]>(() => {
    const value = toValue(path);
    return value?.length && value?.length >= 2 ? value : [[0, 0]];
  })

  const polyline = new L.Polyline(normalized.value, {
    color: "blue",
    stroke: true,
  })

  polyline.addTo(map);

  function focus() {
    if (normalized.value.length > 1) {
      setTimeout(() => {
        map.fitBounds(polyline.getBounds().pad(0.1));
      }, 30)
    }
  }

  watch(normalized, (path) => {
    polyline.setLatLngs(path);
    focus();
  })

  function remove() {
    polyline.remove();
  }

  tryOnScopeDispose(remove);

  return {
    polyline,
    remove,
    focus,
  }
}
