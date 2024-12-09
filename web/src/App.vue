<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import { computed, onMounted, ref } from 'vue';
import Routes from './components/Routes.vue';
import Tabs from './components/Tabs.vue';
import MultiSelect from './components/MultiSelect.vue';
import LocationShow, { Location } from './components/LocationShow.vue';
import { mountMap } from './map';
import { usePath } from './composables/usePath';
import { computeOptions, Options } from './logic/computeOptions';
import { computeDays } from './logic/computeDays';

const mapEl = ref<HTMLElement | null>(null);

onMounted(() => {
  mountMap(mapEl.value!)
})

const city = ref('')
const options = ref<Options>()
const chosenIndexes = ref<number[]>([])
const chosen = computed(() => chosenIndexes.value.map(i => options.value![i]))
const days = computed(() => computeDays(chosen.value))

const activeDay = ref(0)
usePath(() => days.value?.[activeDay.value]?.map(({ coord }) => coord))

async function run() {
  options.value = await computeOptions(city.value)
}
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
        <h2 text-xl flex gap-2 items-center op-90 tracking-wide>
          <div i-carbon-settings-adjust />
          基础设置
        </h2>
        <div flex>
          <label flex-grow flex gap-3 items-center pl-2>
            <div i-carbon-building text-lg />
            <input v-model="city" type="text" placeholder="Search city..." flex-grow py-2 bg-transparent />
          </label>
          <button @click="run">
            Run!
          </button>
        </div>
      </div>

      <template v-if="!options">

      </template>
      <template v-else>
        <div>
          <h2 text-xl flex gap-2 items-center op-90 tracking-wide>
            <div i-carbon-list-checked />
            景点选择
          </h2>

          <MultiSelect :num="options.length" v-model="chosenIndexes" v-slot="{ index }">
            <LocationShow :location="options[index]" hover:bg-gray-200 active:bg-gray-300 px-2 py-1 flex-grow show-pin />
          </MultiSelect>
        </div>

        <div>
          <h2 text-xl flex gap-2 items-center op-90 tracking-wide>
            <div i-carbon-calendar />
            行程安排
          </h2>
          <Tabs v-if="chosen.length" name="Day" v-model="activeDay" :num="days.length">
            <Routes v-for="day, i in days" :key="i" v-show="i === activeDay" :locations="day" />
          </Tabs>
          <div v-else>
            <div text-center text-gray-500>
              No locations selected
            </div>
          </div>
        </div>
      </template>

    </div>
    <div ref="mapEl" id="map" flex-grow />
  </div>
</template>

<style scoped></style>
