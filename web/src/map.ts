import L from "leaflet";
import { ref, watch } from "vue";
import errorTileUrl from "./assets/fallback_tile.png?url";

const officialTile = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const myTile = window.location.origin + import.meta.env.BASE_URL + '{z}/{x}/{y}.png';

export const map = ref<L.Map>();
const onMapMountedCbs: ((map: L.Map) => void)[] = [];

export function mountMap(el: HTMLElement) {
  const _map = map.value = L.map(el).setView([31.3, 121.5], 13);
  L.tileLayer(myTile, {
    minZoom: 5,
    maxZoom: 18,
    errorTileUrl,
  }).addTo(_map);
  _map.addControl(L.control.scale());

  onMapMountedCbs.forEach(cb => cb(_map));
}

export function onMapMounted(cb: (map: L.Map) => void) {
  if (map.value) {
    cb(map.value);
  } else {
    onMapMountedCbs.push(cb);
  }
}
