<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { authStore } from '~/store/authStore';
import type { Account } from '~/types/models/Account';
import { useAddDetailsStore } from '~/store/addDetailsStore';
import { EmploymentType } from '~/types/models/WorkExperience';
import { WorkExperience } from '~/types/models/WorkExperience';
import _ from 'lodash';

const { user } = storeToRefs(authStore());

const { WorkExperiences } = storeToRefs(useAddDetailsStore());
const { setWorkExperiences } = useAddDetailsStore();

const createEmptyForm = (): Partial<WorkExperience> => ({
    job_title: '',
    company: '',
    website: '',
    country: '',
    description: '',
    start_month: 1,
    start_year: new Date().getFullYear(),
    is_current: false,
    employment: EmploymentType.FULL_TIME // Set a default valid EmploymentType value
});

const WorkExperienceForms = ref<WorkExperience[]>(
    WorkExperiences.value.length ? [...WorkExperiences.value] : [createEmptyForm()]
);

const { sendRequest: updateWorkExperience } = useSubmit<{ data: Account }, ApiErrorResponse>();

const validateForm = (): boolean => {
    return WorkExperienceForms.value.every(form => 
        form.job_title.trim() !== '' &&
        form.company.trim() !== '' &&
        form.website.trim() !== '' &&
        form.country.trim() !== '' &&
        form.description.trim() !== '' &&
        form.start_month > 0 &&
        form.start_year > 0 &&
        form.employment.trim() !== '' &&
        (form.is_current || (form.end_month && form.end_year))
    );
};

const SubmitWorkExperience = async () => {
    if (!validateForm()) {
        console.log('Error: All fields must be filled out.');
        return;
    }

    try {
        await updateWorkExperience(`/v1/auth/accounts/${user.value.id}`, {
            method: 'PUT',
            body: {
                work_experiences: WorkExperienceForms.value,
            }
        });
        setWorkExperiences(WorkExperienceForms.value);
    } catch (error) {
        console.log('Error updating work experience:', error);
    }
};

const addWorkExperienceForm = () => {
    WorkExperienceForms.value.push(createEmptyForm());
};

const removeWorkExperienceForm = (index: number) => {
    WorkExperienceForms.value.splice(index, 1);
};

defineExpose({
    SubmitWorkExperience,
});
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1 class="text-2xl font-bold mb-4">Describe Your Work Experience</h1>
        <span class="text-gray-600 mb-4">Share your professional journey and achievements to highlight your expertise.</span>
        
        <div v-for="(form, index) in WorkExperienceForms" :key="index" class="w-full max-w-lg mb-8">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold">Work Experience {{ index + 1 }}</h2>
                <button v-if="WorkExperienceForms.length > 1" @click="removeWorkExperienceForm(index)" class="text-red-500">Remove</button>
            </div>
            
            <!-- Job Title -->
            <div class="mt-4">
                <label for="jobTitle" class="block text-sm font-medium leading-6 text-gray-900">
                    Job Title <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:account" :ssr="true" />
                        <input type="text" id="jobTitle" v-model="form.job_title" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                    </div>
                </div>
            </div>

            <div class="mt-4 flex flex-row space-x-4">
                <!-- Company Name -->
                <div class="w-1/2">
                    <label for="companyName" class="block text-sm font-medium leading-6 text-gray-900">
                        Company Name <span class="text-red-500">*</span>
                    </label>
                    <div class="mt-2">
                        <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:office-building" :ssr="true" />
                            <input type="text" id="companyName" v-model="form.company" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                    </div>
                </div>

                <!-- Website -->
                <div class="w-1/2">
                    <label for="website" class="block text-sm font-medium leading-6 text-gray-900">
                        Website <span class="text-red-500">*</span>
                    </label>
                    <div class="mt-2">
                        <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:web" :ssr="true" />
                            <input type="url" id="website" v-model="form.website" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
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

            <!-- Is Current -->
            <div class="mt-4">
                <label for="isCurrent" class="block text-sm font-medium leading-6 text-gray-900">
                    Is Current <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div class="flex items-center">
                        <input type="checkbox" id="isCurrent" v-model="form.is_current" class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
                        <label for="isCurrent" class="ml-2 block text-sm text-gray-900">Currently working here</label>
                    </div>
                </div>
            </div>

            <!-- End Month and End Year (conditionally rendered) -->
            <div v-if="!form.is_current" class="mt-4 flex flex-row space-x-4">
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

            <!-- Employment Type -->
            <div class="mt-4">
                <label for="employment" class="block text-sm font-medium leading-6 text-gray-900">
                    Employment Type <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:briefcase" :ssr="true" />
                        <select id="employment" v-model="form.employment" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                            <option value="" disabled>Select employment type</option>
                            <option v-for="(type, key) in EmploymentType" :key="key" :value="type">{{ _.capitalize(_.startCase(key)) }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <Button text="Add Work Experience" @click="addWorkExperienceForm" class="mt-4" type="button" foreground="white" background="primary" />
    </div>
</template>