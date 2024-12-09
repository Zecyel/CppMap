<script setup lang="ts">
import { usePin } from '../composables/usePin'
import { map } from '../map'

export interface Location {
  name: string
  description: string
  coord: [number, number]
  distance?: string
  time?: string
}

const props = defineProps<{
  location: Location
}>()

const { focus } = usePin(() => props.location.coord)
</script>

<template>
  <div @click="focus">
    <div flex gap-2>
      <div text-lg> {{ location.name }} </div>
      <div flex-grow />
      <div v-if="location.distance" w-16 flex items-center gap-.5 op-80 font-mono>
        <div i-carbon-car />
        {{ location.distance }}
      </div>
      <div v-if="location.time" w-16 flex items-center gap-.5 op-80 font-mono>
        <div i-carbon-time />
        {{ location.time }}
      </div>
    </div>
    <div op-80 leading-tight> {{ location.description }} </div>
  </div>
</template>
