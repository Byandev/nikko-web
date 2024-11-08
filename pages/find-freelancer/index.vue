<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { storeToRefs } from 'pinia';
import { accountStore } from '~/store/accountStore';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { PaginatedList } from '~/types/models/Pagination';
import { debounce } from '~/utils/debounce';
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import type { Skill } from '~/types/models/Skill';
import { Country} from 'country-state-city';
import type { ICountry } from 'country-state-city'
import type { Account } from '~/types/models/Account';


const router = useRouter();
const { account } = storeToRefs(accountStore());

interface SearchParams {
  include: string;
  type: string;
  search: string;
  skills: Skill[];
  countries: ICountry[];
}

const searchParams = ref<SearchParams>({
  include: 'user.avatar,skills',
  type: 'FREELANCER',
  search: '',
  skills: [],
  countries: [],
});

const { data: Savedfreelancers, fetchData: fetchSavedFreelancer, pending: isLoadingSavedFreelancer } = useFetchData<PaginatedList<Account>, ApiErrorResponse>();
const { data: Unsavedfreelancers, fetchData: fetchUnsavedFreelancer, pending: isLoadingUnsavedFreelancer } = useFetchData<PaginatedList<Account>, ApiErrorResponse>();

const { data: skills, fetchData: fetchSkills } = useFetchData<{ data: Skill[] }, ApiErrorResponse>();

const { sendRequest: updateFreelancer } = useSubmit<{ data: Account }, ApiErrorResponse>();

onMounted(async () => {
  await fetchFreelancers(1);
  await fetchSkills('/v1/skills');
});

watch(
  [() => searchParams.value.skills, () => searchParams.value.search, () => searchParams.value.countries],
  debounce(async () => {
    await fetchFreelancers(1);
  }, 1000)
);

const fetchFreelancers = async (page: number) => {
  await fetchUnsavedFreelancer(
    `v1/accounts?include=${searchParams.value.include}&filter[type]=${searchParams.value.type}&filter[search]=${searchParams.value.search}&filter[skills]=${searchParams.value.skills.map(skill => skill.id).join(',')}&filter[user_countries]=${searchParams.value.countries.map(country => country.isoCode).join(',') }&page=${page}`,
    {
      headers: account?.value?.id
        ? {
          'X-ACCOUNT-ID': account.value.id.toString(),
        }
        : undefined,
    }
  );

  await fetchSavedFreelancer(
    `v1/accounts?include=${searchParams.value.include}&filter[type]=${searchParams.value.type}&filter[search]=${searchParams.value.search}&filter[skills]=${searchParams.value.skills.map(skill => skill.id).join(',')}&filter[user_countries]=${searchParams.value.countries.map(country => country.isoCode).join(',') }&filter[is_saved]=true&page=${page}`,
    {
      headers: account?.value?.id
        ? {
          'X-ACCOUNT-ID': account.value.id.toString(),
        }
        : undefined,
    }
  );
};

const updateSaveStatus = async (id: number, isSaved: boolean) => {
  if (!isSaved) {
    const response = await updateFreelancer(`v1/accounts/${id}/save`,
      {
        method: 'POST',
        headers: account?.value?.id ? {
          'X-ACCOUNT-ID': account.value.id.toString(),
        } : undefined,
      }
    );
    console.log('Freelancer saved', response.data);
  } else {
    const response = await updateFreelancer(`v1/accounts/${id}/un-save`,
      {
        method: 'DELETE',
        headers: account?.value?.id ? {
          'X-ACCOUNT-ID': account.value.id.toString(),
        } : undefined,
      }
    );
    console.log('Freelancer unsaved', response.data);
  }
  await fetchFreelancers(1);
  console.log('Freelancer updated', Savedfreelancers.value?.data, Unsavedfreelancers.value?.data);
};

const tabs = ref([
  { name: `All freelancer`, current: true },
  { name: `Saved freelancer`, current: false },
]);

const setActiveTab = (tabName: string) => {
  tabs.value.forEach(tab => {
    tab.current = (tab.name === tabName);
  });
};

const freelancerProfile = (user: Account) => {
  router.push({ path: `/freelancer/${user.id}` });
}

const tabCount = computed(() => {
  return (tabName: string) => {
    if (tabName === 'All freelancer') {
      return Unsavedfreelancers.value?.meta.total || 0;
    } else if (tabName === 'Saved freelancer') {
      return Savedfreelancers.value?.meta.total || 0;
    }
    return 0;
  };
});

const removeSkill = (skill: Skill) => {
  searchParams.value.skills = searchParams.value.skills.filter(s => s.id !== skill.id);
};

const removeCountry = (country: ICountry) => {
  searchParams.value.countries = searchParams.value.countries.filter(c => c.name !== country.name);
};

</script>

