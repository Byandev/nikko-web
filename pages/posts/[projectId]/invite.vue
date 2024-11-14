<script setup lang="ts">
import type { ICountry } from 'country-state-city';
import _ from 'lodash';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Account } from '~/types/models/Account';
import type { PaginatedList } from '~/types/models/Pagination';
import type { Skill } from '~/types/models/Skill';
import { accountStore } from '~/store/accountStore';

const route = useRoute();
const { account } = storeToRefs(accountStore());

const tabs = [
    { name: 'View Job', href: `/posts/${route.params.projectId}/details`, current: false },
    { name: 'All Proposals', href: `/posts/${route.params.projectId}/proposals`, current: false },
    { name: 'Invite Freelancers', href: `/posts/${route.params.projectId}/invite`, current: true },
    { name: 'Hired', href: `/posts/${route.params.projectId}/hires`, current: false },
];

const miniTab = ref([
    { name: 'Top Freelancers', current: true },
    { name: 'Invited Freelancers', current: false },
    { name: 'Shortlisted Freelancer', current: false }
]);

const setActiveTab = (tabName: string) => {
    miniTab.value.forEach(tab => {
        tab.current = (tab.name === tabName);
    });
};

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

const { data: freelancers, fetchData: fetchFreelancers, pending: isLoading } = useFetchData<PaginatedList<Account>, ApiErrorResponse>();

onMounted(async () => {
    await fetchFreelancers(
        `v1/accounts?include=${searchParams.value.include}&filter[type]=${searchParams.value.type}&filter[search]=${searchParams.value.search}&filter[skills]=${searchParams.value.skills.map(skill => skill.id).join(',')}&filter[user_countries]=${searchParams.value.countries.map(country => country.isoCode).join(',')}&filter[is_saved]=true&page=1`,
        {
            headers: account?.value?.id
                ? {
                    'X-ACCOUNT-ID': account.value.id.toString(),
                }
                : undefined,
        }
    );
});

const fetchFreelancersPage = async (page: number) => {
    await fetchFreelancers(`v1/accounts?include=${searchParams.value.include}&filter[type]=${searchParams.value.type}&filter[search]=${searchParams.value.search}&filter[skills]=${searchParams.value.skills.map(skill => skill.id).join(',')}&filter[user_countries]=${searchParams.value.countries.map(country => country.isoCode).join(',')}&filter[is_saved]=true&page=${page}`, {
        headers: account?.value?.id
            ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            }
            : undefined,
    });
};



</script>

<template>
    <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <Tab :tabs="tabs">
            <div class="bg-white shadow sm:rounded-lg">
                <div class="p-6">
                    <div>
                        <nav class="flex space-x-4" aria-label="Tabs">
                            <template v-for="tab in miniTab" :key="tab.name">
                                <a href="#" @click.prevent="setActiveTab(tab.name)"
                                    :class="tab.current ? 'bg-primary/30 text-primary' : 'text-gray-500 hover:text-gray-700'"
                                    class="px-3 py-2 font-medium text-sm rounded-md">
                                    {{ tab.name }}
                                </a>
                            </template>
                        </nav>
                    </div>
                    <div v-if="miniTab[0].current" class="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div class="px-4 py-5 sm:px-6">
                            <FreelancerCard 
                                v-for="(freelancer, idx) in freelancers?.data" :key="idx" :freelancer="freelancer"
                                />
                            <Pagination v-if="!isLoading && freelancers?.data && freelancers.data.length > 0 && freelancers?.meta"
                                :pagination="freelancers?.meta"
                                @prev-page="fetchFreelancersPage(freelancers?.meta.current_page - 1)"
                                @next-page="fetchFreelancersPage(freelancers?.meta.current_page + 1)" />

                        </div>
                    </div>
                </div>
            </div>
        </Tab>
    </div>
</template>