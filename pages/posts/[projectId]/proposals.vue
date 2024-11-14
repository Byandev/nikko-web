<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Project } from '~/types/models/Project';
import _ from 'lodash';

const route = useRoute();
const dropdownOpen = ref(false);

const tabs = [
    { name: 'View Job', href: `/posts/${route.params.projectId}/details`, current: false },
    { name: 'All Proposals', href: `/posts/${route.params.projectId}/proposals`, current: true },
    { name: 'Invite Freelancers', href: `/posts/${route.params.projectId}/invite`, current: false },
    { name: 'Hired', href: `/posts/${route.params.projectId}/hires`, current: false },
];

</script>

<template>
    <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <Tab :tabs="tabs">
            <div class="bg-white shadow sm:rounded-lg">
                
            </div>
        </Tab>
    </div>
</template>