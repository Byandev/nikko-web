<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { WorkExperience } from '~/types/models/WorkExperience';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { accountStore } from '~/store/accountStore';
import { EmploymentType } from '~/types/models/WorkExperience';
import _ from 'lodash';

const isModalOpen = ref(false);
const isViewModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isEditing = ref(false);
const workExperienceToDelete = ref<WorkExperience | null>(null);

interface FormValues {
    job_title: string;
    company: string;
    website: string;
    country: string;
    description: string;
    start_month: number;
    start_year: number;
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
    start_month: 0,
    start_year: 0,
    employment: '',
    is_current: false,
    end_month: undefined,
    end_year: undefined,
};

const form = ref<FormValues>({ ...initialValue });

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

const handleSubmit = async () => {
    try {
        // Submit the work experience
        await submitWorkExperience(isEditing.value ? `/v1/work-experiences/${currentWorkExperience.value?.data.id}` : '/v1/work-experiences', {
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
    <div v-else-if="workExperiences?.data && workExperiences.data.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div v-for="workExperience in workExperiences.data" :key="workExperience.id" class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900">{{ workExperience.job_title }}</h3>
                <p class="mt-2 text-sm text-gray-600"><strong>Company: </strong>{{ workExperience.company }}</p>
                <p class="mt-2 text-sm text-gray-600"><strong>Employment: </strong>{{ _.capitalize(_.startCase(workExperience.employment)) }}</p>
                <p class="mt-2 text-sm text-gray-600"><strong>Location: </strong>{{ workExperience.country }}</p>
                <p class="mt-2 text-sm text-gray-600"><strong>Website: </strong>{{ workExperience.website }}</p>
                <p class="mt-2 text-sm text-gray-600"><strong>Start Date:</strong>{{ workExperience.start_month }}/{{ workExperience.start_year }} <strong>End Date: </strong>{{ workExperience.is_current ? 'Present' : `${workExperience.end_month}/${workExperience.end_year}` }}</p>
                <p class="mt-4 text-sm text-gray-600"><strong></strong>{{ workExperience.description }}</p>
                <div class="flex flex-row gap-5 mt-4">
                    <button @click="handleView(String(workExperience.id))" class="inline-block text-primary hover:text-primary-dark transition-colors">View</button>
                    <button @click="handleEdit(String(workExperience.id))" class="inline-block text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
                    <button @click="confirmDelete(workExperience)" class="inline-block text-red-600 hover:text-red-800 transition-colors">Delete</button>
                </div>
            </div>
        </div>
        <div class="flex justify-center items-center rounded-lg border border-primary border-dashed p-4">
            <button @click="isModalOpen = true" class="bg-primary-600 text-primary px-4 py-2 rounded-md hover:bg-primary-700 flex items-center transition-colors">
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
            <Button @click="isModalOpen=true" text="New Work Experience" type="button" foreground="white" background="primary"/>
        </div>
    </div>
    
    <Modal :modelValue="isModalOpen" @update:modelValue="isModalOpen = $event">
            <template #title>
                    {{ isEditing ? 'Edit Work Experience' : 'Add Work Experience' }}
            </template>
            <template #content>
                    <form class="space-y-4 text-left">
                        <div class="sm:col-span-2">
                            <label for="job_title" class="text-sm font-medium text-gray-500">Job Title</label>
                            <div class="mt-1 text-sm text-gray-900">
                                <input v-model="form.job_title" type="text" id="job_title" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                            </div>
                        </div>
                        <div class="sm:col-span-2">
                            <label for="company_website" class="text-sm font-medium text-gray-500">Company & Website</label>
                            <div class="mt-1 text-sm text-gray-900 flex space-x-4">
                                <div class="w-1/2">
                                    <input v-model="form.company" type="text" id="company" placeholder="Company" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                                </div>
                                <div class="w-1/2">
                                    <input v-model="form.website" type="url" id="website" placeholder="Website" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                                </div>
                            </div>
                        </div>
                        <div class="sm:col-span-2">
                            <label for="country_employment" class="text-sm font-medium text-gray-500">Country & Employment</label>
                            <div class="mt-1 text-sm text-gray-900 flex space-x-4">
                                <div class="w-1/2">
                                    <input v-model="form.country" type="text" id="country" placeholder="Country" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                                </div>
                                <div class="w-1/2">
                                    <select v-model="form.employment" id="employment" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                                        <option value="" disabled>Select employment type</option>
                                        <option v-for="employmentType in Object.values(EmploymentType).map(type => _.capitalize(_.startCase(type)))" :key="employmentType" :value="employmentType">{{ employmentType }}</option>
                                    </select>
                                </div>
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
                            <label for="is_current" class="text-sm font-medium text-gray-500">Is Current</label>
                            <div class="mt-1 text-sm text-gray-900">
                                <input v-model="form.is_current" type="checkbox" id="is_current" class="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                            </div>
                        </div>
                        <div v-if="!form.is_current" class="sm:col-span-2">
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
                                <a :href="currentWorkExperience.data.website" target="_blank" class="text-primary-600 hover:text-primary-800">{{ currentWorkExperience.data.website }}</a>
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
            <p>Are you sure you want to delete this work experience?</p>
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
