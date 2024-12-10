import { tryOnScopeDispose } from "@vueuse/core";
import L from "leaflet";
import { computed, MaybeRefOrGetter, toValue, watch, watchEffect } from "vue";
import focusedIcon from "../assets/marker-focused.png?url";
import normalIcon from "../assets/marker.png?url";
import disabledIcon from "../assets/marker-disabled.png?url";
import { useMap } from "./useMap";

const iconScale = 0.5;
const iconOptions = {
  iconSize: [50 * iconScale, 82 * iconScale] as L.PointTuple,
  iconAnchor: [25 * iconScale, 82 * iconScale] as L.PointTuple,
}

const iconNormal = L.icon({ iconUrl: normalIcon, ...iconOptions });
const iconFocused = L.icon({ iconUrl: focusedIcon, ...iconOptions });
const iconDisabled = L.icon({ iconUrl: disabledIcon, ...iconOptions });

export function usePin(coord: MaybeRefOrGetter<L.LatLngExpression>, show: MaybeRefOrGetter<boolean> = true, disabled: MaybeRefOrGetter<boolean> = false) {
  const { map, focusedCoord, focus: _focus } = useMap();
  const focus = () => _focus(toValue(coord));

  const shownCoord = computed<L.LatLngExpression>(() => toValue(show) ? toValue(coord) : [0, 0]);
  const pin = L.marker(shownCoord.value);

  pin.addTo(map);

  watchEffect(() => {
    pin.setLatLng(shownCoord.value);
  })

  pin.addEventListener("click", focus)

  watchEffect(() => {
    const focused = focusedCoord.value === toValue(coord).toString();
    pin.setIcon(toValue(disabled) ? iconDisabled : focused ? iconFocused : iconNormal);
  })

  watch(() => toValue(disabled), (disabled) => {
    if (disabled && focusedCoord.value === toValue(coord).toString()) {
      focusedCoord.value = undefined
    }
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
