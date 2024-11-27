<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import { accountStore } from '~/store/accountStore';
import _ from 'lodash';
import type { PaginatedList } from "~/types/models/Pagination";
import type { Contract } from '~/types/models/Contract';

const { account } = storeToRefs(accountStore());

const router = useRouter();
const page = ref(1)

const queryString = computed(() => {
    let params: Record<string, string> = {
        'filter[status]': 'ACTIVE,COMPLETED',
        include: 'account.user.avatar,proposal.project.account.user,proposal.project.languages,proposal.project.skills,proposal.project.images,proposal.attachments',
        page: page.value.toString()
    }
    return new URLSearchParams(params).toString();
})

const { data: contracts, fetchData: fetchContract, pending: isLoading } = useFetchData<PaginatedList<Contract>, ApiErrorResponse>();

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

const viewFreelancer = async (id: number) => {
    await router.push(`/freelancer/${id}`);
};

const viewContract = async (id: number) => {
    await router.push(`/contract/${id}`);
};

</script>

<template>
    <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <PostTabs />
        <div class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg font-medium text-gray-900 mb-5">Hired Freelancer</h3>

                <div class="space-y-5">
                    <div v-if="contracts && contracts?.data.length > 0">
                        <FreelancerCard v-for="contract in contracts.data ?? []"
                            :key="contract.id" :contract="contract" :show-save-button="true"
                            :has-view-contract-button="true" 
                            :has-contract-details="true"
                            @view-contract="viewContract"
                            :freelancer="contract.account" @click="viewFreelancer"
                            />
                        <Pagination v-if="!isLoading && contracts.data.length > 0" :pagination="contracts?.meta"
                            @prev-page="page = page - 1" @next-page="page = page + 1" />
                    </div>

                    <div v-else>
                        <p class="text-gray-600 text-base tracking-wider text-center">You haven't hired any freelancer.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
