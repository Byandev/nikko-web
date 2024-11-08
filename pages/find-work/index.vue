<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Project } from '~/types/models/Project';
import { accountStore } from '~/store/accountStore';
import { Level, Term } from '~/types/models/Project';
import { Icon } from '@iconify/vue';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import _ from 'lodash';
import type { PaginatedList } from '~/types/models/Pagination';

interface SearchParams {
  search: string;
  length: string;
  experience_level: string;
}

const searchParams = ref<SearchParams>({
  search: " ",
  length: '',
  experience_level: '',
});

const { account } = storeToRefs(accountStore());
const { data: allProjects, fetchData: fetchAllProjects, pending: isAllProjectsLoading } = useFetchData<PaginatedList<Project>, ApiErrorResponse>();
const { data: savedProjects, fetchData: fetchSavedProjects, pending: isSavedProjectsLoading } = useFetchData<PaginatedList<Project>, ApiErrorResponse>();

onMounted(async () => {
  await fetchProjects(1);
});

watch(
  [()=>searchParams.value.search,()=>searchParams.value.length,()=>searchParams.value.experience_level],
  debounce(async () => {
    await fetchProjects(1);
  }, 1000)
);


const fetchProjects = async (page: number) => {
  await fetchAllProjects(`/v1/projects?page=${page}&filter[search]=${searchParams.value.search}&filter[length]=${searchParams.value.length}&filter[experience_level]=${searchParams.value.experience_level}&include=account.user.avatar`,
    {
      headers: account?.value?.id ? {
        'X-ACCOUNT-ID': account.value.id.toString(),
      } : undefined,
    }
  );
  await fetchSavedProjects(`/v1/projects?page=${page}&filter[is_saved]=true&filter[search]=${searchParams.value.search}&filter[length]=${searchParams.value.length}&filter[experience_level]=${searchParams.value.experience_level}&include=account.user.avatar`,{
    headers: account?.value?.id ? {
      'X-ACCOUNT-ID': account.value.id.toString(),
    } : undefined,
  });
};

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
  await fetchProjects(1);
};

const tabCount = computed(() => {
  return (tabName: string) => {
    if (tabName === 'Latest Jobs') {
      return allProjects.value?.meta.total || 0;
    }else if (tabName === 'Saved Jobs') {
      return savedProjects.value?.meta.total || 0;
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
      <div class="col-span-1 flex flex-col gap-5">

        <!-- Length Section -->
        <Section>
          <template #header>
            <div class="flex justify-start items-center gap-3">
              <Icon icon="material-symbols:filter-list" class="text-2xl text-primary" />
              <h2 class="text-xl font-bold">Project Length</h2>
            </div>
          </template>
          <template #content>
            <Listbox v-model="searchParams.length" class="ring-1 ring-gray-300 rounded-md">
              <div class="relative mt-1">
                <ListboxButton
                  class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span class="block truncate">
                    <span v-if="!searchParams.length">Select Length</span>
                    <span v-else>
                      {{ _.capitalize(_.startCase(searchParams.length)) }}
                    </span>
                  </span>
                  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </ListboxButton>

                <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
                  leave-to-class="opacity-0">
                  <ListboxOptions
                    class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                    <ListboxOption v-for="(term, index) in Term" v-slot="{ active, selected }" :key="index"
                      :value="term" as="template">
                      <li
                        :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                        <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                          _.capitalize(_.startCase(term))
                        }}</span>
                        <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <CheckIcon class="h-5 w-5" aria-hidden="true" />
                        </span>
                      </li>
                    </ListboxOption>
                  </ListboxOptions>
                </transition>
              </div>
            </Listbox>
          </template>
        </Section>

        <!-- Experience Level Section -->
        <Section>
          <template #header>
            <div class="flex justify-start items-center gap-3">
              <Icon icon="material-symbols:filter-list" class="text-2xl text-primary" />
              <h2 class="text-xl font-bold">Experience Level</h2>
            </div>
          </template>
          <template #content>
            <Listbox v-model="searchParams.experience_level" class="ring-1 ring-gray-300 rounded-md">
              <div class="relative mt-1">
                <ListboxButton
                  class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span class="block truncate">
                    <span v-if="!searchParams.experience_level">Select Level</span>
                    <span v-else>
                      {{ _.capitalize(_.startCase(searchParams.experience_level)) }}
                    </span>
                  </span>
                  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </ListboxButton>

                <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
                  leave-to-class="opacity-0">
                  <ListboxOptions
                    class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                    <ListboxOption v-for="(level, index) in Level" v-slot="{ active, selected }" :key="index"
                      :value="level" as="template">
                      <li
                        :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                        <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                          _.capitalize(_.startCase(level))
                        }}</span>
                        <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <CheckIcon class="h-5 w-5" aria-hidden="true" />
                        </span>
                      </li>
                    </ListboxOption>
                  </ListboxOptions>
                </transition>
              </div>
            </Listbox>
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

            <div v-if="tabs[0].current && allProjects?.meta && allProjects.data" class="flex flex-col gap-4 mt-5">
              <FindWorkJobCard @save="updateSaveStatus($event, false)" @unsave="updateSaveStatus($event, true)"
                v-for="job in allProjects.data" :key="job.id" :job="job" />
              <Pagination v-if="!isAllProjectsLoading && allProjects.data.length > 0" :pagination="allProjects.meta"
                @prev-page="fetchProjects(allProjects.meta.current_page - 1)"
                @next-page="fetchProjects(allProjects.meta.current_page + 1)" />
            </div>

            <div v-if="tabs[1].current && savedProjects?.data && savedProjects?.meta" class="flex flex-col gap-4 mt-5">
              <FindWorkJobCard @save="updateSaveStatus($event, false)" @unsave="updateSaveStatus($event, true)"
                v-for="job in savedProjects.data" :key="job.id" :job="job" />
              <Pagination v-if="!isAllProjectsLoading && savedProjects.data.length > 0" :pagination="savedProjects.meta"
                @prev-page="fetchProjects(savedProjects.meta.current_page - 1)"
                @next-page="fetchProjects(savedProjects.meta.current_page + 1)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>