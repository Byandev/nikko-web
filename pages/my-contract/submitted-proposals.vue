<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Proposal } from '~/types/models/Proposal';
import { accountStore } from '~/store/accountStore';
import _, {omit} from 'lodash';
import type {PaginatedList} from "~/types/models/Pagination";
import ContractTabs from "~/components/freelancer/ContractTabs.vue";
import type {Project} from "~/types/models/Project";

const { account } = storeToRefs(accountStore());

const tabs = [
  { name: 'Submitted Proposals', href: '/my-contract/submitted-proposals', current: true },
  { name: 'Invites', href: '#', current: false },
  { name: 'Active Proposals', href: '#', current: false },
  { name: 'Pending Offers', href: '#', current: false },
  { name: 'Active Jobs', href: '#', current: false },
  { name: 'Completed Jobs', href: '#', current: false },
];

const router = useRouter();

const page = ref(1)

const queryString = computed(() => {
  let params: Record<string, string>  = {
    include: 'project.account.user,attachments,project.skills',
    page: page.value.toString()
  }

  return new URLSearchParams(params).toString();
})


const { data: proposals, fetchData: fetchSubmittedProposals, pending: isLoading } = useFetchData<PaginatedList<Proposal>,ApiErrorResponse>();


const fetchProposals =  async  () => {
  await fetchSubmittedProposals(`/v1/proposals?${queryString.value}`,{
    method: 'GET',
    headers: account?.value?.id ? {
      'X-ACCOUNT-ID': account.value.id.toString(),
    } : undefined,
  });
}

onMounted(() => {
  fetchProposals();
});

watch(
    [() => queryString.value],
    debounce(async () => {
      await fetchProposals();
    }, 500)
);



const viewProposal = async (id: number) => {
  await router.push(`/proposal/${id}`);
};

const extractProjectData = (proposal: Proposal) => {
  return {...proposal.project, my_proposal: omit(proposal, 'project') }
}

</script>

<template>
  <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
    <ContractTabs/>
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg font-medium text-gray-900 mb-5">My Proposal</h3>

          <div class="space-y-5">
            <div v-if="(proposals as PaginatedList<Proposal>)?.data.length > 0">
              <ProjectCard
                  v-for="proposal in (proposals as PaginatedList<Proposal>)?.data ?? []"
                  :key="proposal.id"
                  :project="extractProjectData(proposal)"
                  :show-save-button="false"
                  :show-withdraw-application="true"
                  @click="() => viewProposal(proposal.id)"
                  @withdraw-proposal="() => fetchProposals()"
              />


              <Pagination
                  v-if="!isLoading && (proposals as PaginatedList<Proposal>)?.data.length > 0"
                  :pagination="(proposals as PaginatedList<Proposal>)?.meta"
                  @prev-page="page = page -1 "
                  @next-page="page = page + 1" />
            </div>

            <div v-else>
              <p class="text-gray-600 text-base tracking-wider text-center">You have no submitted proposals yet.</p>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>
