<script setup lang="ts">
const tabs = [
    { name: 'Profile', href: '/settings/profile', current: false },
    { name: 'Email', href: '/settings/email', current: false },
    { name: 'Security & Password', href: '/settings/security-and-password', current: true },
];

</script>

<template>
    <div class="max-w-4xl mx-auto mt-12">
        <Tab :tabs="tabs">
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">Security & Password</h3>
                    <p class="mt-1 max-w-2xl text-sm text-gray-500">
                        Here you can update your security settings and change your password.
                        Ensure your password is strong and unique to protect your account.
                    </p>
                </div>
            </div>
        </Tab>
    </div>
</template>