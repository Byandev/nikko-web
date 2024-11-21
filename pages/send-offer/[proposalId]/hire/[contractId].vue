<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Proposal } from '~/types/models/Proposal';
import { accountStore } from '~/store/accountStore';
import { Icon } from '@iconify/vue';

const { account } = storeToRefs(accountStore());
const { data: proposal, fetchData: fetchProposal, pending: isLoading } = useFetchData<{ data: Proposal }, ApiErrorResponse>();

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);

const avatarUrl = computed(
    () => proposal.value?.data.project.account.user?.avatar?.original_url ??
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
);

const name = computed(
    () => proposal.value?.data.project.account.user.first_name && proposal.value?.data.project.account.user.last_name ?
        `${proposal.value?.data.project.account.user.first_name} ${proposal.value?.data.project.account.user.last_name}` :
        'No name provided'
);

const location = computed(
    () => proposal.value?.data.project.account.user.country_code ?? 'No location provided'
);

const bio = computed(
    () => proposal.value?.data.project.account.bio ?? 'No bio provided'
);

const route = useRoute();
const router = useRouter();

onMounted(async () => {
    await fetchProposal(`v1/client/proposals/${route.params.proposalId}`, {
        headers: requestHeaders.value
    });
});

const handlePayNow = async () => {
    await router.push(`/projects/${proposal.value?.data.project.id}/proposals`);
};
</script>

<template>
    <div class="my-8 lg:mx-auto mx-5">
        <div class="max-w-6xl grid grid-cols-1 gap-4 mt-5 mx-auto">
            <div class="flex">
                <Button class="ring-1 ring-gray-300 rounded-md" text="Back to offer" type="button" foreground="primary" background="white" @click="router.push(`/send-offer/${route.params.proposalId}`);" />
            </div>
            <div>
                <div>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="ring-1 ring-gray-300 rounded-md h-fit">
                            <div class="flex flex-col items-center border-b-2 py-4">
                                <img :src="avatarUrl" :alt="name" class="w-16 h-16 rounded-full">
                                <h2 class="text-lg font-medium mt-4">{{ name }}</h2>
                                <p v-if="bio" class="text-sm text-gray-500 mt-1">{{ bio }}</p>
                                <p v-if="location" class="text-sm text-gray-500 mt-1">Location: {{ location }}</p>
                            </div>
                            <div class="py-4 px-4 border-b-2">
                                <h3 class="text-lg font-medium">Payment Summary</h3>
                                <div class="space-y-4 mt-4">
                                    <div class="flex flex-row justify-between">
                                        <p class="text-sm text-gray-500">Total Amount</p>
                                        <p class="text-lg font-medium">${{ proposal?.data.contract?.amount }}</p>
                                    </div>
                                    <div class="flex flex-row justify-between">
                                        <p class="text-sm text-gray-500">Platform Fee Percentage</p>
                                        <p class="text-lg font-medium">${{ proposal?.data.contract.platform_fee_percentage }}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="py-4 px-4 border-b-2">
                                <div class="flex flex-row justify-between">
                                    <p class="text-sm text-gray-500">Amount To Pay</p>
                                    <p class="text-lg font-medium">${{ proposal?.data.contract.total_amount }}</p>
                                </div>
                            </div>

                            <div class="py-4 px-4">
                                <Button @click="handlePayNow" text="Pay Now & Hire" type="button" foreground="white" background="primary"
                                    :is-wide="true" />
                            </div>
                        </div>

                        <div
                            class="col-span-1 md:col-span-3 ring-1 ring-gray-300 rounded-md p-4 flex flex-col items-center justify-center space-y-5">
                            <!-- Icon and Payment Method text -->
                            <div class="flex items-center flex-col">
                                <Icon icon="mdi:credit-card-outline" class="text-gray-500 text-4xl" />
                                <span class="text-gray-700 font-medium">You haven't add payment method yet</span>
                            </div>
                            <!-- Add Payment Method button -->
                            <Button text="Add Payment Method" type="button" foreground="white" background="primary" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>