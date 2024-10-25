<script setup lang="ts">
import {Icon} from "@iconify/vue";

const emits = defineEmits<{ (e: 'submit'): void; (e: 'back'): void; }>();

import type {Skill} from "~/types/models/Skill";
import type {Account} from '~/types/models/Account';
import type {ApiErrorResponse} from '~/types/api/response/error';

import {authStore} from '~/store/authStore';
import {accountStore} from "~/store/accountStore";
import {useFetchData} from "~/composables/useFetchData";
import { helpers, required } from "@vuelidate/validators";

const route = useRoute();
const {user} = storeToRefs(authStore());
const {account} = storeToRefs(accountStore())
const { data: skills, fetchData: fetchSkills } = useFetchData<{ data: Skill[] }, ApiErrorResponse>();

fetchSkills('/v1/skills');

const {sendRequest: updateAccount, pending: isSubmitting} = useSubmit<{ data: Account }, ApiErrorResponse>();

interface FormValues {
  skills: Skill[]
}

const selectedSkillId = ref<number>(0)

const form = ref<FormValues>({
  skills: (account.value?.skills ?? [])
});

const rules = {
  skills: {
    required: helpers.withMessage('Please select at least one skill', required)
  }
}

const {formRef, v$} = useValidation(form, rules);

const skillOptions = computed<Skill[]>(() => (skills.value?.data ?? []).filter(skill => !form.value.skills.find(i => i.id === skill.id)))

const submitForm = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;

  try {
   const response = await updateAccount(`/v1/auth/accounts/${route.params.accountId}`, {
      method: 'PUT',
      body: {
        skills: form.value.skills.map(skill => skill.id)
      },
    });

    if (account.value) {
      account.value.skills = response.data.skills
    }

    emits('submit');
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};

const onSelect = (e: Event) => {
  if (selectedSkillId.value) {
    const selectedSkill = skillOptions.value.find(skill => skill.id === selectedSkillId.value)

    if (selectedSkill && !form.value.skills.find(skill => skill.id === selectedSkillId.value) ) {
      form.value.skills.push(selectedSkill)
    }

    selectedSkillId.value = 0
  }
}

const onRemoveSkill = (index: number) => {
  form.value.skills.splice(index, 1);
}
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold mb-4">List Your Skills</h1>
    <span class="text-gray-600 mb-4">Showcase your expertise by listing your skills.</span>

    <form @submit.prevent="submitForm" class="w-full max-w-lg">
      <!-- Profile Title -->
      <div class="mt-4 w-full">
        <label for="profileTitle" class="block text-sm font-medium leading-6 text-gray-900">
          Skills <span class="text-red-500">*</span>
        </label>
        <div class="mt-2">
          <select required @change="onSelect" v-model="selectedSkillId"
                  class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
            <option :value="0">Select Skill</option>
            <option class="truncate text-sm leading-6" v-for="skill in skillOptions" :key="skill.id"
                    :value="skill.id">
              {{ skill.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap">
        <div v-for="(skill, idx) in formRef.skills" :key="`selected-skill-${skill.id}`" class="mr-2 my-1">
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
        <span v-if="v$.$error" class="text-red-900 text-sm">{{
              v$.$errors[0].$message }}</span>
      </div>

      <div class="flex mt-5 justify-between w-full">
        <span @click="emits('back')" class="flex flex-row justify-center items-center cursor-pointer text-primary">
        <Icon icon="weui:back-filled" width="20" height="20" class="text-primary"/>
        Back
      </span>

        <Button text="Submit" type="submit" background="primary" foreground="white" :is-loading="isSubmitting"/>
      </div>
    </form>
  </div>
</template>
