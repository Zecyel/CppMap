import { createSharedComposable } from "@vueuse/core";
import L from "leaflet";
import errorTileUrl from "../assets/fallback_tile.png?url";
import { onScopeDispose } from "vue";
import 'leaflet/dist/leaflet.css';

const officialTile = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const myTile = window.location.origin + import.meta.env.BASE_URL + '{z}/{x}/{y}.png';

export const useMap = createSharedComposable(() => {
  const container = document.getElementById('map')!;

  const map = L.map(container).setView([25.3, 105.5], 13);
  L.tileLayer(myTile, {
    minZoom: 5,
    maxZoom: 18,
    errorTileUrl,
  }).addTo(map);
  map.addControl(L.control.scale());

  onScopeDispose(() => {
    map.remove();
  })

  return {
    map,
  }
})
