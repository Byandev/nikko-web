<script setup lang="ts">
import _ from 'lodash';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { PaginatedList } from '~/types/models/Pagination';
import { accountStore } from '~/store/accountStore';
import { Icon } from '@iconify/vue';
import type { Proposal } from '~/types/models/Proposal';

const { account } = storeToRefs(accountStore());

const miniTab = ref([
    { name: 'All Proposals', current: true },
    { name: 'Messaged', current: false },
    { name: 'Saved Proposals', current: false }
]);

const setActiveTab = (tabName: string) => {
    miniTab.value.forEach(tab => {
        tab.current = (tab.name === tabName);
    });
};

interface SearchParams {
    project_id: number;
    status: string;
    is_saved: boolean;
    page: number;
}

const route = useRoute();
const page = ref(1);

const searchParams = ref<SearchParams>({
    project_id: parseInt(route.params.projectId as string),
    status: 'ACTIVE',
    is_saved: false,
    page: 1
});

const { data: proposals, fetchData: fetchAllProposals, pending: isLoading } = useFetchData<PaginatedList<Proposal>, ApiErrorResponse>();

const queryString = computed(() => {
    let params: Record<string, string> = {
        ...(searchParams.value.project_id ? { project_id: searchParams.value.project_id.toString() } : {}),
        ...(searchParams.value.status ? { status: searchParams.value.status } : {}),
        ...(searchParams.value.is_saved ? { is_saved: 'true' } : {}),
        page: searchParams.value.page.toString()
    };

    return new URLSearchParams(params).toString();
});

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);

const fetchProposals = async () => {
    await fetchAllProposals(
        `v1/client/proposals?${queryString.value}`,
        {
            headers: requestHeaders.value
        }
    );
};

onMounted(async () => {
    await fetchProposals();
});

watch(
    [() => searchParams.value.page],
    debounce(async () => {
        await fetchProposals();
    }, 500)
);

</script>

<template>
    <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <PostTabs />
        <div class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
                <div class="space-y-5">
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
                    <div v-if="miniTab[0].current" class="flex flex-col gap-5">
                        <FreelancerInvitationCard v-if="proposals?.data && !isLoading"
                            v-for="proposal in proposals.data" :key="proposal.id" :proposal="proposal" />
                        <Pagination
                            v-if="!isLoading && proposals?.data && proposals?.data.length > 0"
                            :pagination="proposals.meta"
                            @prev-page="searchParams.page = searchParams.page - 1" @next-page="searchParams.page = searchParams.page + 1" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>