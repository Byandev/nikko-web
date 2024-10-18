<script setup lang="ts">
import {router} from "next/client";

const emits = defineEmits<{ (e: 'submit'): void; (e: 'back'): void; }>();

import _ from 'lodash';
import {ref} from "vue";
import moment from 'moment'
import {Icon} from '@iconify/vue';
import {Country, ICountry} from 'country-state-city';

import {authStore} from '~/store/authStore';
import {accountStore} from "~/store/accountStore";

import type {Account} from '~/types/models/Account';
import type {Education} from '~/types/models/Education';

import type {ApiErrorResponse} from '~/types/api/response/error';


const {user} = storeToRefs(authStore());
const {account} = storeToRefs(accountStore())


const monthOptions = computed(() => moment.months());
const countriesOptions = ref<ICountry[]>(Country.getAllCountries());

const initialValue: Partial<Education> = {
  degree: '',
  country: '',
  description: '',
  start_month: 0,
  start_year: 0,
  end_month: 0,
  end_year: 0,
};

const form = ref<Partial<Education>[]>(
    account.value?.educations?.length ? account.value?.educations : [initialValue]
);

const {sendRequest: updateEducationHistory, pending: isSubmitting} = useSubmit<{ data: Account }, ApiErrorResponse>();


const submitForm = async () => {
  try {
    const response = await updateEducationHistory(`/v1/auth/accounts/${user.value.id}`, {
      method: 'PUT',
      body: {
        educations: form.value,
      }
    });

    if (account.value) {
      account.value.educations = response.data.educations
    }

    await router.push('/freelancer-dashboard')
    console.log('Education history updated:', response);
  } catch (error) {
    console.log('Error updating work experience:', error);
  }
};

const addEducation = () => {
  form.value.push(initialValue);
};

const removeEducation = (index: number) => {
  form.value.splice(index, 1);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold mb-4">Describe Your Education History</h1>
    <span class="text-gray-600 mb-4">Share your educational background to highlight your qualifications.</span>

    <form class="w-full max-w-lg" @submit.prevent="submitForm">
      <div v-for="(form, index) in form" :key="index" class="w-full mb-8">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Education History {{ index + 1 }}</h2>
          <button v-if="form.length > 1" @click="removeEducation(index as number)" class="text-red-500">Remove</button>
        </div>

        <!-- Degree -->
        <div class="mt-4">
          <label for="degree" class="block text-sm font-medium leading-6 text-gray-900">
            Degree <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div
                class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
              <Icon icon="mdi:school" :ssr="true"/>
              <input required type="text" id="degree" v-model="form.degree"
                     class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
            </div>
          </div>
        </div>

        <!-- Country -->
        <div class="mt-4">
          <label for="country" class="block text-sm font-medium leading-6 text-gray-900">
            Country <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <select required v-model="form.country"
                    class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <option :value="country.isoCode" class="truncate text-sm leading-6 " v-for="country in countriesOptions"
                      :key="`countries-${index}-${country.isoCode}`">
                {{ country.name }}
              </option>
            </select>
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
              <Icon icon="mdi:note-text" :ssr="true"/>
              <textarea required id="description" v-model="form.description" rows="4"
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
              <select required v-model="form.start_month"
                      class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <option :value="0">Select Month</option>
                <option class="truncate text-sm leading-6" v-for="(month, monthIndex) in monthOptions"
                        :key="`start-month-${index}-${monthIndex}`"
                        :value="monthIndex + 1">
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
              <select required v-model="form.start_year"
                      class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <option :value="0">Select Year</option>
                <option class="truncate text-sm leading-6" v-for="(year, yearIndex) in _.range(2000, 2025)"
                        :key="`start-year-${index}-${yearIndex}`"
                        :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- End Month and End Year -->
        <div class="mt-4 flex flex-row space-x-4">
          <!-- End Month -->
          <div class="w-1/2">
            <label for="startMonth" class="block text-sm font-medium leading-6 text-gray-900">
              End Month <span class="text-red-500">*</span>
            </label>
            <div class="mt-2">
              <select v-model="form.end_month"
                      class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <option :value="0">Select Month</option>
                <option class="truncate text-sm leading-6" v-for="(month, monthIndex) in monthOptions"
                        :key="`start-month-${index}-${monthIndex}`"
                        :value="monthIndex + 1">
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
              <select v-model="form.end_year"
                      class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <option :value="0">Select Year</option>
                <option class="truncate text-sm leading-6" v-for="(year, yearIndex) in _.range(2000, 2025)"
                        :key="`start-year-${index}-${yearIndex}`"
                        :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <Button text="Add Education History" @click="addEducation" class="mt-4" type="button" foreground="white"
                background="primary"/>
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
