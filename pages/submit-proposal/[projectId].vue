<script setup lang="ts">
import { accountStore } from '~/store/accountStore';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Project } from '~/types/models/Project';
import { watch } from 'vue';

const route = useRoute();
const { account } = storeToRefs(accountStore());
const { data: project, fetchData: fetchProject, pending: isLoading } = useFetchData<Project, ApiErrorResponse>();

onMounted(async() => {
    await fetchProject(`v1/projects/${route.params.projectId}`,{
      headers: account?.value?.id ? {
        'X-ACCOUNT-ID': account.value.id.toString(),
      } : undefined,
    });
});

</script>

<template>
    <div class="my-8 lg:mx-auto mx-5">
      <div class="max-w-6xl grid grid-cols-1 gap-4 mt-5 mx-auto">
        <h1 class="text-6xl font-semibold whitespace-nowrap">Submit a proposal</h1>
  
        <div class="ring-1 ring-gray-300 rounded-md p-10 my-10">
          <h2 class="text-3xl">Job Details</h2>
          <div v-if="project" class="grid grid-cols-1 gap-4 mt-5">
            <div class="grid grid-cols-1 gap-4">
              <div class="grid grid-cols-1 gap-4">
                <label class="text-lg">Title</label>
                <p class="text-lg" v-if="project.title">{{ project.title }}</p>
                <p class="text-lg" v-else>Project title not available yet</p>
              </div>
              <div class="grid grid-cols-1 gap-4">
                <label class="text-lg">Description</label>
                <p class="text-lg" v-if="project.description">{{ project.description }}</p>
                <p class="text-lg" v-else>Project description not available yet</p>
              </div>
            </div>
          </div>
          <div v-else>
            <p>Loading project details...</p>
          </div>
        </div>
      </div>
    </div>
  </template>