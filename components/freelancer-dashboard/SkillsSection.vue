<script setup lang="ts">
import { accountStore } from '~/store/accountStore';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Account } from '~/types/models/Account';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useSubmit } from '~/composables/useSubmit';
import { useFetchData } from '~/composables/useFetchData';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

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
    console.error('Error updating skills:', error);
  }
};

const requestSkill = async () => {
  if (!account?.value?.id) return;

  try {
    const response = await updateSkills(`/v1/auth/accounts/${account.value.id}`, {
      method: 'PUT',
      body: {
        skills: [
          ...(account.value?.skills?.map((skill: { id: number }) => skill.id) || []),
          ...selectedSkills.value.map((skill: { id: number }) => skill.id)
        ],
      },
    });

    if (account.value) {
      account.value.skills = response.data.skills;
    }

    selectedSkills.value = [];
    isRequestModalOpen.value = false;
  } catch (error) {
    console.error('Error requesting skill:', error);
  }
};

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
          <button class="text-blue-500" @click="isRequestModalOpen = true">Add Skills</button>
          <button class="text-gray-500 ml-5" @click="isEditModalOpen = true">Edit</button>
        </div>
      </div>
    </template>
    <template #content>
      <div class="flex flex-wrap">
        <div v-if="account?.skills.length === 0" class="text-gray-500">
          No skills yet.
        </div>
        <div v-else v-for="(skill, idx) in account?.skills" :key="`selected-skill-${skill.id}`" class="mr-2 my-1">
          <span
            class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
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
          <span
            class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            {{skill.name}}
            <button @click="onRemoveSkill(idx)" type="button"
              class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-green-600/20">
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
      <h3 class="text-lg font-medium leading-6 text-gray-900">Add New Skill</h3>
    </template>
    <template #content>
      <div class="mt-4 w-full">

        <div class="mt-2">
          <Listbox v-model="selectedSkills" multiple>
            <div class="relative mt-1">
              <ListboxButton
                class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                <span class="block truncate">
                  <span v-if="selectedSkills.length === 0">Select Skill</span>
                  <span v-else>
                    <span v-for="(skill, index) in selectedSkills" :key="index">
                      {{ skill.name }}<span v-if="index < selectedSkills.length - 1">, </span>
                    </span>
                  </span>
                </span>
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>

              <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <ListboxOptions
                  class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                  <ListboxOption v-for="(skill, index) in skillOptions?.data" v-slot="{ active, selected }"
                    :key="index" :value="skill" as="template">
                    <li
                      :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                      <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ skill.name
                        }}</span>
                      <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
                      </span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </div>
          </Listbox>
        </div>
        <div class="mt-4">
          <div class="flex flex-wrap mt-2">
            <div v-for="(skill, idx) in selectedSkills" :key="`selected-skill-${skill.id}`" class="mr-2 my-1">
              <span
                class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                {{skill.name}}
                <button @click="onRemoveSelectedSkill(idx)" type="button"
                  class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-green-600/20">
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
      <Button @click="requestSkill" text="Add" type="button" background="primary" foreground="white" />
    </template>
  </Modal>
</template>