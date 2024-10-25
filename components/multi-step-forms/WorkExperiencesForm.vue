<script setup lang="ts">
const emits = defineEmits<{ (e: 'submit'): void; (e: 'back'): void; }>();

import _ from 'lodash';
import { ref } from "vue";
import moment from 'moment'
import { Icon } from '@iconify/vue';

import { authStore } from '~/store/authStore';
import { accountStore } from "~/store/accountStore";

import type { Account } from '~/types/models/Account';
import type { WorkExperience } from '~/types/models/WorkExperience';
import { EmploymentType } from '~/types/models/WorkExperience';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { helpers, required } from '@vuelidate/validators';

const { user } = storeToRefs(authStore());
const { account } = storeToRefs(accountStore())

const monthOptions = computed(() => moment.months());

const initialValue: Partial<WorkExperience> = {
  job_title: '',
  company: '',
  website: '',
  country: '',
  description: '',
  start_month: undefined,
  start_year: undefined,
  is_current: false,
  employment: EmploymentType.FULL_TIME
}

const { sendRequest: updateWorkExperience, pending: isSubmitting } = useSubmit<{ data: Account }, ApiErrorResponse>();

const form = ref<Partial<WorkExperience>[]>(account.value?.work_experiences?.length ? account.value?.work_experiences : [initialValue]);

const rules = {
  work_experiences: {
    $each: helpers.forEach({
      job_title: { required: helpers.withMessage('Job title is required', required) },
      company: { required: helpers.withMessage('Company name is required', required) },
      website: { required: helpers.withMessage('Website is required', required) },
      country: { required: helpers.withMessage('Country is required', required) },
      description: { required: helpers.withMessage('Description is required', required) },
      start_month: { required: helpers.withMessage('Start month is required', required) },
      start_year: { required: helpers.withMessage('Start year is required', required) },
      is_current: { required: helpers.withMessage('Is current is required', required) },
      employment: { required: helpers.withMessage('Employment type is required', required) },
    })
  }
}

const { formRef, v$ } = useValidation(form, rules);

const submitForm = async () => {
  v$.value.$touch();
  console.log('Errors:', v$.value.$errors);
  if (v$.value.$invalid) return;

  // Remove end month and end year if is_current is true
  form.value.forEach(workExperience => {
    if (workExperience.is_current) {
      workExperience.end_month = undefined;
      workExperience.end_year = undefined;
    }
  });

  try {
    const response = await updateWorkExperience(`/v1/auth/accounts/${user.value.id}`, {
      method: 'PUT',
      body: {
        work_experiences: form.value,
      }
    });

    if (account.value) {
      account.value.work_experiences = response.data.work_experiences
    }

    emits('submit')
  } catch (error) {
    console.error('Error updating work experience:', error);
  }
};

const addWorkExperienceForm = () => {
  form.value.push(initialValue);
};

