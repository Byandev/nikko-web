<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Proposal } from '~/types/models/Proposal';
import { accountStore } from '~/store/accountStore';

const { account } = storeToRefs(accountStore());

const tabs = [
    { name: 'Submitted Proposals', href: '/my-contract/submit-proposal', current: true },
    { name: 'Invites', href: '#', current: false },
    { name: 'Active Proposals', href: '#', current: false },
];

const { data: submittedProposals, fetchData: fetchSubmittedProposals } = useFetchData<Proposal,ApiErrorResponse>();

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
                    <h3 class="text-lg font-medium text-gray-900">Submitted Proposal</h3>
                    <!-- <p class="mt-1 text-sm text-gray-500">
                        Update your personal details here to ensure accurate contact information.
                    </p> -->
                </div>

                
            </div>
        </Tab>
    </div>
</template>