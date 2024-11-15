<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Project } from '~/types/models/Project';
import _ from 'lodash';
import type {PaginatedList} from "~/types/models/Pagination";
import type {ProposalInvitation} from "~/types/models/ProposalInvitation";
import type {Proposal} from "~/types/models/Proposal";

const route = useRoute();

const { data: details, fetchData: fetchProjectDetails, pending: isFetching } = useFetchData<{ data: Project }, ApiErrorResponse>();

onMounted(() => {
  fetchProjectDetails(`/v1/projects/${route.params.projectId}`);
});
</script>

<template>
    <div class="max-w-6xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
      <PostTabs/>
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <div class="space-y-5">
            <div v-if="details">
           <ProjectCard
              v-for="detail in details ?? []"
              :key="detail.id"
              :project="detail"
              :show-save-button="false"
              :show-withdraw-application="false"
              @click=""
              @apply=""
          />
          </div>
          </div>
        </div>
      </div>
    </div>
</template>