<template>
  <div class="h-screen flex flex-col">
    <Header class="sticky top-0 z-50" />
    <div class="flex-1 overflow-auto">
      <slot />
    </div>
  </div>
</template>