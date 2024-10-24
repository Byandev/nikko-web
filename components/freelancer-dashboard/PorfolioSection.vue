<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import type { Portfolio } from '~/types/models/Portfolio';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Media } from '~/types/models/Media';
import { accountStore } from '~/store/accountStore';

const isModalOpen = ref(false);
const isViewModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isEditing = ref(false);
const portfolioToDelete = ref<Portfolio | null>(null);

interface FormValues {
    title: string;
    description: string;
    url: string;
    images: { file_name?: string; id: number }[];
}

const initialValue: FormValues = {
    title: '',
    description: '',
    url: '',
    images: [],
};

const form = ref<FormValues>({ ...initialValue });

const selectedFiles = ref<File[]>([]);

const { account } = storeToRefs(accountStore());

const { sendRequest: submitPortfolio, pending: isSubmitting } = useSubmit<{ data: Portfolio }, ApiErrorResponse>();
const { sendRequest: uploadMedia, pending: isUploading } = useSubmit<{ data: Media }, ApiErrorResponse>();
const { sendRequest: deletePortfolio, pending: isDeleting } = useSubmit<null, ApiErrorResponse>();
const { data: portfolios, fetchData: fetchPortfolio, pending: isLoadingPortfolio } = useFetchData<{ data: Portfolio[] }, ApiErrorResponse>();
const { data: currentPortfolio, fetchData: fetchPortfolioDetails, pending: isLoadingPortfolioDetails } = useFetchData<{ data: Portfolio }, ApiErrorResponse>();

fetchPortfolio(`v1/accounts/${account.value?.id}/portfolios`);

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        selectedFiles.value = selectedFiles.value.concat(Array.from(target.files));
    }
};

const handleClick = () => {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    fileInput.click();
};

const handleRemoveFile = (fileNameToRemove: string) => {
    if (isEditing.value) {
        form.value.images = form.value.images.filter(image => image.file_name !== fileNameToRemove);
    } else {
        selectedFiles.value = selectedFiles.value.filter(file => file.name !== fileNameToRemove);
    }
};

const handleEdit = async (portfolioId: string) => {
    isEditing.value = true;
    isModalOpen.value = true;
    await fetchPortfolioDetails(`/v1/accounts/${account.value?.id}/portfolios/${portfolioId}`);
    
    if (currentPortfolio && currentPortfolio.value?.data) {
        form.value = {
            title: currentPortfolio.value.data.title,
            description: currentPortfolio.value.data.description,
            url: currentPortfolio.value.data.url,
            images: currentPortfolio.value.data.images.map((image: { id: number; file_name: string }) => ({ id: image.id, file_name: image.file_name })),
        };
    }
};

const handleView = async (portfolioId: string) => {
    isViewModalOpen.value = true;
    await fetchPortfolioDetails(`/v1/accounts/${account.value?.id}/portfolios/${portfolioId}`);
};

const confirmDelete = (portfolio: Portfolio) => {
    portfolioToDelete.value = portfolio;
    isDeleteModalOpen.value = true;
};

const handleDelete = async () => {
    if (!portfolioToDelete.value) return;

    try {
        await deletePortfolio(`/v1/portfolios/${portfolioToDelete.value.id}`, {
            method: 'DELETE',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
        });

        // Refetch portfolios
        fetchPortfolio(`v1/accounts/${account.value?.id}/portfolios`);
        isDeleteModalOpen.value = false;
        portfolioToDelete.value = null;
    } catch (error) {
        console.error(error);
    }
};

