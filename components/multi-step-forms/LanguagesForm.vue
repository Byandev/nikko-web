<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { authStore } from '~/store/authStore';
import type { Account } from '~/types/models/Account';
import { useAddDetailsStore } from '~/store/addDetailsStore';
import { Proficiency } from '~/types/models/Language';

const { user } = storeToRefs(authStore());

const { updateUser } = authStore();

const { Languages } = storeToRefs(useAddDetailsStore());
const { setLanguages } = useAddDetailsStore();

interface FormData {
    languages: {
        name: string;
        proficiency: string;
    }[];
}

const ProfileForm = ref<FormData>({
    languages: Languages.value.length > 0 ? [...Languages.value] : [{ name: '', proficiency: '' }],
});

const { sendRequest: updateLanguages } = useSubmit<{ data: Account }, ApiErrorResponse>();

const SubmitLanguage = async () => {
    try {
       await updateLanguages(`/v1/auth/accounts/${user.value.id}`, {
            method: 'PUT',
            body: {
                languages: ProfileForm.value.languages,
            },
        });
        setLanguages(ProfileForm.value.languages); // Update the store with the local copy
    } catch (error) {
        console.log('Error updating languages:', error);
    }
};

defineExpose({
    SubmitLanguage,
});

const addLanguage = () => {
    ProfileForm.value.languages.push({ name: '', proficiency: '' });
};  
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1 class="text-2xl font-bold mb-4">Write a Title for your Profile</h1>
        <span class="text-gray-600 mb-4">Your impression matters. Describe your expertise uniquely to stand out.</span>

        <div v-for="(language, index) in ProfileForm.languages" :key="index" class="flex flex-row gap-5">
            <!-- Language -->
            <div class="mt-4 w-full max-w-lg">
                <label for="languageName" class="block text-sm font-medium leading-6 text-gray-900">
                    Language <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div
                        class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="flowbite:language-outline" :ssr="true" />
                        <input type="text" id="languageName" v-model="language.name"
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                    </div>
                </div>
            </div>

            <!-- Level -->
            <div class="mt-4 w-full max-w-lg">
                <label for="languageProficiency" class="block text-sm font-medium leading-6 text-gray-900">
                    Level <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div
                        class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:account" :ssr="true" />
                        <select id="languageProficiency" v-model="language.proficiency"
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                            <option v-for="proficiency in Proficiency" :key="proficiency" :value="proficiency">
                                {{ proficiency }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <Button text="Add" type="button" background="primary" foreground="white" @click="addLanguage" class="mt-5" />
    </div>
</template>