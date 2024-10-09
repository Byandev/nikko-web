<script setup lang="ts">
import { useSubmit } from '~/composables/useSubmit';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import type { ApiErrorResponse } from '~/types/api/response/error';

const router = useRouter();
const email = ref('');
const isLoading = ref(false);

const { sendRequest: sendPasswordResetEmail } = useSubmit<{ data: { expires_at: string } }, ApiErrorResponse>();

const handleForgotPassword = async () => {
    try {
        isLoading.value = true;
        await sendPasswordResetEmail('/v1/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email: email.value }),
        });
        
        await router.push("/reset-password");
    } catch (error) {
        console.error('Password reset request failed:', error);
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="flex justify-center items-center h-full lg:h-[700px]">
        <form @submit.prevent="handleForgotPassword" class="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
            <div class="flex justify-center items-center mb-6">
                <Icon icon="mdi:forgot-password" :ssr="true" width="96" height="96" class="text-primary" />
            </div>
            <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Forgot Password</h2>
            <p class="text-gray-600 mb-6 text-center">Please enter your email address to receive a password reset link.
            </p>
            <div class="mb-6">
                <input type="email" v-model="email" placeholder="Email" required
                    class="w-full px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <Button text="Send Reset Link" background="primary" foreground="white" :is-loading="isLoading"
                :is-wide="true" type="submit"></Button>
        </form>
    </div>
</template>