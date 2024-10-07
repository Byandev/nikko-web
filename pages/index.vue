<script setup lang="ts">
import { ref } from 'vue';

const welcomeMessage = ref('Welcome to Conkard!');

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/dashboard',
  },
});
</script>

<template>
  <div class="h-full flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">{{ welcomeMessage }}</h1>
      <p class="text-lg mb-5">This is your starting point. Customize it as you like!</p>
      <NuxtLink to="/register" class="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
        Get Started
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
@tailwind utilities;
</style>