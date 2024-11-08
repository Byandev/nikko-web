<script setup lang="ts">
import { type Project } from '~/types/models/Project';
import { Icon } from '@iconify/vue';
import _ from 'lodash';

const props = defineProps<{
    job: Partial<Project>;
}>();

const emit = defineEmits<{
    (e: 'save', id: number): void;
    (e: 'unsave', id: number): void;
}>();

const router = useRouter();

const viewJobDetails = async () => {
    await router.push(`/jobs/${props.job.id}`);
};

</script>

<template>
    <div class="job-card bg-white border-b-2 border-t-2 border-black p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-800">{{ props.job.title }}</h2>
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
        <div class="mt-4 flex items-center space-x-2">
            <span class="text-sm text-gray-500">Languages:</span>
            <div class="flex flex-wrap gap-2">
                <span v-for="(language, index) in props.job.languages" :key="index" class="bg-primary/15 text-primary  text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                    {{ language.name }}
                </span>
            </div>
        </div>
        <div class="mt-4 flex items-center space-x-2">
            <span class="text-sm text-gray-500">Skills:</span>
            <div class="flex flex-wrap gap-2">
                <span v-for="(skill, index) in props.job.skills" :key="index" class="bg-primary/15 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                    {{ skill.name }}
                </span>
            </div>
        </div>
        <div class="mt-4 flex items-center justify-between">
            <span class="text-lg font-semibold text-gray-800">${{ props.job.estimated_budget }}</span>
            <div class="flex flex-col gap-4">
                <Button @click="viewJobDetails" text="View Details" type="button" background="primary" foreground="white" />
                <div v-if="!props.job.is_saved" @click="emit('save',Number(job.id))" class="flex flex-row justify-center items-center border rounded-lg px-2 py-1 gap-2 hover:cursor-pointer">
                    <Icon icon="mdi:heart" class="text-primary"  />
                    <button class="text-primary">Save</button>
                </div>
                <div v-else @click="emit('unsave',Number(job.id))" class="flex flex-row justify-center items-center border rounded-lg px-2 py-1 gap-2 hover:cursor-pointer">
                    <Icon icon="mdi:heart-outline" class="text-primary" />
                    <button class="text-primary">Unsave</button>
                </div>
            </div>
        </div>
    </div>
    
</template>