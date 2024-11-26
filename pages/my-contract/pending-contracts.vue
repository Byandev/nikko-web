<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Proposal } from '~/types/models/Proposal';
import { accountStore } from '~/store/accountStore';
import _ from 'lodash';
import type {PaginatedList} from "~/types/models/Pagination";
import ContractTabs from "~/components/freelancer/ContractTabs.vue";
import type {ProposalInvitation} from "~/types/models/ProposalInvitation";
import { AccountType } from '~/types/models/Account';
import type { Contract } from '~/types/models/Contract';

const { account } = storeToRefs(accountStore());

const router = useRouter();

const message = ref('');
const isMessageModalOpen = ref(false);
const invitationId = ref<number|null>(null);

const page = ref(1)

const queryString = computed(() => {
  let params: Record<string, string>  = {
    'filter[status]': 'PENDING',
    include: 'account.user.avatar,proposal.project.account.user,proposal.project.languages,proposal.project.skills,proposal.project.images,proposal.attachments',
    page: page.value.toString()
  }

  return new URLSearchParams(params).toString();
})


const { data: pendingContracts, fetchData: fetchContract, pending: isLoading } = useFetchData<PaginatedList<Contract>,ApiErrorResponse>();
const { sendRequest: updateStatus } = useSubmit<ProposalInvitation, ApiErrorResponse>();

const fetchProposals =  async  () => {
  await fetchContract(`/v1/contracts?${queryString.value}`,{
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

const acceptContract = async (id: number | null) => {
  try{
    await updateStatus(`/v1/contracts/${id}`, {
      method: 'PUT',
      headers: account?.value?.id ? {
        'X-ACCOUNT-ID': account.value.id.toString(),
      } : undefined,
      body: {
        status: 'ACTIVE',
      }
    });
  }catch (e) {
    console.log("Failed to reject proposal: ", e.message)
  }
};

const rejectContract = async (id: number | null) => {
  try{
    await updateStatus(`/v1/contracts/${id}`, {
      method: 'PUT',
      headers: account?.value?.id ? {
        'X-ACCOUNT-ID': account.value.id.toString(),
      } : undefined,
      body: {
        status: 'REJECTED',
      }
    });
  }catch (e) {
    console.log("Failed to reject proposal: ", e.message)
  }
};

</script>

<template>
  <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
    <ContractTabs/>

    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg font-medium text-gray-900 mb-5">Pending Offers</h3>

        <div class="space-y-5">
          <div v-if="pendingContracts && pendingContracts?.data.length > 0">
            <ProjectCard
                v-for="contract in pendingContracts?.data ?? []"
                :key="contract.id"
                :view-as="AccountType.FREELANCER"
                :project="contract.proposal.project"
                :contract="contract"
                :show-reject-button="true"
                :show-accept-button="true"
                :show-contract-details="true"
                class="mb-5"
                @accept-contract="acceptContract($event)"
                @reject-contract="rejectContract($event)"

            />
            <Pagination
                v-if="!isLoading && pendingContracts.data.length > 0"
                :pagination="pendingContracts?.meta"
                @prev-page="page = page -1 "
                @next-page="page = page + 1" />
          </div>

          <div v-else>
            <p class="text-gray-600 text-base tracking-wider text-center">You have no submitted proposals yet.</p>
          </div>
        </div>
      </div>

      <Modal :modelValue="isMessageModalOpen" @update:modelValue="isMessageModalOpen = $event">
        <template #title>Rejection message</template>
        <template #content>
            <textarea v-model="message" class="w-full h-32 p-2 border rounded" placeholder="Write your message here..."></textarea>
        </template>
        <template #actions>
            <Button text="Cancel" type="button" background="white" foreground="gray" @click="{isMessageModalOpen = false;
            message = '';
            invitationId = null;
            }" />
            <Button text="Reject" type="button" background="primary" foreground="white" @click="rejectContract(invitationId)" />
        </template>
    </Modal>
    </div>
  </div>
</template>
