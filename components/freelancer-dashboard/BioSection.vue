<script setup lang="ts">
import { accountStore } from '~/store/accountStore';
import Button from '../ui/Button.vue';
import { Icon } from '@iconify/vue';
import type { Account } from '~/types/models/Account';
import type { ApiErrorResponse } from '~/types/api/response/error';

const { account } = storeToRefs(accountStore());

const { sendRequest: updateBio } = useSubmit<{ data: Account }, ApiErrorResponse>();

const isEditModalOpen = ref(false);
const newBio = ref(account.value?.bio || '');
const newTitle = ref(account.value?.title || '');

const openEditModal = () => {
    newBio.value = account.value?.bio || '';
    newTitle.value = account.value?.title || '';
    isEditModalOpen.value = true;
};

const closeEditModal = () => {
    isEditModalOpen.value = false;
};

const submitBio = () => {
    try {
        if (account.value) {
            updateBio(`/v1/auth/accounts/${account.value.id}`, {
                method: 'PUT',
                body: {
                    bio: newBio.value,
                    title: newTitle.value,
                },
            });
        } else {
            console.error('Account is not available.');
        }
        
    } catch (error) {
        console.error('Error updating bio:', error);
    } finally {
        if (account.value) {
            account.value.bio = newBio.value;
            account.value.title = newTitle.value;
        }
        closeEditModal();
    }

  
};
</script>

<template>
    <Section>
        <template #header>
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">About</h2>
                <div>
                    <button @click="openEditModal">Edit Bio</button>

                </div>
            </div>
        </template>
        <template #content>
            <div>
                <h2 class="text-xl font-bold text-gray-900">{{ account?.title || 'No Title' }}</h2>
                <p class="mt-2 text-base text-gray-700">{{ account?.bio || 'No Bio available' }}</p>
            </div>

            <Modal v-if="isEditModalOpen" :modelValue="isEditModalOpen" @update:modelValue="isEditModalOpen = $event"
                @close="closeEditModal">
                <template #title>
                    <div class="flex items-center space-x-2 justify-center">
                        <Icon icon="mdi:account-circle" class="text-primary-600" width="24" height="24" />
                        <span>Edit Bio</span>
                    </div>
                </template>
                <template #content>
                    <div class="sm:col-span-2 text-start">
                        <label for="bio-title" class="text-sm font-medium text-gray-500">Title</label>
                        <div class="mt-1 text-sm text-gray-900">
                            <input id="bio-title" v-model="newTitle" type="text"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 mb-4" />
                        </div>
                    </div>
                    <div class="sm:col-span-2 text-start">
                        <label for="bio-textarea" class="text-sm font-medium text-gray-500">Bio</label>
                        <div class="mt-1 text-sm text-gray-900">
                            <textarea id="bio-textarea" v-model="newBio"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
                        </div>
                    </div>
                </template>
                <template #actions>
                    <Button @click="closeEditModal" text="Cancel" type="button" background="white"
                        foreground="primary" />
                    <Button @click="submitBio" text="Save" type="button" background="primary" foreground="white" />
                </template>
            </Modal>
        </template>
    </Section>
</template>
