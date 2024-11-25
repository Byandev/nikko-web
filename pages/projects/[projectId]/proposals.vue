<script setup lang="ts">
import _ from 'lodash';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { PaginatedList, PaginationMeta } from '~/types/models/Pagination';
import { accountStore } from '~/store/accountStore';
import { Icon } from '@iconify/vue';
import type { Proposal } from '~/types/models/Proposal';
import type { Account } from '~/types/models/Account';

const { account } = storeToRefs(accountStore());

interface Filter {
    include: string;
    project_id: number;
    is_saved: boolean;
    page: number;
}

interface ProposalPaginationMeta extends PaginationMeta {
    total_count: number;
    total_saved_count: number;
}

interface ProposalList extends PaginatedList<Proposal> {
    meta: ProposalPaginationMeta
}

const route = useRoute();
const router = useRouter();

const filter = ref<Filter>({
    include: 'project.account.user,attachments,contract,account.user.avatar,account.skills',
    project_id: parseInt(route.params.projectId as string),
    is_saved: false,
    page: 1
});

const { data: proposals, fetchData: fetchAllProposals, pending: isLoading } = useFetchData<ProposalList, ApiErrorResponse>();

const queryString = computed(() => {
    let params: Record<string, string> = {
        include: filter.value.include,
        ...(filter.value.project_id ? { 'filter[project_id]': filter.value.project_id.toString() } : {}),
        ...(filter.value.is_saved ? { 'filter[is_saved]': 'true' } : {}),
        page: filter.value.page.toString()
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
    [() => queryString.value],
    debounce(async () => {
        await fetchProposals();
    }, 500)
);

const viewFreelancer = async (id: number) => {
    await router.push(`/freelancer/${id}`);
};

const hireFreelancer = async (id: number) => {
    await router.push(`/send-offer/${id}`);
};

const viewContract = async (id: number) => {
    await router.push(`/contract/${id}`);
};


const totalCount = computed(() => proposals.value?.meta?.total_count ?? 0);
const totalSavedCount = computed(() => proposals.value?.meta?.total_saved_count ?? 0);

</script>

<template>
    <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <PostTabs />
        <div class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
                <div class="space-y-5">
                    <div>
                        <nav class="flex space-x-4" aria-label="Tabs">
                            <nav class="flex space-x-4" aria-label="Tabs">
                                <a href="#" @click.prevent="filter.is_saved = false"
                                    :class="!filter.is_saved ? 'bg-primary/30 text-primary' : 'text-gray-500 hover:text-gray-700'"
                                    class="px-3 py-2 font-medium text-sm rounded-md">
                                    All Proposal {{ totalCount > 0 ? `(${totalCount})` : '' }}
                                </a>

                                <a href="#" @click.prevent="filter.is_saved = true"
                                    :class="filter.is_saved ? 'bg-primary/30 text-primary' : 'text-gray-500 hover:text-gray-700'"
                                    class="px-3 py-2 font-medium text-sm rounded-md">
                                    Saved Proposal {{ totalSavedCount > 0 ? `(${totalSavedCount})` : '' }}
                                </a>
                            </nav>
                        </nav>
                    </div>
                    <div class="space-y-5">
                        <ProposalCard v-if="proposals?.data && !isLoading" v-for="proposal in proposals.data"
                            @click="viewFreelancer"
                            :key="proposal.id" :proposal="proposal" :show-save-button="true"
                            @save="(proposals as ProposalList).meta.total_saved_count++"
                            @un-save="(proposals as ProposalList).meta.total_saved_count--"
                            @hire="hireFreelancer"
                            @view="viewContract"/>
                        <div v-else class="animate-pulse space-y-4">
                            <div class=" h-40 bg-gray-200 rounded w-full"></div>
                        </div>
                        <Pagination v-if="!isLoading && proposals?.data && proposals?.data.length > 0"
                            :pagination="proposals.meta" @prev-page="filter.page = filter.page - 1"
                            @next-page="filter.page = filter.page + 1" />
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
