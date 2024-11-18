<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Project } from '~/types/models/Project';
import _ from 'lodash';
import { AccountType } from '~/types/models/Account';

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
            <div v-if="details && !isFetching">
           <ProjectCard
              v-for="detail in details ?? []"
              :key="detail.id"
              :view-as="AccountType.FREELANCER"
              :project="detail"
              :show-save-button="false"
              :show-withdraw-application="false"
          />
          </div>
          </div>
        </div>
      </div>
    </div>
</template>