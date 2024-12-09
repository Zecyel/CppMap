import { MaybeRefOrGetter, ref, toValue, watchEffect } from "vue";
import L from "leaflet";
import { tryOnScopeDispose } from "@vueuse/core"
import { map, onMapMounted } from "../map";
import normalIcon from "../assets/pin.svg?url";
import focusedIcon from "../assets/pin-focused.svg?url";

const iconNormal = L.icon({
  iconUrl: normalIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const iconFocused = L.icon({
  iconUrl: focusedIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const focusedCoord = ref<string>();

export function usePin(coord: MaybeRefOrGetter<L.LatLngExpression>) {
  const pin = L.marker(toValue(coord));

  onMapMounted((map) => {
    pin.addTo(map);
  });

  watchEffect(() => {
    pin.setLatLng(toValue(coord));
  })

  function focus() {
    map.value?.flyTo(toValue(coord), 18);
    focusedCoord.value = toValue(coord).toString();
  }

  watchEffect(() => {
    const focused = focusedCoord.value === toValue(coord).toString();
    pin.setIcon(focused ? iconFocused : iconNormal);
  })

  function remove() {
    pin.removeFrom(map.value!);
  }

  tryOnScopeDispose(remove)

  return {
    remove,
    focus,
  }
}
