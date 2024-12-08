<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import { onMounted, ref } from 'vue';
import Routes from './components/Routes.vue';
import Tabs from './components/Tabs.vue';
import MultiSelect from './components/MultiSelect.vue';
import LocationShow, { Location } from './components/LocationShow.vue';
import { mountMap } from './map';

const mapEl = ref<HTMLElement | null>(null);

onMounted(() => {
  mountMap(mapEl.value!)
})

const days = [[
  {
    name: 'Shanghai',
    description: 'Some description, may be quite long......',
    coord: [31.3, 121.5],
    distance: '10km',
    time: '10:00',
  },
], [
  {
    name: 'Shanghai',
    description: 'Some description, may be quite long......',
    coord: [31.3, 121.5],
    distance: '10km',
    time: '10:00',
  },
  {
    name: 'Shanghai',
    description: 'Some description, may be quite long......',
    coord: [31.3, 121.5],
    distance: '10km',
    time: '10:00',
  },
], [
  {
    name: 'Shanghai',
    description: 'Some description, may be quite long......',
    coord: [31.3, 121.5],
    distance: '10km',
    time: '10:00',
  },
  {
    name: 'Shanghai',
    description: 'Some description, may be quite long......',
    coord: [31.3, 121.5],
    distance: '10km',
    time: '10:00',
  },
  {
    name: 'Shanghai',
    description: 'Some description, may be quite long......',
    coord: [31.3, 121.5],
    distance: '10km',
    time: '10:00',
  },
]] satisfies Location[][]

const chosen = ref<number[]>([])
</script>

<template>
  <div fixed inset-0 flex>
    <div w-120 p-4 flex flex-col gap-4>
      <div px-1 flex relative>
        <h1 text-3xl> Map </h1>
        <div absolute bottom-0 right-2 text-sm gray-200 op-80 font-serif>
          by Zecyel
        </div>
      </div>

      <div>
        <label flex gap-2 items-center pl-2>
          <div i-carbon-search text-lg />
          <input type="text" placeholder="Search..." flex-grow py-2 bg-transparent />
        </label>

        <MultiSelect :num="days[2].length" v-model="chosen" v-slot="{ index }">
          <LocationShow :location="days[2][index]" hover:bg-gray-200 active:bg-gray-300 px-2 py-1 flex-grow />
        </MultiSelect>
      </div>

      <Tabs name="Day" :num="days.length" v-slot="{ index }">
        <Routes :locations="days[index]"/>
      </Tabs>
    </div>
    <div ref="mapEl" id="map" flex-grow />
  </div>
</template>

<style scoped></style>
