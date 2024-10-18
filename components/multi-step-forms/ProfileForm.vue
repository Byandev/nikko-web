<script setup lang="ts">
const emits = defineEmits<{ (e: 'submit'): void; }>();

import {Icon} from '@iconify/vue';
import type {Account} from '~/types/models/Account';
import type {ApiErrorResponse} from '~/types/api/response/error';

import {authStore} from '~/store/authStore';
import {accountStore} from "~/store/accountStore";

const route = useRoute();
const {user} = storeToRefs(authStore());
const {account} = storeToRefs(accountStore())

const {sendRequest: updateAccount} = useSubmit<{ data: Account }, ApiErrorResponse>();

interface FormValues {
  title: string;
  bio: string;
}

const form = ref<FormValues>({
  title: account.value?.title ?? '',
  bio: account.value?.bio ?? '',
});


const submitForm = async () => {
  try {
    await updateAccount(`/v1/auth/accounts/${route.params.accountId}`, {
      method: 'PUT',
      body: {
        title: form.value.title,
        bio: form.value.bio,
      },
    });

    if (account.value) {
      account.value.title = form.value.title
      account.value.bio = form.value.title
    }

    emits('submit');
  } catch (error) {
    console.log('Error updating profile:', error);
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold mb-4">Write a Title for your Profile</h1>
    <span class="text-gray-600 mb-4">Your impression matters. Describe your expertise uniquely to stand out.</span>

    <form @submit.prevent="submitForm" class="w-full max-w-lg">
      <!-- Profile Title -->
      <div class="mt-4 w-full">
        <label for="profileTitle" class="block text-sm font-medium leading-6 text-gray-900">
          Profile Title <span class="text-red-500">*</span>
        </label>
        <div class="mt-2">
          <div
              class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
            <Icon icon="mdi:account" :ssr="true"/>
            <input required type="text" id="profileTitle" v-model="form.title"
                   class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
          </div>
        </div>
      </div>

      <!-- Profile Bio -->
      <div class="mt-4 w-full">
        <label for="profileBio" class="block text-sm font-medium leading-6 text-gray-900">
          Profile Bio <span class="text-red-500">*</span>
        </label>
        <div class="mt-2">
          <div
              class="flex flex-row items-start px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
            <Icon icon="mdi:account-details" :ssr="true"/>
            <textarea required id="profileBio" v-model="form.bio" rows="4"
                      class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0"></textarea>
          </div>
        </div>
      </div>

      <div class="flex mt-5 justify-end w-full">
        <Button text="Submit" type="submit" background="primary" foreground="white"/>
      </div>
    </form>
  </div>
</template>
