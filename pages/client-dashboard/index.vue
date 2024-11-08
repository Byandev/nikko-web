<script setup lang="ts">
import { authStore } from '~/store/authStore';
import { Icon } from '@iconify/vue';
import { ref, watch, computed } from 'vue';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Media as MediaResponse } from '~/types/models/Media';
import { accountStore } from '~/store/accountStore';

const { fetchProjects, projects, isProjectsLoading } = useProject();
const { sendRequest: sendRequest, pending: isLoading } = useSubmit<{ data: MediaResponse }, ApiErrorResponse>();

const { user } = storeToRefs(authStore());
const { updateUser } = authStore();

const { account } = storeToRefs(accountStore());

const tabs = ref([
    { name: 'Post a Job', current: true },
    { name: 'All Jobs Post', current: false },
    { name: 'Saved Drafts', current: false }
]);

const isAvatarModalOpen = ref(false);

const avatarImage = ref<File | null>(null);
const avatarImagePreview = ref<string | null>(null);

const defaultAvatarUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const avatarUrl = ref(user.value?.avatar?.original_url || defaultAvatarUrl);

watch(user, (newMedia) => {
    avatarUrl.value = newMedia?.avatar?.original_url || defaultAvatarUrl;
    console.log('Updated avatarUrl:', avatarUrl.value);
});

definePageMeta({
    middleware: ['verify']
});

const setActiveTab = (tabName: string) => {
    tabs.value.forEach(tab => {
        tab.current = (tab.name === tabName);
    });
};

const router = useRouter();

const postAJob = async () => {
    await router.push(`/post-a-job/${user.value.accounts[0].id}`);
};

const updateAvatarImage = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file) {
        avatarImage.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            avatarImagePreview.value = e.target?.result?.toString() || '';
        };
        reader.readAsDataURL(file);
    }
};

const uploadImage = async () => {
    try {
        const formData = new FormData();
        if (avatarImage.value) {
            formData.append('file', avatarImage.value);
        }

        // Upload image and Get the ID
        const UploadImageResponse = await sendRequest('/v1/medias', {
            method: 'POST',
            body: formData,
        });

        // Update the avatar
        await sendRequest(`/v1/auth/profile`, {
            method: 'PUT',
            body: JSON.stringify({
                avatar: UploadImageResponse.data.id,
            }),
        });
        isAvatarModalOpen.value = false;

    } catch (error) {
        console.error('Error uploading photo:', error);
    } finally {
        updateUser();
        avatarImagePreview.value = null;
    }
};

const refreshJobs = async () => {
    fetchProjects(1,'v1/client/projects');
};

const deleteAJob = async (jobId: number) => {
    try {
        await sendRequest(`/v1/client/projects/${jobId}`, {
            method: 'DELETE',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
        });
    } catch (error) {
        console.error('Error deleting job:', error);
    } finally {
        refreshJobs();
    }
};

const isDeleteModalOpen = ref(false);
const jobToDelete = ref<number | null>(null);

const openDeleteModal = (jobId: number) => {
    jobToDelete.value = jobId;
    isDeleteModalOpen.value = true;
};

const confirmDeleteJob = async () => {
    if (jobToDelete.value !== null) {
        await deleteAJob(jobToDelete.value);
        isDeleteModalOpen.value = false;
        jobToDelete.value = null;
    }
};

const searchQuery = ref('');

