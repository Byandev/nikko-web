<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Proposal } from '~/types/models/Proposal';
import { accountStore } from '~/store/accountStore';
import _ from 'lodash';
import { Icon } from '@iconify/vue';

const { account } = storeToRefs(accountStore());

const tabs = [
    { name: 'Submitted Proposals', href: '/my-contract/submit-contract', current: true },
    { name: 'Invites', href: '#', current: false },
    { name: 'Active Proposals', href: '#', current: false },
    { name: 'Pending Offers', href: '#', current: false },
    { name: 'Active Jobs', href: '#', current: false },
    { name: 'Completed Jobs', href: '#', current: false },
];

const router = useRouter();

const viewJob = async (id: number) => {
    await router.push(`/jobs/${id}`);
};


const { data: submittedProposals, fetchData: fetchSubmittedProposals } = useFetchData<{ data: Proposal[] },ApiErrorResponse>();

onMounted(() => {
    fetchSubmittedProposals('/v1/proposals?include=project.account.user.avatar,attachments',{
        method: 'GET',
        headers: account?.value?.id ? {
            'X-ACCOUNT-ID': account.value.id.toString(),
        } : undefined,
    });
    console.log('submittedProposals', submittedProposals);
});

</script>

<template>
    <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <Tab :tabs="tabs">
            <div class="bg-white shadow sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-5">My Proposal</h3>
                    <div v-if="submittedProposals?.data" v-for="proposal in submittedProposals.data"
                        class="ring-1 ring-gray-300 rounded-md p-4 mb-5">
                        <p class="text-sm text-gray-500 mb-2">Project ID: {{ proposal.project_id }}</p>
                        <JobCard @view="viewJob" :key="proposal.project_id" :job="proposal.my_proposal" class="mb-5">
                            <Button text="Withdraw" @click="" type="button" foreground="white" background="primary" />
                        </JobCard>
                        <div class="flex flex-row mb-2 space-x-2">
                            <p class="bg-primary/15 text-primary text-xs font-medium px-2.5 py-0.5 rounded">
                                Transaction Fee: {{ proposal.transaction_fee }}
                            </p>
                            <p class="bg-primary/15 text-primary text-xs font-medium px-2.5 py-0.5 rounded">
                                Bid Value: {{ proposal.bid }}
                            </p>
                            <p class="bg-primary/15 text-primary text-xs font-medium px-2.5 py-0.5 rounded">
                                Status: {{ _.capitalize(proposal.status) }}
                            </p>
                        </div>
                    </div>
                    <p v-else>No submitted proposals found.</p>
                </div>
            </div>
        </Tab>
    </div>
</template>