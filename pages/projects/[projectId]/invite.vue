<script setup lang="ts">
import _ from 'lodash';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Account } from '~/types/models/Account';
import type { PaginatedList } from '~/types/models/Pagination';
import { accountStore } from '~/store/accountStore';
import { Icon } from '@iconify/vue';

const { account } = storeToRefs(accountStore());

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

interface SearchParams {
    include: string;
    type: string;
    search: string;
    page: number;
}

const searchParams = ref<SearchParams>({
    include: 'user.avatar,skills',
    type: 'FREELANCER',
    search: '',
    page: 1
});

const { data: freelancers, fetchData: fetchAllFreelancers, pending: isLoading } = useFetchData<PaginatedList<Account>, ApiErrorResponse>();
const { sendRequest: invite } = useSubmit<{
        project_id: string,
        account_id: string,
        message: string
    }, ApiErrorResponse>();

onMounted(async () => {
    fetchFreelancers();
});

const fetchFreelancers =  async  () => {
    await fetchAllFreelancers(
        `v1/accounts?include=${searchParams.value.include}&filter[type]=${searchParams.value.type}&filter[search]=${searchParams.value.search}&page=${searchParams.value.page}`,
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
    [() => searchParams.value.search, () => searchParams.value.page],
    debounce(async () => {
      await fetchFreelancers();
    }, 500)
);

const route = useRoute();

const handleInvite = async ({ id, msg }: { id: number, msg: string }) => {
    try{
        await invite(`/v1/client/proposals/invitations`, {
            method: 'POST',
            headers: account?.value?.id
                ? {
                    'X-ACCOUNT-ID': account.value.id.toString(),
                }
                : undefined,
            body: {
                project_id: Number(route.params.projectId),
                account_id: id,
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
                        <div class="border border-gray-300 rounded-lg p-4 flex flex-row items-center gap-2">
                            <Icon icon="material-symbols:search" class=" text-xl text-gray-400" />
                            <input v-model="searchParams.search" type="text" placeholder="Search for freelancers..."
                            class="w-full outline-none border-none" />
                        </div>
                        <InviteFreelancerCard v-if="freelancers && !isLoading" v-for="freelancer in freelancers.data" :key="freelancer.id"
                            :freelancer="freelancer" @invite="handleInvite({ id: $event.id, msg: $event.msg })" />
                            <Pagination
                                v-if="!isLoading && freelancers"
                                :pagination="freelancers.meta"
                                @prev-page="searchParams.page = searchParams.page - 1 "
                                @next-page="searchParams.page = searchParams.page + 1" />
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>