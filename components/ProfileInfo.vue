<template>
    <div
        class="mt-8 text-center relative max-w-6xl mx-auto border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg p-4">
        <div class="cover-photo relative group">
            <img :src="coverPhotoUrl" alt="Cover Photo" class="w-full h-36 object-cover rounded-t-lg" />
            <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition duration-300">
                <label class="cursor-pointer text-white">
                    <div class="bg-white rounded-full p-2 flex items-center justify-center shadow-md">
                        <Icon icon="ic:outline-edit" width="24" height="24" class="text-primary" />
                    </div>
                    <input type="file" class="hidden" @change="updateCoverPhoto" />
                </label>
            </div>
        </div>
        <div class="relative">
            <div class="profile-picture absolute -bottom-24 left-1/2 transform -translate-x-1/2 sm:left-8 sm:translate-x-0 group">
                <img :src="profilePictureUrl" alt="Profile Picture"
                    class="w-36 h-36 rounded-full border-4 border-white shadow-lg" />
                <div
                    class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <label class="cursor-pointer text-white">
                        <div class="bg-white rounded-full p-2 flex items-center justify-center shadow-md">
                            <Icon icon="ic:outline-edit" width="24" height="24" class="text-primary" />
                        </div>
                        <input type="file" class="hidden" @change="updateProfilePicture" />
                    </label>
                </div>
            
                <div class="mt-2 text-lg font-semibold text-gray-700 bg-gray-100 p-2 rounded-lg shadow-sm inline-block">
                    $50/hr
                </div>
            </div>
        </div>
        <div class="mt-20 sm:mt-4 mb-4 px-4 flex flex-col sm:flex-row items-center sm:items-start">
            <div class="sm:ml-40 mt-4 sm:mt-0 text-left">
                <h2 class="text-2xl font-bold text-gray-900">John Doe</h2>
                <p class="mt-2 text-md text-gray-600">Web Developer</p>
                <div class="mt-2 flex items-center space-x-2">
                    <Icon icon="twemoji:flag-for-flag-philippines" width="15" height="15" />
                    <span class=" text-sm text-black font-semibold">Philippines</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue/dist/iconify.js';

const coverPhotoUrl = ref('https://images.pexels.com/photos/1323206/pexels-photo-1323206.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500');
const profilePictureUrl = ref('https://wallpapers.com/images/featured/cool-profile-picture-87h46gcobjl5e4xu.jpg');

const updateCoverPhoto = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            coverPhotoUrl.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
};

const updateProfilePicture = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profilePictureUrl.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
};
</script>