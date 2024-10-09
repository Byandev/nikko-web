<script setup lang="ts">
import { useSubmit } from '~/composables/useSubmit';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import type { ApiErrorResponse } from '~/types/api/response/error';

const router = useRouter();
const newPassword = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);

const { sendRequest: sendPasswordReset } = useSubmit<{ message: string }, ApiErrorResponse>();

const handleResetPassword = async () => {
    if (newPassword.value !== confirmPassword.value) {
        console.error('Passwords do not match');
        return;
    }

    try {
        isLoading.value = true;
        await sendPasswordReset('/v1/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ password: newPassword.value }),
        });

        await router.push("/login");
    } catch (error) {
        console.error('Password reset failed:', error);
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="flex justify-center items-center h-full lg:h-[700px]">
        <form @submit.prevent="handleResetPassword" class="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
            <div class="flex justify-center items-center mb-6">
                <Icon icon="mdi:lock-reset" :ssr="true" width="96" height="96" class="text-primary" />
            </div>
            <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Reset Password</h2>
            <p class="text-gray-600 mb-6 text-center">Please enter your new password and confirm it.</p>
            <div class="mb-6">
                <input type="password" v-model="newPassword" placeholder="New Password" required
                    class="w-full px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="mb-6">
                <input type="password" v-model="confirmPassword" placeholder="Confirm Password" required
                    class="w-full px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <Button text="Reset Password" background="primary" foreground="white" :is-loading="isLoading"
                :is-wide="true" type="submit"></Button>
        </form>
    </div>
</template>