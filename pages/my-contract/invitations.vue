<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Proposal } from '~/types/models/Proposal';
import { accountStore } from '~/store/accountStore';
import _, {omit} from 'lodash';
import type {PaginatedList} from "~/types/models/Pagination";
import ContractTabs from "~/components/freelancer/ContractTabs.vue";
import type {ProposalInvitation} from "~/types/models/ProposalInvitation";
import { AccountType } from '~/types/models/Account';

const { account } = storeToRefs(accountStore());

const router = useRouter();

const message = ref('');
const isMessageModalOpen = ref(false);
const invitationId = ref<number|null>(null);

const page = ref(1)

const queryString = computed(() => {
  let params: Record<string, string>  = {
    include: 'project.account.user',
    page: page.value.toString()
  }

  return new URLSearchParams(params).toString();
})


const { data: proposalInvitations, fetchData: fetchProposalInvitations, pending: isLoading } = useFetchData<PaginatedList<ProposalInvitation>,ApiErrorResponse>();
const { sendRequest: rejectClientProposal } = useSubmit<ProposalInvitation, ApiErrorResponse>();

const fetchProposals =  async  () => {
  await fetchProposalInvitations(`/v1/proposals/invitations?${queryString.value}`,{
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

const viewJob = async (id: number) => {
  await router.push(`/jobs/${id}`);
};

const sendProposal = async (id: number) => {
  await router.push(`/submit-proposal/${id}`);
};

const updateInvatationId = (id: number) => {
  invitationId.value = id;
  isMessageModalOpen.value = true;
}

const rejectProposal = async (id: number | null) => {
  try{
    await rejectClientProposal(`/v1/proposals/invitations/${id}`, {
      method: 'PUT',
      headers: account?.value?.id ? {
        'X-ACCOUNT-ID': account.value.id.toString(),
      } : undefined,
      body: {
        status: 'REJECTED',
        rejection_message: message.value
      }
    });

    isMessageModalOpen.value = false;
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
        <h3 class="text-lg font-medium text-gray-900 mb-5">Invites</h3>

        <div class="space-y-5">
          <div v-if="(proposalInvitations as PaginatedList<ProposalInvitation>)?.data.length > 0">
            <ProjectCard
                v-for="invitation in (proposalInvitations as PaginatedList<Proposal>)?.data ?? []"
                :key="invitation.id"
                :view-as="AccountType.FREELANCER"
                :project="invitation.project"
                :proposal-id="invitation.id"
                :show-save-button="false"
                :show-propose-button="true"
                :show-submit-proposal-button="true"
                :show-reject-button="true"
                :show-withdraw-application="false"
                class="mb-5"
                @click="viewJob"
                @submit-proposal="sendProposal"
                @reject-proposal="updateInvatationId"
            />
            <Pagination
                v-if="!isLoading && (proposalInvitations as PaginatedList<Proposal>)?.data.length > 0"
                :pagination="(proposalInvitations as PaginatedList<Proposal>)?.meta"
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
            <Button text="Reject" type="button" background="primary" foreground="white" @click="rejectProposal(invitationId)" />
        </template>
    </Modal>
    </div>
  </div>
</template>
