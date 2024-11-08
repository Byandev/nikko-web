<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { WorkExperience } from '~/types/models/WorkExperience';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { accountStore } from '~/store/accountStore';
import { EmploymentType } from '~/types/models/WorkExperience';
import _ from 'lodash';
import moment from 'moment';
import { helpers, required } from '@vuelidate/validators';
import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

const isModalOpen = ref(false);
const isViewModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isEditing = ref(false);
const workExperienceToDelete = ref<WorkExperience | null>(null);

const monthOptions = computed(() => moment.months().map((month, index) => index + 1));

interface FormValues {
    job_title: string;
    company: string;
    website: string;
    country: string;
    description: string;
    start_month?: number;
    start_year?: number;
    employment: string;
    is_current: boolean;
    end_month?: number;
    end_year?: number;
}

const initialValue: FormValues = {
    job_title: '',
    company: '',
    website: '',
    country: '',
    description: '',
    start_month: undefined,
    start_year: undefined,
    employment: '',
    is_current: false,
    end_month: undefined,
    end_year: undefined,
};

const form = ref<FormValues>({ ...initialValue });

const rules = {
    job_title: { required: helpers.withMessage('Job title is required', required) },
    company: { required: helpers.withMessage('Company name is required', required) },
    website: { required: helpers.withMessage('Website is required', required) },
    country: { required: helpers.withMessage('Country is required', required) },
    description: { required: helpers.withMessage('Description is required', required) },
    start_month: { required: helpers.withMessage('Start month is required', required) },
    start_year: { required: helpers.withMessage('Start year is required', required) },
    employment: { required: helpers.withMessage('Employment type is required', required) },
    end_month: { 
        required: form.value.is_current ? null : helpers.withMessage('End month is required', required)
    },
    end_year: { 
        required: form.value.is_current ? null : helpers.withMessage('End year is required', required)
    },
};

const { formRef, v$ } = useValidation(form, rules);

const { account } = storeToRefs(accountStore());

const { sendRequest: submitWorkExperience, pending: isSubmitting } = useSubmit<{ data: WorkExperience }, ApiErrorResponse>();
const { sendRequest: deleteWorkExperience, pending: isDeleting } = useSubmit<null, ApiErrorResponse>();
const { data: workExperiences, fetchData: fetchWorkExperience, pending: isLoadingWorkExperience } = useFetchData<{ data: WorkExperience[] }, ApiErrorResponse>();
const { data: currentWorkExperience, fetchData: fetchWorkExperienceDetails, pending: isLoadingWorkExperienceDetails } = useFetchData<{ data: WorkExperience }, ApiErrorResponse>();

fetchWorkExperience(`v1/accounts/${account.value?.id}/work-experiences`);

const handleEdit = async (workExperienceId: string) => {
    isEditing.value = true;
    isModalOpen.value = true;
    await fetchWorkExperienceDetails(`/v1/accounts/${account.value?.id}/work-experiences/${workExperienceId}`);

    if (currentWorkExperience && currentWorkExperience.value?.data) {
        form.value = {
            job_title: currentWorkExperience.value.data.job_title,
            company: currentWorkExperience.value.data.company,
            website: currentWorkExperience.value.data.website,
            country: currentWorkExperience.value.data.country,
            description: currentWorkExperience.value.data.description,
            start_month: currentWorkExperience.value.data.start_month,
            start_year: currentWorkExperience.value.data.start_year,
            employment: currentWorkExperience.value.data.employment,
            is_current: currentWorkExperience.value.data.is_current,
            end_month: currentWorkExperience.value.data.end_month ?? undefined,
            end_year: currentWorkExperience.value.data.end_year ?? undefined,
        };
    }
};

const handleView = async (workExperienceId: string) => {
    isViewModalOpen.value = true;
    await fetchWorkExperienceDetails(`/v1/accounts/${account.value?.id}/work-experiences/${workExperienceId}`);
};

const confirmDelete = (workExperience: WorkExperience) => {
    workExperienceToDelete.value = workExperience;
    isDeleteModalOpen.value = true;
};

