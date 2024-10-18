<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { authStore } from '~/store/authStore';
import type { Account } from '~/types/models/Account';
import { useAddDetailsStore } from '~/store/addDetailsStore';
import type { Education } from '~/types/models/Education';
import _ from 'lodash';

const { user } = storeToRefs(authStore());

const { EducationHistory } = storeToRefs(useAddDetailsStore());
const { setEducationHistory } = useAddDetailsStore();

const createEmptyForm = (): Partial<Education> => ({
    degree: '',
    country: '',
    description: '',
    start_month: 1,
    start_year: new Date().getFullYear(),
    end_month: 1,
    end_year: new Date().getFullYear()
});

const EducationHistoryForms = ref<WorkExperience[]>(
    EducationHistory.value.length ? [...EducationHistory.value] : [createEmptyForm()]
);

const { sendRequest: updateEducationHistory } = useSubmit<{ data: Account }, ApiErrorResponse>();

const validateForm = (): boolean => {
    return EducationHistoryForms.value.every(form => 
        form.degree.trim() !== '' &&
        form.country.trim() !== '' &&
        form.description.trim() !== '' &&
        form.start_month > 0 &&
        form.start_year > 0 &&
        form.end_month > 0 &&
        form.end_year > 0
    );
};

const SubmitEducationHistory = async () => {
    if (!validateForm()) {
        console.log('Error: All fields must be filled out.');
        return;
    }

    try {
        const response = await updateEducationHistory(`/v1/auth/accounts/${user.value.id}`, {
            method: 'PUT',
            body: {
                educations: EducationHistoryForms.value,
            }
        });
        console.log('Education history updated:', response);
        setEducationHistory(EducationHistoryForms.value);
    } catch (error) {
        console.log('Error updating work experience:', error);
    }
};

const addWorkExperienceForm = () => {
    EducationHistoryForms.value.push(createEmptyForm());
};

const removeWorkExperienceForm = (index: number) => {
    EducationHistoryForms.value.splice(index, 1);
};

defineExpose({
    SubmitEducationHistory,
});
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1 class="text-2xl font-bold mb-4">Describe Your Education History</h1>
        <span class="text-gray-600 mb-4">Share your educational background to highlight your qualifications.</span>
        
        <div v-for="(form, index) in EducationHistoryForms" :key="index" class="w-full max-w-lg mb-8">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold">Education History {{ index + 1 }}</h2>
                <button v-if="EducationHistoryForms.length > 1" @click="removeWorkExperienceForm(index)" class="text-red-500">Remove</button>
            </div>
            
            <!-- Degree -->
            <div class="mt-4">
                <label for="degree" class="block text-sm font-medium leading-6 text-gray-900">
                    Degree <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:school" :ssr="true" />
                        <input type="text" id="degree" v-model="form.degree" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                    </div>
                </div>
            </div>

            <!-- Country -->
            <div class="mt-4">
                <label for="country" class="block text-sm font-medium leading-6 text-gray-900">
                    Country <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:earth" :ssr="true" />
                        <input type="text" id="country" v-model="form.country" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                    </div>
                </div>
            </div>

            <!-- Description -->
            <div class="mt-4">
                <label for="description" class="block text-sm font-medium leading-6 text-gray-900">
                    Description <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div class="flex flex-row items-start px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:note-text" :ssr="true" />
                        <textarea id="description" v-model="form.description" rows="4" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0"></textarea>
                    </div>
                </div>
            </div>

            <!-- Start Month and Start Year -->
            <div class="mt-4 flex flex-row space-x-4">
                <!-- Start Month -->
                <div class="w-1/2">
                    <label for="startMonth" class="block text-sm font-medium leading-6 text-gray-900">
                        Start Month <span class="text-red-500">*</span>
                    </label>
                    <div class="mt-2">
                        <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:calendar" :ssr="true" />
                            <input type="number" id="startMonth" v-model="form.start_month" min="1" max="12" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                    </div>
                </div>

                <!-- Start Year -->
                <div class="w-1/2">
                    <label for="startYear" class="block text-sm font-medium leading-6 text-gray-900">
                        Start Year <span class="text-red-500">*</span>
                    </label>
                    <div class="mt-2">
                        <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:calendar" :ssr="true" />
                            <input type="number" id="startYear" v-model="form.start_year" min="1900" :max="new Date().getFullYear()" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                    </div>
                </div>
            </div>

            <!-- End Month and End Year -->
            <div class="mt-4 flex flex-row space-x-4">
                <!-- End Month -->
                <div class="w-1/2">
                    <label for="endMonth" class="block text-sm font-medium leading-6 text-gray-900">
                        End Month <span class="text-red-500">*</span>
                    </label>
                    <div class="mt-2">
                        <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:calendar" :ssr="true" />
                            <input type="number" id="endMonth" v-model="form.end_month" min="1" max="12" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                    </div>
                </div>

                <!-- End Year -->
                <div class="w-1/2">
                    <label for="endYear" class="block text-sm font-medium leading-6 text-gray-900">
                        End Year <span class="text-red-500">*</span>
                    </label>
                    <div class="mt-2">
                        <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:calendar" :ssr="true" />
                            <input type="number" id="endYear" v-model="form.end_year" min="1900" :max="new Date().getFullYear()" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Button text="Add Education History" @click="addWorkExperienceForm" class="mt-4" type="button" foreground="white" background="primary" />
    </div>
</template>
