<script setup lang="ts">
import { watch } from 'vue';

const props = defineProps<{
  name: string,
  num: number,
}>()

const active = defineModel<number>({ default: 0 })

watch(() => props.num, () => {
  if (active.value > props.num) {
    active.value = props.num
  }
})
</script>

<template>
  <div flex flex-col gap-2>
    <div of-x-auto flex style="scrollbar-width: none;">
      <div v-for="i in num" :key="i" @click="active = i - 1"
        px-2 py-1 cursor-pointer select-none hover:bg-gray-200 active:bg-gray-300 
        :class="i - 1 === active ? 'bg-gray-200' : ''"
      >
        {{ name }} {{ i }}
      </div>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>
