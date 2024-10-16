<script setup lang="ts">
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { authStore } from '@/store/authStore';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { useSubmit } from '~/composables/useSubmit';
import type { Media as MediaResponse } from '~/types/models/Media';

enum MediaType {
    AVATAR = 'AVATAR',
    BANNER = 'BANNER',
}

const { user } = storeToRefs(authStore());
const { updateUser } = authStore();

const isAvatarModalOpen = ref(false);
const isBannerModalOpen = ref(false);
const isLoading = ref(false);

const defaultBannerUrl = 'https://wallpapers.com/images/hd/grey-aesthetic-pattern-190rmn46ypy7vq2q.jpg';
const defaultAvatarUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const bannerUrl = ref(user.value?.banner?.original_url || defaultBannerUrl);
const avatarUrl = ref(user.value?.avatar?.original_url || defaultAvatarUrl);

watch(user, (newMedia) => {
    bannerUrl.value = newMedia?.banner?.original_url || defaultBannerUrl;
    avatarUrl.value = newMedia?.avatar?.original_url || defaultAvatarUrl;
});

const { sendRequest: sendRequest } = useSubmit<{ data: MediaResponse }, ApiErrorResponse>();

const avatarImage = ref<File | null>(null);
const avatarImagePreview = ref<string | null>(null);
const bannerImage = ref<File | null>(null);
const bannerImagePreview = ref<string | null>(null);

const updateAvatarImage = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file) {
        avatarImage.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            avatarImagePreview.value = e.target?.result?.toString() || '';
        };
        reader.readAsDataURL(file);
    }
};

const updateBannerImage = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file) {
        bannerImage.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            bannerImagePreview.value = e.target?.result?.toString() || '';
        };
        reader.readAsDataURL(file);
    }
};

const uploadImage = async (type: MediaType) => {
    try {
        isLoading.value = true;
        const formData = new FormData();
        if (type === MediaType.AVATAR && avatarImage.value) {
            formData.append('file', avatarImage.value);
        } else if (type === MediaType.BANNER && bannerImage.value) {
            formData.append('file', bannerImage.value);
        } else {
            console.error('No image selected.');
            return;
        }

        // Upload image and Get the ID
        const UploadImageResponse = await sendRequest('/v1/medias', {
            method: 'POST',
            body: formData,
        });

        if (type === MediaType.AVATAR) {
            // Update the avatar
            await sendRequest(`/v1/auth/profile`, {
                method: 'PUT',
                body: JSON.stringify({
                    avatar: UploadImageResponse.data.id,
                }),
            });
            isAvatarModalOpen.value = false;
        } else {
            // Update the banner
            await sendRequest(`/v1/auth/profile`, {
                method: 'PUT',
                body: JSON.stringify({
                    banner: UploadImageResponse.data.id,
                }),
            });
            isBannerModalOpen.value = false;
        }

    } catch (error) {
        console.error('Error uploading photo:', error);
    } finally {
        updateUser();
        isLoading.value = false;
        avatarImagePreview.value = null;
        bannerImagePreview.value = null;
    }
};
</script>

<template>
    <div class="text-center relative border border-gray-300 rounded-lg overflow-hidden bg-white p-4">
        <div class="relative group">
            <img :src="bannerUrl" alt="Banner" class="w-full h-48 object-cover rounded-t-lg" />
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
                <img :src="avatarUrl" alt="Avatar" class="w-36 h-36 rounded-full border-4 border-white shadow-lg" />
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
            <template #title>Avatar</template>
            <template #content>
                <p class="text-sm text-gray-500 mb-4">Please select an image file to upload as your avatar.</p>
                <div v-if="avatarImagePreview" class="sm:col-span-2 mb-4 flex items-center justify-center">
                    <img :src="avatarImagePreview" alt="Image Preview" class="w-32 h-32 object-cover rounded-md" />
                </div>
                <div class="sm:col-span-2 mb-4 flex items-center">
                    <label class="text-sm font-medium text-gray-500 w-1/4 text-left">Image</label>
                    <input type="file" accept="image/*" required @change="updateAvatarImage"
                        class="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:cursor-pointer" />
                </div>
            </template>
            <template #actions>
                <div class="flex justify-end space-x-2">
                    <Button type="button" text="Cancel" background="white" foreground="black" :is-loading="isLoading"
                        :is-wide="false" @click="isAvatarModalOpen = false"></Button>
                    <Button type="button" text="Upload" background="primary" foreground="white" :is-loading="isLoading"
                        :is-wide="false" @click="() => uploadImage('AVATAR' as MediaType)"></Button>
                </div>
            </template>
        </Modal>

        <Modal :modelValue="isBannerModalOpen" @update:modelValue="isBannerModalOpen = $event">
            <template #title>Upload Banner</template>
            <template #content>
                <p class="text-sm text-gray-500 mb-4">Please select an image file to upload as your banner.</p>
                <div v-if="bannerImagePreview" class="sm:col-span-2 mb-4 flex items-center justify-center">
                    <img :src="bannerImagePreview" alt="Banner Preview" class="w-full h-36 object-cover rounded-md" />
                </div>
                <div class="sm:col-span-2 mb-4 flex items-center">
                    <label class="text-sm font-medium text-gray-500 w-1/4 text-left">Image</label>
                    <input type="file" accept="image/*" required @change="updateBannerImage"
                        class="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:cursor-pointer" />
                </div>
            </template>
            <template #actions>
                <div class="flex justify-end space-x-2">
                    <Button type="button" text="Cancel" background="white" foreground="black" :is-loading="isLoading"
                        :is-wide="false" @click="isBannerModalOpen = false"></Button>
                    <Button type="button" text="Upload" background="primary" foreground="white" :is-loading="isLoading"
                        :is-wide="false" @click="() => uploadImage('BANNER' as MediaType)"></Button>
                </div>
            </template>
        </Modal>
    </div>
</template>