<script setup lang="ts">
import { ref } from 'vue';
import { accountStore } from '~/store/accountStore';
import Button from '../ui/Button.vue';
import { Icon } from '@iconify/vue';
import type { Account } from '~/types/models/Account';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { helpers, required } from '@vuelidate/validators';

const { account } = storeToRefs(accountStore());

const { sendRequest: updateBio } = useSubmit<{ data: Account }, ApiErrorResponse>();

const isEditModalOpen = ref(false);

const form = ref({
  title: account.value?.title || '',
  bio: account.value?.bio || '',
});

const rules = {
  title: { required: helpers.withMessage('Title is required', required) },
  bio: { required: helpers.withMessage('Bio is required', required) },
};

const { formRef, v$ } = useValidation(form, rules);

const openEditModal = () => {
  form.value.title = account.value?.title || '';
  form.value.bio = account.value?.bio || '';
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const submitBio = async () => {
    v$.value.$touch();
    if (v$.value.$invalid) return;

  try {
    if (account.value) {
      await updateBio(`/v1/auth/accounts/${account.value.id}`, {
        method: 'PUT',
        body: {
          title: form.value.title,
          bio: form.value.bio,
        },
      });

      // Update account values after successful submission
      account.value.title = form.value.title;
      account.value.bio = form.value.bio;
    } else {
      console.error('Account is not available.');
    }
  } catch (error) {
    console.error('Error updating bio:', error);
  } finally {
    closeEditModal();
  }
};
</script>

<template>
  <Section>
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">About</h2>
        <div>
          <button @click="openEditModal">Edit Bio</button>
        </div>
      </div>
    </template>
    <template #content>
      <div>
        <h2 class="text-xl font-bold text-gray-900">{{ account?.title || 'No Title' }}</h2>
        <p class="mt-2 text-base text-gray-700">{{ account?.bio || 'No Bio available' }}</p>
      </div>

      <Modal v-if="isEditModalOpen" :modelValue="isEditModalOpen" @update:modelValue="isEditModalOpen = $event" @close="closeEditModal">
        <template #title>
          <div class="flex items-center space-x-2 justify-center">
            <Icon icon="mdi:account-circle" class="text-primary-600" width="24" height="24" />
            <span>Edit Bio</span>
          </div>
        </template>
        <template #content>
          <div class="sm:col-span-2 text-start">
            <label for="bio-title" class="text-sm font-medium text-gray-500">Title <span class="text-red-500">*</span></label>
            <div class="mt-1 text-sm text-gray-900">
              <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                <input id="bio-title" v-model="formRef.title" type="text" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
              </div>
              <span v-if="v$.title.$error" class="text-red-900 text-sm">{{
                            v$.title.$errors[0].$message }}</span>
            </div>
          </div>
          <div class="sm:col-span-2 text-start">
            <label for="bio-textarea" class="text-sm font-medium text-gray-500">Bio <span class="text-red-500">*</span></label>
            <div class="mt-1 text-sm text-gray-900"> 
              <div class="flex flex-row items-start px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                <textarea id="bio-textarea" v-model="formRef.bio" class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0"></textarea>
              </div>
              <span v-if="v$.bio.$error" class="text-red-900 text-sm">{{
                            v$.bio.$errors[0].$message }}</span>
            </div>
          </div>
        </template>
        <template #actions>
          <Button @click="closeEditModal" text="Cancel" type="button" background="white" foreground="primary" />
          <Button @click="submitBio" text="Save" type="button" background="primary" foreground="white" />
        </template>
      </Modal>
    </template>
  </Section>
</template>