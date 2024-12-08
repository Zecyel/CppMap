<script setup lang="ts">
defineProps<{
  num: number
}>()

defineSlots<{
  default(props: { index: number }): any
}>()

const selected = defineModel<number[]>({
  required: true,
})

function toggle(item: number) {
  if (selected.value.includes(item)) {
    selected.value = selected.value.filter(i => i !== item)
  } else {
    selected.value = [...selected.value, item]
  }
}
</script>

<template>
  <div of-y-auto flex flex-col>
    <div v-for="no, i in num" :key="i" flex>
      <div select-none cursor-pointer hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center w-8 min-h-8 text-xl text-gray-800 @click="toggle(no - 1)">
        <div v-if="selected.includes(no - 1)" i-carbon-checkbox-checked />
        <div v-else i-carbon-checkbox />
      </div>
      <slot :index="no - 1" />
    </div>
  </div>
</template>
