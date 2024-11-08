<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { Education } from '~/types/models/Education';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { accountStore } from '~/store/accountStore';
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
const educationToDelete = ref<Education | null>(null);

interface FormValues {
    degree: string;
    country: string;
    description: string;
    start_month?: number;
    start_year?: number;
    end_month?: number;
    end_year?: number;
}

const initialValue: FormValues = {
    degree: '',
    country: '',
    description: '',
    start_month: undefined,
    start_year: undefined,
    end_month: undefined,
    end_year: undefined,
};

const form = ref<FormValues>({ ...initialValue });

const rules = {
    degree: {
        required: helpers.withMessage('Degree is required', required),
    },
    country: {
        required: helpers.withMessage('Country is required', required),
    },
    description: {
        required: helpers.withMessage('Description is required', required),
    },
    start_month: {
        required: helpers.withMessage('Start month is required', required),
    },
    start_year: {
        required: helpers.withMessage('Start year is required', required),
    },
    end_month: {
        required: helpers.withMessage('End month is required', required),
    },
    end_year: {
        required: helpers.withMessage('End year is required', required),
    },
};

const { formRef, v$ } = useValidation(form, rules);

const monthOptions = computed(() => moment.months().map((month, index) => index + 1));

const { account } = storeToRefs(accountStore());

const { sendRequest: submitEducation, pending: isSubmitting } = useSubmit<{ data: Education }, ApiErrorResponse>();
const { sendRequest: deleteEducation, pending: isDeleting } = useSubmit<null, ApiErrorResponse>();
const { data: educations, fetchData: fetchEducation, pending: isLoadingEducation } = useFetchData<{ data: Education[] }, ApiErrorResponse>();
const { data: currentEducation, fetchData: fetchEducationDetails, pending: isLoadingEducationDetails } = useFetchData<{ data: Education }, ApiErrorResponse>();

fetchEducation(`v1/accounts/${account.value?.id}/educations`);

const handleEdit = async (educationId: string) => {
    isEditing.value = true;
    isModalOpen.value = true;
    await fetchEducationDetails(`/v1/accounts/${account.value?.id}/educations/${educationId}`);

    if (currentEducation && currentEducation.value?.data) {
        form.value = {
            degree: currentEducation.value.data.degree,
            country: currentEducation.value.data.country,
            description: currentEducation.value.data.description,
            start_month: currentEducation.value.data.start_month,
            start_year: currentEducation.value.data.start_year,
            end_month: currentEducation.value.data.end_month ?? undefined,
            end_year: currentEducation.value.data.end_year ?? undefined,
        };
    }
};

const handleView = async (educationId: string) => {
    isViewModalOpen.value = true;
    await fetchEducationDetails(`/v1/accounts/${account.value?.id}/educations/${educationId}`);
};

const confirmDelete = (education: Education) => {
    educationToDelete.value = education;
    isDeleteModalOpen.value = true;
};

const handleDelete = async () => {
    if (!educationToDelete.value) return;

    try {
        await deleteEducation(`/v1/educations/${educationToDelete.value.id}`, {
            method: 'DELETE',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
        });

        // Refetch educations
        fetchEducation(`v1/accounts/${account.value?.id}/educations`);
        isDeleteModalOpen.value = false;
        educationToDelete.value = null;
    } catch (error) {
        console.error(error);
    }
};

const handleSubmit = async () => {
    v$.value.$touch();
    if (v$.value.$invalid) return;

    try {
        // Submit the education
        await submitEducation(isEditing.value ? `/v1/educations/${currentEducation.value?.data.id}` : '/v1/educations', {
            method: isEditing.value ? 'PUT' : 'POST',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
            body: JSON.stringify(form.value),
        });

        // Reset the form and state
        form.value = { ...initialValue };
        isModalOpen.value = false;
        isEditing.value = false;
        currentEducation.value = null;

        // Refetch educations
        fetchEducation(`v1/accounts/${account.value?.id}/educations`);
    } catch (error) {
        console.error(error);
    }
};
</script>

