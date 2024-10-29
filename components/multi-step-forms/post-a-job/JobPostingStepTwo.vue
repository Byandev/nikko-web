<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { Icon } from '@iconify/vue';
import codes from 'iso-language-codes';

const emits = defineEmits<{ (e: 'submit'): void; (e: 'back'): void; }>();

interface FormData {
    projectLength: string;
    experienceLevel: string;
    language: string;
    estimatedBudget: string;
}

const initialValue: FormData = {
    projectLength: '',
    experienceLevel: '',
    language: '',
    estimatedBudget: '',
}

const form = ref(initialValue);

const rules = {
    projectLength: { required: helpers.withMessage('Project Length is required', required) },
    experienceLevel: { required: helpers.withMessage('Experience Level is required', required) },
    language: { required: helpers.withMessage('Language is required', required) },
    estimatedBudget: { required: helpers.withMessage('Estimated Budget is required', required) },
};

const { formRef, v$ } = useValidation(form, rules);

const submitForm = () => {
    v$.value.$touch();
    if (v$.value.$invalid) return;

    emits('submit');
};
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1 class="text-2xl font-bold mb-4">Post a Job</h1>
        <span class="text-gray-600 mb-4">Provide detailed information about the job to attract the right
            candidates.</span>

        <form @submit.prevent="submitForm" class="w-full max-w-lg text-left">
            <!-- Project Length -->
            <div class="mt-4 w-full">
                <label for="projectLength" class="block text-sm font-medium leading-6 text-gray-900">
                    Project Length <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div
                        class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:calendar" :ssr="true" />
                        <input type="text" id="projectLength" v-model="formRef.projectLength"
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                    </div>
                    <span v-if="v$.projectLength.$error" class="text-red-900 text-sm">{{
                        v$.projectLength.$errors[0].$message }}</span>
                </div>
            </div>

            <!-- Experience Level -->
            <div class="mt-4 w-full">
                <label for="experienceLevel" class="block text-sm font-medium leading-6 text-gray-900">
                    Experience Level <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div
                        class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:account" :ssr="true" />
                        <input type="text" id="experienceLevel" v-model="formRef.experienceLevel"
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                    </div>
                    <span v-if="v$.experienceLevel.$error" class="text-red-900 text-sm">{{
                        v$.experienceLevel.$errors[0].$message }}</span>
                </div>
            </div>

            <!-- Language -->
            <div class="mt-4 w-full">
                <label for="language" class="block text-sm font-medium leading-6 text-gray-900">
                    Language <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div>
                        <select
                        v-model="formRef.language"
                        class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                        <option :value="language.name" class="truncate text-sm leading-6" v-for="language in codes" :key="language.name">
                            {{ language.name }}
                        </option>
                        </select>
                    </div>
                    <span v-if="v$.language.$error" class="text-red-900 text-sm">{{
                        v$.language.$errors[0].$message }}</span>
                </div>
            </div>

            <!-- Estimated Budget -->
            <div class="mt-4 w-full">
                <label for="estimatedBudget" class="block text-sm font-medium leading-6 text-gray-900">
                    Estimated Budget <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div
                        class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:currency-usd" :ssr="true" />
                        <input type="text" id="estimatedBudget" v-model="formRef.estimatedBudget"
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                    </div>
                    <span v-if="v$.estimatedBudget.$error" class="text-red-900 text-sm">{{
                        v$.estimatedBudget.$errors[0].$message }}</span>
                </div>
            </div>

            <div class="flex mt-5 justify-end w-full">
                <Button text="Back" type="button" background="white" foreground="primary" @click="emits('back')" />
                <Button text="Submit" type="submit" background="primary" foreground="white" />
            </div>
        </form>
    </div>
</template>