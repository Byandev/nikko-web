<script setup lang="ts">
import type {Account} from "~/types/models/Account";
import Button from "~/components/ui/Button.vue";
import type {PaginatedList} from "~/types/models/Pagination";
import type {Project} from "~/types/models/Project";
import type {ApiDataResponse, ApiErrorResponse} from "~/types/api/response/error";
import {accountStore} from "~/store/accountStore";
import {helpers, required} from "@vuelidate/validators";
import type {ProposalInvitation} from "~/types/models/ProposalInvitation";

const {freelancer, isOpen} = defineProps<{ freelancer?: Account, isOpen: boolean }>();
const emit = defineEmits<{
  (e: 'toggle-open', isOpen: boolean): void;
}>();

const { account } = storeToRefs(accountStore());

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID' : account.value.id.toString()} : undefined
);

const {data: projects, fetchData:fetchProjects, } = useFetchData<PaginatedList<Project>, ApiErrorResponse>();
const { sendRequest: sendInvite } = useSubmit<ApiDataResponse<ProposalInvitation>, ApiErrorResponse>();

const form = ref<{  "project_id": string, "message": string }>({
  project_id: "",
  message: ""
})

const rules = {
  project_id: {
    required: helpers.withMessage('Project is required', required),
  },
  message: {
    required: helpers.withMessage('Message is required', required),
  },
};

const { formRef, v$ } = useValidation(form, rules);

watch(
    [() => freelancer],
    debounce(async () => {
      if (freelancer) {
        await fetchProjects(`v1/client/projects?page=1&per_page=100&filter[status]=ACTIVE&filter[can_be_invited_to_account]=${freelancer.id}`, { headers: requestHeaders.value})
      }
    }, 100)
);

const sendProposalInvitation =  async  () => {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  try{
    await sendInvite(`/v1/client/proposals/invitations`, {
      method: 'POST',
      headers: requestHeaders.value,
      body: {
        project_id: form.value.project_id,
        account_id: freelancer?.id,
        message: form.value.message
      }
    });

    emit('toggle-open', false)
  }catch(e){
    console.log(e);
  }
}

</script>


<template>
  <Modal :modelValue="isOpen" @update:modelValue="emit('toggle-open', !isOpen)" @close="emit('toggle-open', false)">
    <template #title>
      <h2>Send Invitation to freelancer</h2>
    </template>
    <template #content>

        <div class="space-y-6">
          <div class="flex flex-col">
            <label for="bio-title" class="text-sm font-medium text-gray-500 text-left w-full">Project <span class="text-red-500">*</span></label>
            <div class="my-1 text-sm text-gray-900">
              <select v-model="form.project_id" class="w-full border rounded py-2">
                <option value="">Select project</option>
                <option :key="project.id" :value="project.id?.toString()" v-for="project in ((projects as PaginatedList<Project>)?.data ?? [])">
                  {{project.title}}
                </option>
              </select>
            </div>

            <span v-if="v$.project_id.$error" class="text-left text-red-900 text-sm">{{ v$.project_id.$errors[0].$message }}</span>
          </div>

          <div class="flex flex-col">
            <label for="bio-title" class="text-sm font-medium text-gray-500 text-left">Message <span class="text-red-500">*</span></label>
            <div class="my-1 text-sm text-gray-900">
              <textarea v-model="form.message" class="w-full h-32 p-2 border rounded" placeholder="Write your message here..."></textarea>
            </div>

            <span v-if="v$.message.$error" class="text-left text-red-900 text-sm">{{ v$.message.$errors[0].$message }}</span>
          </div>
        </div>
    </template>
    <template #actions>
      <Button text="Cancel" type="button" background="white" foreground="gray" @click="emit('toggle-open', false)" />
      <Button text="Invite" type="button" background="primary" foreground="white" @click="sendProposalInvitation"/>
    </template>
  </Modal>
</template>
