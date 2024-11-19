<script setup lang="ts">
import { HeartIcon } from '@heroicons/vue/24/outline';
import type { Proposal } from '~/types/models/Proposal';
import { accountStore } from '~/store/accountStore';
import type { ApiErrorResponse } from '~/types/api/response/error';

const { account } = storeToRefs(accountStore());

const emit = defineEmits<{
    (e: 'click', id: number): void;
    (e: 'hire', id: number): void;
    (e: 'save', id: number): void;
    (e: 'un-save', id: number): void;
}>();

const defaultAvatarUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const props = defineProps<{
    proposal: Proposal;
    showSaveButton?: boolean;
}>();

const { proposal, showSaveButton } = toRefs(props)

const showAllBio = ref(false);
const hasLongBio = computed(() => props.proposal.cover_letter.length > 300);

const { sendRequest: toggleSaveProposal } = useSubmit<{ data: Proposal }, ApiErrorResponse>();

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
        class="bg-white hover:bg-gray-100 ring-1 ring-gray-300 rounded-md hover:cursor-pointer flex divide-x text-sm text-gray-800">
        <div class="w-9/12 px-5 py-5 space-y-4">
            <div class="flex flex-row justify-between gap-4">
                <div class="flex flex-row gap-3 items-center">
                    <img :src="props.proposal.project.account.user?.avatar?.original_url || defaultAvatarUrl"
                        alt="profile" class="w-16 h-16 rounded-full">
                    <div class="flex flex-col justify-center">
                        <div class="flex justify-between" @click="emit('click', proposal.project.account.id)">
                            <span class="text-lg font-bold" v-if="props.proposal.project.account.user">
                                {{ props.proposal.project.account.user.first_name || 'No name provided' }} {{
                                props.proposal.project.account.user.last_name || '' }}
                            </span>
                        </div>
                        <span class="text-sm text-gray-500" v-if="props.proposal.project.account.user">{{
                            props?.proposal?.project?.title
                            }}</span>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <span class="text-xl font-bold text-red-400">
                        ${{ props?.proposal?.project?.estimated_budget }}
                    </span>
                    <HeartIcon v-if="showSaveButton" @click="toggleSave"
                        class="w-5 h-5 text-primary-dark cursor-pointer"
                        :class="props.proposal.is_saved ? 'fill-primary' : ''" />
                </div>
            </div>
            <div v-if="props.proposal.project.account.skills && props.proposal.project.account.skills.length > 0"
                class="mt-4 w-full">
                <label for="profileTitle" class="block text-sm font-medium leading-6 text-gray-900">
                    Skills
                </label>
                <div class="mt-2 flex flex-row gap-2 flex-wrap">
                    <div v-for="skill in props.proposal.project.account.skills" :key="`selected-skill-${skill.id}`">
                        <span
                            class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {{ skill.name }}
                        </span>
                    </div>
                </div>
            </div>
            <p class="">
                {{ hasLongBio && showAllBio ? proposal.cover_letter : proposal.cover_letter.slice(0, 300) }}
            </p>
            <p class="underline text-primary" v-if="hasLongBio" @click="showAllBio = !showAllBio">
                {{ showAllBio ? 'Show Less' : 'Show more' }}
            </p>
        </div>

        <div class="w-3/12 divide-y p-4 flex flex-col item-center gap-2 justify-center">
            <Button @click="emit('hire', proposal.id)" text="Hire" type="button" background="primary"
                foreground="white" />

        </div>
    </div>
</template>
