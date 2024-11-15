<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { authStore } from '~/store/authStore';
import type { AuthenticationResponse } from '~/types/api/response/auth';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { accountStore } from '~/store/accountStore';

const { user } = storeToRefs(authStore());
const { account } = storeToRefs(accountStore());

const { status } = useAuth();
const isAuthenticated = computed(() => status.value === 'authenticated');
const showDropdown = ref(false);
const showDropdownMyContract = ref(false);
const showSidebar = ref(false);

const { sendRequest: signOut } = useSubmit<AuthenticationResponse, ApiErrorResponse>()

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const toggleDropdownMyContract = () => {
    showDropdownMyContract.value = !showDropdownMyContract.value;
};

const closeDropdown = () => {
    showDropdown.value = false;
    showDropdownMyContract.value = false;
}

const toggleSidebar = () => {
    showSidebar.value = !showSidebar.value;
};

const handleLogout = async () => {
    closeDropdown();
    await signOut('/v1/auth/logout', {
        method: 'POST',
    });
    await navigateTo("/login", { external: true });
};
</script>

<template>
    <header
        class="flex flex-row justify-between items-center border-b-2 border-gray-200 text-white py-2 px-4 sm:px-16 bg-white">
        <div class="flex items-center">
            <button @click="toggleSidebar" class="sm:hidden">
                <Icon icon="mdi:menu" width="24" height="24" class="text-black" />
            </button>
            <NuxtLink to="/" @click="closeDropdown" class="ml-4 sm:ml-0">
                <img src="@/assets/icons/artsycrowd.png" alt="Dummy Logo" class="h-10 object-cover rounded-full">
            </NuxtLink>

            <div class="hidden sm:block ml-5 border-l-2 pl-5">
                <NuxtLink :to="account?.type === 'FREELANCER' ? '/find-work' : '/find-freelancer'" @click="closeDropdown"
                    class="text-sm text-black">
                    {{ account?.type === 'FREELANCER' ? 'Find Work' : 'Browse Freelancer' }}
                </NuxtLink>
            </div>

            <div v-if="account?.type === 'FREELANCER'" class="hidden sm:block relative ml-5 text-sm">
                <button @click="toggleDropdownMyContract" class="flex items-center space-x-2 text-black">
                    <span>My contract</span>
                    <Icon icon="mdi:chevron-down" width="24" height="24" />
                </button>
                <div v-if="showDropdownMyContract" class="absolute mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                    <NuxtLink to="/my-contract/submitted-proposals" @click="closeDropdown"
                        class="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                        Submit proposals
                    </NuxtLink>
                </div>
            </div>
        </div>
        <div class="relative flex justify-end space-x-4 group">
            <template v-if="isAuthenticated">
                <div @click="toggleDropdown" class="cursor-pointer">
                    <template v-if="user?.avatar?.original_url">
                        <img :src="user?.avatar?.original_url" alt="User Avatar"
                            class="h-10 w-10 object-cover rounded-full">
                    </template>
                    <template v-else>
                        <Icon icon="iconamoon:profile-circle-fill" width="40" height="40"
                            class="text-primary sm:w-50 sm:h-50" />
                    </template>
                </div>
                <div v-if="showDropdown"
                    class="absolute right-0 mt-10 sm:mt-14 w-48 bg-white border rounded-lg shadow-lg z-50">
                    <NuxtLink :to="account?.type === 'FREELANCER' ? '/freelancer-dashboard' : '/client-dashboard'"
                        @click="closeDropdown" class="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-t-lg">
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
                    <div @click="handleLogout"
                        class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-b-lg">
                        <div class="flex items-center space-x-2">
                            <Icon icon="mdi:logout" width="24" height="24" class="text-primary" />
                            <span>Logout</span>
                        </div>
                    </div>
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

    <div v-if="showSidebar" class="fixed inset-0 bg-black bg-opacity-50 z-50 sm:hidden" @click="toggleSidebar">
        <div class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50" @click.stop>
            <div class="flex flex-col p-4 space-y-4">
                <NuxtLink to="/" @click="toggleSidebar" class="text-black font-bold">
                    Home
                </NuxtLink>
                <NuxtLink :to="account?.type === 'FREELANCER' ? '/find-work' : 'find-freelancer'" @click="toggleSidebar"
                    class="text-black">
                    {{ account?.type === 'FREELANCER' ? 'Find Work' : 'Find Freelancer' }}
                </NuxtLink>
                <NuxtLink to="/my-contract/submitted-proposals" @click="toggleSidebar" class="text-black">
                    Submit proposals
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
