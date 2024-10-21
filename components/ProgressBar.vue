<script setup lang="ts">
import { computed, defineProps } from 'vue';

const props = defineProps<{
  steps: string[];
  currentStep: number;
}>();

const stepClasses = computed(() => {
  return props.steps.map((step, index) => {
    let stepClass = '';
    let lineClass = '';

    if (index < props.currentStep) {
      stepClass = 'bg-primary text-white';
      lineClass = 'bg-primary';
    } else if (index === props.currentStep) {
      stepClass = 'border-2 border-primary bg-primary text-white';
      lineClass = 'bg-primary';
    } else if (index > props.currentStep) {
      stepClass = 'border-2 border-primary bg-white text-primary hover:border-primary';
      lineClass = 'bg-primary';
    }

    return {
      stepClass,
      lineClass,
      isLast: index === props.steps.length - 1,
    };
  });
});
</script>

<template>
  <nav aria-label="Progress" class="w-full">
    <ol role="list" class="flex flex-wrap items-center justify-center">
      <li v-for="(step, index) in props.steps" :key="index" :class="{'relative': true, 'pr-4 sm:pr-8 md:pr-12 lg:pr-16 xl:pr-20': !stepClasses[index].isLast}">
        <div v-if="!stepClasses[index].isLast" class="absolute inset-0 flex items-center" aria-hidden="true">
          <div :class="`h-0.5 w-full ${stepClasses[index].lineClass}`"></div>
        </div>
        <a href="#" :class="`relative flex h-8 w-8 items-center justify-center rounded-full ${stepClasses[index].stepClass}`">
          <template v-if="index < currentStep">
            <svg class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
            </svg>
          </template>
          <template v-else>
            <span :class="index > currentStep ? 'text-primary' : 'text-white'">{{ index + 1 }}</span>
          </template>
          <span class="sr-only">{{ step }}</span>
        </a>
      </li>
    </ol>
  </nav>
</template>
