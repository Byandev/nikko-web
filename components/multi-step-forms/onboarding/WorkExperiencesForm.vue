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
import { helpers, required, requiredIf } from '@vuelidate/validators';

import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

const { user } = storeToRefs(authStore());
const { account } = storeToRefs(accountStore())

const monthOptions = computed(() => moment.months().map((month, index) => index + 1));

interface FormValues {
  work_experiences: Partial<WorkExperience>[];
}

const initialValue: FormValues  = {
  work_experiences: [{
    job_title: '',
    company: '',
    website: '',
    country: '',
    description: '',
    start_month: undefined,
    start_year: undefined,
    end_month: undefined,
    end_year: undefined,
    is_current: false,
    employment: EmploymentType.FULL_TIME
  }]
}

const { sendRequest: updateWorkExperience, pending: isSubmitting } = useSubmit<{ data: Account }, ApiErrorResponse>();

const form = ref<FormValues>(
  {
    work_experiences: account.value?.work_experiences?.length ?
      account.value.work_experiences.map(workExperience => ({
        job_title: workExperience.job_title,
        company: workExperience.company,
        website: workExperience.website,
        country: workExperience.country,
        description: workExperience.description,
        start_month: workExperience.start_month,
        start_year: workExperience.start_year,
        end_month: workExperience.end_month,
        end_year: workExperience.end_year,
        is_current: workExperience.is_current,
        employment: workExperience.employment
      })) :
      [initialValue.work_experiences[0]]
  }
)

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
};

const { formRef, v$ } = useValidation(form, rules);

