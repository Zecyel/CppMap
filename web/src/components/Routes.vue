<script setup lang="ts">
import LocationShow, { type Location } from './LocationShow.vue';

defineProps<{
  locations: Location[]
}>()
</script>

<template>
  <div relative of-y-auto gap-2>
    <div absolute left-0 top-0 bottom-8 w-22px border="r-4 black" />
    <div flex flex-col select-none cursor-pointer>
      <div v-for="location, i in locations" :key="i" flex p-2 gap-2 hover:bg-gray-200 active:bg-gray-300>
        <div bg-black rounded-full min-w-6 h-6 flex items-center justify-center>
          <div i-carbon-location-filled text-white  />
        </div>
        <LocationShow :location mt--.5 flex-grow />
      </div>
    </div>
  </div>
</template>
