<script setup lang="ts">
import { accountStore } from '~/store/accountStore';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Account } from '~/types/models/Account';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useSubmit } from '~/composables/useSubmit';
import { useFetchData } from '~/composables/useFetchData';

interface Skill {
  id: number;
  name: string;
}

const { account } = storeToRefs(accountStore());

const { sendRequest: updateSkills } = useSubmit<{ data: Account }, ApiErrorResponse>();
const { data: skillOptions, fetchData: fetchSkills } = useFetchData<{ data: Skill[] }, ApiErrorResponse>();

fetchSkills('/v1/skills');

const isEditModalOpen = ref(false);
const isRequestModalOpen = ref(false);
const selectedSkillId = ref<number | null>(null);
const selectedSkills = ref<Skill[]>([]);

function onRemoveSkill(idx: number) {
  if (account.value && account.value.skills) {
    account.value.skills.splice(idx, 1);
  }
}

const submitSkills = async () => {
  if (!account.value || !account.value.skills) return;

  try {
    const response = await updateSkills(`/v1/auth/accounts/${account.value.id}`, {
      method: 'PUT',
      body: {
        skills: account.value.skills.map((skill: { id: number }) => skill.id),
      },
    });

    if (account.value) {
      account.value.skills = response.data.skills;
    }

    isEditModalOpen.value = false;
  } catch (error) {
    console.log('Error updating skills:', error);
  }
};

const requestSkill = async () => {
  if (!selectedSkillId.value || !account.value || !account.value.skills) return;

  try {
    const response = await updateSkills(`/v1/auth/accounts/${account.value.id}`, {
      method: 'PUT',
      body: {
        skills: [
          ...account.value.skills.map((skill: { id: number }) => skill.id),
          ...selectedSkills.value.map((skill: { id: number }) => skill.id)
        ],
      },
    });

    if (account.value) {
      account.value.skills = response.data.skills;
    }

    selectedSkills.value = [];
    selectedSkillId.value = null;
    isRequestModalOpen.value = false;
  } catch (error) {
    console.log('Error requesting skill:', error);
  }
};

const onSelect = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const skillId = Number(target.value);
  const skill = skillOptions.value?.data.find(skill => skill.id === skillId);
  if (skill && !selectedSkills.value.some(s => s.id === skill.id)) {
    selectedSkills.value.push(skill);
  }
}

const onRemoveSelectedSkill = (idx: number) => {
  selectedSkills.value.splice(idx, 1);
}

const onCancelEdit = async () => {
    isEditModalOpen.value = false;
}

</script>

<template>
  <Section class="mt-5">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Skills</h2>
        <div>
          <button class="text-blue-500" @click="isRequestModalOpen = true">Request Skills</button>
          <button class="text-gray-500 ml-5" @click="isEditModalOpen = true">Edit</button>
        </div>
      </div>
    </template>
    <template #content>
      <div class="flex flex-wrap">
        <div v-for="(skill, idx) in account?.skills" :key="`selected-skill-${skill.id}`" class="mr-2 my-1">
          <span class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            {{skill.name}}
          </span>
        </div>
      </div>
    </template>
  </Section>

  <Modal v-model="isEditModalOpen" @close="isEditModalOpen = false">
    <template #title>
      <h3 class="text-lg font-medium leading-6 text-gray-900">Edit Skills</h3>
    </template>
    <template #content>
      <div class="mt-5 flex flex-wrap">
        <div v-for="(skill, idx) in account?.skills" :key="`selected-skill-${skill.id}`" class="mr-2 my-1">
          <span class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            {{skill.name}}
            <button @click="onRemoveSkill(idx)" type="button" class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-green-600/20">
              <span class="sr-only">Remove</span>
              <svg viewBox="0 0 14 14" class="h-3.5 w-3.5 stroke-green-700/50 group-hover:stroke-green-700/75">
                <path d="M4 4l6 6m0-6l-6 6" />
              </svg>
              <span class="absolute -inset-1" />
            </button>
          </span>
        </div>
      </div>
    </template>
    <template #actions>
      <Button @click="onCancelEdit" text="Cancel" type="button" background="white" foreground="primary" />
      <Button @click="submitSkills" text="Save" type="button" background="primary" foreground="white" />
    </template>
  </Modal>

  <Modal v-model="isRequestModalOpen" @close="isRequestModalOpen = false">
    <template #title>
      <h3 class="text-lg font-medium leading-6 text-gray-900">Request New Skill</h3>
    </template>
    <template #content>
      <div class="mt-4 w-full">
        
        <div class="mt-2">
          <select required @change="onSelect" v-model="selectedSkillId"
                  class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
            <option :value="null">Select Skill</option>
            <option class="truncate text-sm leading-6" v-for="skill in skillOptions?.data" :key="skill.id"
                    :value="skill.id">
              {{ skill.name }}
            </option>
          </select>
        </div>
        <div class="mt-4">
          <div class="flex flex-wrap mt-2">
            <div v-for="(skill, idx) in selectedSkills" :key="`selected-skill-${skill.id}`" class="mr-2 my-1">
                <span class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    {{skill.name}}
                    <button @click="onRemoveSelectedSkill(idx)" type="button" class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-green-600/20">
                    <span class="sr-only">Remove</span>
                    <svg viewBox="0 0 14 14" class="h-3.5 w-3.5 stroke-green-700/50 group-hover:stroke-green-700/75">
                        <path d="M4 4l6 6m0-6l-6 6" />
                    </svg>
                    <span class="absolute -inset-1" />
                    </button>
                </span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #actions>
      <Button @click="isRequestModalOpen = false" text="Cancel" type="button" background="white" foreground="primary" />
      <Button @click="requestSkill" text="Request" type="button" background="primary" foreground="white" />
    </template>
  </Modal>
</template>