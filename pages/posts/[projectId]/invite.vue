<script setup lang="ts">
import _ from 'lodash';

const route = useRoute();

const tabs = [
    { name: 'View Job', href: `/posts/${route.params.projectId}/details`, current: false },
    { name: 'All Proposals', href: `/posts/${route.params.projectId}/proposals`, current: false },
    { name: 'Invite Freelancers', href: `/posts/${route.params.projectId}/invite`, current: true },
    { name: 'Hired', href: `/posts/${route.params.projectId}/hires`, current: false },
];

const miniTab = ref([
    { name: 'Top Freelancers', current: true },
    { name: 'Invited Freelancers', current: false },
    { name: 'Shortlisted Freelancer', current: false }
]);

const setActiveTab = (tabName: string) => {
    miniTab.value.forEach(tab => {
        tab.current = (tab.name === tabName);
    });
};

</script>

<template>
    <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <Tab :tabs="tabs">
            <div class="bg-white shadow sm:rounded-lg">
                <div class="p-6">
                    <div>
                        <nav class="flex space-x-4" aria-label="Tabs">
                            <template v-for="tab in miniTab" :key="tab.name">
                                <a href="#" @click.prevent="setActiveTab(tab.name)"
                                    :class="tab.current ? 'bg-primary/30 text-primary' : 'text-gray-500 hover:text-gray-700'"
                                    class="px-3 py-2 font-medium text-sm rounded-md">
                                    {{ tab.name }}
                                </a>
                            </template>
                        </nav>
                    </div>
                    
                </div>
            </div>
        </Tab>
    </div>
</template>