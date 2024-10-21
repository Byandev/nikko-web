<script setup lang="ts">
import { useSubmit } from '~/composables/useSubmit';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { useResetPasswordStore } from '~/store/resetPasswordStore';
import { maskEmail } from '~/utils/helper';

definePageMeta({
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/find-work',
    },
});

const { resetPasswordData } = storeToRefs(useResetPasswordStore());

const form = ref({
    password: '',
    password_confirmation: '',
});

const router = useRouter();

const { sendRequest: resetPassword, pending: isSubmitting } = useSubmit<{ message: string }, ApiErrorResponse>();

const submitForm = async () => {
    try {
        await resetPassword('/v1/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email: resetPasswordData.value.email, token: resetPasswordData.value.token, password: form.value.password, password_confirmation: form.value.password_confirmation }),
        });
        resetPasswordData.value = { email: '', token: '' };
        await router.push("/login");
    } catch (error) {
        console.error('Password reset failed:', error);
    }
};
</script>

<template>
    <div class="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
        <form @submit.prevent="submitForm"
            class="relative bg-white p-8 rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-300 hover:scale-105">
            <NuxtLink to="/forgot-password" class="absolute top-4 left-4 text-gray-600 hover:text-gray-800">
                <Icon icon="mdi:arrow-left" width="24" height="24" />
            </NuxtLink>
            <div class="flex justify-center items-center mb-6">
                <Icon icon="mdi:lock-reset" :ssr="true" width="96" height="96" class="text-primary" />
            </div>
            <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Reset Password</h2>
            <p class="text-gray-600 mb-6 text-center">Please enter your new password for <strong>{{ maskEmail(resetPasswordData.email) }}</strong></p>
            <!-- Hidden username field for accessibility -->
            <input type="email" v-model="resetPasswordData.email" autocomplete="username" class="hidden" />
            <div class="mb-6">
                <input type="password" v-model="form.password" placeholder="New Password" required autocomplete="new-password"
                    class="w-full px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" />
            </div>
            <div class="mb-6">
                <input type="password" v-model="form.password_confirmation" placeholder="Confirm Password"
                    required autocomplete="new-password"
                    class="w-full px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" />
            </div>
            <Button text="Reset Password" background="primary" foreground="white" :is-loading="isSubmitting"
                :is-wide="true" type="submit"></Button>
        </form>
    </div>
</template>