const filteredJobs = computed(() => {
    if (!projects.value?.data) return [];
    return projects.value.data.filter(project => project.title.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

fetchProjects(1,'v1/client/projects');
</script>

<template>
    <div class="my-8 lg:mx-auto mx-5">
        <div class="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5 mx-auto ">

            <!-- Left Column -->
            <div class="col-span-1">
                <div
                    class="flex flex-col items-center justify-center gap-5 border border-gray-300 rounded-lg overflow-hidden bg-white p-4">
                    <div class="relative group">
                        <img :src="avatarUrl" alt="Avatar"
                            class="w-36 h-36 rounded-full border-4 border-white shadow-lg mx-auto" />
                        <div
                            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                            <label class="cursor-pointer text-white">
                                <div @click="isAvatarModalOpen = true"
                                    class="bg-white rounded-full p-2 flex items-center justify-center shadow-md">
                                    <Icon icon="ic:outline-edit" width="24" height="24" class="text-primary" />
                                </div>
                            </label>
                        </div>
                        <div class="mt-4 text-center">
                            <h2 class="text-2xl font-bold text-gray-900">{{ user.first_name }} {{ user.last_name }}</h2>
                            <p class="mt-2 text-md text-gray-600">
                                Joined on {{ new Date(user.created_at).toLocaleString('en-US', {
                                    month: 'long', day:
                                        'numeric', year: 'numeric'
                                }) }}
                            </p>
                            <div class="mt-2 flex items-center space-x-2 justify-center">
                                <Icon icon="mdi:map-marker" width="15" height="15" />
                                <span class="text-sm text-black font-semibold">{{ user.country_code }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- About the client Section -->
                <Section class="mt-4">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <h2 class="text-2xl font-bold">About the Client</h2>
                        </div>
                    </template>
                    <template #content>
                        <div>
                            <p class="text-gray-500">About the client Section</p>
                        </div>
                    </template>
                </Section>

                <!-- My all Contracts -->
                <Section class="mt-4">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <h2 class="text-2xl font-bold">My All Contracts</h2>
                        </div>
                    </template>
                    <template #content>
                        <div>
                            <p class="text-gray-500">My all Contracts Section</p>
                        </div>
                    </template>
                </Section>

            </div>

            <!-- Right Column -->
            <div class="col-span-1 lg:col-span-2">
                <div class="grid grid-cols-1 gap-5">
                    <div>
                        <nav class="flex space-x-4" aria-label="Tabs">
                            <template v-for="tab in tabs" :key="tab.name">
                                <a href="#" @click.prevent="setActiveTab(tab.name)"
                                    :class="tab.current ? 'bg-primary/30 text-primary' : 'text-gray-500 hover:text-gray-700'"
                                    class="px-3 py-2 font-medium text-sm rounded-md">
                                    {{ tab.name }}
                                </a>
                            </template>
                        </nav>
                    </div>

                    <div v-if="tabs[0].current" class="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div class="px-4 py-5 sm:px-6">
                            <h3 class="text-lg font-medium leading-6 text-gray-900">Post a Job</h3>
                            <p class="mt-1 max-w-2xl text-sm text-gray-500">
                                Fill out the details below to post a new job. Ensure all information is accurate to
                                attract the
                                right candidates.
                            </p>
                            <div class="flex justify-end">
                                <Button class="mt-4" @click="postAJob" text="Post Job" background="primary"
                                    foreground="white" :is-wide="false" type="button"></Button>
                            </div>
                        </div>
                    </div>

                    <div v-if="tabs[1].current" class="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div class="px-4 py-5 sm:px-6 flex flex-col gap-5 lg:flex-row justify-between items-center">
                            <div>
                                <h3 class="text-lg font-medium leading-6 text-gray-900">All Jobs Post</h3>
                                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                                    Here you can see all the jobs you have posted.
                                </p>
                            </div>

                            <div class="flex justify-end mb-4">
                                <input type="text" v-model="searchQuery" placeholder="Search jobs..."
                                    class="p-2 border rounded-md" />
                            </div>
                        </div>
                        <div v-if="!isProjectsLoading">
                            <div v-for="(job, idx) in filteredJobs.filter(job => job.status === 'ACTIVE')" :key="job.id">
                                <JobCard @submit="refreshJobs" @delete="openDeleteModal" :job="job" />
                            </div>
                        </div>
                        <div v-else>
                            <div class="animate-pulse space-y-4">
                                <div class=" h-72 bg-gray-100 rounded-lg"></div>
                                <div class=" h-72 bg-gray-100 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                    
                    <Pagination
                        v-if="!isLoading && (projects.data ?? []).length > 0 && !tabs[0].current && tabs[1].current && projects.data.filter(project => project.status === 'ACTIVE').length > 0"
                        :pagination="projects.meta"
                        @prev-page="fetchProjects(projects.meta.current_page - 1,'v1/client/projects')"
                        @next-page="fetchProjects(projects.meta.current_page + 1,'v1/client/projects')"
                    />

                    <div v-if="tabs[2].current" class="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div class="px-4 py-5 sm:px-6 flex flex-col gap-5 lg:flex-row justify-between items-center">
                            <div>
                                <h3 class="text-lg font-medium leading-6 text-gray-900">All Saved Draft</h3>
                                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                                    Here you can see all the jobs you have saved as drafts.
                                </p>
                            </div>

                            <div class="flex justify-end mb-4">
                                <input type="text" v-model="searchQuery" placeholder="Search jobs..."
                                    class="p-2 border rounded-md" />
                            </div>
                        </div>
                        <div v-if="!isProjectsLoading">
                            <div v-for="(job, idx) in filteredJobs.filter(job => job.status === 'DRAFT')" :key="job.id">
                                <JobCard @submit="refreshJobs" @delete="deleteAJob" :job="job" />
                            </div>
                        </div>
                        <div v-else>
                            <div class="animate-pulse space-y-4">
                                <div class=" h-72 bg-gray-100 rounded-lg"></div>
                                <div class=" h-72 bg-gray-100 rounded-lg"></div>
                            </div>
                        </div>
                    </div>

                    <Pagination
                        v-if="!isLoading && (projects.data ?? []).length > 0 && !tabs[0].current && tabs[2].current && projects.data.filter(project => project.status === 'DRAFT').length > 0"
                        :pagination="projects.meta"
                        @prev-page="fetchProjects(projects.meta.current_page - 1, 'v1/client/projects')"
                        @next-page="fetchProjects(projects.meta.current_page + 1, 'v1/client/projects')"
                    />
                </div>
            </div>

            <Modal :modelValue="isAvatarModalOpen" @update:modelValue="isAvatarModalOpen = $event">
                <template #title>Avatar</template>
                <template #content>
                    <p class="text-sm text-gray-500 mb-4">Please select an image file to upload as your avatar.</p>
                    <div v-if="avatarImagePreview" class="sm:col-span-2 mb-4 flex items-center justify-center">
                        <img :src="avatarImagePreview" alt="Image Preview" class="w-32 h-32 object-cover rounded-md" />
                    </div>
                    <div class="sm:col-span-2 mb-4 flex items-center">
                        <label class="text-sm font-medium text-gray-500 w-1/4 text-left">Image</label>
                        <input type="file" accept="image/*" required @change="updateAvatarImage"
                            class="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:cursor-pointer" />
                    </div>
                </template>
                <template #actions>
                    <div class="flex justify-end space-x-2">
                        <Button type="button" text="Cancel" background="white" foreground="black"
                            :is-loading="isLoading" :is-wide="false" @click="isAvatarModalOpen = false"></Button>
                        <Button type="button" text="Upload" background="primary" foreground="white"
                            :is-loading="isLoading" :is-wide="false" @click="() => uploadImage()"></Button>
                    </div>
                </template>
            </Modal>

            <Modal :modelValue="isDeleteModalOpen" @update:modelValue="isDeleteModalOpen = $event">
                <template #title>Confirm Deletion</template>
                <template #content>
                    <p class="text-sm text-gray-500 mb-4">Are you sure you want to delete this job? This action cannot
                        be undone.</p>
                </template>
                <template #actions>
                    <div class="flex justify-end space-x-2">
                        <Button type="button" text="Cancel" background="white" foreground="black"
                            :is-loading="isLoading" :is-wide="false" @click="isDeleteModalOpen = false"></Button>
                        <Button type="button" text="Delete" background="primary" foreground="white"
                            :is-loading="isLoading" :is-wide="false" @click="confirmDeleteJob"></Button>
                    </div>
                </template>
            </Modal>
        </div>
    </div>
</template>