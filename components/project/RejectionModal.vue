<script setup lang="ts">
import type { Account } from "~/types/models/Account";
import Button from "~/components/ui/Button.vue";
import type { ApiErrorResponse } from "~/types/api/response/error";
import { accountStore } from "~/store/accountStore";
import type { Proposal } from "~/types/models/Proposal";

const emit = defineEmits<{
    (e: 'toggle-open', isOpen: boolean): void;
}>();

const props = defineProps<{ isOpen: boolean, proposalId: number }>();

const { account } = storeToRefs(accountStore());

const rejectionMessage = ref('');

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);

const { sendRequest: sendRejectProposal } = useSubmit<Proposal, ApiErrorResponse>();

const rejectProposal = async (id: number) => {
    await sendRejectProposal(`/v1/proposals/invitations/${id}`, {
        method: 'PUT',
        headers: requestHeaders.value,
        body: {
            rejection_message: rejectionMessage.value,
            status: 'REJECTED'
        }
    });
    emit('toggle-open', false)
};

</script>

<template>
    <Modal :modelValue="isOpen" @update:modelValue="emit('toggle-open', !isOpen)" @close="emit('toggle-open', false)">
        <template #title>
            <h2>Reject Invitation</h2>
        </template>
        <template #content>
            <div class="flex flex-col">
                <label for="bio-title" class="text-sm font-medium text-gray-500 text-left">Message <span
                        class="text-red-500">*</span></label>
                <div class="my-1 text-sm text-gray-900">
                    <textarea v-model="rejectionMessage" class="w-full h-32 p-2 border rounded"
                        placeholder="Write your message here..."></textarea>
                </div>
            </div>
        </template>
        <template #actions>
            <Button text="Cancel" type="button" background="white" foreground="gray"
                @click="emit('toggle-open', false)" />
            <Button text="Reject" type="button" background="primary" foreground="white"
                @click="rejectProposal(props.proposalId)" />
        </template>
    </Modal>
</template>
