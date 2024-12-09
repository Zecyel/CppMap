<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import Routes from './components/Routes.vue';
import Tabs from './components/Tabs.vue';
import MultiSelect from './components/MultiSelect.vue';
import LocationShow, { Location } from './components/LocationShow.vue';
import { usePath } from './composables/usePath';
import { computeOptions, Options } from './logic/computeOptions';
import { computeDays } from './logic/computeDays';
import { useMap } from './composables/useMap';

onMounted(() => {
  const { map } = useMap();
  map.invalidateSize()
})

const city = ref('')
const dayNum = ref(3)
const isRelax = ref(true)
const computing = ref(false)
const canceled = ref(false)
const options = ref<Options>()
const chosenIndexes = ref<number[]>([])
const chosen = computed(() => chosenIndexes.value.map(i => options.value![i]))
const days = computed(() => computeDays(chosen.value, dayNum.value))

const activeDay = ref(0)
usePath(() => days.value?.[activeDay.value]?.map(({ coord }) => coord))

async function run() {
  computing.value = true
  canceled.value = false
  const result = await computeOptions(city.value, dayNum.value, isRelax.value)
  computing.value = false
  if (!canceled.value) {
    options.value = result
  }
  canceled.value = false
}

function reset() {
  options.value = undefined
  computing.value = false
  canceled.value = true
}

watch([city, dayNum, isRelax], reset)
</script>

<template>
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
      <div flex mb-1>
        <label flex-grow flex gap-3 items-center pl-2>
          <div i-carbon-building text-lg />
          <input v-model="city" type="text" placeholder="Search city..." flex-grow py-2 bg-transparent w-10 />
        </label>
        <label flex-grow flex gap-3 items-center pl-2>
          <div i-carbon-window-overlay text-lg op-80 />
          <input v-model="dayNum" type="number" placeholder="Days" flex-grow py-2 bg-transparent w-0 />
        </label>
        <label flex-grow flex gap-2 items-center>
          <div flex-grow grid grid-cols-2 w-10 h-full>
            <div class="kind-button" :data-active="isRelax" @click="isRelax = true">
              <div i-carbon-umbrella />
              Relax
            </div>
            <div class="kind-button" :data-active="!isRelax" @click="isRelax = false">
              <div i-carbon-running />
              Fulfill
            </div>
          </div>
        </label>
      </div>
      <button v-if="!computing && !options" @click="run" w-full text-center py-2 text-lg bg-gray-100>
        Run!
      </button>
      <template v-if="computing">
        <div relative w-full text-center py-1 text-lg bg-gray-100 flex gap-2 items-center justify-center>
          <div i-svg-spinners-90-ring-with-bg op-60 />
          <div op-60> Computing... </div>
          <div absolute inset-0 flex items-center justify-end class="group">
            <button op-40 group-hover:op-80 hover:op-100 h-full @click="reset">
              <div i-carbon-close-large />
            </button>
          </div>
        </div>
      </template>
    </div>
    <template v-if="options">
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
</template>

<style scoped>
.kind-button {
  @apply relative flex items-end justify-end min-w-max uppercase text-black/80;
  @apply tracking-tight select-none text-right px-1 hover:bg-gray-200 h-full;
}

.kind-button[data-active="true"] {
  @apply bg-gray-300;
}

.kind-button>div {
  @apply absolute left-1 top-1 text-2xl op-50;
}
</style>
