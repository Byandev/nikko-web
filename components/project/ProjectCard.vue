<script lang="ts" setup>
import {HeartIcon} from '@heroicons/vue/24/outline';
import {ExperienceLevelToText, type Project, ProjectLengthToText} from "~/types/models/Project";
import type {ApiErrorResponse} from "~/types/api/response/error";
import {accountStore} from "~/store/accountStore";

const props = defineProps<{ project: Project; }>();
const emit = defineEmits<{
  (e: 'click', id: number): void;
  (e: 'save', id: number): void;
  (e: 'un-save', id: number): void;
}>();

const {project} = toRefs(props)

const {account} = storeToRefs(accountStore());
const {sendRequest: toggleSaveProject} = useSubmit<{ data: Project }, ApiErrorResponse>();

const showAllDescription = ref(false);
const hasLongDescription = computed(() => project.value.description.length > 300);

const toggleSave = async () => {
  const isSaved = !project.value.is_saved;

  project.value.is_saved = isSaved;

  isSaved ? emit('save', project.value.id) : emit('un-save', project.value.id);

  try {
    await toggleSaveProject(`v1/projects/${project.value.id}/${isSaved ? 'save' : 'un-save'}`,
        {
          method: isSaved ? 'POST' : 'DELETE',
          headers: account?.value?.id ? {
            'X-ACCOUNT-ID': account.value.id.toString(),
          } : undefined,
        }
    );
  } catch (e) {
    console.log("Failed to marked the project: ", e.message)
  }
}
</script>

<template>
  <div
      class="bg-white hover:bg-gray-100 ring-1 ring-gray-300 rounded-md hover:cursor-pointer flex divide-x text-sm text-gray-800">
    <div class="w-8/12 px-5 py-5 space-y-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h2 @click="emit('click', project.id)" class="text-xl font-bold hover:underline">{{ project.title }}</h2>

        <HeartIcon @click="toggleSave"
           class="w-5 h-5 text-primary-dark cursor-pointer"
           :class="project.is_saved ? 'fill-primary': ''"
        />
      </div>

      <div class="space-y-1" v-if="project.skills && project.skills.length">
        <div class="font-medium">Skills:</div>
        <div class="flex flex-wrap gap-1">
           <span v-for="(skill, index) in project.skills" :key="index"
                 class="bg-primary/15 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
              {{ skill.name }}
           </span>
        </div>
      </div>

      <p class="">
        {{ hasLongDescription && showAllDescription ? project.description : project.description.slice(0, 300) }}
      </p>
      <p class="underline text-primary" v-if="hasLongDescription" @click="showAllDescription = !showAllDescription">
        {{ showAllDescription ? 'Show Less' : 'Show more' }}
      </p>
    </div>

    <div class="w-4/12 divide-y">
      <div class="pt-5 pb-2 space-y-1 px-5">
        <p>Estimated Budget: <span>${{ project.estimated_budget }}</span></p>
        <p>Experience Level: <span>{{ ExperienceLevelToText[project.experience_level] }}</span></p>
        <p>Project Length: <span>{{ ProjectLengthToText[project.length] }}</span></p>
      </div>

      <div class="py-2 space-y-1 px-5">
        <p>Client: <span>{{ `${project.account.user.first_name} ${project.account.user.last_name}` }}</span></p>
        <p>Location: <span>{{ project.account.user.country_code }}</span></p>
      </div>

      <div class="pt-2 pb-5 px-5">
        <p>Proposals: <span>{{ project.proposals_count ?? 0 }}</span></p>
      </div>
    </div>
  </div>
</template>
