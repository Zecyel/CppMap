import { tryOnScopeDispose } from "@vueuse/core";
import L from "leaflet";
import { MaybeRefOrGetter, ref, toValue, watchEffect } from "vue";
import focusedIcon from "../assets/marker-focused.png?url";
import normalIcon from "../assets/marker.png?url";
import { useMap } from "./useMap";

const iconScale = 0.5;
const iconOptions = {
  iconSize: [50 * iconScale, 82 * iconScale] as L.PointTuple,
  iconAnchor: [25 * iconScale, 82 * iconScale] as L.PointTuple,
}

const iconNormal = L.icon({
  iconUrl: normalIcon,
  ...iconOptions,
});

const iconFocused = L.icon({
  iconUrl: focusedIcon,
  ...iconOptions,
});

const focusedCoord = ref<string>();

export function usePin(coord: MaybeRefOrGetter<L.LatLngExpression>) {
  const { map } = useMap();

  const pin = L.marker(toValue(coord));

  pin.addTo(map);

  watchEffect(() => {
    pin.setLatLng(toValue(coord));
  })

  function focus() {
    map.flyTo(toValue(coord), 18);
    focusedCoord.value = toValue(coord).toString();
  }

  pin.addEventListener("click", focus)

  watchEffect(() => {
    const focused = focusedCoord.value === toValue(coord).toString();
    pin.setIcon(focused ? iconFocused : iconNormal);
  })

  function remove() {
    pin.removeFrom(map);
    pin.remove();
  }

  tryOnScopeDispose(remove)

  return {
    pin,
    remove,
    focus,
  }
}
