<script setup lang="ts">
import { map } from '../map'

export interface Location {
  name: string
  description: string
  coord: [number, number]
  distance?: string
  time?: string
}

defineProps<{
  location: Location
}>()
</script>

<template>
  <div @click="map?.flyTo(location.coord)">
    <div flex gap-2>
      <div text-lg> {{ location.name }} </div>
      <div flex-grow />
      <div v-if="location.distance" flex items-center gap-.5 op-80>
        <div i-carbon-car />
        {{ location.distance }}
      </div>
      <div v-if="location.time" flex items-center gap-.5 op-80>
        <div i-carbon-time />
        {{ location.time }}
      </div>
    </div>
    <div op-80 leading-tight> {{ location.description }} </div>
  </div>
</template>