const handleDelete = async () => {
    if (!workExperienceToDelete.value) return;

    try {
        await deleteWorkExperience(`/v1/work-experiences/${workExperienceToDelete.value.id}`, {
            method: 'DELETE',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
        });

        // Refetch work experiences
        fetchWorkExperience(`v1/accounts/${account.value?.id}/work-experiences`);
        isDeleteModalOpen.value = false;
        workExperienceToDelete.value = null;
    } catch (error) {
        console.error(error);
    }
};

const submitForm = async () => {
    v$.value.$touch();
    console.log(v$.value.$errors);
    if (v$.value.$invalid) return;

    try {

        const body = {
            job_title: form.value.job_title,
            company: form.value.company,
            website: form.value.website,
            country: form.value.country,
            description: form.value.description,
            start_month: form.value.start_month,
            start_year: form.value.start_year,
            employment: form.value.employment,
            is_current: form.value.is_current,
            ...(form.value.is_current ? {} : { end_month: form.value.end_month, end_year: form.value.end_year })
        };
        // Submit the work experience
        await submitWorkExperience(isEditing.value ? `/v1/work-experiences/${currentWorkExperience.value?.data.id}` : '/v1/work-experiences', {
            method: isEditing.value ? 'PUT' : 'POST',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
            body: JSON.stringify(body),
        });

        // Reset the form and state
        form.value = { ...initialValue };
        isModalOpen.value = false;
        isEditing.value = false;
        currentWorkExperience.value = null;

        // Refetch work experiences
        fetchWorkExperience(`v1/accounts/${account.value?.id}/work-experiences`);
    } catch (error) {
        console.error(error);
    }
};
</script>

