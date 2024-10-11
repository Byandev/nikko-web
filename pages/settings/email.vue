<script setup lang="ts">
import { ref, computed } from 'vue';
import { authStore } from '~/store/auth';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { maskEmail } from '~/utils/helper';
import { useSubmit } from '~/composables/useSubmit';

const tabs = [
    { name: 'Profile', href: '/settings/profile', current: false },
    { name: 'Email', href: '/settings/email', current: true },
    { name: 'Security & Password', href: '/settings/security-and-password', current: false },
];

const { user } = storeToRefs(authStore());

const changeEmailForm = ref({
    email: '',
    token: '',
});

const maskedEmail = computed(() => maskEmail(user.value.email));

const isLoading = ref(false);
const isModalOpen = ref(false);
const isResendDisabled = ref(false);
const resendTimer = ref(60);

const resendOTPText = computed(() => {
    return isResendDisabled.value ? `Send OTP (${resendTimer.value}s)` : 'Send OTP';
});

const { sendRequest: sendRequest } = useSubmit<{ data: { expires_at: string } }, ApiErrorResponse>();

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

const sendEmailVerification = async () => {
    try {
        isLoading.value = true;
        await sendRequest('/v1/auth/change-email', {
            method: 'POST',
            body: {
                email: changeEmailForm.value.email,
            },
        });
        startResendTimer();
    } catch (error) {
        console.error('Error sending password reset email:', error);
    } finally {
        isLoading.value = false;
    }
};

const verifyOTP = async () => {
    try {
        isLoading.value = true;
        await sendRequest('/v1/auth/change-email/verify', {
            method: 'POST',
            body: {
                token: changeEmailForm.value.token,
            },
        });
        isModalOpen.value = false;
    } catch (error) {
        console.error('Error sending password reset email:', error);
    } finally {
        isLoading.value = false;
    }
};

</script>

<template>
    <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <Tab :tabs="tabs">
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">Email</h3>
                    <p class="mt-1 max-w-2xl text-sm text-gray-500">
                        Manage your contact information here. Ensure your email and phone number are up-to-date to
                        receive notifications and avoid communication issues.
                    </p>
                </div>

                <!-- Change Password Section -->
                <div class="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
                    <h1 class="text-lg font-medium text-gray-900 mb-4">Update Email</h1>
                    <div class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div class="sm:col-span-2">
                            <label class="text-sm font-medium text-gray-500">Email</label>
                            <div class="mt-1 text-sm text-gray-900">
                                <input v-model="maskedEmail" type="email" autocomplete="email" disabled
                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 cursor-not-allowed">
                            </div>
                        </div>
                    </div>
                    <!-- Update Button -->
                    <div class="mt-6 flex justify-end">
                        <Button @click="isModalOpen = true" text="Update Email" background="primary" foreground="white"
                            :is-loading="isLoading" :is-wide="false" type="button"></Button>
                    </div>
                </div>
            </div>
        </Tab>

        <Modal :modelValue="isModalOpen" @update:modelValue="isModalOpen = $event">
            <template #title>
                Verify Email
            </template>
            <template #content>
                <p class="text-sm text-gray-500 mb-4">
                    An OTP has been sent to your email. Please enter it below to verify your email address.
                </p>
                <div class="sm:col-span-2 mb-4 flex items-center">
                    <label class="text-sm font-medium text-gray-500 w-1/4 text-left">Email</label>
                    <input v-model="changeEmailForm.email" type="email" autocomplete="email" required
                        placeholder="Enter New Email"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-gray-100" />
                </div>
                <div class="sm:col-span-2 flex items-center">
                    <label class="text-sm font-medium text-gray-500 w-1/4 text-left">OTP</label>
                    <div class="flex flex-row mt-1 text-sm text-gray-900 w-full">
                        <input v-model="changeEmailForm.token" type="text" autocomplete="one-time-code" required
                            placeholder="Enter OTP"
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-gray-100" />
                        <Button @click="sendEmailVerification" :disabled="isResendDisabled"
                            :class="{ 'cursor-not-allowed': isResendDisabled }"
                            class="whitespace-nowrap ml-2" type="submit" :text="resendOTPText" background="none"
                            foreground="black" :is-loading="isLoading" :is-wide="false"></Button>
                    </div>
                </div>
            </template>
            <template #actions>
                <div class="flex justify-end space-x-2">
                    <Button type="button" text="Cancel" background="white" foreground="black" :is-loading="isLoading"
                        :is-wide="false" @click="isModalOpen = false"></Button>
                    <Button type="button" text="Verify" background="primary" foreground="white" :is-loading="isLoading"
                        :is-wide="false" @click="verifyOTP"></Button>
                </div>
            </template>
        </Modal>
    </div>
</template>