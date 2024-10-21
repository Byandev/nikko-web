<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import type { Portfolio } from '~/types/models/Portfolio';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Media } from '~/types/models/Media';
import { accountStore } from '~/store/accountStore';

const isModalOpen = ref(false);
const isDragging = ref(false);
const isEditing = ref(false);
const currentPortfolio = ref<Portfolio | null>(null);

interface formValues {
    title: string;
    description: string;
    url: string;
    images: number[];
}

const form = ref<formValues>({
    title: '',
    description: '',
    url: '',
    images: [],
});

const selectedFiles = ref<File[]>([]);
const { account } = storeToRefs(accountStore());

const { sendRequest: submitPortfolio, pending: isSubmitting } = useSubmit<{ data: Portfolio }, ApiErrorResponse>();
const { sendRequest: uploadMedia, pending: isUploading } = useSubmit<{ data: Media }, ApiErrorResponse>();
const { data: portfolios, fetchData: fetchPortfolio } = useFetchData<{ data: { id: string; title: string; description: string; url: string; created_at: string; updated_at: string; images: { id: number; uuid: string; name: string; type: string; disk: string; size: number; conversions_disk: string; thumb_url: string; }[]; }[] }, ApiErrorResponse>();

fetchPortfolio(`v1/accounts/${account.value?.id}/portfolios`);

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        selectedFiles.value = selectedFiles.value.concat(Array.from(target.files));
    }
};

const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    isDragging.value = false;
    if (event.dataTransfer?.files) {
        selectedFiles.value = selectedFiles.value.concat(Array.from(event.dataTransfer.files));
    }
};

const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    isDragging.value = true;
};

const handleDragLeave = () => {
    isDragging.value = false;
};

const handleClick = () => {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    fileInput.click();
};

const handleRemoveFile = (fileToRemove: File) => {
    selectedFiles.value = selectedFiles.value.filter(file => file !== fileToRemove);
};

const handleEdit = (portfolio: Portfolio) => {
    isEditing.value = true;
    currentPortfolio.value = portfolio;
    form.value = {
        title: portfolio.title,
        description: portfolio.description,
        url: portfolio.url,
        images: portfolio.images.map(image => image.id),
    };
    isModalOpen.value = true;
};

const handSubmit = async () => {
    try {
        // Upload each file and collect the responses
        const uploadPromises = selectedFiles.value.map(file => {
            const formData = new FormData();
            formData.append('file', file);
            return uploadMedia('/v1/medias', {
                method: 'POST',
                body: formData,
            });
        });

        const uploadResponses = await Promise.all(uploadPromises);
        const uploadedImages = uploadResponses.map(response => response.data.id);

        console.log(uploadedImages);

        // Update the form images with the uploaded image URLs
        form.value.images = uploadedImages;

        // Submit the portfolio
        await submitPortfolio(isEditing.value ? `/v1/portfolios/${currentPortfolio.value?.id}` : '/v1/portfolios', {
            method: isEditing.value ? 'PUT' : 'POST',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
            body: form.value,
        });

        // Reset the form and state
        selectedFiles.value = [];
        form.value.title = '';
        form.value.description = '';
        form.value.url = '';
        form.value.images = [];
        isModalOpen.value = false;
        isEditing.value = false;
        currentPortfolio.value = null;

        // Refetch portfolios
        fetchPortfolio(`v1/accounts/${account.value?.id}/portfolios`);
    } catch (error) {
        console.error(error);
    }
};
</script>

<template>
<div v-if="portfolios?.data" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="portfolio in portfolios.data" :key="portfolio.id" class="bg-white rounded-lg shadow-md overflow-hidden">
        <img :src="portfolio.images[0].thumb_url" alt="portfolio image" class="w-full h-48 object-cover">
        <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ portfolio.title }}</h3>
            <p class="mt-2 text-sm text-gray-600">{{ portfolio.description }}</p>
            <a :href="portfolio.url" target="_blank" class="mt-4 inline-block text-primary-600 hover:text-primary-800">View Project</a>
            <button @click="handleEdit(portfolio)" class="mt-2 inline-block text-blue-600 hover:text-blue-800">Edit</button>
        </div>
    </div>
</div>
<div v-else class="flex justify-center flex-col items-center py-5">
        <Icon icon="system-uicons:folder-add" width="50" height="50" class="text-primary sm:w-50 sm:h-50" />
        <h3 class="mt-2 text-sm font-semibold text-gray-900">No portfolio</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new portfolio.</p>
        <div class="mt-6 flex justify-center">
                <Button @click="isModalOpen=true" text="New Project" type="button" foreground="white" background="primary"/>
        </div>
</div>

<Modal :modelValue="isModalOpen" @update:modelValue="isModalOpen = $event">
        <template #title>
                {{ isEditing ? 'Edit Portfolio' : 'Add Portfolio' }}
        </template>
        <template #content>
                <form class="space-y-4 text-left">
                    <div class="sm:col-span-2">
                        <label for="title" class="text-sm font-medium text-gray-500">Title</label>
                        <div class="mt-1 text-sm text-gray-900">
                            <input v-model="form.title" type="text" id="title" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                        </div>
                    </div>
                    <div class="sm:col-span-2">
                        <label for="description" class="text-sm font-medium text-gray-500">Description</label>
                        <div class="mt-1 text-sm text-gray-900">
                            <textarea v-model="form.description" id="description" rows="3" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
                        </div>
                    </div>
                    <div class="sm:col-span-2">
                        <label for="url" class="text-sm font-medium text-gray-500">Url</label>
                        <div class="mt-1 text-sm text-gray-900">
                            <input v-model="form.url" type="url" id="url" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                        </div>
                    </div>
                    <div class="sm:col-span-2">
                        <label for="file" class="text-sm font-medium text-gray-500">File Attachment</label>
                        <div 
                            class="mt-1 text-sm text-gray-900 border-2 border-dashed rounded-md p-4 cursor-pointer"
                            :class="{'border-indigo-500': isDragging, 'border-gray-300': !isDragging}"
                            @drop="handleDrop"
                            @dragover="handleDragOver"
                            @dragleave="handleDragLeave"
                            @click="handleClick"
                        >
                            <input type="file" id="file" multiple @change="handleFileChange" class="hidden">
                            <p class="text-center text-gray-500">Drag and drop files here, or click to select files</p>
                        </div>
                    </div>
                </form>
                <div v-if="selectedFiles.length" class="mt-4">
                    <ul class="mt-2 space-y-4">
                        <li v-for="file in selectedFiles" :key="file.name" class="flex items-center justify-between p-2 bg-gray-100 rounded-md shadow-sm">
                            <div class="flex items-center space-x-2 w-full">
                                <Icon icon="mdi:file" class="text-gray-500" width="24" height="24" />
                                <span class="text-sm text-gray-900 truncate max-w-52 lg:max-w-96" :title="file.name">{{ file.name }}</span>
                            </div>
                            <button @click="handleRemoveFile(file)" class="text-red-500 hover:text-red-700">
                                <Icon icon="mdi:close" width="16" height="16" />
                            </button>
                        </li>
                    </ul>
                </div>
        </template>
        <template #actions>
                <div class="flex justify-end space-x-2">
                        <Button type="button" text="Cancel" background="white" foreground="black" 
                                :is-wide="false" @click="isModalOpen = false"></Button>
                        <Button type="button" text="Save" background="primary" foreground="white"
                                :is-wide="false" @click="handSubmit"></Button>
                </div>
        </template>
</Modal>
</template>