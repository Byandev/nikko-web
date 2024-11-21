<script setup lang="ts">
const {status} = useAuth()
console.log(status.value)
</script>

<template>
  <div class="h-screen flex flex-col">
    <Header :class="'sticky top-0 z-50'" />
    <div class="flex-1 overflow-auto" v-if="status !== 'loading'">
      <slot />
    </div>
  </div>
</template>