<template>
    <div v-if="isLoadingEducation" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div v-for="n in 6" :key="n" class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div class="w-full h-48 bg-gray-200"></div>
            <div class="p-4">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
        </div>
    </div>
    <div v-else-if="educations?.data && educations.data.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div v-for="education in educations.data" :key="education.id"
            class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900">{{ education.degree }}</h3>
                <p class="mt-2 text-sm text-gray-600"><strong>Country: </strong>{{ education.country }}</p>
                <p class="mt-2 text-sm text-gray-600"><strong>Start Date:</strong>{{ education.start_month }}/{{
                    education.start_year }} <strong>End Date: </strong>{{ education.end_month }}/{{ education.end_year
                    }}</p>
                <p class="mt-4 text-sm text-gray-600">{{ education.description }}</p>
                <div class="flex flex-row gap-5 mt-4">
                    <button @click="handleView(String(education.id))"
                        class="inline-block text-primary hover:text-primary-dark transition-colors">View</button>
                    <button @click="handleEdit(String(education.id))"
                        class="inline-block text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
                    <button @click="confirmDelete(education)"
                        class="inline-block text-red-600 hover:text-red-800 transition-colors">Delete</button>
                </div>
            </div>
        </div>
        <div class="flex justify-center items-center rounded-lg border border-primary border-dashed p-4">
            <button @click="isModalOpen = true"
                class="bg-primary-600 text-primary px-4 py-2 rounded-md hover:bg-primary-700 flex items-center transition-colors">
                <Icon icon="mdi:plus" class="mr-2" width="20" height="20" />
                Add Education
            </button>
        </div>
    </div>
    <div v-else class="flex justify-center flex-col items-center py-5">
        <Icon icon="system-uicons:folder-add" width="50" height="50" class="text-primary sm:w-50 sm:h-50" />
        <h3 class="mt-2 text-sm font-semibold text-gray-900">No education</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by adding your education.</p>
        <div class="mt-6 flex justify-center">
            <Button @click="isModalOpen = true" text="New Education" type="button" foreground="white"
                background="primary" />
        </div>
    </div>

    <Modal :modelValue="isModalOpen" @update:modelValue="isModalOpen = $event">
        <template #title>
            {{ isEditing ? 'Edit Education' : 'Add Education' }}
        </template>
        <template #content>
            <form class="w-full max-w-lg text-start">

                <!-- Degree -->
                <div class="mt-4">
                    <label for="degree" class="block text-sm font-medium leading-6 text-gray-900">
                        Degree <span class="text-red-500">*</span>
                    </label>
                    <div class="mt-2">
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:school" :ssr="true" />
                            <input type="text" id="degree" v-model="formRef.degree"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                        <span v-if="v$.degree.$error" class="text-red-900 text-sm">{{
                            v$.degree.$errors[0].$message }}</span>
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
                        <span v-if="v$.country.$error" class="text-red-900 text-sm">{{
                            v$.country.$errors[0].$message }}</span>
                    </div>
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
                        <span v-if="v$.description.$error" class="text-red-900 text-sm">{{
                            v$.description.$errors[0].$message }}</span>
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

                <!-- End Month and End Year -->
                <div class="mt-4 flex flex-row space-x-4">
                    <!-- End Month -->
                    <div class="w-1/2">
                        <label for="startMonth" class="block text-sm font-medium leading-6 text-gray-900">
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
                        <label for="startYear" class="block text-sm font-medium leading-6 text-gray-900">
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
            </form>
        </template>
        <template #actions>
            <div class="flex justify-end space-x-2">
                <Button type="button" text="Cancel" background="white" foreground="black" :is-wide="false" @click="{
                    isModalOpen = false;
                    form = { ...initialValue };
                }"></Button>
                <Button type="button" text="Save" background="primary" foreground="white" :is-wide="false"
                    @click="handleSubmit" :is-loading="isSubmitting"></Button>
            </div>
        </template>
    </Modal>

    <Modal :modelValue="isViewModalOpen" @update:modelValue="isViewModalOpen = $event">
        <template #title>
            <div class="flex items-center space-x-2 justify-center">
                <Icon icon="mdi:school" class="text-primary-600" width="24" height="24" />
                <span>View Education</span>
            </div>
        </template>
        <template #content>
            <div v-if="isLoadingEducationDetails" class="animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div class="h-48 bg-gray-200 rounded"></div>
            </div>
            <div v-else-if="currentEducation" class="space-y-4 text-left">
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:school" class="text-primary-600" width="20" height="20" />
                        <span>Degree</span>
                    </label>
                    <div class="mt-1 text-lg font-semibold text-gray-900">
                        {{ currentEducation.data.degree }}
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500">Country</label>
                    <div class="mt-1 text-sm text-gray-900">
                        {{ currentEducation.data.country }}
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:note-text" class="text-primary-600" width="20" height="20" />
                        <span>Description</span>
                    </label>
                    <div class="mt-1 text-sm text-gray-900">
                        {{ currentEducation.data.description }}
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:calendar" class="text-primary-600" width="20" height="20" />
                        <span>Start Date</span>
                    </label>
                    <div class="mt-1 text-sm text-gray-900">
                        {{ currentEducation.data.start_month }}/{{ currentEducation.data.start_year }}
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:calendar" class="text-primary-600" width="20" height="20" />
                        <span>End Date</span>
                    </label>
                    <div class="mt-1 text-sm text-gray-900">
                        {{ currentEducation.data.end_month }}/{{ currentEducation.data.end_year }}
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
            <p>Are you sure you want to delete this education?</p>
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