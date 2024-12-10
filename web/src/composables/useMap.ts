import { createSharedComposable } from "@vueuse/core";
import L from "leaflet";
import errorTileUrl from "../assets/fallback_tile.png?url";
import { onScopeDispose, ref } from "vue";
import 'leaflet/dist/leaflet.css';

const officialTile = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const myTile = window.location.origin + import.meta.env.BASE_URL + 'tile/{z}/{x}/{y}.png';

export const useMap = createSharedComposable(() => {
  const container = document.getElementById('map')!;

  const map = L.map(container).setView([26.5, 106.6], 12);
  L.tileLayer(myTile, {
    minZoom: 5,
    maxZoom: 18,
    errorTileUrl,
  }).addTo(map);
  map.addControl(L.control.scale());

  onScopeDispose(() => {
    map.remove();
  })

  const focusedCoord = ref<string>();

  function focus(coord: L.LatLngExpression) {
    map.flyTo(coord, 18);
    focusedCoord.value = coord.toString();
  }

  return {
    map,
    focusedCoord,
    focus,
  }
})

