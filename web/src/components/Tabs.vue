<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  name: string,
  num: number,
}>()

defineSlots<{
  default(props: { index: number }): any
}>()

const active = ref(1)
</script>

<template>
  <div flex flex-col gap-2>
    <div of-x-auto flex style="scrollbar-width: none;">
      <div v-for="i in num" :key="i" @click="active = i" px-2 py-1 cursor-pointer select-none
        hover:bg-gray-200 active:bg-gray-300 
        :class="i === active ? 'bg-gray-200' : ''"
      >
        {{ name }} {{ i }}
      </div>
    </div>
    <div>
      <slot :index="active - 1" />
    </div>
  </div>
</template>