<script setup lang="ts">
import { type Project } from '~/types/models/Project';
import { Icon } from '@iconify/vue';
import _ from 'lodash';

const props = defineProps<{
    job: Project;
}>();

const emit = defineEmits<{
    (e: 'save', id: number): void;
    (e: 'unsave', id: number): void;
}>();

const {job} = toRefs(props)

const router = useRouter();

const save = (isSave: boolean) => {
  job.value.is_saved = isSave;
  isSave ? emit('save', job.value.id): emit('unsave', job.value.id)
}


const sendProposal = async () => {
    await router.push(`/submit-proposal/${props.job.id}`);
};

</script>

<template>
    <div class="job-card bg-white hover:bg-gray-100 p-5 ring-1 ring-gray-300 rounded-md hover:cursor-pointer">
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
                <Button @click="sendProposal" text="Apply Now" type="button" background="primary" foreground="white" />
                <div v-if="!props.job.is_saved" @click="save(true)" class="flex flex-row justify-center items-center border rounded-lg px-2 py-1 gap-2 hover:cursor-pointer">
                    <Icon icon="mdi:heart" class="text-primary"  />
                    <button class="text-primary">Save</button>
                </div>
                <div v-else @click="save(false)" class="flex flex-row justify-center items-center border rounded-lg px-2 py-1 gap-2 hover:cursor-pointer">
                    <Icon icon="mdi:heart-outline" class="text-primary" />
                    <button class="text-primary">Unsave</button>
                </div>
            </div>
        </div>
    </div>
    
</template>