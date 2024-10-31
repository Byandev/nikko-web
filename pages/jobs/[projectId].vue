<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Project } from '~/types/models/Project';
import { accountStore } from '~/store/accountStore';
import _ from 'lodash';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';

const { data: job, fetchData: fetchJob, pending: isLoading } = useFetchData<{ data: Project }, ApiErrorResponse>();
const { account } = storeToRefs(accountStore());
const router = useRouter();

const route = useRoute();

onMounted(async () => {
    await fetchJob(`v1/client/projects/${route.params.projectId}`,
        {
            method: 'GET',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
        }
    );
    console.log(job);
});

const goBack = () => {
    router.back();
};

</script>

<template>
    <div class="my-10 max-w-xl mx-5 lg:mx-auto border border-gray-300 rounded-lg py-10 px-4 sm:px-16 bg-white shadow-lg">
        <button @click="goBack" class="mb-6 inline-flex items-center gap-x-1 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-primary ring-1 ring-inset ring-green-600/20 hover:bg-green-100">
            <Icon icon="mdi:arrow-left" class="text-lg" />
            Return
        </button>
        <div v-if="!isLoading && job">
            <h1 class="text-3xl font-bold mb-6 text-gray-800">{{ job.data.title }}</h1>
            <p class="mb-4 text-gray-600"><strong>Posted On:</strong> {{ new Date(job.data.created_at).toLocaleDateString() }}</p>
            <p class="mb-4 text-gray-600"><strong>Description:</strong> {{ job.data.description }}</p>
            <p class="mb-4 text-gray-600"><strong>Estimated Budget:</strong> {{ job.data.estimated_budget }}</p>
            <p class="mb-4 text-gray-600"><strong>Experience Level:</strong> {{ _.capitalize(job.data.experience_level) }}</p>
            <p class="mb-4 text-gray-600"><strong>Project Length:</strong> {{ _.startCase(_.lowerCase(job.data.length)) }}</p>
            <p class="mb-4 text-gray-600"><strong>Languages:</strong></p>
            <div class="flex flex-wrap mb-4">
                <div v-for="(language, idx) in job.data.languages" :key="`selected-language-${language.id}`" class="mr-2 my-1">
                    <span class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 whitespace-nowrap">
                        {{ language.name }}
                    </span>
                </div>
            </div>
            <p class="mb-4 text-gray-600"><strong>Skills:</strong></p>
            <div class="flex flex-wrap mb-4">
                <div v-for="(skill, idx) in job.data.skills" :key="`selected-skill-${skill.id}`" class="mr-2 my-1">
                    <span class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 whitespace-nowrap">
                        {{ skill.name }}
                    </span>
                </div>
            </div>
            <p class="mb-4 text-gray-600"><strong>File Attachments:</strong></p>
            <div class="flex flex-wrap mb-4">
                <div v-for="(attachment, idx) in job.data.images" :key="`selected-attachment-${attachment.id}`" class="mr-2 my-1">
                    <a :href="attachment.original_url" target="_blank" class="inline-flex items-center gap-x-1 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 whitespace-nowrap">
                        <Icon icon="gg:attachment" class="text-lg" />
                        {{ attachment.name }}
                        <Icon icon="material-symbols:download" class="text-lg"/>
                    </a>
                </div>
            </div>
            
        </div>
        <div v-else>
            <p class="text-gray-600">Loading...</p>
        </div>
    </div>
</template>

<style scoped>
@media (max-width: 640px) {
    .my-10 {
        margin-top: 2.5rem;
        margin-bottom: 2.5rem;
    }
    .max-w-5xl {
        max-width: 100%;
    }
    .px-4 {
        padding-left: 1rem;
        padding-right: 1rem;
    }
    .sm\:px-16 {
        padding-left: 1rem;
        padding-right: 1rem;
    }
    .text-3xl {
        font-size: 1.875rem;
        line-height: 2.25rem;
    }
    .mb-6 {
        margin-bottom: 1.5rem;
    }
    .mb-4 {
        margin-bottom: 1rem;
    }
}
</style>