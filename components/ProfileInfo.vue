<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { authStore } from '@/store/authStore';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { useSubmit } from '~/composables/useSubmit';

enum ModalType {
    AVATAR = 'AVATAR',
    BANNER = 'BANNER',
}

const { user } = storeToRefs(authStore());
const isAvatarModalOpen = ref(false);
const isBannerModalOpen = ref(false);
const isLoading = ref(false);

const defaultBannerUrl = 'https://wallpapers.com/images/hd/grey-aesthetic-pattern-190rmn46ypy7vq2q.jpg';
const defaultAvatarUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const bannerUrl = ref(user.value?.banner?.original_url || defaultBannerUrl);
const avatarUrl = ref(user.value?.avatar?.original_url || defaultAvatarUrl);

const { sendRequest: sendRequest } = useSubmit<{ data: { expires_at: string } }, ApiErrorResponse>();

const avatarFile = ref<File | null>(null);
const bannerFile = ref<File | null>(null);

const updatePhoto = (event: Event, type: ModalType) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files) {
        type === 'AVATAR' ? avatarFile.value = files[0] : bannerFile.value = files[0];
    }
};

const uploadImage = async (type: string) => {
    const file = type === 'AVATAR' ? avatarFile.value : bannerFile.value;
    try {
        isLoading.value = true;
        const response = await sendRequest('/v1/medias', {
            method: 'POST',
            body: {
                file: file,
                type: type,
            },
        });
        console.log(response);
    } catch (error) {
        console.error('Error uploading photo:', error);
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div
        class="mt-8 text-center relative max-w-6xl mx-auto border border-gray-300 rounded-lg overflow-hidden bg-white p-4">
        <div class="relative group">
            <img :src="bannerUrl" alt="Banner" class="w-full h-36 object-cover rounded-t-lg" />
            <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition duration-300">
                <label class="cursor-pointer text-white">
                    <div @click="isBannerModalOpen = true"
                        class="bg-white rounded-full p-2 flex items-center justify-center shadow-md">
                        <Icon icon="ic:outline-edit" width="24" height="24" class="text-primary" />
                    </div>
                </label>
            </div>
        </div>
        <div class="relative">
            <div class="absolute -bottom-24 left-1/2 transform -translate-x-1/2 sm:left-8 sm:translate-x-0 group">
                <img :src="avatarUrl" alt="Avatar"
                    class="w-36 h-36 rounded-full border-4 border-white shadow-lg" />
                <div
                    class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <label class="cursor-pointer text-white">
                        <div @click="isAvatarModalOpen = true"
                            class="bg-white rounded-full p-2 flex items-center justify-center shadow-md">
                            <Icon icon="ic:outline-edit" width="24" height="24" class="text-primary" />
                        </div>
                    </label>
                </div>
                <div class="mt-2 text-lg font-semibold text-white bg-primary p-2 rounded-lg shadow-sm inline-block">
                    $50/hr</div>
            </div>
        </div>
        <div class="mt-20 sm:mt-4 mb-4 px-4 flex flex-col sm:flex-row items-center sm:items-start">
            <div class="sm:ml-40 mt-4 sm:mt-0 text-left">
                <h2 class="text-2xl font-bold text-gray-900">{{ user.first_name }} {{ user.last_name }}</h2>
                <p class="mt-2 text-md text-gray-600">Joined on {{ new Date(user.created_at).toLocaleString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric' }) }}</p>
                <div class="mt-2 flex items-center space-x-2">
                    <Icon icon="twemoji:flag-for-flag-philippines" width="15" height="15" />
                    <span class="text-sm text-black font-semibold">Philippines</span>
                </div>
            </div>
        </div>

        <Modal :modelValue="isAvatarModalOpen" @update:modelValue="isAvatarModalOpen = $event">
            <template #title>Upload Avatar</template>
            <template #content>
                <p class="text-sm text-gray-500 mb-4">Please select an image file to upload as your avatar.</p>
                <div class="sm:col-span-2 mb-4 flex items-center">
                    <label class="text-sm font-medium text-gray-500 w-1/4 text-left">Image</label>
                    <input type="file" accept="image/*" required
                        @change="event => updatePhoto(event,'AVATAR' as ModalType)"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-gray-100" />
                </div>
            </template>
            <template #actions>
                <div class="flex justify-end space-x-2">
                    <Button type="button" text="Cancel" background="white" foreground="black" :is-loading="isLoading"
                        :is-wide="false" @click="isAvatarModalOpen = false"></Button>
                    <Button type="button" text="Upload" background="primary" foreground="white" :is-loading="isLoading"
                        :is-wide="false" @click="() => uploadImage('avatar')"></Button>
                </div>
            </template>
        </Modal>

        <Modal :modelValue="isBannerModalOpen" @update:modelValue="isBannerModalOpen = $event">
            <template #title>Upload Banner</template>
            <template #content>
                <p class="text-sm text-gray-500 mb-4">Please select an image file to upload as your banner.</p>
                <div class="sm:col-span-2 mb-4 flex items-center">
                    <label class="text-sm font-medium text-gray-500 w-1/4 text-left">Image</label>
                    <input type="file" accept="image/*" required @change="event => updatePhoto(event, 'BANNER' as ModalType)"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-gray-100" />
                </div>
            </template>
            <template #actions>
                <div class="flex justify-end space-x-2">
                    <Button type="button" text="Cancel" background="white" foreground="black" :is-loading="isLoading"
                        :is-wide="false" @click="isBannerModalOpen = false"></Button>
                    <Button type="button" text="Upload" background="primary" foreground="white" :is-loading="isLoading"
                        :is-wide="false" @click="() => uploadImage('banner')"></Button>
                </div>
            </template>
        </Modal>
    </div>
</template>