const submitForm = async () => {
  v$.value.$touch();
  console.log(v$.value.$errors)
  if (v$.value.$invalid) return;

  console.log(formRef.value.work_experiences)

  try {
    const body = {
      work_experiences: form.value.work_experiences.map(workExperience => ({
        job_title: workExperience.job_title,
        company: workExperience.company,
        website: workExperience.website,
        country: workExperience.country,
        description: workExperience.description,
        start_month: workExperience.start_month,
        start_year: workExperience.start_year,
        is_current: workExperience.is_current,
        employment: workExperience.employment,
        ...(workExperience.is_current ? {} : { 
          end_month: workExperience.end_month,
          end_year: workExperience.end_year 
        })
      }))
    };

    const response = await updateWorkExperience(`/v1/auth/accounts/${user.value.id}`, {
      method: 'PUT',
      body: {
        work_experiences: body.work_experiences,
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
  form.value.work_experiences.push({
    job_title: '',
    company: '',
    website: '',
    country: '',
    description: '',
    start_month: undefined,
    start_year: undefined,
    end_month: undefined,
    end_year: undefined,
    is_current: false,
    employment: EmploymentType.FULL_TIME
  });
};

const removeWorkExperienceForm = (index: number) => {
  form.value.work_experiences.splice(index, 1);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold mb-4">Describe Your Work Experience</h1>
    <span class="text-gray-600 mb-4">Share your professional journey and achievements to highlight your
      expertise.</span>

    <form class="max-w-lg w-full" @submit.prevent="submitForm">
      <div v-for="(workExperience, index) in formRef.work_experiences" :key="index" class="w-full mb-8">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Work Experience {{ index + 1 }}</h2>
          <button v-if="form.work_experiences.length > 1" @click="removeWorkExperienceForm(index)" class="text-red-500">
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
            <span
              v-if="v$.work_experiences.$each.$response.$errors && v$.work_experiences.$each.$response.$errors[index] && v$.work_experiences.$each.$response.$errors[index].job_title && v$.work_experiences.$each.$response.$errors[index].job_title[0] && v$.work_experiences.$each.$response.$errors[index].job_title[0].$message"
              class="text-red-900 text-sm">{{
              v$.work_experiences.$each.$response.$errors[index].job_title[0].$message }}</span>
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
              <span
                v-if="v$.work_experiences.$each.$response.$errors && v$.work_experiences.$each.$response.$errors[index] && v$.work_experiences.$each.$response.$errors[index].company && v$.work_experiences.$each.$response.$errors[index].company[0] && v$.work_experiences.$each.$response.$errors[index].company[0].$message"
                class="text-red-900 text-sm">{{
                v$.work_experiences.$each.$response.$errors[index].company[0].$message }}</span>
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
              <span
                v-if="v$.work_experiences.$each.$response.$errors && v$.work_experiences.$each.$response.$errors[index] && v$.work_experiences.$each.$response.$errors[index].website && v$.work_experiences.$each.$response.$errors[index].website[0] && v$.work_experiences.$each.$response.$errors[index].website[0].$message"
                class="text-red-900 text-sm">{{
                v$.work_experiences.$each.$response.$errors[index].website[0].$message }}</span>
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
            <span
              v-if="v$.work_experiences.$each.$response.$errors && v$.work_experiences.$each.$response.$errors[index] && v$.work_experiences.$each.$response.$errors[index].country && v$.work_experiences.$each.$response.$errors[index].country[0] && v$.work_experiences.$each.$response.$errors[index].country[0].$message"
              class="text-red-900 text-sm">{{
              v$.work_experiences.$each.$response.$errors[index].country[0].$message }}</span>
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
            <span
              v-if="v$.work_experiences.$each.$response.$errors && v$.work_experiences.$each.$response.$errors[index] && v$.work_experiences.$each.$response.$errors[index].description && v$.work_experiences.$each.$response.$errors[index].description[0] && v$.work_experiences.$each.$response.$errors[index].description[0].$message"
              class="text-red-900 text-sm">{{
              v$.work_experiences.$each.$response.$errors[index].description[0].$message }}</span>
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
              <Listbox v-model="workExperience.start_month" class="ring-1 ring-gray-300 rounded-md">
                <div class="relative mt-1">
                  <ListboxButton
                    class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span class="block truncate">
                      <span>
                        <span v-if="!workExperience.start_month">Select Month</span>
                        <span v-else>
                          {{ workExperience.start_month }}
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
                      <ListboxOption v-for="(month, index) in monthOptions" v-slot="{ active, selected }" :key="index"
                        :value="month" as="template">
                        <li
                          :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                          <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ month
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
              <span
                v-if="v$.work_experiences.$each.$response.$errors && v$.work_experiences.$each.$response.$errors[index] && v$.work_experiences.$each.$response.$errors[index].start_month && v$.work_experiences.$each.$response.$errors[index].start_month[0] && v$.work_experiences.$each.$response.$errors[index].start_month[0].$message"
                class="text-red-900 text-sm">{{
                v$.work_experiences.$each.$response.$errors[index].start_month[0].$message }}</span>
            </div>
          </div>

          <!-- Start Year -->
          <div class="w-1/2">
            <label for="startYear" class="block text-sm font-medium leading-6 text-gray-900">
              Start Year <span class="text-red-500">*</span>
            </label>
            <div class="mt-2">
              <Listbox v-model="workExperience.start_year" class="ring-1 ring-gray-300 rounded-md">
                <div class="relative mt-1">
                  <ListboxButton
                    class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span class="block truncate">
                      <span>
                        <span v-if="!workExperience.start_year">Select Year</span>
                        <span v-else>
                          {{ workExperience.start_year }}
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
                      <ListboxOption v-for="(year, index) in _.range(2000, 2025)" v-slot="{ active, selected }"
                        :key="index" :value="year" as="template">
                        <li
                          :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                          <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ year
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
              <span
                v-if="v$.work_experiences.$each.$response.$errors && v$.work_experiences.$each.$response.$errors[index] && v$.work_experiences.$each.$response.$errors[index].start_year && v$.work_experiences.$each.$response.$errors[index].start_year[0] && v$.work_experiences.$each.$response.$errors[index].start_year[0].$message"
                class="text-red-900 text-sm">{{
                v$.work_experiences.$each.$response.$errors[index].start_year[0].$message }}</span>
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
              <Listbox v-model="workExperience.end_month" class="ring-1 ring-gray-300 rounded-md">
                <div class="relative mt-1">
                  <ListboxButton
                    class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span class="block truncate">
                      <span>
                        <span v-if="!workExperience.end_month">Select Month</span>
                        <span v-else>
                          {{ workExperience.end_month }}
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
                      <ListboxOption v-for="(month, index) in monthOptions" v-slot="{ active, selected }" :key="index"
                        :value="month" as="template">
                        <li
                          :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                          <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ month
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
              <span
                v-if="v$.work_experiences.$each.$response.$errors && v$.work_experiences.$each.$response.$errors[index] && v$.work_experiences.$each.$response.$errors[index].end_month && v$.work_experiences.$each.$response.$errors[index].end_month[0] && v$.work_experiences.$each.$response.$errors[index].end_month[0].$message"
                class="text-red-900 text-sm">{{
                v$.work_experiences.$each.$response.$errors[index].end_month[0].$message }}</span>
            </div>
          </div>

          <!-- End Year -->
          <div class="w-1/2">
            <label for="startYear" class="block text-sm font-medium leading-6 text-gray-900">
              End Year <span class="text-red-500">*</span>
            </label>
            <div class="mt-2">
              <Listbox v-model="workExperience.end_year" class="ring-1 ring-gray-300 rounded-md">
                <div class="relative mt-1">
                  <ListboxButton
                    class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span class="block truncate">
                      <span>
                        <span v-if="!workExperience.end_year">Select Year</span>
                        <span v-else>
                          {{ workExperience.end_year }}
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
                      <ListboxOption v-for="(year, index) in _.range(2000, 2025)" v-slot="{ active, selected }"
                        :key="index" :value="year" as="template">
                        <li
                          :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                          <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ year
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
              <span
                v-if="v$.work_experiences.$each.$response.$errors && v$.work_experiences.$each.$response.$errors[index] && v$.work_experiences.$each.$response.$errors[index].end_year && v$.work_experiences.$each.$response.$errors[index].end_year[0] && v$.work_experiences.$each.$response.$errors[index].end_year[0].$message"
                class="text-red-900 text-sm">{{
                v$.work_experiences.$each.$response.$errors[index].end_year[0].$message }}</span>
            </div>
          </div>
        </div>

        <!-- Employment Type -->
        <div class="mt-4">
          <label for="employment" class="block text-sm font-medium leading-6 text-gray-900">
            Employment Type <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <Listbox v-model="workExperience.employment" class="ring-1 ring-gray-300 rounded-md">
              <div class="relative mt-1">
                <ListboxButton
                  class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span class="block truncate">
                    <span>
                      <span v-if="!workExperience.employment">Select Employment</span>
                      <span v-else>
                        {{ _.capitalize(_.startCase(workExperience.employment))  }}
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
                    <ListboxOption v-for="(type, index) in EmploymentType" v-slot="{ active, selected }"
                      :key="index" :value="type" as="template">
                      <li
                        :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                        <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ _.capitalize(_.startCase(type))
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
            <span
              v-if="v$.work_experiences.$each.$response.$errors && v$.work_experiences.$each.$response.$errors[index] && v$.work_experiences.$each.$response.$errors[index].employment && v$.work_experiences.$each.$response.$errors[index].employment[0] && v$.work_experiences.$each.$response.$errors[index].employment[0].$message"
              class="text-red-900 text-sm">{{
              v$.work_experiences.$each.$response.$errors[index].employment[0].$message }}</span>
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