<template>
  <div class="my-8 lg:mx-auto mx-5">
    <ProfileInfo class="max-w-6xl mx-auto " />
    <div class="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5 mx-auto ">

      <!-- Left Column -->
      <div class="col-span-1 flex flex-col gap-4">

        <!-- Skill Section -->
        <Section>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">Skills</h2>
            </div>
          </template>
          <template #content>
            <Listbox v-model="searchParams.skills" multiple class="ring-1 ring-gray-300 rounded-md">
              <div class="relative mt-1">
                <ListboxButton
                  class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span class="block truncate">
                    <span v-if="searchParams.skills.length === 0">Select Skills</span>
                    <span v-else>
                      <span v-for="(skill, index) in searchParams.skills" :key="skill.id">
                        {{ skill.name }}<span v-if="index < searchParams.skills.length - 1">, </span>
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
              <div v-for="skill in searchParams.skills" :key="skill.id" class="mr-2 my-1">
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

        <!-- Country Section -->
        <Section>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">Country</h2>
            </div>
          </template>
          <template #content>
            <Listbox v-model="searchParams.countries" multiple class="ring-1 ring-gray-300 rounded-md">
              <div class="relative mt-1">
                <ListboxButton
                  class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span class="block truncate">
                    <span v-if="searchParams.countries.length === 0">Select Country</span>
                    <span v-else>
                      <span v-for="(country, index) in searchParams.countries" :key="index">
                        {{ country.name }}<span v-if="index < searchParams.countries.length - 1">, </span>
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
                    <ListboxOption v-for="(country, index) in Country.getAllCountries()" v-slot="{ active, selected }"
                      :key="index" :value="country" as="template">
                      <li
                        :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                        <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ country.name
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
              <div v-for="(country, index) in searchParams.countries" :key="index" class="mr-2 my-1">
                <span
                  class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {{ country.name }}
                  <button @click="removeCountry(country)" type="button"
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

      </div>

      <!-- Right Column -->
      <div class="col-span-1 lg:col-span-2 ">
        <div class="grid grid-cols-1 gap-5">
          <div class="border border-gray-300 rounded-lg p-4 flex flex-row items-center gap-2">
            <Icon icon="material-symbols:search" class=" text-xl text-gray-400" />
            <input v-model="searchParams.search" type="text" placeholder="Search for freelancers..."
              class="w-full outline-none border-none" />
          </div>
          <div
            v-if="!isLoadingSavedFreelancer && !isLoadingUnsavedFreelancer && (Savedfreelancers || Unsavedfreelancers)">
            <nav class="flex space-x-4" aria-label="Tabs">
              <template v-for="tab in tabs" :key="tab.name">
                <a href="#" @click.prevent="setActiveTab(tab.name)"
                  :class="tab.current ? 'bg-primary/30 text-primary' : 'text-gray-500 hover:text-gray-700'"
                  class="px-3 py-2 font-medium text-sm rounded-md">
                  {{ tab.name }} <span class="text-green-900"> ({{ tabCount(tab.name) }})</span>
                </a>
              </template>
            </nav>
          </div>

          <div v-if="tabs[0].current && !isLoadingUnsavedFreelancer && Unsavedfreelancers" class="flex flex-col gap-4">
            <div v-for="(freelancer, idx) in Unsavedfreelancers.data" :key="idx">
              <FreelancerCard @save="updateSaveStatus($event, false)" @unsave="updateSaveStatus($event, true)"
                :freelancer="freelancer" @profile="freelancerProfile" />
            </div>
            <Pagination v-if="!isLoadingUnsavedFreelancer && Unsavedfreelancers.data.length > 0"
              :pagination="Unsavedfreelancers.meta"
              @prev-page="fetchFreelancers(Unsavedfreelancers.meta.current_page - 1)"
              @next-page="fetchFreelancers(Unsavedfreelancers.meta.current_page + 1)" />
          </div>
          <div v-if="tabs[0].current && isLoadingUnsavedFreelancer && !Unsavedfreelancers" class="flex flex-col gap-4">
            <div v-for="n in 5" :key="n" class="animate-pulse flex space-x-4 border p-4 rounded-xl">
              <div class="rounded-full bg-gray-300 h-12 w-12"></div>
              <div class="flex-1 space-y-4 py-1">
                <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                <div class="space-y-2">
                  <div class="h-4 bg-gray-300 rounded"></div>
                  <div class="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="tabs[1].current && !isLoadingSavedFreelancer && Savedfreelancers" class="flex flex-col gap-4">
            <div v-for="(freelancer, idx) in Savedfreelancers.data" :key="idx">
              <FreelancerCard @save="updateSaveStatus($event, false)" @unsave="updateSaveStatus($event, true)"
                :freelancer="freelancer" @profile="freelancerProfile" />
            </div>
            <Pagination v-if="!isLoadingSavedFreelancer && Savedfreelancers.data.length > 0"
              :pagination="Savedfreelancers.meta" @prev-page="fetchFreelancers(Savedfreelancers.meta.current_page - 1)"
              @next-page="fetchFreelancers(Savedfreelancers.meta.current_page + 1)" />
          </div>
          <div v-if="tabs[1].current && isLoadingSavedFreelancer && !Savedfreelancers" class="flex flex-col gap-4">
            <div v-for="n in 5" :key="n" class="animate-pulse flex space-x-4 border p-4 rounded-xl">
              <div class="rounded-full bg-gray-300 h-12 w-12"></div>
              <div class="flex-1 space-y-4 py-1">
                <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                <div class="space-y-2">
                  <div class="h-4 bg-gray-300 rounded"></div>
                  <div class="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>