const handleSubmit = async () => {
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

               // Update the form images with the uploaded image URLs
        form.value.images = form.value.images.concat(uploadedImages.map(id => ({ id })));

        // Submit the portfolio
        await submitPortfolio(isEditing.value ? `/v1/portfolios/${currentPortfolio.value?.data.id}` : '/v1/portfolios', {
            method: isEditing.value ? 'PUT' : 'POST',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
            body: JSON.stringify({
                ...form.value,
                images: form.value.images.map(image => image.id),
            }),
        });

        // Reset the form and state
        selectedFiles.value = [];
        form.value = { ...initialValue };
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
<div v-if="isLoadingPortfolio" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="n in 6" :key="n" class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div class="w-full h-48 bg-gray-200"></div>
        <div class="p-4">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
    </div>
</div>
<div v-else-if="portfolios?.data && portfolios.data.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="portfolio in portfolios.data" :key="portfolio.id" class="bg-white rounded-lg shadow-md overflow-hidden">
      <div v-if="portfolio.images[0]?.thumb_url">
        <img :src="portfolio.images[0].thumb_url" alt="portfolio image" class="w-full h-48 object-cover">
      </div>
      <div v-else class="w-full h-48 flex items-center justify-center bg-gray-200">
        <span class="text-gray-500">No Image</span>
      </div>
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-900">{{ portfolio.title }}</h3>
        <p class="mt-2 text-sm text-gray-600">{{ portfolio.description }}</p>
        <div class="flex flex-row gap-5">
          <button @click="handleView(portfolio.id)" class="mt-2 inline-block text-primary">View</button>
          <button @click="handleEdit(portfolio.id)" class="mt-2 inline-block text-blue-600 hover:text-blue-800">Edit</button>
          <button @click="confirmDelete(portfolio)" class="mt-2 inline-block text-red-600 hover:text-red-800">Delete</button>
        </div>
      </div>
    </div>
    <div class="flex justify-center rounded-lg border border-primary border-dashed">
        <button @click="isModalOpen = true" class="bg-primary-600 text-primary px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
            <Icon icon="mdi:plus" class="mr-2" width="20" height="20" />
            Add Portfolio
        </button>
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

<Modal :modelValue="isModalOpen" @update:modelValue="isModalOpen = $event" class="sm:max-w-lg w-full sm:w-auto">
    <template #title>
        {{ isEditing ? 'Edit Portfolio' : 'Add Portfolio' }}
    </template>
    <template #content>
        <form class="space-y-4 text-left">
            <div class="w-full sm:col-span-2">
                <label for="title" class="text-sm font-medium text-gray-500">Title <span class="text-red-500">*</span></label>
                <div class="mt-1 text-sm text-gray-900">
                    <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:label" :ssr="true" />
                        <input v-model="form.title" type="text" id="title" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                    </div>
                </div>
            </div>
            <div class="w-full sm:col-span-2">
                <label for="description" class="text-sm font-medium text-gray-500">Description <span class="text-red-500">*</span></label>
                <div class="mt-1 text-sm text-gray-900">
                    <div class="flex flex-row items-start px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:note-text" :ssr="true" />
                        <textarea v-model="form.description" id="description" rows="3" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0"></textarea>
                    </div>
                </div>
            </div>
            <div class="w-full sm:col-span-2">
                <label for="url" class="text-sm font-medium text-gray-500">Url <span class="text-red-500">*</span></label>
                <div class="mt-1 text-sm text-gray-900">
                    <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:web" :ssr="true" />
                        <input v-model="form.url" type="url" id="url" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                    </div>
                </div>
            </div>
            <div class="w-full sm:col-span-2">
                <label for="file" class="text-sm font-medium text-gray-500">File Attachment <span class="text-red-500">*</span></label>
                <div class="mt-1 text-sm text-gray-900">
                    <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 cursor-pointer" @click="handleClick">
                        <Icon icon="mdi:file" :ssr="true" />
                        <input type="file" id="file" multiple @change="handleFileChange" class="hidden" accept="image/*">
                        <p class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">Click to select files</p>
                    </div>
                </div>
            </div>
        </form>
        <div v-if="selectedFiles.length || form.images.length" class="mt-4">
            <ul class="mt-2 space-y-4">
                <li v-for="file in selectedFiles" :key="file.name" class="flex items-center justify-between p-2 bg-gray-100 rounded-md shadow-sm">
                    <div class="flex items-center space-x-2 w-full">
                        <Icon icon="mdi:file" class="text-gray-500" width="24" height="24" />
                        <span class="text-sm text-gray-900 truncate max-w-52 lg:max-w-96" :title="file.name">{{ file.name }}</span>
                    </div>
                    <button @click="handleRemoveFile(file.name)" class="text-red-500 hover:text-red-700">
                        <Icon icon="mdi:close" width="16" height="16" />
                    </button>
                </li>
                <li v-for="image in form.images" :key="image.id" class="flex items-center justify-between p-2 bg-gray-100 rounded-md shadow-sm">
                    <div class="flex items-center space-x-2 w-full">
                        <Icon icon="mdi:file" class="text-gray-500" width="24" height="24" />
                        <span class="text-sm text-gray-900 truncate max-w-52 lg:max-w-96" :title="image.file_name">{{ image.file_name }}</span>
                    </div>
                    <button @click="handleRemoveFile(String(image.file_name))" class="text-red-500 hover:text-red-700">
                        <Icon icon="mdi:close" width="16" height="16" />
                    </button>
                </li>
            </ul>
        </div>
    </template>
    <template #actions>
        <div class="flex justify-end space-x-2">
            <Button type="button" text="Cancel" background="white" foreground="black" :is-wide="false" @click="{isModalOpen = false; form = { ...initialValue };}"></Button>
            <Button type="button" text="Save" background="primary" foreground="white" :is-wide="false" @click="handleSubmit" :is-loading="isSubmitting || isUploading"></Button>
        </div>
    </template>
</Modal>
<Modal :modelValue="isViewModalOpen" @update:modelValue="isViewModalOpen = $event">
    <template #title>
        <div class="flex items-center space-x-2 justify-center">
            <Icon icon="mdi:eye" class="text-primary-600" width="24" height="24" />
            <span>View Portfolio</span>
        </div>
    </template>
    <template #content>
        <div v-if="isLoadingPortfolioDetails" class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div class="h-48 bg-gray-200 rounded"></div>
        </div>
        <div v-else-if="currentPortfolio" class="space-y-4 text-left">
            <div class="sm:col-span-2">
                <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                    <Icon icon="mdi:label" class="text-primary-600" width="20" height="20" />
                    <span>Title</span>
                </label>
                <div class="mt-1 text-lg font-semibold text-gray-900">
                    {{ currentPortfolio.data.title }}
                </div>
            </div>
            <div class="sm:col-span-2">
                <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                    <Icon icon="mdi:note-text" class="text-primary-600" width="20" height="20" />
                    <span>Description</span>
                </label>
                <div class="mt-1 text-sm text-gray-900">
                    {{ currentPortfolio.data.description }}
                </div>
            </div>
            <div class="sm:col-span-2">
                <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                    <Icon icon="mdi:web" class="text-primary-600" width="20" height="20" />
                    <span>Url</span>
                </label>
                <div class="mt-1 text-sm text-gray-900">
                    <a :href="currentPortfolio.data.url" target="_blank" class="text-primary-600 hover:text-primary-800">{{ currentPortfolio.data.url }}</a>
                </div>
            </div>
            <div class="sm:col-span-2">
                <label class="text-sm font-medium text-gray-500 flex items-center space-x-2">
                    <Icon icon="mdi:image" class="text-primary-600" width="20" height="20" />
                    <span>Images</span>
                </label>
                <div class="mt-1 text-sm text-gray-900">
                    <div class="carousel">
                        <div v-for="image in currentPortfolio.data.images" :key="image.id" class="carousel-item">
                            <img :src="image.original_url" alt="portfolio image" class="w-full h-48 object-cover rounded-md shadow-md">
                        </div>
                    </div>
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
        <p>Are you sure you want to delete this portfolio?</p>
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