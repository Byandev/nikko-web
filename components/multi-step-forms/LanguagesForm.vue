<script setup lang="ts">
const emits = defineEmits<{ (e: 'submit'): void; (e: 'back'): void; }>();

import codes from 'iso-language-codes';
import { startCase } from 'lodash-es';
import { Icon } from '@iconify/vue';

import { authStore } from '~/store/authStore';
import type { Account } from '~/types/models/Account';
import { Proficiency } from '~/types/models/Language';

import type { ApiErrorResponse } from '~/types/api/response/error';
import { helpers, required } from '@vuelidate/validators';

const { user } = storeToRefs(authStore());

interface FormValues {
  languages: { name: string; proficiency: string; }[];
}

const form = ref<FormValues>({
  languages: user.value.languages?.length ?
    user.value.languages.map(language => ({ name: language.name, proficiency: language.proficiency })) :
    [{ name: '', proficiency: '' }],
});


const rules = {
  languages: {
    $each: helpers.forEach({
      name: { required: helpers.withMessage('Language is required', required) },
      proficiency: { required: helpers.withMessage('Proficiency level is required', required) },
    }),
  },
};

const { formRef, v$ } = useValidation(form, rules);


const { sendRequest: updateAccount, pending: isSubmitting } = useSubmit<{ data: Account }, ApiErrorResponse>();

const submitForm = async () => {

  v$.value.$touch();
  if (v$.value.$invalid) return;
  
  try {
    const response = await updateAccount(`/v1/auth/accounts/${user.value.id}`, {
      method: 'PUT',
      body: {
        languages: form.value.languages,
      },
    });

    user.value.languages = response.data.user.languages;
    
    emits('submit');
  } catch (error) {
    console.error('Error updating languages:', error);
  }
};

const addLanguage = () => {
  form.value.languages.push({ name: '', proficiency: '' });
};

const removeLanguage = (index: number) => {
  form.value.languages.splice(index, 1);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold mb-4">Languages You Speak</h1>
    <span class="text-gray-600 mb-4">List the languages you are proficient in and your level of proficiency.</span>

    <form @submit.prevent="submitForm" class="w-full">
      <div v-for="(language, index) in formRef.languages" :key="index" class="flex flex-row gap-5 items-center">
        <div class="mt-4 w-full max-w-lg">
          <label for="languageName" class="block text-sm font-medium leading-6 text-gray-900">
            Language <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <select
              v-model="language.name"
              class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <option :value="language.name" class="truncate text-sm leading-6" v-for="language in codes" :key="language.name">
                {{ language.name }}
              </option>
            </select>
          </div>
            <span v-if="v$.languages.$each.$response.$errors && v$.languages.$each.$response.$errors[index] && v$.languages.$each.$response.$errors[index].name && v$.languages.$each.$response.$errors[index].name[0] && v$.languages.$each.$response.$errors[index].name[0].$message" class="text-red-900 text-sm">{{
              v$.languages.$each.$response.$errors[index].name[0].$message }}</span>
        </div>

        <!-- Level -->
        <div class="mt-4 w-full max-w-lg">
          <label for="languageProficiency" class="block text-sm font-medium leading-6 text-gray-900">
            Level <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <select v-model="language.proficiency"
              class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <option class="truncate text-sm leading-6" v-for="proficiency in Proficiency" :key="proficiency" :value="proficiency">
                {{ startCase(proficiency.toLowerCase()) }}
              </option>
            </select>
          </div>
          <span v-if="v$.languages.$each.$response.$errors && v$.languages.$each.$response.$errors[index] && v$.languages.$each.$response.$errors[index].proficiency && v$.languages.$each.$response.$errors[index].proficiency[0] && v$.languages.$each.$response.$errors[index].proficiency[0].$message" class="text-red-900 text-sm">{{
              v$.languages.$each.$response.$errors[index].proficiency[0].$message }}</span>
        </div>

        <!-- Remove Button -->
        <div>
          <button type="button" @click="removeLanguage(index)" class="text-red-500 hover:text-red-700">
            Remove
          </button>
        </div>
      </div>

      <div class="flex justify-center">
        <Button text="Add" type="button" background="primary" foreground="white" @click="addLanguage" class="mt-5" />
      </div>

      <div class="flex mt-5 justify-between w-full">
        <span @click="emits('back')" class="flex flex-row justify-center items-center cursor-pointer text-primary">
          <Icon icon="weui:back-filled" width="20" height="20" class="text-primary" />
          Back
        </span>

        <Button text="Submit" type="submit" background="primary" foreground="white" :is-loading="isSubmitting" />
      </div>
    </form>
  </div>
</template>