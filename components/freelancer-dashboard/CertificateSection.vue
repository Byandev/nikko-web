<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import type { Certificate } from '~/types/models/Certificate';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Media } from '~/types/models/Media';
import { accountStore } from '~/store/accountStore';
import { helpers, required } from '@vuelidate/validators';

const isModalOpen = ref(false);
const isViewModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isEditing = ref(false);
const certificateToDelete = ref<Certificate | null>(null);

interface FormValues {
    title: string;
    issued_date: string;
    url: string;
    reference_id: string;
    image?: { file_name?: string; id?: number };
}

const initialValue: FormValues = {
    title: '',
    issued_date: '',
    url: '',
    reference_id: '',
    image: undefined,
};

const form = ref<FormValues>({ ...initialValue });

const rules = {
    title: {
        required: helpers.withMessage('Title is required', required),
    },
    issued_date: {
        required: helpers.withMessage('Issue Date is required', required),
    },
    url: {
        required: helpers.withMessage('Url is required', required),
    },
    reference_id: {
        required: helpers.withMessage('Reference ID is required', required),
    },
};

const { formRef, v$ } = useValidation(form, rules);

const selectedFile = ref<File | null>(null);

const { account } = storeToRefs(accountStore());

const { sendRequest: submitCertificate, pending: isSubmitting } = useSubmit<{ data: Certificate }, ApiErrorResponse>();
const { sendRequest: uploadMedia, pending: isUploading } = useSubmit<{ data: Media }, ApiErrorResponse>();
const { sendRequest: deleteCertificate, pending: isDeleting } = useSubmit<null, ApiErrorResponse>();
const { data: certificates, fetchData: fetchCertificate, pending: isLoadingCertificate } = useFetchData<{ data: Certificate[] }, ApiErrorResponse>();
const { data: currentCertificate, fetchData: fetchCertificateDetails, pending: isLoadingCertificateDetails } = useFetchData<{ data: Certificate }, ApiErrorResponse>();

fetchCertificate(`v1/accounts/${account.value?.id}/certificates`);

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        selectedFile.value = target.files[0];
        form.value.image = { file_name: target.files[0].name };
    }
};

const handleClick = () => {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    fileInput.click();
};

const handleRemoveFile = () => {
    selectedFile.value = null;
    form.value.image = undefined;
};

const handleEdit = async (certificateId: string) => {
    isEditing.value = true;
    isModalOpen.value = true;
    await fetchCertificateDetails(`/v1/accounts/${account.value?.id}/certificates/${certificateId}`);

    if (currentCertificate && currentCertificate.value?.data) {
        form.value = {
            title: currentCertificate.value.data.title,
            issued_date: currentCertificate.value.data.issued_date,
            url: currentCertificate.value.data.url,
            reference_id: currentCertificate.value.data.reference_id,
            image: currentCertificate.value.data.image ? { id: currentCertificate.value.data.image.id, file_name: currentCertificate.value.data.image.file_name } : undefined,
        };
    }
};

const handleView = async (certificateId: string) => {
    isViewModalOpen.value = true;
    await fetchCertificateDetails(`/v1/accounts/${account.value?.id}/certificates/${certificateId}`);
};

const confirmDelete = (certificate: Certificate) => {
    certificateToDelete.value = certificate;
    isDeleteModalOpen.value = true;
};

const handleDelete = async () => {
    if (!certificateToDelete.value) return;

    try {
        await deleteCertificate(`/v1/certificates/${certificateToDelete.value.id}`, {
            method: 'DELETE',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
        });

        // Refetch certificates
        fetchCertificate(`v1/accounts/${account.value?.id}/certificates`);
        isDeleteModalOpen.value = false;
        certificateToDelete.value = null;
    } catch (error) {
        console.error(error);
    }
};

const handleSubmit = async () => {
    v$.value.$touch();
    if (v$.value.$invalid) return;

    try {
        console.log('Selected File', selectedFile.value);
        if (selectedFile.value) {
            const formData = new FormData();
            formData.append('file', selectedFile.value);
            const uploadResponse = await uploadMedia('/v1/medias', {
                method: 'POST',
                body: formData,
            });
            form.value.image = { id: uploadResponse.data.id, file_name: uploadResponse.data.file_name };

            console.log('Upload Cerfiticate Image', uploadResponse);
        }

         // Submit the certificate
         await submitCertificate(isEditing.value ? `/v1/certificates/${currentCertificate.value?.data.id}` : '/v1/certificates', {
                method: isEditing.value ? 'PUT' : 'POST',
                headers: account?.value?.id ? {
                    'X-ACCOUNT-ID': account.value.id.toString(),
                } : undefined,
                body: JSON.stringify({
                    title: form.value.title,
                    issued_date: form.value.issued_date,
                    url: form.value.url,
                    reference_id: form.value.reference_id,
                    image: form.value.image?.id,
                }),
            });
            
        // Reset the form and state
        selectedFile.value = null;
        form.value = { ...initialValue };
        isModalOpen.value = false;
        isEditing.value = false;
        currentCertificate.value = null;

        // Refetch certificates
        fetchCertificate(`v1/accounts/${account.value?.id}/certificates`);
    } catch (error) {
        console.error(error);
    }
};
</script>

