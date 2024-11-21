<script setup lang="ts">
import type { ApiDataResponse, ApiErrorResponse } from '~/types/api/response/error';
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
import type {PaginatedList, PaginationMeta} from '~/types/models/Pagination';
import { AccountType } from '~/types/models/Account';
import type { Skill } from '~/types/models/Skill';

interface ProjectPaginationMeta extends PaginationMeta {
  total_count: number;
  total_saved_count: number;
}

interface ProjectList extends PaginatedList<Project> {
   meta: ProjectPaginationMeta
}

const router = useRouter();
const page = ref(1)

const filters = ref<{skills: Skill[],search: string, length: string, experience_level: string, is_saved: boolean}>({
  skills: [],
  search: "",
  length: "",
  experience_level: "",
  is_saved: false
});

const { account } = storeToRefs(accountStore());
const { data: projects, fetchData, pending: isLoading } = useFetchData<ProjectList, ApiErrorResponse>();
const { data: skills, fetchData: fetchSkills } = useFetchData<ApiDataResponse<Skill[]>, ApiErrorResponse>();
await fetchSkills('/v1/skills');

const queryString = computed(() => {
  let params: Record<string, string>  = {
    ...(filters.value.search ? {"filter[search]": filters.value.search}: {}),
    ...(filters.value.length ? {"filter[length]": filters.value.length}: {}),
    ...(filters.value.experience_level ? {"filter[experience_level]": filters.value.experience_level}: {}),
    ...(filters.value.is_saved ? {"filter[is_saved]": "true"}: {}),
    ...(filters.value.skills.length ? { "filter[skills]": filters.value.skills.map(skill => skill.id).join(',') } : {}),
    include: 'account.user,skills,myProposal',
    page: page.value.toString()
  }

  return new URLSearchParams(params).toString();
})

const totalCount = computed(() => projects.value?.meta?.total_count ?? 0);
const totalSavedCount = computed(() => projects.value?.meta?.total_saved_count ?? 0);

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID' : account.value.id.toString()} : undefined
);

watch(
  [() => queryString.value],
  debounce(async () => {
    await fetchData(`/v1/projects?${queryString.value}`, { headers: requestHeaders.value})
  }, 500)
);

fetchData(`/v1/projects?${queryString.value}`, { headers: requestHeaders.value})


const viewJob = async (id: number) => {
  await router.push(`/jobs/${id}`);
};

const sendProposal = async (id: number) => {
  await router.push(`/submit-proposal/${id}`);
};

const removeSkill = (skill: Skill) => {
  filters.value.skills = filters.value.skills.filter(s => s.id !== skill.id);
};

</script>

<template>
  <div class="my-8 lg:mx-auto mx-5">
    <ProfileInfo class="max-w-7xl mx-auto " />
    <div class="max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5 mx-auto ">

      <!-- Left Column -->
      <div class="col-span-1 flex flex-col gap-5">

        <!-- Skill Section -->
        <Section>
          <template #header>
            <div class="flex justify-start items-center gap-3">
              <Icon icon="material-symbols:filter-list" class="text-2xl text-primary" />
              <h2 class="text-xl font-bold">Skills</h2>
            </div>
          </template>
          <template #content>
            <Listbox v-model="filters.skills" multiple class="ring-1 ring-gray-300 rounded-md">
              <div class="relative mt-1">
                <ListboxButton
                  class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span class="block truncate">
                    <span v-if="filters.skills.length === 0">Select Skills</span>
                    <span v-else>
                      <span v-for="(skill, index) in filters.skills" :key="skill.id">
                        {{ skill.name }}<span v-if="index < filters.skills.length - 1">, </span>
                      </span>
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
                    <ListboxOption v-for="skill in skills?.data" v-slot="{ active, selected }" :key="skill.id"
                      :value="skill" as="template">
                      <li
                        :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                        <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ skill.name
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

            <div class="mt-4 flex flex-wrap">
              <div v-for="skill in filters.skills" :key="skill.id" class="mr-2 my-1">
                <span
                  class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {{ skill.name }}
                  <button @click="removeSkill(skill)" type="button"
                    class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-green-600/20">
                    <span class="sr-only">Remove</span>
                    <svg viewBox="0 0 14 14" class="h-3.5 w-3.5 stroke-green-700/50 group-hover:stroke-green-700/75">
                      <path d="M4 4l6 6m0-6l-6 6" />
                    </svg>
                    <span class="absolute -inset-1" />
                  </button>
                </span>
              </div>
            </div>
          </template>
        </Section>

        <!-- Length Section -->
        <Section>
          <template #header>
            <div class="flex justify-start items-center gap-3">
              <Icon icon="material-symbols:filter-list" class="text-2xl text-primary" />
              <h2 class="text-xl font-bold">Project Length</h2>
            </div>
          </template>
          <template #content>
            <Listbox v-model="filters.length" class="ring-1 ring-gray-300 rounded-md">
              <div class="relative mt-1">
                <ListboxButton
                  class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span class="block truncate">
                    <span v-if="!filters.length">Select Length</span>
                    <span v-else>
                      {{ _.capitalize(_.startCase(filters.length)) }}
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
                    <ListboxOption value="">
                      <li :class="['relative cursor-default select-none py-2 pl-10 pr-4']">
                        <span class="block truncate">Select Length</span>
                      </li>
                    </ListboxOption>
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
            <Listbox v-model="filters.experience_level" class="ring-1 ring-gray-300 rounded-md">
              <div class="relative mt-1">
                <ListboxButton
                  class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span class="block truncate">
                    <span v-if="!filters.experience_level">Select Level</span>
                    <span v-else>
                      {{ _.capitalize(_.startCase(filters.experience_level)) }}
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
                    <ListboxOption value="">
                      <li :class="['relative cursor-default select-none py-2 pl-10 pr-4']">
                        <span class="block truncate">Select Level</span>
                      </li>
                    </ListboxOption>
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
            <input v-model="filters.search" type="text" placeholder="Search for any jobs"
              class="w-full outline-none border-none" />
          </div>

          <div class="space-y-5">
            <nav class="flex space-x-4" aria-label="Tabs">
              <a href="#" @click.prevent="filters.is_saved = false"
                :class="!filters.is_saved ? 'bg-primary/30 text-primary' : 'text-gray-500 hover:text-gray-700'"
                class="px-3 py-2 font-medium text-sm rounded-md">
                Latest Jobs {{ totalCount > 0 ? `(${totalCount})` : '' }}
              </a>

              <a href="#" @click.prevent="filters.is_saved  = true"
                :class="filters.is_saved ? 'bg-primary/30 text-primary' : 'text-gray-500 hover:text-gray-700'"
                class="px-3 py-2 font-medium text-sm rounded-md">
                Saved Jobs {{ totalSavedCount > 0 ? `(${totalSavedCount})` : '' }}
              </a>
            </nav>

            <div class="space-y-5">
              <ProjectCard v-for="project in (projects as ProjectList)?.data ?? []" :key="project.id" :project="project"
                :show-save-button="true" :show-apply-button="true" :view-as="AccountType.FREELANCER" @click="viewJob"
                @apply="sendProposal" @save="(projects as ProjectList).meta.total_saved_count++"
                @un-save="(projects as ProjectList).meta.total_saved_count--" />

              <Pagination v-if="!isLoading && (projects as ProjectList)?.data.length > 0"
                :pagination="(projects as ProjectList)?.meta" @prev-page="page = page -1 "
                @next-page="page = page + 1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
