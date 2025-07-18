<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, Teleport, watch } from 'vue';
import LocationShow from './components/LocationShow.vue';
import MultiSelect from './components/MultiSelect.vue';
import Routes from './components/Routes.vue';
import Tabs from './components/Tabs.vue';
import { useMap } from './composables/useMap';
import { usePath } from './composables/usePath';
import { computeDays } from './logic/computeDays';
import computeOptions, { Options } from './logic/computeOptions';
import { asyncComputed } from '@vueuse/core';
import type { Location } from './types'
import { usePin } from './composables/usePin';

onMounted(() => {
  const { map } = useMap();
  map.invalidateSize()
})

const city = ref('')
const dayNum = ref(3)
const prompt = ref<string | number>(1)
const promptDialog = ref(false)
const computing = ref(false)
const canceled = ref(false)
const options = shallowRef<Options>()
const chosenIndexes = ref<number[]>([])
const chosen = computed(() => options.value ? chosenIndexes.value.map(i => options.value!.locations[i]) : [])
const days = asyncComputed((onCancel) => {
  // Track deps
  void [options.value, chosen.value, dayNum.value]
  if (options.value && chosen.value.length) {
    const abortController = new AbortController()
    onCancel(() => abortController.abort())
    return computeDays(options.value, chosen.value, dayNum.value, abortController.signal)
  } else {
    return null
  }
}, null, { lazy: true })
const routes = computed(() => days.value?.routes ?? [])
usePin(() => days.value?.hotel.coord ?? [0,0])

const activeDay = ref(0)
const { focus: focusPath } = usePath(() => {
  const day = days.value?.routes?.[activeDay.value]
  if (!day || !options.value) return null
  const paths: [number, number][][] = []
  let last: Location | null = null
  for (const location of day) {
    if (last) {
      paths.push(options.value.getPath(last.nearestNode, location.nearestNode))
    }
    last = location
  }
  return paths.flat()
})

async function run() {
  computing.value = true
  canceled.value = false
  const result = await computeOptions(city.value, prompt.value)

  if (!canceled.value) {
    options.value = result
    const { map } = useMap();
    map.fitBounds(result.locations.map(l => l.coord))
    chosenIndexes.value = result.locations.map((_, i) => i)
  }

  computing.value = false
  canceled.value = false
}

function reset() {
  options.value = undefined
  computing.value = false
  canceled.value = true
  chosenIndexes.value = []
}

watch([city, prompt], reset)
</script>

<template>
  <div w-120 h-full pl-4 pt-4 flex flex-col gap-4>
    <div flex relative font-serif mr-4>
      <h1 text-3xl> Travel Planner </h1>
      <div absolute bottom-0 right-2 text-sm gray-200 op-80>
        by Zecyel
      </div>
    </div>

    <div mr-4>
      <h2 text-xl flex gap-2 items-center op-90 tracking-wide>
        <div i-carbon-settings-adjust />
        基础设置
      </h2>
      <div flex mb-1>
        <label flex-grow flex gap-3 items-center pl-2>
          <div i-carbon-building text-lg op-80 />
          <input v-model="city" type="text" placeholder="Search city..." flex-grow py-2 bg-transparent w-16 />
        </label>
        <label flex-grow flex gap-3 items-center pl-2>
          <div i-carbon-window-overlay text-lg op-60 />
          <input v-model="dayNum" type="number" placeholder="Days" flex-grow py-2 bg-transparent w-0 step="1" min="1"
            max="9" />
        </label>
        <div grid grid-cols-3 min-h-max>
          <div class="kind-button" :data-active="prompt === 1" @click="prompt = 1">
            <div i-carbon-umbrella />
            Relax
          </div>
          <div class="kind-button" :data-active="prompt === 2" @click="prompt = 2">
            <div i-carbon-running />
            Fulfill
          </div>
          <div class="kind-button" :data-active="typeof prompt === 'string'"
            @click="promptDialog = true; typeof prompt === 'string' || (prompt = '')">
            <div i-carbon-add-comment />
            Custom
          </div>
        </div>
      </div>
      <div v-if="!options" w-full h-12 text-center text-lg bg-gray-100 select-none>
        <div v-if="computing" relative h-full w-full text-center flex gap-2 items-center justify-center>
          <div i-svg-spinners-90-ring-with-bg op-60 />
          <div op-60> Computing... </div>
          <div absolute inset-0 flex class="group">
            <div flex-grow />
            <div flex items-center justify-end op-40 group-hover:op-60 hover:op-100 px-4 h-full hover:bg-gray-200
              @click="reset">
              <div i-carbon-close-large text-xl />
            </div>
          </div>
        </div>
        <div v-else @click="city.trim() && run()" text-lg h-full flex items-center justify-center :class="city.trim() ? '' : 'op-40'">
          Run!
        </div>
      </div>
    </div>
    <template v-if="options">
      <div flex flex-col flex-grow>
        <h2 text-xl flex gap-2 items-center op-90 tracking-wide>
          <div i-carbon-list-checked />
          景点选择
        </h2>

        <MultiSelect :num="options.locations.length" v-model="chosenIndexes" v-slot="{ index, selected }" flex-grow h-0>
          <LocationShow :location="options.locations[index]" :disabled-pin="!selected" hover:bg-gray-200 active:bg-gray-300 px-2 py-1 flex-grow
            show-pin />
        </MultiSelect>
      </div>

      <div h-32 flex flex-col flex-grow>
        <h2 text-xl flex gap-2 items-center op-90 tracking-wide mb-1>
          <div i-carbon-calendar />
          行程安排
        </h2>
        <Tabs v-if="chosen.length" name="Day" v-model="activeDay" :num="routes.length" @change="focusPath" h-full>
          <Routes v-for="route, i in routes" :key="i" v-show="i === activeDay" :locations="route" />
        </Tabs>
        <div v-else>
          <div text-center text-gray-500>
            No locations selected
          </div>
        </div>
      </div>
    </template>
    <Teleport v-if="promptDialog" to="body">
      <div fixed inset-0 z-100 backdrop-blur-.4 bg-gray-800 bg-op-40 flex items-center justify-center
        @click="promptDialog = false">
        <div relative w-200 max-w-full bg-white p-4 flex flex-col gap-4 rounded @click.stop="">
          <button absolute right-4 top-4 w-10 h-10 flex items-center justify-center rounded class="p0!"
            @click="promptDialog = false">
            <div i-carbon-checkmark text-2xl />
          </button>
          <div text-2xl pt-1> Custom Prompt </div>
          <textarea v-model="prompt" placeholder="Any additional information for AI?" w-full resize-none bg-gray-100
            focus:bg-gray-200 p-2 rounded h-80 />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.kind-button {
  @apply relative flex items-end justify-end w-18 uppercase text-black/70;
  @apply tracking--0.2 select-none text-right px-1 hover:bg-gray-200 h-full;
}

.kind-button[data-active="true"] {
  @apply bg-gray-300;
}

.kind-button>div {
  @apply absolute left-.5 top-.5 text-2xl op-35;
}
</style>
