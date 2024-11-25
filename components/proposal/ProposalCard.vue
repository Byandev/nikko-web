<script setup lang="ts">
import { HeartIcon } from '@heroicons/vue/24/outline';
import type { Proposal } from '~/types/models/Proposal';
import { accountStore } from '~/store/accountStore';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Account } from '~/types/models/Account';

const { account } = storeToRefs(accountStore());

const emit = defineEmits<{
    (e: 'click', id: number): void;
    (e: 'hire', id: number): void;
    (e: 'view', id: number): void;
    (e: 'save', id: number): void;
    (e: 'un-save', id: number): void;
}>();


const props = defineProps<{
    proposal: Proposal;
    showSaveButton?: boolean;
}>();

const { proposal, showSaveButton } = toRefs(props)

const showAllBio = ref(false);
const hasLongBio = computed(() => props.proposal.cover_letter.length > 300);

const { sendRequest: toggleSaveProposal } = useSubmit<{ data: Proposal }, ApiErrorResponse>();
const { data: accountDetails, fetchData: fetchAccountDetails, pending: isLoading } = useFetchData<{ data: Account }, ApiErrorResponse>();

onMounted(async () => {
    if (props.proposal.account_id) {
        await fetchAccountDetails(`v1/accounts/${props.proposal.account_id}`);
    }
});

const accountName = computed(() => {
    const firstName = accountDetails.value?.data.user.first_name ?? '';
    const lastName = accountDetails.value?.data.user.last_name ?? '';
    return `${firstName} ${lastName}`.trim();
});

const accountAvatar = computed(() => {
    return accountDetails.value?.data.user.avatar?.original_url;
});

const acountBio = computed(() => {
    return accountDetails.value?.data.bio;
});

const accountSkills = computed(() => {
    return accountDetails.value?.data.skills;
});

const avatarUrl = computed(
    () => accountAvatar ??
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
);

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);

const toggleSave = async () => {
    const isSaved = !proposal.value.is_saved;

    proposal.value.is_saved = isSaved;

    isSaved ? emit('save', proposal.value.id) : emit('un-save', proposal.value.id);

    try {
        await toggleSaveProposal(`v1/client/proposals/${proposal.value.id}/${isSaved ? 'save' : 'un-save'}`,
            {
                method: isSaved ? 'POST' : 'DELETE',
                headers: requestHeaders.value,
            }
        );
    } catch (e: any) {
        console.log("Failed to marked the proposal: ", e.message)
    }
}
</script>

<template>
    <div
        class="bg-white hover:bg-gray-100 ring-1 ring-gray-300 rounded-md hover:cursor-pointer flex flex-col md:flex-row divide-y md:divide-x text-sm text-gray-800">
        <div class="w-full md:w-9/12 px-5 py-5 space-y-4">
            <div class="flex flex-col md:flex-row justify-between gap-4">
                <div class="flex flex-col md:flex-row gap-3 items-center w-full">
                    <img v-if="accountAvatar" :src="avatarUrl.value"
                        alt="profile" class="w-16 h-16 rounded-full"/>
                    <div v-else class="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
                    <div class="flex flex-col justify-center flex-grow w-full">
                        <div class="flex justify-between">
                            <span class="text-lg font-bold hover:underline" v-if="accountName"
                                @click="emit('click', accountDetails?.data.id ?? 0)">
                                {{ accountName || 'Loading...' }}
                            </span>
                            <span v-else>
                                <div class="h-6 w-32 bg-gray-200 animate-pulse"></div>
                            </span>
                            <div class="flex items-center gap-2">
                                <span class="text-xl font-bold text-primary">
                                    ${{ props?.proposal?.project?.estimated_budget }}
                                </span>
                                <HeartIcon v-if="showSaveButton" @click="toggleSave"
                                    class="w-5 h-5 text-primary-dark cursor-pointer"
                                    :class="props.proposal.is_saved ? 'fill-primary' : ''" />
                            </div>
                        </div>
                        <span class="text-sm text-gray-500" v-if="acountBio">{{ acountBio }}</span>
                        <span v-else class="h-4 w-48 bg-gray-200 animate-pulse"></span>
                    </div>
                </div>
            </div>
            <div v-if="accountSkills && accountSkills.length > 0"
                class="mt-4 w-full">
                <label for="profileTitle" class="block text-sm font-medium leading-6 text-gray-900">
                    Skills
                </label>
                <div class="mt-2 flex flex-row gap-2 flex-wrap">
                    <div v-for="skill in accountSkills" :key="`selected-skill-${skill.id}`">
                        <span
                            class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {{ skill.name }}
                        </span>
                    </div>
                </div>
            </div>
            <div v-else class="mt-4 w-full">
                <div class="h-4 w-32 bg-gray-200 animate-pulse mb-2"></div>
                <div class="h-4 w-24 bg-gray-200 animate-pulse"></div>
            </div>
            <p v-if="proposal.cover_letter">
                {{ hasLongBio && showAllBio ? proposal.cover_letter : proposal.cover_letter.slice(0, 300) }}
            </p>
            <p class="underline text-primary" v-if="hasLongBio" @click="showAllBio = !showAllBio">
                {{ showAllBio ? 'Show Less' : 'Show more' }}
            </p>
        </div>

        <div class="w-full md:w-3/12 divide-y p-4 flex flex-col item-center gap-2 justify-center">
            <Button text="View Profile" background="white" foreground="primary" class="ring-1 ring-primary w-full font-base"
                @click="emit('click', accountDetails?.data.id ?? 0)" type="button"/>

            <Button @click="!proposal.contract ? emit('hire', proposal.id) : emit('view', proposal.contract.id)" :text="!proposal.contract ? `Hire`: `View Contract`" type="button" :background="!proposal.contract ? `white` : `primary`"
                :foreground="!proposal.contract ? `primary` : `white`" class="ring-1 ring-primary" />

        </div>
    </div>
</template>