<template>
    <div v-if="isLoadingCertificate" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div class="w-full h-48 bg-gray-200"></div>
            <div class="p-4">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
        </div>
    </div>
    <div v-else-if="certificates?.data && certificates.data.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="certificate in certificates.data" :key="certificate.id"
            class="bg-white rounded-lg shadow-md overflow-hidden">
            <div v-if="certificate.image?.thumb_url">
                <img :src="certificate.image.thumb_url" alt="certificate image" class="w-full h-48 object-cover">
            </div>
            <div v-else class="w-full h-48 flex items-center justify-center bg-gray-200">
                <span class="text-gray-500">No Image</span>
            </div>
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900">{{ certificate.title }}</h3>
                <p class="mt-2 text-sm text-gray-600">{{ certificate.issued_date }}</p>
                <p class="mt-2 text-sm text-gray-600">{{ certificate.reference_id }}</p>
                <div class="flex flex-row gap-5">
                    <button @click="handleView(certificate.id)" class="mt-2 inline-block text-primary">View</button>
                    <button @click="handleEdit(certificate.id)"
                        class="mt-2 inline-block text-blue-600 hover:text-blue-800">Edit</button>
                    <button @click="confirmDelete(certificate)"
                        class="mt-2 inline-block text-red-600 hover:text-red-800">Delete</button>
                </div>
            </div>
        </div>
        <div class="flex justify-center rounded-lg border border-primary border-dashed">
            <button @click="{isModalOpen = true; isEditing = false}"
                class="bg-primary-600 text-primary px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
                <Icon icon="mdi:plus" class="mr-2" width="20" height="20" />
                Add Certificate
            </button>
        </div>
    </div>
    <div v-else class="flex justify-center flex-col items-center py-5">
        <Icon icon="system-uicons:folder-add" width="50" height="50" class="text-primary sm:w-50 sm:h-50" />
        <h3 class="mt-2 text-sm font-semibold text-gray-900">No certificate</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new certificate.</p>
        <div class="mt-6 flex justify-center">
            <Button @click="isModalOpen = true" text="New Certificate" type="button" foreground="white"
                background="primary" />
        </div>
    </div>

    <Modal :modelValue="isModalOpen" @update:modelValue="isModalOpen = $event">
        <template #title>
            {{ isEditing ? 'Edit Certificate' : 'Add Certificate' }}
        </template>
        <template #content>
            <form class="space-y-4 text-left">
                <div class="sm:col-span-2">
                    <label for="title" class="text-sm font-medium text-gray-500">Title <span
                            class="text-red-500">*</span></label>
                    <div class="mt-1 text-sm text-gray-900">
                        <input v-model="formRef.title" type="text" id="title"
                            class="block w-full rounded-md ring-2 ring-gray-300 shadow-sm focus:ring-indigo-500 sm:text-sm p-2">
                    </div>
                    <span v-if="v$.title.$error" class="text-red-900 text-sm">{{
                            v$.title.$errors[0].$message }}</span>
                </div>
                <div class="sm:col-span-2">
                    <label for="issued_date" class="text-sm font-medium text-gray-500">Issue Date <span
                            class="text-red-500">*</span></label>
                    <div class="mt-1 text-sm text-gray-900">
                        <input v-model="formRef.issued_date" type="date" id="issued_date"
                            class="block w-full rounded-md ring-2 ring-gray-300 shadow-sm focus:ring-indigo-500 sm:text-sm p-2">
                    </div>
                    <span v-if="v$.issued_date.$error" class="text-red-900 text-sm">{{
                            v$.issued_date.$errors[0].$message }}</span>
                </div>
                <div class="sm:col-span-2">
                    <label for="url" class="text-sm font-medium text-gray-500">Url <span
                            class="text-red-500">*</span></label>
                    <div class="mt-1 text-sm text-gray-900">
                        <input v-model="formRef.url" type="url" id="url"
                            class="block w-full rounded-md ring-2 ring-gray-300 shadow-sm focus:ring-indigo-500 sm:text-sm p-2">
                    </div>
                    <span v-if="v$.url.$error" class="text-red-900 text-sm">{{
                            v$.url.$errors[0].$message }}</span>
                </div>
                <div class="sm:col-span-2">
                    <label for="reference_id" class="text-sm font-medium text-gray-500">Reference ID <span
                            class="text-red-500">*</span></label>
                    <div class="mt-1 text-sm text-gray-900">
                        <input v-model="formRef.reference_id" type="text" id="reference_id"
                            class="block w-full rounded-md ring-2 ring-gray-300 shadow-sm focus:ring-indigo-500 sm:text-sm p-2">
                    </div>
                    <span v-if="v$.reference_id.$error" class="text-red-900 text-sm">{{
                            v$.reference_id.$errors[0].$message }}</span>
                </div>
                <div class="sm:col-span-2">
                    <label for="file" class="text-sm font-medium text-gray-500">File Attachment <span
                            class="text-red-500">*</span></label>
                    <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 cursor-pointer"
                        @click="handleClick">
                        <Icon icon="mdi:file" :ssr="true" />
                        <input type="file" id="file" @change="handleFileChange" class="hidden" accept="image/*">
                        <p
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                            Click to select a file</p>
                    </div>
                </div>
            </form>
            <div v-if="selectedFile || form.image" class="mt-4">
                <ul class="mt-2 space-y-4">
                    <li v-if="form.image"
                        class="flex items-center justify-between p-2 bg-gray-100 rounded-md shadow-sm">
                        <div class="flex items-center space-x-2 w-full">
                            <Icon icon="mdi:file" class="text-gray-500" width="24" height="24" />
                            <span class="text-sm text-gray-900 truncate max-w-52 lg:max-w-96"
                                :title="form.image.file_name">{{ form.image.file_name }}</span>
                        </div>
                        <button @click="handleRemoveFile" class="text-red-500 hover:text-red-700">
                            <Icon icon="mdi:close" width="16" height="16" />
                        </button>
                    </li>
                </ul>
            </div>
        </template>
        <template #actions>
            <div class="flex justify-end space-x-2">
                <Button type="button" text="Cancel" background="white" foreground="black" :is-wide="false" @click="{
                    isModalOpen = false;
                    form = { ...initialValue };
                }"></Button>
                <Button type="button" text="Save" background="primary" foreground="white" :is-wide="false"
                    @click="handleSubmit" :is-loading="isSubmitting || isUploading"></Button>
            </div>
        </template>
    </Modal>

    <Modal :modelValue="isViewModalOpen" @update:modelValue="isViewModalOpen = $event">
        <template #title>
            <div class="flex items-center space-x-2 justify-center">
                <Icon icon="mdi:certificate" class="text-primary-600" width="24" height="24" />
                <span>View Certificate</span>
            </div>
        </template>
        <template #content>
            <div v-if="isLoadingCertificateDetails" class="animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div class="h-48 bg-gray-200 rounded"></div>
            </div>
            <div v-else-if="currentCertificate" class="space-y-4 text-left">
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:label" class="text-primary-600" width="20" height="20" />
                        <span>Title</span>
                    </label>
                    <div class="mt-1 text-lg font-semibold text-gray-900">
                        {{ currentCertificate.data.title }}
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:calendar" class="text-primary-600" width="20" height="20" />
                        <span>Issue Date</span>
                    </label>
                    <div class="mt-1 text-sm text-gray-900">
                        {{ currentCertificate.data.issued_date }}
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:web" class="text-primary-600" width="20" height="20" />
                        <span>Url</span>
                    </label>
                    <div class="mt-1 text-sm text-gray-900">
                        <a :href="currentCertificate.data.url" target="_blank"
                            class="text-primary-600 hover:text-primary-800">{{ currentCertificate.data.url }}</a>
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:identifier" class="text-primary-600" width="20" height="20" />
                        <span>Reference ID</span>
                    </label>
                    <div class="mt-1 text-sm text-gray-900">
                        {{ currentCertificate.data.reference_id }}
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                        <Icon icon="mdi:image" class="text-primary-600" width="20" height="20" />
                        <span>Image</span>
                    </label>
                    <div class="mt-1 text-sm text-gray-900">
                        <div class="carousel">
                            <div v-if="currentCertificate.data.image" class="carousel-item">
                                <img :src="currentCertificate.data.image.original_url" alt="certificate image"
                                    class="w-full h-48 object-cover rounded-md shadow-md">
                            </div>
                        </div>
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
            <p>Are you sure you want to delete this certificate?</p>
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

<style scoped>
.carousel {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
}

.carousel-item {
    flex: none;
    scroll-snap-align: start;
    margin-right: 1rem;
}
</style>