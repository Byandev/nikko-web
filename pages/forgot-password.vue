<script setup lang="ts">
import { useSubmit } from '~/composables/useSubmit';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { useResetPasswordStore } from '~/store/resetPasswordStore';

definePageMeta({
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/find-work',
    },
});

const router = useRouter();

const form = ref({
    email: '',
    token: '',
});

const { resetPasswordData } = storeToRefs(useResetPasswordStore());

const showOtpInput = ref(false);
const isResendDisabled = ref(false);
const resendTimer = ref(60);

const startResendTimer = () => {
    isResendDisabled.value = true;
    resendTimer.value = 60;
    const interval = setInterval(() => {
        resendTimer.value -= 1;
        if (resendTimer.value <= 0) {
            clearInterval(interval);
            isResendDisabled.value = false;
        }
    }, 1000);
};

const { sendRequest: sendPasswordResetRequest, pending: isSubmitting } = useSubmit<{ data: { expires_at: string } }, ApiErrorResponse>();

const submitForm = async () => {
    if (showOtpInput.value) {
        // Reset password
        try {
            await sendPasswordResetRequest('/v1/auth/reset-password/check', {
                method: 'POST',
                body: {
                    email: form.value.email,
                    token: form.value.token,
                },
            });
            resetPasswordData.value = { email: form.value.email, token: form.value.token };
            await router.push('/reset-password');
        } catch (error) {
            console.error('Error sending password reset email:', error);
        } 
    } else {
        // Send password reset email
        resendOTP();
    }
};

const resendOTP = async () => {
    startResendTimer();
    try {
        await sendPasswordResetRequest('/v1/auth/forgot-password', {
            method: 'POST',
            body: {
                email: form.value.email,
            },
        });
        showOtpInput.value = true;
    } catch (error) {
        console.error('Error resending OTP:', error);
    } 
};
</script>

<template>
    <div class="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
        <form @submit.prevent="submitForm"
            class="relative bg-white p-8 rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-300 hover:scale-105">
            <NuxtLink to="/login" class="absolute top-4 left-4 text-gray-600 hover:text-gray-800">
                <Icon icon="mdi:arrow-left" width="24" height="24" />
            </NuxtLink>
            <div class="flex justify-center items-center mb-6">
                <Icon icon="mdi:forgot-password" :ssr="true" width="96" height="96" class="text-primary" />
            </div>
            <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Forgot Password</h2>
            <p class="text-gray-600 mb-6 text-center">
                <span v-if="showOtpInput">
                    We sent OTP to <strong>{{ form.email }}</strong>
                </span>
                <span v-else>
                    Please enter the email you registered to reset your password.
                </span>
            </p>
            <div v-if="showOtpInput" class="mb-6">
                <input type="text" v-model="form.token" placeholder="Enter OTP" required
                    class="w-full px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" />

                <div class="flex flex-col items-center mt-4">
                    <p class="text-sm text-gray-500 mb-2">
                        Didn't receive the OTP? Click below to resend.
                    </p>
                    <button @click="resendOTP" type="button" :disabled="isResendDisabled"
                        class="text-primary transition-all duration-200 disabled:text-gray-400 disabled:cursor-not-allowed">
                        Resend OTP <span v-if="isResendDisabled">({{ resendTimer }}s)</span>
                    </button>
                </div>
            </div>
            <div v-else class="mb-6">
                <input type="email" v-model="form.email" placeholder="Email" required
                    class="w-full px-4 py-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" />
            </div>
            <Button :text="showOtpInput ? 'Verify OTP' : 'Submit'" background="primary" foreground="white"
                :is-loading="isSubmitting" :is-wide="true" type="submit"></Button>
        </form>
    </div>
</template>