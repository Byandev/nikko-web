<script setup lang="ts">
import { useSubmit } from '~/composables/useSubmit';
import { Icon } from '@iconify/vue';
import type { VerificationResponse } from "~/types/api/response/verfication";
import type { ApiErrorResponse } from '~/types/api/response/error';
import {authStore} from "~/store/authStore";

const router = useRouter();
const code = ref(Array(6).fill(''));
const isLoading = ref(false);
const isResendDisabled = ref(false);
const resendButtonText = ref('Resend Code');
const countdown = ref(60);
let timer: ReturnType<typeof setInterval> | null = null;

const { sendRequest: resendEmailVerification } = useSubmit<VerificationResponse, ApiErrorResponse>();
const { sendRequest: verifyEmail } = useSubmit<VerificationResponse, ApiErrorResponse>();
const { user } = authStore();

const focusNext = (event: Event, index: number) => {
    const input = event.target as HTMLInputElement;
    if (input.value.length === 1 && index < 5) {
        const nextInput = input.nextElementSibling as HTMLInputElement;
        nextInput?.focus();
    }
};

const verifyCode = async () => {
    const enteredCode = code.value.join('');
    try {
        isLoading.value = true;

        await verifyEmail('/v1/auth/email-verification/verify', {
            method: 'POST',
            body: JSON.stringify({ code: enteredCode }),
        });

        await router.push("/sign-up/contact-info");
    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        isLoading.value = false;
    }
};

const resendCode = async () => {
    try {
        isLoading.value = true;
        await resendEmailVerification('/v1/auth/email-verification/resend', {
            method: 'POST',
        });
        startTimer();
    } catch (error) {
        console.error('Resend code failed:', error);
    } finally {
        isLoading.value = false;
    }
};

const startTimer = () => {
    isResendDisabled.value = true;
    resendButtonText.value = `Resend Code (${countdown.value}s)`;
    timer = setInterval(() => {
        countdown.value--;
        resendButtonText.value = `Resend Code (${countdown.value}s)`;
        if (countdown.value === 0) {
            clearInterval(timer!);
            isResendDisabled.value = false;
            resendButtonText.value = 'Resend Code';
            countdown.value = 60;
        }
    }, 1000);
};
</script>

<template>
    <div class="flex justify-center items-center h-full lg:h-[700px]">
        <form @submit.prevent="verifyCode" class="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
            <div class="flex justify-center items-center mb-6">
                <Icon icon="fluent-color:mail-16" :ssr="true" width="96" height="96"  />
            </div>
            <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Email Verification</h2>
            <p class="text-gray-600 mb-6 text-center">Please enter the 6-digit code sent to your email: <strong> {{
                    user?.email }} </strong></p>
            <div class="mb-6">
                <div class="flex justify-center gap-2">
                    <input type="text" maxlength="1" v-for="n in 6" :key="n" v-model="code[n - 1]"
                        @input="focusNext($event, n - 1)"
                        class="w-12 h-12 text-center text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <Button @click="resendCode" :text="resendButtonText" background="gray" foreground="primary" :is-loading="isLoading"
                    :is-wide="true" type="button"></Button>
            </div>
            <Button text="Confirm Code" background="primary" foreground="white" :is-loading="isLoading" :is-wide="true"
                type="submit"></Button>
        </form>
    </div>
</template>
