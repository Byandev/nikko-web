<script setup lang="ts">
import _ from 'lodash';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { PaginatedList, PaginationMeta } from '~/types/models/Pagination';
import { accountStore } from '~/store/accountStore';
import type { Proposal } from '~/types/models/Proposal';
import type { Channel } from '~/types/models/Channel';
import type { Message } from '~/types/models/Message';

const { account } = storeToRefs(accountStore());

interface Filter {
    include: string;
    project_id: number;
    is_saved: boolean;
    page: number;
    status: string;
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
const receiverName = ref('');
const message = ref('');
const isMessageModalOpen = ref(false);
const current_proposal_id = ref<number | null>(null);

const filter = ref<Filter>({
    include: 'project.account.user,attachments,contract,account.user.avatar,account.skills,chat_channel',
    project_id: parseInt(route.params.projectId as string),
    is_saved: false,
    page: 1,
    status: 'SUBMITTED'
});

const { data: proposals, fetchData: fetchAllProposals, pending: isLoading } = useFetchData<ProposalList, ApiErrorResponse>();
const { sendRequest: createChannel } = useSubmit<{ data: Channel }, ApiErrorResponse>();
const { sendRequest: sendMessage } = useSubmit<{ data: Message }, ApiErrorResponse>();

const queryString = computed(() => {
    let params: Record<string, string> = {
        include: filter.value.include,
        ...(filter.value.project_id ? { 'filter[project_id]': filter.value.project_id.toString() } : {}),
        ...(filter.value.is_saved ? { 'filter[is_saved]': 'true' } : {}),
        ...(filter.value.status ? { 'filter[status]': filter.value.status } : {}),
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

const handModal = async ({ proposal_id, accountName, channel_id }:{proposal_id?: number | null, accountName?: string | null, channel_id?: number | null}) =>
{
    if (proposal_id && accountName) {
        receiverName.value = accountName;
        isMessageModalOpen.value = true;
        current_proposal_id.value = proposal_id;
    }
    else{
        await router.push(`/chat/${channel_id}`);
    }
    // You can use the accountName as needed in your modal or other logic
};

const handleSubmit = async () => {
    try {
        const response = await createChannel('v1/chat/channels', {
            method: 'POST',
            headers: requestHeaders.value,
            body: JSON.stringify({
                subject_proposal_id: current_proposal_id.value
            })
        });

        await sendMessage(`v1/chat/channels/${response.data.id}/messages`, {
            method: 'POST',
            headers: requestHeaders.value,
            body: JSON.stringify({
                content: message.value
            })
        });

        await router.push(`/chat/${response.data.id}`);
    } catch (error) {
        console.error(error);
    }
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
                        <ContractCard v-if="proposals?.data && !isLoading" v-for="proposal in proposals.data"
                            @click="viewFreelancer" :key="proposal.id" :proposal="proposal" :show-save-button="true"
                            @save="(proposals as ProposalList).meta.total_saved_count++"
                            @un-save="(proposals as ProposalList).meta.total_saved_count--" @hire="hireFreelancer"
                            @view="viewContract" @message="handModal({proposal_id: $event.proposal_id, accountName: $event.sender, channel_id: $event.channel_id})" />
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

        <Modal v-if="isMessageModalOpen" :modelValue="isMessageModalOpen"
            @update:modelValue="isMessageModalOpen = $event" @close="isMessageModalOpen = false">
            <template #title>
                <div class="flex items-center space-x-2 justify-center">
                    <span>New Message</span>
                </div>
            </template>
            <template #content>
                <div class="flex flex-col gap-2">
                    <span class="border-b-2 p-2 w-full text-left border-t-2 py-4"> To: <span class="ml-2 ring-1 rounded-md p-2 ring-gray-200 text-primary">{{ receiverName }}</span></span>
                    <textarea v-model="message"
                        class="ring-0 ring-gray-300 w-full p-2 rounded-md placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
                        placeholder="Type your message here"></textarea>
                </div>
            </template>
            <template #actions>
                <Button @click="isMessageModalOpen = false" text="Cancel" type="button" background="white"
                    foreground="primary" />
                <Button @click="handleSubmit" text="Send" type="button" background="primary" foreground="white" />
            </template>
        </Modal>
    </div>
</template>
