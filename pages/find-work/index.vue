<script setup lang="ts">
import { Level, Status, Term, type Project } from '~/types/models/Project';


interface SearchParams {
  search: string;
}

const searchParams = ref<SearchParams>({
  search: "",
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

const savedJobs = ref<Partial<Project>[]>([
  {
    id: 1,
    title: "Seeking Web Developer",
    description: "In search of a skilled web developer to create a responsive website.",
    estimated_budget: "$1000 - $2000",
    length: Term.EXTENDED,
    experience_level: Level.INTERMEDIATE,
    status: Status.ACTIVE,
    languages: [],
    images: [],
    skills: [],
  },
  {
    id: 2,
    title: "Hiring Mobile App Developer",
    description: "Looking for a mobile app developer for a new initiative.",
    estimated_budget: "$2000 - $3000",
    length: Term.EXTENDED,
    experience_level: Level.INTERMEDIATE,
    status: Status.ACTIVE,
    languages: [],
    images: [],
    skills: [],
  },
]);


const jobs = ref<Partial<Project>[]>([
  {
    id: 1,
    title: "Web Developer Needed",
    description: "Looking for an experienced web developer to build a responsive website.",
    estimated_budget: "$1000 - $2000",
    length: Term.EXTENDED,
    experience_level: Level.INTERMEDIATE,
    status: Status.ACTIVE,
    languages: [],
    images: [],
    skills: [],
  },
  {
    id: 2,
    title: "Mobile App Developer",
    description: "Need a mobile app developer for a new project.",
    estimated_budget: "$2000 - $3000",
    length: Term.EXTENDED,
    experience_level: Level.INTERMEDIATE,
    status: Status.ACTIVE,
    languages: [],
    images: [],
    skills: [],
  },
]);

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
                  {{ tab.name }}
                </a>
              </template>
            </nav>

            <div v-if="tabs[0].current" class="flex flex-col gap-4 mt-5">
              <JobCard v-for="job in jobs" :key="job.id" :job="job" />
            </div>

            <div v-if="tabs[1].current" class="flex flex-col gap-4 mt-5">
              <JobCard v-for="job in savedJobs" :key="job.id" :job="job" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>