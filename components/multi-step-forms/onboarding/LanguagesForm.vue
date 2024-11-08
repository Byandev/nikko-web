<script setup lang="ts">
const emits = defineEmits<{ (e: 'submit'): void; (e: 'back'): void; }>();

import codes from 'iso-language-codes';
import { Icon } from '@iconify/vue';
import { authStore } from '~/store/authStore';
import type { Account } from '~/types/models/Account';
import { Proficiency } from '~/types/models/Language';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { helpers, required } from '@vuelidate/validators';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import _ from 'lodash';

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

  console.log(form.value.languages)
  
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

const languageCodes = codes.map(code => ({ name: code.name }));

</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold mb-4">Languages You Speak</h1>
    <span class="text-gray-600 mb-4">List the languages you are proficient in and your level of proficiency.</span>

    <form @submit.prevent="submitForm" class="w-full">
      <div v-for="(language, index) in formRef.languages" :key="index"
        class="flex flex-row gap-5 items-center justify-center">
        <div class="mt-4 w-full max-w-lg">
          <label for="languageName" class="block text-sm font-medium leading-6 text-gray-900">
            Language <span class="text-red-500">*</span>
          </label>
          <div>
            <Listbox v-model="language.name" class="ring-1 ring-gray-300 rounded-md">
              <div class="relative mt-1">
                <ListboxButton
                  class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span class="block truncate">
                    <span v-if="!language.name">Select Language</span>
                    <span v-else>{{ language.name }}</span>
                  </span>
                  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </ListboxButton>

                <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
                  leave-to-class="opacity-0">
                  <ListboxOptions
                    class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                    <ListboxOption v-for="(code, index) in languageCodes" v-slot="{ active, selected }" :key="index"
                      :value="code.name" as="template">
                      <li
                        :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                        <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ code.name
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
          <div class="h-4">
            <span
              v-if="v$.languages.$each.$response.$errors && v$.languages.$each.$response.$errors[index] && v$.languages.$each.$response.$errors[index].name && v$.languages.$each.$response.$errors[index].name[0] && v$.languages.$each.$response.$errors[index].name[0].$message"
              class="text-red-900 text-sm">{{
              v$.languages.$each.$response.$errors[index].name[0].$message }}</span>
          </div>
        </div>

        <!-- Level -->
        <div class="mt-4 w-full max-w-lg">
          <label for="languageProficiency" class="block text-sm font-medium leading-6 text-gray-900">
            Level <span class="text-red-500">*</span>
          </label>
          <div>
            <Listbox v-model="language.proficiency" class="ring-1 ring-gray-300 rounded-md">
              <div class="relative mt-1">
                <ListboxButton
                  class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span class="block truncate">
                    <span v-if="!language.proficiency">Select Proficiency</span>
                    <span v-else>{{ _.capitalize(language.proficiency) }}</span>
                  </span>
                  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </ListboxButton>

                <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
                  leave-to-class="opacity-0">
                  <ListboxOptions
                    class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                    <ListboxOption v-for="(item, index) in Proficiency" v-slot="{ active, selected }" :key="index"
                      :value="item" as="template">
                      <li
                        :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                        <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ _.capitalize(item)
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
          <div class="h-4">
            <span
              v-if="v$.languages.$each.$response.$errors && v$.languages.$each.$response.$errors[index] && v$.languages.$each.$response.$errors[index].proficiency && v$.languages.$each.$response.$errors[index].proficiency[0] && v$.languages.$each.$response.$errors[index].proficiency[0].$message"
              class="text-red-900 text-sm">{{
              v$.languages.$each.$response.$errors[index].proficiency[0].$message }}</span>
          </div>
        </div>

        <!-- Remove Button -->
        <div class="mt-5">
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