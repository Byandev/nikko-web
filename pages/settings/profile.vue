<script setup lang="ts">
import { required } from '@vuelidate/validators';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { User as UpdateResponse } from '~/types/models/User';
import { authStore } from '~/store/auth';

const { user } = storeToRefs(authStore());

const tabs = [
    { name: 'Profile', href: '/settings/profile', current: true },
    { name: 'Email', href: '/settings/email', current: false },
    { name: 'Security & Password', href: '/settings/security-and-password', current: false },
];
    
const { sendRequest: updateProfile } = useSubmit<UpdateResponse, ApiErrorResponse>();

const isLoading = ref(false);

interface RegisterForm {
    first_name: string;
    last_name: string;
}
const UpdateForm = ref<RegisterForm>({
    first_name: user.value?.first_name ?? '',
    last_name: user.value?.last_name ?? '',
});

const UpdateRules = {
    first_name: {required},
    last_name: {required}
};

const { formRef, v$ } = useValidation(UpdateForm, UpdateRules);

const handleUpdate = async () => {
    v$.value.$touch();
    if (v$.value.$invalid) return;

    try {
        isLoading.value = true;
        await updateProfile('/v1/auth/profile', {
            method: 'PUT',
            body: {
                first_name: UpdateForm.value.first_name,
                last_name: UpdateForm.value.last_name,
            },
        });
    } catch (error) {
        console.error('Error updating profile:', error);
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="max-w-4xl mx-auto mt-12">
        <Tab :tabs="tabs">
            <div class="bg-white shadow sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium text-gray-900">Profile Information</h3>
                    <p class="mt-1 text-sm text-gray-500">
                        This section contains your personal details and application information.
                        Here you can view and update your name, email address, phone number, and other personal details.
                        Keeping this information up-to-date ensures that we can contact you if needed and that your
                        profile is accurate.
                    </p>
                </div>

                <!-- Name Section -->
                <form @submit.prevent="handleUpdate" class="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
                    <h1 class="text-lg font-medium text-gray-900 mb-4">Name</h1>
                    <div class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div class="sm:col-span-1">
                            <label class="text-sm font-medium text-gray-500">First Name</label>
                            <div class="mt-1 text-sm text-gray-900">
                                <input v-model="formRef.first_name" type="text" autocomplete="given-name"
                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                            </div>
                        </div>
                        <div class="sm:col-span-1">
                            <label class="text-sm font-medium text-gray-500">Last Name</label>
                            <div class="mt-1 text-sm text-gray-900">
                                <input v-model="formRef.last_name" type="text" autocomplete="family-name"
                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                            </div>
                        </div>
                    </div>
                    <!-- Update Button -->
                    <div class="mt-6 flex justify-end">
                        <Button text="Update" background="primary" foreground="white" :is-loading="isLoading"
                            :is-wide="false" type="submit"></Button>
                    </div>
                </form>
            </div>
        </Tab>
    </div>
</template>