const removeWorkExperienceForm = (index: number) => {
  form.value.splice(index, 1);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold mb-4">Describe Your Work Experience</h1>
    <span class="text-gray-600 mb-4">Share your professional journey and achievements to highlight your
      expertise.</span>

    <form class="max-w-lg w-full" @submit.prevent="submitForm">
      <div v-for="(workExperience, index) in formRef" :key="index" class="w-full mb-8">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Work Experience {{ index + 1 }}</h2>
          <button v-if="form.length > 1" @click="removeWorkExperienceForm(index)" class="text-red-500">
            Remove
          </button>
        </div>

        <!-- Job Title -->
        <div class="mt-4">
          <label for="jobTitle" class="block text-sm font-medium leading-6 text-gray-900">
            Job Title <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div
              class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
              <Icon icon="mdi:account" :ssr="true" />
              <input type="text" id="jobTitle" v-model="workExperience.job_title"
                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
            </div>
          </div>
        </div>

        <div class="mt-4 flex flex-row space-x-4">
          <!-- Company Name -->
          <div class="w-1/2">
            <label for="companyName" class="block text-sm font-medium leading-6 text-gray-900">
              Company Name <span class="text-red-500">*</span>
            </label>
            <div class="mt-2">
              <div
                class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                <Icon icon="mdi:office-building" :ssr="true" />
                <input type="text" id="companyName" v-model="workExperience.company"
                  class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
              </div>
            </div>
          </div>

          <!-- Website -->
          <div class="w-1/2">
            <label for="website" class="block text-sm font-medium leading-6 text-gray-900">
              Website <span class="text-red-500">*</span>
            </label>
            <div class="mt-2">
              <div
                class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                <Icon icon="mdi:web" :ssr="true" />
                <input type="url" id="website" v-model="workExperience.website"
                  class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
              </div>
            </div>
          </div>
        </div>

        <!-- Country -->
        <div class="mt-4">
          <label for="country" class="block text-sm font-medium leading-6 text-gray-900">
            Country <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div
              class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <Icon icon="mdi:earth" :ssr="true" />
              <input type="text" id="country" name="country" v-model="workExperience.country"
                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="mt-4">
          <label for="description" class="block text-sm font-medium leading-6 text-gray-900">
            Description <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div
              class="flex flex-row items-start px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
              <Icon icon="mdi:note-text" :ssr="true" />
              <textarea id="description" v-model="workExperience.description" rows="4"
                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0"></textarea>
            </div>
          </div>
        </div>

        <!-- Start Month and Start Year -->
        <div class="mt-4 flex flex-row space-x-4">
          <!-- Start Month -->
          <div class="w-1/2">
            <label for="startMonth" class="block text-sm font-medium leading-6 text-gray-900">
              Start Month <span class="text-red-500">*</span>
            </label>
            <div class="mt-2">
              <select v-model="workExperience.start_month"
                class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <option :value="0">Select Month</option>
                <option class="truncate text-sm leading-6" v-for="(month, monthIndex) in monthOptions"
                  :key="`start-month-${index}-${monthIndex}`" :value="monthIndex + 1">
                  {{ month }}
                </option>
              </select>
            </div>
          </div>

          <!-- Start Year -->
          <div class="w-1/2">
            <label for="startYear" class="block text-sm font-medium leading-6 text-gray-900">
              Start Year <span class="text-red-500">*</span>
            </label>
            <div class="mt-2">
              <select v-model="workExperience.start_year"
                class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <option :value="0">Select Year</option>
                <option class="truncate text-sm leading-6" v-for="(year, yearIndex) in _.range(2000, 2025)"
                  :key="`start-year-${index}-${yearIndex}`" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Is Current -->
        <div class="mt-4">
          <label for="isCurrent" class="block text-sm font-medium leading-6 text-gray-900">
            Is Current <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div class="flex items-center">
              <input type="checkbox" id="isCurrent" v-model="workExperience.is_current"
                class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
              <label for="isCurrent" class="ml-2 block text-sm text-gray-900">Currently working here</label>
            </div>
          </div>
        </div>

        <!-- End Month and End Year (conditionally rendered) -->
        <div v-if="!workExperience.is_current" class="mt-4 flex flex-row space-x-4">
          <!-- End Month -->
          <div class="w-1/2">
            <label for="startMonth" class="block text-sm font-medium leading-6 text-gray-900">
              End Month <span class="text-red-500">*</span>
            </label>
            <div class="mt-2">
              <select v-model="workExperience.end_month"
                class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <option :value="0">Select Month</option>
                <option class="truncate text-sm leading-6" v-for="(month, monthIndex) in monthOptions"
                  :key="`start-month-${index}-${monthIndex}`" :value="monthIndex + 1">
                  {{ month }}
                </option>
              </select>
            </div>
          </div>

          <!-- End Year -->
          <div class="w-1/2">
            <label for="startYear" class="block text-sm font-medium leading-6 text-gray-900">
              End Year <span class="text-red-500">*</span>
            </label>
            <div class="mt-2">
              <select v-model="workExperience.end_year"
                class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <option :value="0">Select Year</option>
                <option class="truncate text-sm leading-6" v-for="(year, yearIndex) in _.range(2000, 2025)"
                  :key="`start-year-${index}-${yearIndex}`" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Employment Type -->
        <div class="mt-4">
          <label for="employment" class="block text-sm font-medium leading-6 text-gray-900">
            Employment Type <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <select id="employment" v-model="workExperience.employment"
              class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <option class="truncate text-sm leading-6" value="">Select employment type</option>
              <option class="truncate text-sm leading-6" v-for="(type) in EmploymentType" :key="`type-${index}-${type}`"
                :value="type">
                {{ _.capitalize(_.startCase(type)) }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <Button text="Add Work Experience" @click="addWorkExperienceForm" class="mt-4" type="button" foreground="white"
          background="primary" />
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