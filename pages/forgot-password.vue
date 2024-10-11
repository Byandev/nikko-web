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
        navigateAuthenticatedTo: '/dashboard',
    },
});

const router = useRouter();

const forgetPasswordForm = ref({
    email: '',
    token: '',
});

const { setEmail, setToken } = useResetPasswordStore();

const isLoading = ref(false);
const showOtpInput = ref(false);

const resetForm = () => {
    forgetPasswordForm.value.email = '';
    forgetPasswordForm.value.token = '';
    showOtpInput.value = false;
};

const { sendRequest: sendPasswordResetRequest } = useSubmit<{ data: { expires_at: string } }, ApiErrorResponse>();

const handleForgotPassword = async () => {
    if(showOtpInput.value) {
        // Reset password
        try {
            isLoading.value = true;
            await sendPasswordResetRequest('/v1/auth/reset-password/check', {
                method: 'POST',
                body: {
                    email: forgetPasswordForm.value.email,
                    token: forgetPasswordForm.value.token,
                },
            });
            setEmail(forgetPasswordForm.value.email);
            setToken(forgetPasswordForm.value.token);
            router.push('/reset-password');
        } catch (error) {
            console.error('Error sending password reset email:', error);
        } finally {
            isLoading.value = false;
        }
    } else {
        // Send password reset email otp
        try {
            isLoading.value = true;
            await sendPasswordResetRequest('/v1/auth/forgot-password', {
                method: 'POST',
                body: {
                    email: forgetPasswordForm.value.email,
                },
            });
            showOtpInput.value = true;
        } catch (error) {
            console.error('Error sending password reset email:', error);
        } finally {
            isLoading.value = false;
        }
    }
};
</script>

<template>
    <div class="flex justify-center items-center h-full lg:h-[700px] bg-gradient-to-r from-blue-500 to-purple-600">
        <form @submit.prevent="handleForgotPassword"
            class="relative bg-white p-8 rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-300 hover:scale-105">
            <button v-if="showOtpInput" @click="resetForm" type="button" class="absolute top-4 left-4 text-gray-600 hover:text-gray-800">
                <Icon icon="mdi:arrow-left" width="24" height="24" />
            </button>
            <div class="flex justify-center items-center mb-6">
                <Icon icon="mdi:forgot-password" :ssr="true" width="96" height="96" class="text-primary" />
            </div>
            <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Forgot Password</h2>
            <p class="text-gray-600 mb-6 text-center">
                <span v-if="showOtpInput">
                    We sent OTP to <strong>{{ maskEmail(forgetPasswordForm.email) }}</strong>
                </span>
                <span v-else>
                    Please enter the email you registered to reset your password.
                </span>
            </p>
            <div v-if="showOtpInput" class="mb-6">
                <input type="text" v-model="forgetPasswordForm.token" placeholder="Enter OTP" required
                    class="w-full px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" />
            </div>
            <div v-else class="mb-6">
                <input type="email" v-model="forgetPasswordForm.email" placeholder="Email" required
                    class="w-full px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" />
            </div>
            <Button :text="showOtpInput ? 'Verify OTP' : 'Submit'" background="primary" foreground="white"
                :is-loading="isLoading" :is-wide="true" type="submit"></Button>
        </form>
    </div>
</template>