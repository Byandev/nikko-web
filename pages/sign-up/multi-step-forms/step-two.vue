<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps<{
  formData: {
    languages: {
      language: string;
      level: string;
    }[];
  };
}>();

const emit = defineEmits(['updateLanguage', 'updateLevel', 'addLanguage']);

const addLanguage = () => {
  emit('addLanguage');
};

const updateLanguage = (index: number, value: Event) => {
  const data = value.target as HTMLInputElement;
    emit('updateLanguage', { index, data });
};

const updateLevel = (index: number, value: Event) => {
  const data = value.target as HTMLInputElement;
  emit('updateLevel', { index, data });
};
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold mb-4">Add Languages</h1>
    <span class="text-gray-600 mb-4">Since our company operates globally, clients value your language proficiency.
      English is essential, but do you speak any other languages?</span>

    <div class="mt-5 w-full max-w-2xl">
      <div v-for="(lang, index) in formData.languages" :key="index" class="grid grid-cols-2 gap-5 mb-5">
        <!-- Language -->
        <div class="col-span-1">
          <label :for="'language-' + index" class="block text-sm font-medium leading-6 text-gray-900">
            Language <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div
              class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
              <Icon icon="mdi:translate" :ssr="true" />
              <input type="text" :id="'language-' + index" :value="lang.language"
                @input="updateLanguage(index, $event)"
                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
            </div>
          </div>
        </div>

        <!-- Level -->
        <div class="col-span-1">
          <label :for="'level-' + index" class="block text-sm font-medium leading-6 text-gray-900">
            Level <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div
              class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
              <Icon icon="mdi:star" :ssr="true" />
              <input type="text" :id="'level-' + index" :value="lang.level"
                @input="updateLevel(index, $event)"
                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-center">
        <Button type="button" text="Add" background="primary" foreground="white" @click="addLanguage" />
      </div>
    </div>
  </div>
</template>