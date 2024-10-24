<script setup lang="ts">
import { required } from '@vuelidate/validators';
import type { ApiErrorResponse } from '~/types/api/response/error';

const tabs = [
    { name: 'Profile', href: '/settings/profile', current: false },
    { name: 'Email', href: '/settings/email', current: false },
    { name: 'Security & Password', href: '/settings/security-and-password', current: true },
];

const { sendRequest: changePassword, pending: isSubmitting } = useSubmit<{message: string}, ApiErrorResponse>();


interface PasswordForm {
    username: string;
    old_password: string;
    new_password: string;
    new_password_confirmation: string;
}

const ChangePasswordForm = ref<PasswordForm>({
    username: '',
    old_password: '',
    new_password: '',
    new_password_confirmation: '',
});

const ChangePasswordRules = {
    username: {required},
    old_password: {required},
    new_password: {required},
    new_password_confirmation: {required}
};

const { formRef, v$ } = useValidation(ChangePasswordForm, ChangePasswordRules);

const handleChangePassword = async () => {
    v$.value.$touch();
    if (v$.value.$invalid) return;

    try {
        await changePassword('/v1/auth/change-password', {
            method: 'POST',
            body: {
                username: ChangePasswordForm.value.username,
                old_password: ChangePasswordForm.value.old_password,
                new_password: ChangePasswordForm.value.new_password,
                new_password_confirmation: ChangePasswordForm.value.new_password_confirmation,
            },
        });
    } catch (error) {
        console.error('Error changing password:', error);
    } 
};
</script>

<template>
    <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <Tab :tabs="tabs">
            <div class="bg-white shadow sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium text-gray-900">Security & Password</h3>
                    <p class="mt-1 text-sm text-gray-500">
                        Here you can update your security settings and change your password.
                        Ensure your password is strong and unique to protect your account.
                    </p>
                </div>

                <!-- Change Password Section -->
                <form @submit.prevent="handleChangePassword"
                    class="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
                    <h1 class="text-lg font-medium text-gray-900 mb-4">Change Password</h1>
                    <input v-model="formRef.username" type="text" autocomplete="username" class="hidden">
                    <div class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div class="sm:col-span-1">
                            <label class="text-sm font-medium text-gray-500">Old Password</label>
                            <div class="mt-1 text-sm text-gray-900">
                                <input v-model="formRef.old_password" type="password" autocomplete="current-password"
                                    required
                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                            </div>
                        </div>
                        <div class="sm:col-span-1">
                            <label class="text-sm font-medium text-gray-500">New Password</label>
                            <div class="mt-1 text-sm text-gray-900">
                                <input v-model="formRef.new_password" type="password" autocomplete="new-password"
                                    required
                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                            </div>
                        </div>
                        <div class="sm:col-span-1">
                            <label class="text-sm font-medium text-gray-500">Confirm Password</label>
                            <div class="mt-1 text-sm text-gray-900">
                                <input v-model="formRef.new_password_confirmation" type="password"
                                    autocomplete="new-password" required
                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                            </div>
                        </div>
                    </div>
                    <!-- Save Button -->
                    <div class="mt-6 flex justify-end">
                        <Button text="Save" background="primary" foreground="white" :is-loading="isSubmitting"
                            :is-wide="false" type="submit"></Button>
                    </div>
                </form>
            </div>
        </Tab>
    </div>
</template>