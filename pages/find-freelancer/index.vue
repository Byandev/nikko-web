<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { accountStore } from '~/store/accountStore';
import { profileDisplayStore } from '~/store/profileDisplayStore';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Freelancer } from '~/types/models/Freelancer';
import type { PaginatedList } from '~/types/models/Pagination';
import { debounce } from '~/utils/debounce';

const router = useRouter();
const { account } = storeToRefs(accountStore());

interface SearchParams {
  include: string;
  type: string;
  search: string;
}

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

const { data: Savedfreelancers, fetchData: fetchSavedFreelancer, pending: isLoadingSavedFreelancer } = useFetchData<PaginatedList<Freelancer>, ApiErrorResponse>();
const { data: Unsavedfreelancers, fetchData: fetchUnsavedFreelancer, pending: isLoadingUnsavedFreelancer } = useFetchData<PaginatedList<Freelancer>, ApiErrorResponse>();

const { sendRequest: updateFreelancer } = useSubmit<{ data: Freelancer }, ApiErrorResponse>();

onMounted(async () => {
  await fetchFreelancers(1);
});

watch(
  () => searchParams.value.search,
  debounce(async () => {
    await fetchFreelancers(1);
  }, 300)
);

const fetchFreelancers = async (page: number) => {
  await fetchUnsavedFreelancer(
    `v1/accounts?include=${searchParams.value.include}&filter[type]=${searchParams.value.type}&filter[search]=${searchParams.value.search}&page=${page}`,
    {
      headers: account?.value?.id
        ? {
          'X-ACCOUNT-ID': account.value.id.toString(),
        }
        : undefined,
    }
  );

  await fetchSavedFreelancer(
    `v1/accounts?include=${searchParams.value.include}&filter[type]=${searchParams.value.type}&filter[search]=${searchParams.value.search}&filter[is_saved]=true$page=${page}`,
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

const freelancerProfile = (user: Freelancer) => {
  profileDisplay.value = user;
  router.push({ path: `/freelancer/${user.id}` });
}

const updateInclude = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const includes = searchParams.value.include.split(',');

  if (target.checked) {
    if (!includes.includes(target.value)) {
      includes.push(target.value);
    }
  } else {
    const index = includes.indexOf(target.value);
    if (index > -1) {
      includes.splice(index, 1);
    }
  }

  searchParams.value.include = includes.join(',');
  fetchFreelancers(1);
};

const tabCount = computed(() => {
  return (tabName: string) => {
    if (tabName === 'All freelancer') {
      return Unsavedfreelancers.value?.data.length || 0;
    } else if (tabName === 'Saved freelancer') {
      return Savedfreelancers.value?.data.length || 0;
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
            <input v-model="searchParams.search" type="text" placeholder="Search for freelancers..."
              class="w-full outline-none border-none" />
          </div>
          <div v-if="!isLoadingSavedFreelancer && !isLoadingUnsavedFreelancer && (Savedfreelancers || Unsavedfreelancers)">
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
            <Pagination
              v-if="!isLoadingUnsavedFreelancer && Unsavedfreelancers.data.length > 0"
              :pagination="Unsavedfreelancers.meta" @prev-page="fetchFreelancers(Unsavedfreelancers.meta.current_page - 1)"
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
            <Pagination
              v-if="!isLoadingSavedFreelancer && Savedfreelancers.data.length > 0"
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