<template>
    <div v-if="isLoadingWorkExperience" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div v-for="n in 6" :key="n" class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div class="w-full h-48 bg-gray-200"></div>
            <div class="p-4">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
        </div>
    </div>
    <div v-else-if="workExperiences?.data && workExperiences.data.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div v-for="workExperience in workExperiences.data" :key="workExperience.id"
            class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900">{{ workExperience.job_title }}</h3>
                <p class="mt-2 text-sm text-gray-600"><strong>Company: </strong>{{ workExperience.company }}</p>
                <p class="mt-2 text-sm text-gray-600"><strong>Employment: </strong>{{
                    _.capitalize(_.startCase(workExperience.employment)) }}</p>
                <p class="mt-2 text-sm text-gray-600"><strong>Location: </strong>{{ workExperience.country }}</p>
                <p class="mt-2 text-sm text-gray-600"><strong>Website: </strong>{{ workExperience.website }}</p>
                <p class="mt-2 text-sm text-gray-600"><strong>Start Date:</strong>{{ workExperience.start_month }}/{{
                    workExperience.start_year }} <strong>End Date: </strong>{{ workExperience.is_current ? 'Present' :
                    `${workExperience.end_month}/${workExperience.end_year}` }}</p>
                <p class="mt-4 text-sm text-gray-600"><strong></strong>{{ workExperience.description }}</p>
                <div class="flex flex-row gap-5 mt-4">
                    <button @click="handleView(String(workExperience.id))"
                        class="inline-block text-primary hover:text-primary-dark transition-colors">View</button>
                    <button @click="handleEdit(String(workExperience.id))"
                        class="inline-block text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
                    <button @click="confirmDelete(workExperience)"
                        class="inline-block text-red-600 hover:text-red-800 transition-colors">Delete</button>
                </div>
            </div>
        </div>
        <div class="flex justify-center items-center rounded-lg border border-primary border-dashed p-4">
            <button @click="isModalOpen = true"
                class="bg-primary-600 text-primary px-4 py-2 rounded-md hover:bg-primary-700 flex items-center transition-colors">
                <Icon icon="mdi:plus" class="mr-2" width="20" height="20" />
                Add Work Experience
            </button>
        </div>
    </div>
    <div v-else class="flex justify-center flex-col items-center py-5">
        <Icon icon="system-uicons:folder-add" width="50" height="50" class="text-primary sm:w-50 sm:h-50" />
        <h3 class="mt-2 text-sm font-semibold text-gray-900">No work experience</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by adding your work experience.</p>
        <div class="mt-6 flex justify-center">
            <Button @click="isModalOpen = true" text="New Work Experience" type="button" foreground="white"
                background="primary" />
        </div>
    </div>

    <Modal :modelValue="isModalOpen" @update:modelValue="isModalOpen = $event">
        <template #title>
            {{ isEditing ? 'Edit Work Experience' : 'Add Work Experience' }}
        </template>
        <template #content>
            <form class="max-w-lg w-full space-y-4 text-left">

                <!-- Job Title -->
                <div class="mt-4">
                    <label for="jobTitle" class="block text-sm font-medium leading-6 text-gray-900">
                        Job Title <span class="text-red-500">*</span>
                    </label>
                    <div class="mt-2">
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:account" :ssr="true" />
                            <input type="text" id="jobTitle" v-model="formRef.job_title"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                    </div>
                    <span v-if="v$.job_title.$error" class="text-red-900 text-sm">{{
                        v$.job_title.$errors[0].$message }}</span>
                </div>

                <div class="mt-4 flex flex-row space-x-4">
                    <!-- Company Name -->
                    <div class="w-1/2">
                        <label for="companyName" class="block text-sm font-medium leading-6 text-gray-900">
                            Company Name <span class="text-red-500">*</span>
                        </label>
                        <div class="mt-2">
                            <div
                                class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                                <Icon icon="mdi:office-building" :ssr="true" />
                                <input type="text" id="companyName" v-model="formRef.company"
                                    class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                            </div>
                        </div>
                        <span v-if="v$.company.$error" class="text-red-900 text-sm">{{
                            v$.company.$errors[0].$message }}</span>
                    </div>

                    <!-- Website -->
                    <div class="w-1/2">
                        <label for="website" class="block text-sm font-medium leading-6 text-gray-900">
                            Website <span class="text-red-500">*</span>
                        </label>
                        <div class="mt-2">
                            <div
                                class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                                <Icon icon="mdi:web" :ssr="true" />
                                <input type="url" id="website" v-model="formRef.website"
                                    class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                            </div>
                        </div>
                        <span v-if="v$.website.$error" class="text-red-900 text-sm">{{
                            v$.website.$errors[0].$message }}</span>
                    </div>
                </div>

                <!-- Country -->
                <div class="mt-4">
                    <label for="country" class="block text-sm font-medium leading-6 text-gray-900">
                        Country <span class="text-red-500">*</span>
                    </label>
                    <div class="mt-2">
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <Icon icon="mdi:earth" :ssr="true" />
                            <input type="text" id="country" name="country" v-model="formRef.country"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                    </div>
                    <span v-if="v$.country.$error" class="text-red-900 text-sm">{{
                        v$.country.$errors[0].$message }}</span>
                </div>

                <!-- Description -->
                <div class="mt-4">
                    <label for="description" class="block text-sm font-medium leading-6 text-gray-900">
                        Description <span class="text-red-500">*</span>
                    </label>
                    <div class="mt-2">
                        <div
                            class="flex flex-row items-start px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:note-text" :ssr="true" />
                            <textarea id="description" v-model="formRef.description" rows="4"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0"></textarea>
                        </div>
                    </div>
                    <span v-if="v$.description.$error" class="text-red-900 text-sm">{{
                        v$.description.$errors[0].$message }}</span>
                </div>

                <!-- Start Month and Start Year -->
                <div class="mt-4 flex flex-row space-x-4">
                    <!-- Start Month -->
                    <div class="w-1/2">
                        <label for="startMonth" class="block text-sm font-medium leading-6 text-gray-900">
                            Start Month <span class="text-red-500">*</span>
                        </label>
                        <div class="mt-2">
                            <Listbox v-model="formRef.start_month" class="ring-1 ring-gray-300 rounded-md">
                                <div class="relative mt-1">
                                    <ListboxButton
                                        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span class="block truncate">
                                            <span>
                                                <span v-if="!formRef.start_month">Select Month</span>
                                                <span v-else>
                                                    {{ formRef.start_month }}
                                                </span>
                                            </span>
                                        </span>
                                        <span
                                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </span>
                                    </ListboxButton>

                                    <transition leave-active-class="transition duration-100 ease-in"
                                        leave-from-class="opacity-100" leave-to-class="opacity-0">
                                        <ListboxOptions
                                            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                            <ListboxOption v-for="(month, index) in monthOptions"
                                                v-slot="{ active, selected }" :key="index" :value="month" as="template">
                                                <li
                                                    :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                                                    <span
                                                        :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                                                        month
                                                        }}</span>
                                                    <span v-if="selected"
                                                        class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                </li>
                                            </ListboxOption>
                                        </ListboxOptions>
                                    </transition>
                                </div>
                            </Listbox>
                            <span v-if="v$.start_month.$error" class="text-red-900 text-sm">{{
                                v$.start_month.$errors[0].$message }}</span>
                        </div>
                    </div>

                    <!-- Start Year -->
                    <div class="w-1/2">
                        <label for="startYear" class="block text-sm font-medium leading-6 text-gray-900">
                            Start Year <span class="text-red-500">*</span>
                        </label>
                        <div class="mt-2">
                            <Listbox v-model="formRef.start_year" class="ring-1 ring-gray-300 rounded-md">
                                <div class="relative mt-1">
                                    <ListboxButton
                                        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span class="block truncate">
                                            <span>
                                                <span v-if="!formRef.start_year">Select Year</span>
                                                <span v-else>
                                                    {{ formRef.start_year }}
                                                </span>
                                            </span>
                                        </span>
                                        <span
                                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </span>
                                    </ListboxButton>

                                    <transition leave-active-class="transition duration-100 ease-in"
                                        leave-from-class="opacity-100" leave-to-class="opacity-0">
                                        <ListboxOptions
                                            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                            <ListboxOption v-for="(year, index) in _.range(2000, 2025)"
                                                v-slot="{ active, selected }" :key="index" :value="year" as="template">
                                                <li
                                                    :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                                                    <span
                                                        :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                                                        year
                                                        }}</span>
                                                    <span v-if="selected"
                                                        class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                </li>
                                            </ListboxOption>
                                        </ListboxOptions>
                                    </transition>
                                </div>
                            </Listbox>
                            <span v-if="v$.start_year.$error" class="text-red-900 text-sm">{{
                                v$.start_year.$errors[0].$message }}</span>
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
                            <input type="checkbox" id="isCurrent" v-model="formRef.is_current"
                                class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
                            <label for="isCurrent" class="ml-2 block text-sm text-gray-900">Currently working
                                here</label>
                        </div>
                    </div>
                </div>

                <!-- End Month and End Year (conditionally rendered) -->
                <div v-if="!formRef.is_current" class="mt-4 flex flex-row space-x-4">
                    <!-- End Month -->
                    <div class="w-1/2">
                        <label for="endMonth" class="block text-sm font-medium leading-6 text-gray-900">
                            End Month <span class="text-red-500">*</span>
                        </label>
                        <div class="mt-2">
                            <Listbox v-model="formRef.end_month" class="ring-1 ring-gray-300 rounded-md">
                                <div class="relative mt-1">
                                    <ListboxButton
                                        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span class="block truncate">
                                            <span>
                                                <span v-if="!formRef.end_month">Select Month</span>
                                                <span v-else>
                                                    {{ formRef.end_month }}
                                                </span>
                                            </span>
                                        </span>
                                        <span
                                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </span>
                                    </ListboxButton>

                                    <transition leave-active-class="transition duration-100 ease-in"
                                        leave-from-class="opacity-100" leave-to-class="opacity-0">
                                        <ListboxOptions
                                            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                            <ListboxOption v-for="(month, index) in monthOptions"
                                                v-slot="{ active, selected }" :key="index" :value="month" as="template">
                                                <li
                                                    :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                                                    <span
                                                        :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                                                        month
                                                        }}</span>
                                                    <span v-if="selected"
                                                        class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                </li>
                                            </ListboxOption>
                                        </ListboxOptions>
                                    </transition>
                                </div>
                            </Listbox>
                            <span v-if="v$.end_month.$error" class="text-red-900 text-sm">{{
                                v$.end_month.$errors[0].$message }}</span>
                        </div>
                    </div>

                    <!-- End Year -->
                    <div class="w-1/2">
                        <label for="endYear" class="block text-sm font-medium leading-6 text-gray-900">
                            End Year <span class="text-red-500">*</span>
                        </label>
                        <div class="mt-2">
                            <Listbox v-model="formRef.end_year" class="ring-1 ring-gray-300 rounded-md">
                                <div class="relative mt-1">
                                    <ListboxButton
                                        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span class="block truncate">
                                            <span>
                                                <span v-if="!formRef.end_year">Select Year</span>
                                                <span v-else>
                                                    {{ formRef.end_year }}
                                                </span>
                                            </span>
                                        </span>
                                        <span
                                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </span>
                                    </ListboxButton>

                                    <transition leave-active-class="transition duration-100 ease-in"
                                        leave-from-class="opacity-100" leave-to-class="opacity-0">
                                        <ListboxOptions
                                            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                            <ListboxOption v-for="(year, index) in _.range(2000, 2025)"
                                                v-slot="{ active, selected }" :key="index" :value="year" as="template">
                                                <li
                                                    :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                                                    <span
                                                        :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                                                        year
                                                        }}</span>
                                                    <span v-if="selected"
                                                        class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                </li>
                                            </ListboxOption>
                                        </ListboxOptions>
                                    </transition>
                                </div>
                            </Listbox>
                            <span v-if="v$.end_year.$error" class="text-red-900 text-sm">{{
                                v$.end_year.$errors[0].$message }}</span>
                        </div>
                    </div>
                </div>

                <!-- Employment Type -->
                <div class="mt-4">
                    <label for="employment" class="block text-sm font-medium leading-6 text-gray-900">
                        Employment Type <span class="text-red-500">*</span>
                    </label>
                    <div class="mt-2">
                        <Listbox v-model="formRef.employment" class="ring-1 ring-gray-300 rounded-md">
                            <div class="relative mt-1">
                                <ListboxButton
                                    class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                    <span class="block truncate">
                                        <span>
                                            <span v-if="!formRef.employment">Select Employment</span>
                                            <span v-else>
                                                {{ _.capitalize(_.startCase(formRef.employment)) }}
                                            </span>
                                        </span>
                                    </span>
                                    <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </ListboxButton>

                                <transition leave-active-class="transition duration-100 ease-in"
                                    leave-from-class="opacity-100" leave-to-class="opacity-0">
                                    <ListboxOptions
                                        class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                        <ListboxOption v-for="(type, index) in EmploymentType"
                                            v-slot="{ active, selected }" :key="index" :value="type" as="template">
                                            <li
                                                :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                                                <span
                                                    :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                                                        _.capitalize(_.startCase(type))
                                                    }}</span>
                                                <span v-if="selected"
                                                    class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            </li>
                                        </ListboxOption>
                                    </ListboxOptions>
                                </transition>
                            </div>
                        </Listbox>
                        <span v-if="v$.employment.$error" class="text-red-900 text-sm">{{
                            v$.employment.$errors[0].$message }}</span>
                    </div>
                </div>
            </form>
        </template>
        <template #actions>
            <div class="flex justify-end space-x-2">
                <Button type="button" text="Cancel" background="white" foreground="black" :is-wide="false" @click="{
                    isModalOpen = false;
                    form = { ...initialValue };
                }"></Button>
                <Button type="button" text="Save" background="primary" foreground="white" :is-wide="false"
                    @click="submitForm" :is-loading="isSubmitting"></Button>
            </div>
        </template>
    </Modal>

    <Modal :modelValue="isViewModalOpen" @update:modelValue="isViewModalOpen = $event">
        <template #title>
            <div class="flex items-center space-x-2 justify-center">
                <Icon icon="mdi:briefcase" class="text-primary-600" width="24" height="24" />
                <span>View Work Experience</span>
            </div>
        </template>
        <template #content>
            <div v-if="isLoadingWorkExperienceDetails" class="animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div class="h-48 bg-gray-200 rounded"></div>
            </div>
            <div v-else-if="currentWorkExperience" class="space-y-4 text-left">
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:account" class="text-primary-600" width="20" height="20" />
                        <span>Job Title</span>
                    </label>
                    <div class="mt-1 text-lg font-semibold text-gray-900">
                        {{ currentWorkExperience.data.job_title }}
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500">Company & Website</label>
                    <div class="mt-1 text-sm text-gray-900 flex space-x-4">
                        <div class="w-1/2">
                            <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Icon icon="mdi:office-building" class="text-primary-600" width="20" height="20" />
                                <span>Company</span>
                            </label>
                            <div class="mt-1 text-sm text-gray-900">
                                <div>{{ currentWorkExperience.data.company }}</div>
                            </div>
                        </div>
                        <div class="w-1/2">
                            <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Icon icon="mdi:web" class="text-primary-600" width="20" height="20" />
                                <span>Website</span>
                            </label>
                            <div class="mt-1 text-sm text-gray-900">
                                <a :href="currentWorkExperience.data.website" target="_blank"
                                    class="text-primary-600 hover:text-primary-800">{{
                                    currentWorkExperience.data.website }}</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500">Country & Employment</label>
                    <div class="mt-1 text-sm text-gray-900 flex space-x-4">
                        <div class="w-1/2">
                            <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Icon icon="mdi:earth" class="text-primary-600" width="20" height="20" />
                                <span>Country</span>
                            </label>
                            <div class="mt-1 text-sm text-gray-900">
                                <div>{{ currentWorkExperience.data.country }}</div>
                            </div>
                        </div>
                        <div class="w-1/2">
                            <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Icon icon="mdi:briefcase" class="text-primary-600" width="20" height="20" />
                                <span>Employment</span>
                            </label>
                            <div class="mt-1 text-sm text-gray-900">
                                <div>{{ _.capitalize(_.startCase(currentWorkExperience.data.employment)) }}</div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:note-text" class="text-primary-600" width="20" height="20" />
                        <span>Description</span>
                    </label>
                    <div class="mt-1 text-sm text-gray-900">
                        {{ currentWorkExperience.data.description }}
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:calendar" class="text-primary-600" width="20" height="20" />
                        <span>Start Date</span>
                    </label>
                    <div class="mt-1 text-sm text-gray-900">
                        {{ currentWorkExperience.data.start_month }}/{{ currentWorkExperience.data.start_year }}
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:check-circle" class="text-primary-600" width="20" height="20" />
                        <span>Is Current</span>
                    </label>
                    <div class="mt-1 text-sm text-gray-900">
                        {{ currentWorkExperience.data.is_current ? 'Yes' : 'No' }}
                    </div>
                </div>
                <div v-if="!currentWorkExperience.data.is_current" class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:calendar" class="text-primary-600" width="20" height="20" />
                        <span>End Date</span>
                    </label>
                    <div class="mt-1 text-sm text-gray-900">
                        {{ currentWorkExperience.data.end_month }}/{{ currentWorkExperience.data.end_year }}
                    </div>
                </div>
            </div>
        </template>
        <template #actions>
            <div class="flex justify-end space-x-2">
                <Button type="button" text="Close" background="white" foreground="black" :is-wide="false"
                    @click="isViewModalOpen = false"></Button>
            </div>
        </template>
    </Modal>

    <Modal :modelValue="isDeleteModalOpen" @update:modelValue="isDeleteModalOpen = $event">
        <template #title>
            Confirm Delete
        </template>
        <template #content>
            <p>Are you sure you want to delete this work experience?</p>
        </template>
        <template #actions>
            <div class="flex justify-end space-x-2">
                <Button type="button" text="Cancel" background="white" foreground="black" :is-wide="false"
                    @click="isDeleteModalOpen = false"></Button>
                <Button type="button" text="Delete" background="red" foreground="primary" :is-wide="false"
                    @click="handleDelete" :is-loading="isDeleting"></Button>
            </div>
        </template>
    </Modal>
</template>
