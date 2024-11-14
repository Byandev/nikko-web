<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Project } from '~/types/models/Project';
import _ from 'lodash';

const route = useRoute();
const dropdownOpen = ref(false);

const tabs = [
    { name: 'View Job', href: `/posts/${route.params.projectId}/details`, current: true },
    { name: 'All Proposals', href: `/posts/${route.params.projectId}/proposals`, current: false },
    { name: 'Invite Freelancers', href: `/posts/${route.params.projectId}/invite`, current: false },
    { name: 'Hired', href: `/posts/${route.params.projectId}/hires`, current: false },
];

const { data: project, fetchData: fetchProject, pending: isFetching } = useFetchData<{ data: Project }, ApiErrorResponse>();

onMounted(() => {
    fetchProject(`/v1/projects/${route.params.projectId}`);
});
</script>

<template>
    <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <Tab :tabs="tabs">
            <div class="bg-white shadow sm:rounded-lg">
                <div v-if="!isFetching" class="p-6">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                        <h2 class="text-xl font-bold text-gray-800">{{ project?.data.title }}</h2>
                    </div>
                    <p class="text-gray-600 mb-4">{{ project?.data.description }}</p>
                    <div
                        class="mt-5 flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between gap-3">
                        <div class="flex items-center space-x-2">
                            <span class="text-sm text-gray-500">Experience Level:</span>
                            <span class="text-sm font-medium text-gray-700">{{
                                _.capitalize(project?.data.experience_level)
                                }}</span>
                        </div>
                        <div class="flex items-center space-x-2 mt-2 lg:mt-0">
                            <span class="text-sm text-gray-500">Project Length:</span>
                            <span class="text-sm font-medium text-gray-700">{{
                                _.startCase(project?.data.length?.toLowerCase() ||
                                    '') }}</span>
                        </div>
                    </div>
                    <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-2"
                        v-if="project?.data.languages">
                        <span class="text-sm text-gray-500">Languages:</span>
                        <div class="flex flex-wrap gap-2 mt-2 sm:mt-0">
                            <span v-for="(language, index) in project.data.languages" :key="index"
                                class="bg-primary/15 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                                {{ language.name }}
                            </span>
                        </div>
                    </div>
                    <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-2"
                        v-if="project?.data.skills">
                        <span class="text-sm text-gray-500">Skills:</span>
                        <div class="flex flex-wrap gap-2 mt-2 sm:mt-0">
                            <span v-for="(skill, index) in project.data.skills" :key="index"
                                class="bg-primary/15 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                                {{ skill.name }}
                            </span>
                        </div>
                    </div>
                    <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <span class="text-lg font-semibold text-gray-800">${{ project?.data.estimated_budget }}</span>
                        <div class="flex flex-col gap-2 sm:gap-3 mt-2 sm:mt-0">
                            <slot></slot>
                        </div>
                    </div>
                </div>
            </div>
        </Tab>
    </div>
</template>