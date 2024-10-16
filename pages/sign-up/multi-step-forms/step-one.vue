<script setup lang="ts">
import { Icon } from '@iconify/vue';

defineProps<{
  formData: {
    profileTitle: string;
    profileBio: string;
  };
}>();

const emit = defineEmits(['updateProfileTitle', 'updateProfileBio']);

const updateProfileTitle = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('updateProfileTitle', target.value);
};

const updateProfileBio = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('updateProfileBio', target.value);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold mb-4">Write a Title for your Profile</h1>
    <span class="text-gray-600 mb-4">Your impression matters. Describe your expertise uniquely to stand out.</span>
    
    <!-- Profile Title -->
    <div class="mt-4 w-full max-w-lg">
      <label for="profileTitle" class="block text-sm font-medium leading-6 text-gray-900">
        Profile Title <span class="text-red-500">*</span>
      </label>
      <div class="mt-2">
        <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
          <Icon icon="mdi:account" :ssr="true" />
          <input type="text" id="profileTitle" v-model="formData.profileTitle" @input="updateProfileTitle" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
        </div>
      </div>
    </div>

    <!-- Profile Bio -->
    <div class="mt-4 w-full max-w-lg">
      <label for="profileBio" class="block text-sm font-medium leading-6 text-gray-900">
        Profile Bio <span class="text-red-500">*</span>
      </label>
      <div class="mt-2">
        <div class="flex flex-row items-start px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
          <Icon icon="mdi:account-details" :ssr="true" />
          <textarea id="profileBio" v-model="formData.profileBio" @input="updateProfileBio" rows="4" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>