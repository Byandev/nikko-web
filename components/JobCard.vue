<script setup lang="ts">
import { type Project } from '~/types/models/Project';
import { Icon } from '@iconify/vue';
import _ from 'lodash';

const props = defineProps<{
    job: Project;
}>();

const emit = defineEmits<{
    (e: 'view', id: number): void;
}>();
</script>

<template>
    <div class="job-card bg-white hover:bg-gray-100 p-5 ring-1 ring-gray-300 rounded-md hover:cursor-pointer">
        <div class="flex items-center justify-between mb-4">
            <h2 @click="emit('view', job.id)" class="text-xl font-bold text-gray-800 hover:underline">{{ props.job.title }}</h2>
        </div>
        <p class="text-gray-600 mb-4">{{ props.job.description }}</p>
        <div class="mt-5 flex  items-center justify-start lg:justify-between gap-3">
            <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">Experience Level:</span>
                <span class="text-sm font-medium text-gray-700">{{ _.capitalize(props.job.experience_level) }}</span>
            </div>
            <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">Project Length:</span>
                <span class="text-sm font-medium text-gray-700">{{ _.startCase(props.job.length?.toLowerCase() || '') }}</span>
            </div>
        </div>
        <div class="mt-4 flex items-center space-x-2" v-if="props.job.languages">
            <span class="text-sm text-gray-500">Languages:</span>
            <div class="flex flex-wrap gap-2">
                <span v-for="(language, index) in props.job.languages" :key="index" class="bg-primary/15 text-primary  text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                    {{ language.name }}
                </span>
            </div>
        </div>
        <div class="mt-4 flex items-center space-x-2" v-if="props.job.skills">
            <span class="text-sm text-gray-500">Skills:</span>
            <div class="flex flex-wrap gap-2">
                <span v-for="(skill, index) in props.job.skills" :key="index" class="bg-primary/15 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                    {{ skill.name }}
                </span>
            </div>
        </div>
        <div class="mt-4 flex items-center justify-between">
            <span class="text-lg font-semibold text-gray-800">${{ props.job.estimated_budget }}</span>
            <div class="flex flex-col gap-2 sm:gap-3">
              <slot></slot>
            </div>
        </div>
    </div>
    
</template>