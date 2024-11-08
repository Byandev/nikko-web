<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Project } from '~/types/models/Project';
import { accountStore } from '~/store/accountStore';

interface SearchParams {
  search: string;
}

const searchParams = ref<SearchParams>({
  search: "",
});

const { account } = storeToRefs(accountStore());
const { fetchProjects, projects, isProjectsLoading } = useProject();

onMounted(async() => {
  await fetchProjects(1, '/v1/projects');
});

const tabs = ref([
  { name: `Latest Jobs`, current: true },
  { name: `Saved Jobs`, current: false },
]);

const setActiveTab = (tabName: string) => {
  tabs.value.forEach(tab => {
    tab.current = (tab.name === tabName);
  });
};

const { sendRequest: updateProject } = useSubmit<{ data: Project }, ApiErrorResponse>();

const updateSaveStatus = async (id: number, isSaved: boolean) => {
  if (!isSaved) {
    const response = await updateProject(`v1/projects/${id}/save`,
      {
        method: 'POST',
        headers: account?.value?.id ? {
          'X-ACCOUNT-ID': account.value.id.toString(),
        } : undefined,
      }
    );
    console.log('Freelancer saved', response.data);
  } else {
    const response = await updateProject(`v1/projects/${id}/un-save`,
      {
        method: 'DELETE',
        headers: account?.value?.id ? {
          'X-ACCOUNT-ID': account.value.id.toString(),
        } : undefined,
      }
    );
    console.log('Freelancer unsaved', response.data);
  }
  await fetchProjects(1, '/v1/projects');
};

const tabCount = computed(() => {
  return (tabName: string) => {
    if (tabName === 'Latest Jobs') {
      return projects.value?.meta.total || 0;
    } 
    return 0;
  };
});
</script>

<template>
  <div class="my-8 lg:mx-auto mx-5">
    <ProfileInfo class="max-w-6xl mx-auto " />
    <div class="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5 mx-auto ">

      <!-- Left Column -->
      <div class="col-span-1">
        <Section>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">Your Bids</h2>
            </div>
          </template>
          <template #content>
            <div class="mt-4">
              <p>Available: <strong>Unlimited</strong></p>
            </div>
          </template>
        </Section>

        <!-- Skill Section -->
        <Section class="mt-5">
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">All Contracts</h2>
            </div>
          </template>
          <template #content>
            <div class="mt-4">
              <p class="text-gray-500">Skill Section</p>
            </div>
          </template>
        </Section>

        <!-- Tools Section -->
        <Section class="mt-5">
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">Tools</h2>
              <div>
                <button class="text-blue-500">Request Tools</button>
                <button class="text-gray-500 ml-5">Edit</button>
              </div>
            </div>
          </template>
          <template #content>
            <div class="mt-4">
              <p class="text-gray-500">Tools Section</p>
            </div>
          </template>
        </Section>

        <!-- Verification Section -->
        <Section class="mt-5">
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">Verification</h2>
            </div>
          </template>
          <template #content>
            <div class="mt-4">
              <p class="text-gray-500">Verification Section</p>
            </div>
          </template>
        </Section>

      </div>

      <!-- Right Column -->
      <div class="col-span-1 lg:col-span-2">
        <div class="grid grid-cols-1 gap-5">
          <div class="border border-gray-300 rounded-lg p-4 flex flex-row items-center gap-2">
            <Icon icon="material-symbols:search" class=" text-xl text-gray-400" />
            <input v-model="searchParams.search" type="text" placeholder="Search for any jobs"
              class="w-full outline-none border-none" />
          </div>

          <div>
            <nav class="flex space-x-4" aria-label="Tabs">
              <template v-for="tab in tabs" :key="tab.name">
                <a href="#" @click.prevent="setActiveTab(tab.name)"
                  :class="tab.current ? 'bg-primary/30 text-primary' : 'text-gray-500 hover:text-gray-700'"
                  class="px-3 py-2 font-medium text-sm rounded-md">
                  {{ tab.name }} ({{ tabCount(tab.name) }})
                </a>
              </template>
            </nav>

            <div v-if="tabs[0].current" class="flex flex-col gap-4 mt-5">
              <FindWorkJobCard @save="updateSaveStatus($event,false)" @unsave="updateSaveStatus($event,true)" v-for="job in projects.data" :key="job.id" :job="job" />
              <Pagination v-if="!isProjectsLoading && projects.data.length > 0"
              :pagination="projects.meta" 
              @prev-page="fetchProjects(projects.meta.current_page - 1, '/v1/projects')"
              @next-page="fetchProjects(projects.meta.current_page + 1, '/v1/projects')" />
            </div>

            <div v-if="tabs[1].current" class="flex flex-col gap-4 mt-5">
              <FindWorkJobCard @save="updateSaveStatus($event,false)" @unsave="updateSaveStatus($event,true)" v-for="job in projects.data.filter(project => project.is_saved)" :key="job.id" :job="job" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>