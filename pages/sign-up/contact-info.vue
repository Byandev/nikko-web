<script setup lang="ts">
import type {User} from "~/types/models/User";

definePageMeta({
  middleware: ['verify']
});

import {ref} from 'vue';
const router = useRouter();
import {Icon} from '@iconify/vue/dist/iconify.js';

import {authStore} from '~/store/authStore';

import type {Media} from '~/types/models/Media';
import type {ApiErrorResponse} from '~/types/api/response/error';


const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const {user} = storeToRefs(authStore());
const {updateUser} = authStore();
const avatarUrl = ref<string | undefined>(user.value.avatar?.original_url ?? defaultAvatar);

const {sendRequest: uploadMedia} = useSubmit<{ data: Media }, ApiErrorResponse>();
const {sendRequest: updateProfile, pending: isSubmitting} = useSubmit<{ data: User }, ApiErrorResponse>();

const form = ref<{
  street_address: string;
  city: string;
  state_code: string;
  country_code: string;
  postal: string;
  phone_number: string;
  avatar: number | File | Media | null
}>({
  avatar: null,
  postal: user.value.postal ?? '',
  city: user.value.city ?? '',
  state_code: user.value.state_code ?? '',
  country_code:user.value.country_code ?? '',
  phone_number: user.value.phone_number ?? '',
  street_address: user.value.street_address ?? '',
});

async function changeAvatar(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (file) {
    avatarUrl.value = URL.createObjectURL(file);
    form.value.avatar  = file;
  }
}

const handleSubmit = async () => {
  if (form.value.avatar instanceof File) {
    const formData = new FormData();
    formData.append('file', form.value.avatar);


    const uploadAvatarResponse = await uploadMedia('/v1/medias', {
      method: 'POST',
      body: formData,
    });

    form.value.avatar = uploadAvatarResponse.data.id
  }

  await updateProfile(`/v1/auth/profile`, {
    method: 'PUT',
    body: form.value
  });

  await updateUser();

  if (user.value.accounts[0].type === 'CLIENT') {
    return router.push('/client-dashboard');
  } else {
    return router.push(`/onboarding/${user.value.accounts[0].id}`);
  }
};
</script>

<template>
  <div class="my-10 max-w-2xl lg:mx-auto bg-white border border-gray-300 rounded-lg py-10 px-4 sm:px-16 mx-5">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">Provide your contact details below</h1>
      <p class="text-gray-600 mb-6">Your contact information is kept confidential and is solely used for billing
        purposes to ensure you get paid promptly.</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- Avatar -->
      <div class="mt-4 flex flex-col items-center justify-center">
        <div class="mt-4">
          <img :src="avatarUrl" alt="Avatar Preview"
               class="h-32 w-32 rounded-full object-cover border-2 border-gray-300">
        </div>
        <label for="avatar" class="block text-sm font-medium text-gray-700 mt-4">Upload Avatar</label>
        <div class="flex justify-center">
          <input type="file" id="avatar" @change="changeAvatar"
                 class="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
        </div>
      </div>

      <!-- Street Address -->
      <div class="mt-4">
        <label for="street-address" class="block text-sm font-medium leading-6 text-gray-900">
          Street Address
        </label>
        <div class="mt-2">
          <div
              class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
            <Icon icon="mdi:home" :ssr="true"/>
            <input type="text" id="street-address" name="street-address" v-model="form.street_address"
                   class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-5 mt-4">
        <div class="w-full sm:w-1/2">
          <label for="country" class="block text-sm font-medium leading-6 text-gray-900">
            Country <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div
                class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <Icon icon="mdi:earth" :ssr="true" />
              <input type="text" id="country" name="country" v-model="form.country_code" required
                     class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
            </div>
          </div>
        </div>

        <div class="w-full sm:w-1/2">
          <label for="country" class="block text-sm font-medium leading-6 text-gray-900">
            State
          </label>
          <div class="mt-2">
            <div
                class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <Icon icon="mdi:map-marker" :ssr="true" />
              <input type="text" id="state-code" name="state-code" v-model="form.state_code" required
                     class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-5 mt-4">
        <div class="w-full sm:w-1/2">
          <label for="country" class="block text-sm font-medium leading-6 text-gray-900">
            City
          </label>
          <div class="mt-2">
            <div
                class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <Icon icon="mdi:city" :ssr="true" />
              <input type="text" id="city" name="city" v-model="contactInfo.city" required
                     class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
            </div>
          </div>
        </div>

        <!-- Postal Code -->
        <div class="w-full sm:w-1/2">
          <label for="postal-code" class="block text-sm font-medium leading-6 text-gray-900">Postal
            Code</label>
          <div class="mt-2">
            <div
                class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <Icon icon="mdi:mailbox" :ssr="true"/>
              <input type="text" id="postal-code" name="postal-code" v-model="form.postal" required
                     class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
            </div>
          </div>
        </div>
      </div>

      <!-- Phone Number -->
      <div class="w-full mt-4">
        <label for="phone-number" class="block text-sm font-medium leading-6 text-gray-900">
          Phone Number <span class="text-red-500">*</span>
        </label>
        <div class="mt-2">
          <div
              class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
            <Icon icon="mdi:phone" :ssr="true"/>
            <input type="text" id="phone-number" name="phone-number" v-model="form.phone_number" required
                   class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
          </div>
        </div>
      </div>

      <span class="block text-sm font-medium leading-6 text-gray-700 mt-2">
        Please provide your phone number for updates regarding your profile.
      </span>

      <Button
          type="submit"
          :isWide="true"
          text="Next"
          background="primary"
          foreground="white"
          class="mt-8"
          :is-loading="isSubmitting"
      />
    </form>
  </div>
</template>
