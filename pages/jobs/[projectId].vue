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
    if (account.value?.type === 'FREELANCER') {
        await fetchJob(`v1/projects/${route.params.projectId}`,
            {
                method: 'GET',
                headers: account?.value?.id ? {
                    'X-ACCOUNT-ID': account.value.id.toString(),
                } : undefined,
            }
        );
    } else {
        await fetchJob(`v1/client/projects/${route.params.projectId}`,
            {
                method: 'GET',
                headers: account?.value?.id ? {
                    'X-ACCOUNT-ID': account.value.id.toString(),
                } : undefined,
            }
        );
    }

    console.log(job);
});

const goBack = () => {
    router.back();
};

</script>

<template>
    <div class="my-10 max-w-6xl mx-5 lg:mx-auto">
        <button @click="goBack"
            class="mb-2 inline-flex items-center gap-x-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-primary ring-1 ring-inset ring-green-600/20">
            <Icon icon="mdi:arrow-left" class="text-lg" />
            Return
        </button>
        <div class="ring-1 ring-gray-300 rounded-md px-4 md:px-8 my-3" v-if="!isLoading && job">
            <header class="py-4 md:py-6">
                <h2 class="text-xl md:text-2xl mb-2 md:mb-3">Job details</h2>
            </header>
            <section class="pb-6 md:pb-8">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-5">

                    <!-- Left Side -->
                    <div class="md:col-span-8 lg:col-span-9">
                        <h2 class="text-lg md:text-xl mb-4 md:mb-6">{{ job.data.title ?? 'No title' }}</h2>
                        <div>
                            <span class=" text-sm">{{ job.data.description ?? 'No description' }}</span>
                        </div>

                    </div>

                    <!-- Right Side -->
                    <div class="border-l-0 md:border-l-2 block md:col-span-4 lg:col-span-3 pl-0 md:pl-4"
                        v-if="job.data.experience_level || job.data.length || job.data.estimated_budget">
                        <ul>
                            <li class="flex justify-start items-center gap-2 md:gap-3" v-if="job.data.experience_level">
                                <Icon icon="mdi-light:diamond-stone" style="color: black" />
                                <div class="flex flex-col">
                                    <strong>{{ _.capitalize(job.data.experience_level) ?? 'Any' }}</strong>
                                    <small>Experience Level</small>
                                </div>
                            </li>

                            <li class="flex justify-start items-center gap-2 md:gap-3" v-if="job.data.estimated_budget">
                                <Icon icon="fluent-mdl2:money" style="color: black" />
                                <div class="flex flex-col">
                                    <strong>{{ job.data.estimated_budget }}</strong>
                                    <small>Estimated Budget</small>
                                </div>
                            </li>

                            <li class="flex justify-start items-center gap-2 md:gap-3" v-if="job.data.length">
                                <Icon icon="mingcute:time-duration-line" style="color: black" />
                                <div class="flex flex-col">
                                    <strong>{{ _.startCase(job.data.length.toLowerCase()) }}</strong>
                                    <small>Duration</small>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="border-t-2 mt-5" v-if="job.data.skills || job.data.languages || job.data.images">
                    <div v-if="job.data.skills" class="w-full mt-5">
                        <h2 class="text-base mb-1">Skills</h2>
                        <!-- Flex container for row layout -->
                        <div class="flex flex-wrap gap-2">
                            <div v-for="(skill, idx) in job.data.skills" :key="`selected-skill-${skill.id}`">
                                <span
                                    class="bg-primary/15 text-primary  text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                                    {{ skill.name }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-5">
                    <div v-if="job.data.languages" class="w-full mt-5">
                        <h2 class="text-base mb-1">Languages</h2>
                        <!-- Flex container for row layout -->
                        <div class="flex flex-wrap gap-2">
                            <div v-for="(language, idx) in job.data.languages"
                                :key="`selected-language-${language.id}`">
                                <span
                                    class="bg-primary/15 text-primary  text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                                    {{ language.name }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-5">
                    <div v-if="job.data.images" class="w-full mt-5">
                        <h2 class="text-base mb-1">Attachments</h2>
                        <div class="flex flex-wrap gap-2">
                            <div v-for="(image, idx) in job.data.images" :key="`selected-image-${image.id}`">
                                <a :href="image.original_url" :download="image.name" target="_blank"
                                    class="bg-primary/15 text-primary  text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                                    {{ image.name }}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </section>
        </div>
        <div v-else>
            <div class="ring-1 ring-gray-300 rounded-md px-4 md:px-8 py-16 flex gap-2 flex-col">
                <div class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div class="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div class="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </div>
        </div>
    </div>
</template>