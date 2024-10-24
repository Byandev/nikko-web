<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { Education } from '~/types/models/Education';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { accountStore } from '~/store/accountStore';
import _ from 'lodash';

const isModalOpen = ref(false);
const isViewModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isEditing = ref(false);
const educationToDelete = ref<Education | null>(null);

interface FormValues {
    degree: string;
    country: string;
    description: string;
    start_month: number;
    start_year: number;
    end_month?: number;
    end_year?: number;
}

const initialValue: FormValues = {
    degree: '',
    country: '',
    description: '',
    start_month: 0,
    start_year: 0,
    end_month: undefined,
    end_year: undefined,
};

const form = ref<FormValues>({ ...initialValue });

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
        <div v-for="education in educations.data" :key="education.id" class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900">{{ education.degree }}</h3>
                <p class="mt-2 text-sm text-gray-600"><strong>Country: </strong>{{ education.country }}</p>
                <p class="mt-2 text-sm text-gray-600"><strong>Start Date:</strong>{{ education.start_month }}/{{ education.start_year }} <strong>End Date: </strong>{{ education.end_month }}/{{ education.end_year }}</p>
                <p class="mt-4 text-sm text-gray-600">{{ education.description }}</p>
                <div class="flex flex-row gap-5 mt-4">
                    <button @click="handleView(String(education.id))" class="inline-block text-primary hover:text-primary-dark transition-colors">View</button>
                    <button @click="handleEdit(String(education.id))" class="inline-block text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
                    <button @click="confirmDelete(education)" class="inline-block text-red-600 hover:text-red-800 transition-colors">Delete</button>
                </div>
            </div>
        </div>
        <div class="flex justify-center items-center rounded-lg border border-primary border-dashed p-4">
            <button @click="isModalOpen = true" class="bg-primary-600 text-primary px-4 py-2 rounded-md hover:bg-primary-700 flex items-center transition-colors">
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
            <Button @click="isModalOpen=true" text="New Education" type="button" foreground="white" background="primary"/>
        </div>
    </div>
    
    <Modal :modelValue="isModalOpen" @update:modelValue="isModalOpen = $event">
        <template #title>
            {{ isEditing ? 'Edit Education' : 'Add Education' }}
        </template>
        <template #content>
            <form class="space-y-4 text-left">
                <div class="sm:col-span-2">
                    <label for="degree" class="text-sm font-medium text-gray-500">Degree</label>
                    <div class="mt-1 text-sm text-gray-900">
                        <input v-model="form.degree" type="text" id="degree" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label for="country" class="text-sm font-medium text-gray-500">Country</label>
                    <div class="mt-1 text-sm text-gray-900">
                        <input v-model="form.country" type="text" id="country" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label for="description" class="text-sm font-medium text-gray-500">Description</label>
                    <div class="mt-1 text-sm text-gray-900">
                        <textarea v-model="form.description" id="description" rows="3" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label for="start_date" class="text-sm font-medium text-gray-500">Start Date</label>
                    <div class="mt-1 text-sm text-gray-900 flex space-x-4">
                        <div class="w-1/2">
                            <input v-model="form.start_month" type="number" id="start_month" placeholder="Month" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                        </div>
                        <div class="w-1/2">
                            <input v-model="form.start_year" type="number" id="start_year" placeholder="Year" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                        </div>
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label for="end_date" class="text-sm font-medium text-gray-500">End Date</label>
                    <div class="mt-1 text-sm text-gray-900 flex space-x-4">
                        <div class="w-1/2">
                            <input v-model="form.end_month" type="number" id="end_month" placeholder="Month" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                        </div>
                        <div class="w-1/2">
                            <input v-model="form.end_year" type="number" id="end_year" placeholder="Year" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                        </div>
                    </div>
                </div>
            </form>
        </template>
        <template #actions>
            <div class="flex justify-end space-x-2">
                <Button type="button" text="Cancel" background="white" foreground="black" 
                        :is-wide="false" @click="{isModalOpen = false;
                        form = { ...initialValue };
                        }"></Button>
                <Button type="button" text="Save" background="primary" foreground="white"
                        :is-wide="false" @click="handleSubmit" :is-loading="isSubmitting"></Button>
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
                <Button type="button" text="Close" background="white" foreground="black" 
                        :is-wide="false" @click="isViewModalOpen = false"></Button>
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
                <Button type="button" text="Cancel" background="white" foreground="black" 
                        :is-wide="false" @click="isDeleteModalOpen = false"></Button>
                <Button type="button" text="Delete" background="red" foreground="primary"
                        :is-wide="false" @click="handleDelete" :is-loading="isDeleting"></Button>
            </div>
        </template>
    </Modal>
</template>