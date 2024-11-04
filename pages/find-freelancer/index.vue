<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { accountStore } from '~/store/accountStore';
import { profileDisplayStore } from '~/store/profileDisplayStore';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Freelancer } from '~/types/models/Freelancer';
import type { PaginatedList } from '~/types/models/Pagination';

const router = useRouter();
const { account } = storeToRefs(accountStore());

interface SearchParams {
  include: string;
  type: string;
  search: string;
}

const freelancerLength = ref<number | undefined>(0);

const filters = ref([
  { name: 'Avatar', value: 'user.avatar' },
  { name: 'Skills', value: 'skills' },
]);

const searchParams = ref<SearchParams>({
  include: filters.value.map(filter => filter.value).join(','),
  type: 'FREELANCER',
  search: '',
});

const { profileDisplay } = storeToRefs(profileDisplayStore());

const { data: freelancers, fetchData: fetchFreelancer, pending: isLoading } = useFetchData<PaginatedList<Freelancer>, ApiErrorResponse>();
const { sendRequest: updateFreelancer } = useSubmit<{ data: Freelancer }, ApiErrorResponse>();

onMounted(async () => {
  await fetchFreelancer(`v1/accounts?include=${searchParams.value.include}&filter[type]=${searchParams.value.type}&filter[search]=${searchParams.value.search}`);
});

watch(() => searchParams.value.search, async () => {
  await fetchFreelancer(`v1/accounts?include=${searchParams.value.include}&filter[type]=${searchParams.value.type}&filter[search]=${searchParams.value.search}`);
});

watch(() => freelancers.value?.data ?? [], () => {
  freelancerLength.value = freelancers.value?.data.length;
});

const fetchFreelancers = async (page: number) => {
  await fetchFreelancer(`v1/accounts?include=${searchParams.value.include}&filter[type]=${searchParams.value.type}&filter[search]=${searchParams.value.search}&page=${page}`);
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
  await fetchFreelancer(`v1/accounts?include=${searchParams.value.include}&filter[type]=${searchParams.value.type}&filter[search]=${searchParams.value.search}`);
  console.log('Freelancer updated', freelancers.value?.data);
};

const tabs = computed(() => [
  { name: `All freelancer(${freelancerLength.value ?? 0})`, current: true },
  { name: `Saved freelancer`, current: false },
]);

const setActiveTab = (tabName: string) => {
  tabs.value.forEach(tab => {
    tab.current = (tab.name === tabName);
  });
};

const freelancerProfile = (user: Freelancer) => {
  profileDisplay.value = user;
  router.push({ path: `/freelancer/${user.id}` });
}

const updateInclude = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    searchParams.value.include = `${searchParams.value.include},${target.value}`;
  } else {
    searchParams.value.include = searchParams.value.include.replace(`,${target.value}`, '');
  }
  console.log('Include:', searchParams.value.include);
  fetchFreelancer(`v1/accounts?include=${searchParams.value.include}&filter[type]=${searchParams.value.type}&filter[search]=${searchParams.value.search}`);
};

</script>

<template>
  <div class="my-8 lg:mx-auto mx-5">
    <ProfileInfo class="max-w-6xl mx-auto " />
    <div class="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5 mx-auto ">

      <!-- Left Column -->
      <div class="col-span-1 flex flex-col gap-4">
      
        <!-- Filter search -->
        <Section>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">Filter</h2>
            </div>
          </template>
          <template #content>
            <div v-for="filter in filters" :key="filter.value" class="flex items-center">
              <input type="checkbox" :value="filter.value" @change="updateInclude" class="mr-2" checked />
              <label>{{ filter.name }}</label>
            </div>
          </template>
        </Section>

      </div>

      <!-- Right Column -->
      <div class="col-span-1 lg:col-span-2 ">
        <div class="grid grid-cols-1 gap-5">
          <div class="border border-gray-300 rounded-lg p-4 flex flex-row items-center gap-2">
            <Icon icon="material-symbols:search" class=" text-xl text-gray-400" />
            <input v-model="searchParams.search" type="text" placeholder="Search for freelancers..." class="w-full outline-none border-none"
             />
          </div>
          <div v-if="!isLoading && freelancers">
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

          <div v-if="tabs[0].current && !isLoading && freelancers" class="flex flex-col gap-4">
            <div v-for="(freelancer, idx) in freelancers.data" :key="idx">
              <FreelancerCard @save="updateSaveStatus($event,false)" @unsave="updateSaveStatus($event, true)" :freelancer="freelancer" @profile="freelancerProfile" />
            </div>
            <Pagination
                v-if="!isLoading && (freelancers.data ?? []).length > 0 && tabs[0].current && freelancers.data.filter(freelancer => freelancer.is_saved === false).length > 0"
                :pagination="freelancers.meta"
                @prev-page="fetchFreelancers(freelancers.meta.current_page - 1)"
                @next-page="fetchFreelancers(freelancers.meta.current_page + 1)"
            />
          </div>

          <div v-if="isLoading" class="flex flex-col gap-4">
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
