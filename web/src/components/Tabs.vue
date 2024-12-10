<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';

const props = defineProps<{
  name: string,
  num: number,
}>()

const active = defineModel<number>({ default: 0 })

defineEmits(['change'])

watch(() => props.num, () => {
  if (active.value > props.num) {
    active.value = props.num
  }
})

const scroll = useTemplateRef("scroll")
function onWheel(event: WheelEvent) {
  if (!scroll.value) return
  console.log(event.deltaY)
  scroll.value.scrollLeft += event.deltaY
}
</script>

<template>
  <div flex flex-col gap-2>
    <div ref="scroll" of-x-scroll flex style="scrollbar-width: none;" @wheel="onWheel">
      <div v-for="i in num" :key="i" @click="active = i - 1; $emit('change', i - 1)"
        px-2 py-1 cursor-pointer select-none hover:bg-gray-200 active:bg-gray-300 min-w-max
        :class="i - 1 === active ? 'bg-gray-200' : ''"
      >
        {{ name }} {{ i }}
      </div>
    </div>
    <div flex-grow h-0 of-y-auto>
      <slot />
    </div>
  </div>
</template>
