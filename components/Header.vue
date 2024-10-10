<script setup lang="ts">
import { Icon } from '@iconify/vue';

const { status, signOut } = useAuth();
const isAuthenticated = computed(() => status.value === 'authenticated');
const showDropdown = ref(false);

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
    showDropdown.value = false;
}

const handleLogout = async () => {
    closeDropdown();
    await signOut();
};
</script>

<template>
    <header class="flex flex-row justify-between items-center border-b-2 border-gray-200 text-white py-2 px-4 sm:px-16">
        <NuxtLink to="/" @click="closeDropdown">
            <img src="@/assets/icons/artsycrowd.jpg" alt="Dummy Logo" class="h-10 object-cover rounded-full">
        </NuxtLink>
        <div class="relative flex justify-end space-x-4 group">
            <template v-if="isAuthenticated">
                <div @click="toggleDropdown" class="cursor-pointer">
                    <Icon icon="iconamoon:profile-circle-fill" width="40" height="40" class="text-primary sm:w-50 sm:h-50" />
                </div>
                <div v-if="showDropdown" class="absolute right-0 mt-10 sm:mt-14 w-48 bg-white border rounded-lg shadow-lg z-50">
                    <NuxtLink to="/#" @click="closeDropdown"
                        class="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-t-lg">
                        <div class="flex items-center space-x-2">
                            <Icon icon="mdi:account-circle" width="24" height="24" class="text-primary" />
                            <span>View Profile</span>
                        </div>
                    </NuxtLink>
                    <NuxtLink to="/settings/profile" @click="closeDropdown"
                        class="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                        <div class="flex items-center space-x-2">
                            <Icon icon="mdi:cog" width="24" height="24" class="text-primary" />
                            <span>Settings</span>
                        </div>
                    </NuxtLink>
                    <NuxtLink to="/login" @click="handleLogout"
                        class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-b-lg">
                        <div class="flex items-center space-x-2">
                            <Icon icon="mdi:logout" width="24" height="24" class="text-primary" />
                            <span>Logout</span>
                        </div>
                    </NuxtLink>
                </div>
            </template>
            <template v-else>
                <NuxtLink to="/login" class="text-black font-bold py-2 px-2 sm:px-4 rounded">
                    Log in
                </NuxtLink>
                <NuxtLink to="/register" class="bg-primary rounded-full text-white font-bold py-2 px-2 sm:px-4">
                    Sign up
                </NuxtLink>
            </template>
        </div>
    </header>
</template>