<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { profileDisplayStore } from '~/store/profileDisplayStore';

const { profileDisplay } = storeToRefs(profileDisplayStore());


const defaultBannerUrl = 'https://wallpapers.com/images/hd/grey-aesthetic-pattern-190rmn46ypy7vq2q.jpg';
const defaultAvatarUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const bannerUrl = ref(profileDisplay.value.user?.banner?.original_url ?? defaultBannerUrl);
const avatarUrl = ref(profileDisplay.value.user?.avatar?.original_url || defaultAvatarUrl);

</script>

<template>
    <div class="text-center relative border border-gray-300 rounded-lg overflow-hidden bg-white p-4">
        <div class="relative group">
            <img :src="bannerUrl" alt="Banner" class="w-full h-48 object-cover rounded-t-lg" />
            <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
        </div>
        <div class="relative">
            <div class="absolute -bottom-24 left-1/2 transform -translate-x-1/2 sm:left-8 sm:translate-x-0 group">
                <img :src="avatarUrl" alt="Avatar" class="w-36 h-36 rounded-full border-4 border-white shadow-lg" />
            </div>
        </div>
        <div class="mt-20 sm:mt-4 mb-4 px-4 flex flex-col sm:flex-row items-center sm:items-start">
            <div class="sm:ml-44 mt-4 sm:mt-0 text-center sm:text-left">
                <h2 class="text-2xl font-bold text-gray-900">{{ profileDisplay.user?.first_name }} {{ profileDisplay.user?.last_name }}</h2>
                <p class="mt-2 text-md text-gray-600">Joined on {{ profileDisplay.created_at ? new Date(profileDisplay.created_at).toLocaleString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A' }}</p>
                <div class="mt-2 flex items-center space-x-2 justify-center sm:justify-start">
                    <Icon icon="mdi:map-marker" width="15" height="15" />
                    <span class="text-sm text-black font-semibold">{{ profileDisplay.user?.country_code }}</span>
                </div>
            </div>
        </div>
    </div>
</template>