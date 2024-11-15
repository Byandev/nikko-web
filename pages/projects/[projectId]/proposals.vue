<script setup lang="ts">
import _ from 'lodash';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Account } from '~/types/models/Account';
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
    include: string;
    project_id: string;
    account_id: number;
    page: number;
}

const route = useRoute();


const searchParams = ref<SearchParams>({
    include: 'account.user.avatar,account.user.languages,account.skills,project',
    project_id: route.params.projectId.toString(),
    account_id: account.value?.id ?? 0,
    page: 1
});

const { data: proposals, fetchData: fetchAllProposals, pending: isLoading } = useFetchData<PaginatedList<Proposal>, ApiErrorResponse>();
const { sendRequest: invite } = useSubmit<{
        project_id: string,
        account_id: string,
        message: string
    }, ApiErrorResponse>();

onMounted(async () => {
    fetchProposals();
});

const fetchProposals =  async  () => {
    await fetchAllProposals(
        `v1/client/proposals/invitations?include=${searchParams.value.include}&page=${searchParams.value.page}`,
        {
            headers: account?.value?.id
                ? {
                    'X-ACCOUNT-ID': account.value.id.toString(),
                }
                : undefined,
        }
    );
}

watch(
    [() => searchParams.value.project_id, () => searchParams.value.page, () => searchParams.value.account_id],
    debounce(async () => {
      await fetchProposals();
    }, 500)
);

const handleInvite = async (msg: string) => {
    try{
        await invite(`/v1/client/proposals/invitations`, {
            method: 'POST',
            headers: account?.value?.id
                ? {
                    'X-ACCOUNT-ID': account.value.id.toString(),
                }
                : undefined,
            body: {
                project_id: route.params.projectId,
                account_id: account.value?.id,
                message: msg
            }
        });
    }catch(e){
        console.log(e);
    }
}

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
                        
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>