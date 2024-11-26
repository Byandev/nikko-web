<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import { accountStore } from '~/store/accountStore';
import _ from 'lodash';
import type { PaginatedList } from "~/types/models/Pagination";
import ContractTabs from "~/components/freelancer/FreelancerContractTabs.vue";
import { AccountType } from '~/types/models/Account';
import type { Contract } from '~/types/models/Contract';
import type { ProposalInvitation } from '~/types/models/ProposalInvitation';

const { account } = storeToRefs(accountStore());

const router = useRouter();
const page = ref(1)

const queryString = computed(() => {
    let params: Record<string, string> = {
        'filter[status]': 'ACTIVE',
        include: 'account.user.avatar,proposal.project.account.user,proposal.project.languages,proposal.project.skills,proposal.project.images,proposal.attachments',
        page: page.value.toString()
    }
    return new URLSearchParams(params).toString();
})

const { data: pendingContracts, fetchData: fetchContract, pending: isLoading } = useFetchData<PaginatedList<Contract>, ApiErrorResponse>();
const { sendRequest: updateStatus } = useSubmit<ProposalInvitation, ApiErrorResponse>();

const fetchProposals = async () => {
    await fetchContract(`/v1/client/contracts?${queryString.value}`, {
        method: 'GET',
        headers: account?.value?.id ? {
            'X-ACCOUNT-ID': account.value.id.toString(),
        } : undefined,
    });
}

onMounted(() => {
    fetchProposals();
});

watch(
    [() => queryString.value],
    debounce(async () => {
        await fetchProposals();
    }, 500)
);

const viewJob = async (id: number) => {
    await router.push(`/jobs/${id}`);
};

const updateContractStatus = async (id: number | null) => {
    try {
        await updateStatus(`/v1/client/contracts/${id}`, {
            method: 'PUT',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
            body: {
                status: 'COMPLETED',
            }
        });
    } catch (e) {
        console.log(`Failed to update contract status to ${status}: `, e.message);
    }
};

</script>

<template>
    <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <ClientContractTabs />
        <div class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg font-medium text-gray-900 mb-5">Active Contracts</h3>

                <div class="space-y-5">
                    <div v-if="pendingContracts && pendingContracts?.data.length > 0">
                        <ProjectCard v-for="contract in pendingContracts?.data ?? []" :key="contract.id"
                            :view-as="AccountType.FREELANCER" :project="contract.proposal.project" :contract="contract"
                            :show-contract-details="true" class="mb-5" @click="viewJob" 
                            :show-complete-button="true"
                            @complete-contract="updateContractStatus"/>
                        <Pagination v-if="!isLoading && pendingContracts.data.length > 0"
                            :pagination="pendingContracts?.meta" @prev-page="page = page - 1"
                            @next-page="page = page + 1" />
                    </div>

                    <div v-else>
                        <p class="text-gray-600 text-base tracking-wider text-center">You have no active contracts yet.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
