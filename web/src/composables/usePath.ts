import { MaybeRefOrGetter, toValue, watchEffect } from "vue";
import { map, onMapMounted } from "../map";
import L from "leaflet";
import { tryOnScopeDispose } from "@vueuse/core";

export function usePath(path: MaybeRefOrGetter<L.LatLngExpression[]>) {
  const polyline = new L.Polyline(toValue(path), {
    color: "blue",
    stroke: true,
  })

  onMapMounted((map) => {
    polyline.addTo(map);
  })

  watchEffect(() => {
    polyline.setLatLngs(toValue(path));
    setTimeout(() => {
      map.value?.fitBounds(polyline.getBounds().pad(0.1));
    }, 30)
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
