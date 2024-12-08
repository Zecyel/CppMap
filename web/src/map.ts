import { ref } from "vue";
import L from "leaflet";

const officialTile = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const myTile = window.location.origin + import.meta.env.BASE_URL + '{z}/{x}/{y}.png';

export const map = ref<L.Map | null>(null);

export function mountMap(el: HTMLElement) {
  const _map = map.value = L.map(el).setView([31.3, 121.5], 13);
  L.tileLayer(myTile, {
    minZoom: 5,
    maxZoom: 18,
  }).addTo(_map);
  _map.addControl(L.control.scale());
}
