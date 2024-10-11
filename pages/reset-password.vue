<script setup lang="ts">
import { useSubmit } from '~/composables/useSubmit';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { useResetPasswordStore } from '~/store/resetPasswordStore';

definePageMeta({
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/dashboard',
    },
});

const { resetData } = useResetPasswordStore();
const { email, token } = storeToRefs(useResetPasswordStore());

const resetPasswordForm = ref({
    email: email.value ?? '',
    password: '',
    password_confirmation: '',
    token: token.value ?? '',
});

const router = useRouter();
const isLoading = ref(false);

const { sendRequest: sendPasswordReset } = useSubmit<{ message: string }, ApiErrorResponse>();

const handleResetPassword = async () => {
    try {
        isLoading.value = true;
        await sendPasswordReset('/v1/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email: resetPasswordForm.value.email, token: resetPasswordForm.value.token, password: resetPasswordForm.value.password, password_confirmation: resetPasswordForm.value.password_confirmation }),
        });
        resetData();
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
            <p class="text-gray-600 mb-6 text-center">Please enter your email, token, new password, and confirm it.</p>
            <div class="mb-6">
                <input type="email" v-model="resetPasswordForm.email" placeholder="Email" required
                    class="w-full px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="mb-6">
                <input type="password" v-model="resetPasswordForm.password" placeholder="New Password" required
                    class="w-full px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="mb-6">
                <input type="password" v-model="resetPasswordForm.password_confirmation" placeholder="Confirm Password"
                    required
                    class="w-full px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="mb-6">
                <input type="text" v-model="resetPasswordForm.token" placeholder="Token" required
                    class="w-full px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <Button text="Reset Password" background="primary" foreground="white" :is-loading="isLoading"
                :is-wide="true" type="submit"></Button>
        </form>
    </div>
</template>