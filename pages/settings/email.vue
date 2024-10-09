<script setup lang="ts">
const tabs = [
    { name: 'Profile', href: '/settings/profile', current: false },
    { name: 'Email', href: '/settings/email', current: true },
    { name: 'Security & Password', href: '/settings/security-and-password', current: false },
];
</script>

<template>
    <div class="max-w-4xl mx-auto mt-12">
        <Tab :tabs="tabs">
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">Email</h3>
                    <p class="mt-1 max-w-2xl text-sm text-gray-500">
                        This section allows you to manage your contact information, including your email address and
                        phone number.
                        Keeping your contact details up-to-date ensures that you receive important notifications and can
                        be reached when necessary.
                        Please verify that your email and phone number are correct to avoid any communication issues.
                    </p>
                </div>
            </div>
        </Tab>
    </div>
</template>