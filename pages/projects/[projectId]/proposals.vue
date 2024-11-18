<script setup lang="ts">
import _ from 'lodash';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { PaginatedList } from '~/types/models/Pagination';
import { accountStore } from '~/store/accountStore';
import { Icon } from '@iconify/vue';
import { type ProposalInvitation, ProposalInvitationStatus } from '~/types/models/ProposalInvitation';

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
    include: string;
    project_id: string;
    account_id: number;
    status: ProposalInvitationStatus.PENDING;
    page: number;
}

const route = useRoute();


const searchParams = ref<SearchParams>({
    include: 'account.user.avatar,account.user.languages,account.skills,project',
    project_id: route.params.projectId.toString(),
    account_id: account.value?.id ?? 0,
    status: ProposalInvitationStatus.PENDING,
    page: 1
});

const { data: proposals, fetchData: fetchAllProposals, pending: isLoading } = useFetchData<PaginatedList<ProposalInvitation>, ApiErrorResponse>();

const queryString = computed(() => {
    let params: Record<string, string> = {
        include: searchParams.value.include,
        ...(searchParams.value.project_id && { "filter[project_id]": searchParams.value.project_id }),
        ...(searchParams.value.account_id && { "filter[account_id]": searchParams.value.account_id.toString() }),
        ...(searchParams.value.status && { "filter[status]": searchParams.value.status }),
        page: searchParams.value.page.toString()
    };

    return new URLSearchParams(params).toString();
});

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);

const fetchProposals = async () => {
    await fetchAllProposals(
        `v1/client/proposals/invitations?${queryString.value}`,
        {
            headers: requestHeaders.value
        }
    );
};

onMounted(async () => {
    await fetchProposals();
});

watch(
    [() => searchParams.value.project_id, () => searchParams.value.page, () => searchParams.value.account_id],
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
                        <div class="flex items-center w-fit rounded-md ring-1 ring-gray-300 px-4 py-2 justify-center">
                            <Icon icon="tdesign:filter-1" style="color: black" />
                            <select id="status" v-model="searchParams.status" @change="fetchProposals"
                                class="block w-full pl-1 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                <option v-for="status in Object.values(ProposalInvitationStatus)" :key="status"
                                    :value="status">{{ _.startCase(status.toLowerCase().replace('_', ' ')) }}</option>
                            </select>
                        </div>
                        <FreelancerInvitationCard v-if="proposals?.data && !isLoading"
                            v-for="proposal in proposals.data" :key="proposal.id" :freelancer="proposal.account" />
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