<script setup lang="ts">
import { accountStore } from '~/store/accountStore';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Project } from '~/types/models/Project';
import { Icon } from '@iconify/vue';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import _ from 'lodash';

const route = useRoute();
const { account } = storeToRefs(accountStore());
const { data: project, fetchData: fetchProject, pending: isLoading } = useFetchData<{ data: Project }, ApiErrorResponse>();

onMounted(async () => {
  await fetchProject(`v1/projects/${route.params.projectId}`, {
    headers: account?.value?.id ? {
      'X-ACCOUNT-ID': account.value.id.toString(),
    } : undefined,
  });
});

const durationOptions = [
  { name: 'Less than a week' },
  { name: 'Less than a month' },
  { name: '1-3 months' },
  { name: '3-6 months' },
  { name: '6-12 months' },
  { name: 'More than a year' },
];

interface Form {
  duration: string;
  hourly_rate: number;
}

const form = ref<Form>({
  duration: '',
  hourly_rate: 0,
});


</script>

<template>
  <div class="my-8 lg:mx-auto mx-5">
    <div class="max-w-6xl grid grid-cols-1 gap-4 mt-5 mx-auto">
      <h1 class="text-4xl font-medium whitespace-nowrap">Submit a proposal</h1>
      <div class="flex flex-col gap-4">
        <div class="ring-1 ring-gray-300 rounded-md px-4 md:px-8 my-3 flex-1" v-if="!isLoading && project">
          <header class="py-4 md:py-6">
            <h2 class="text-xl md:text-2xl mb-2 md:mb-3">Job details</h2>
          </header>
          <section class="pb-6 md:pb-8">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-5">
              <!-- Left Side -->
              <div class="md:col-span-8 lg:col-span-9">
                <h2 class="text-lg md:text-xl mb-4 md:mb-6">{{ project.data.title ?? 'No title' }}</h2>
                <div>
                  <span class="text-sm">{{ project.data.description ?? 'No description' }}</span>
                </div>
              </div>
              <!-- Right Side -->
              <div class="border-l-0 md:border-l-2 block md:col-span-4 lg:col-span-3 pl-0 md:pl-4"
                v-if="project.data.experience_level || project.data.length || project.data.estimated_budget">
                <ul>
                  <li class="flex justify-start items-center gap-2 md:gap-3" v-if="project.data.experience_level">
                    <Icon icon="mdi-light:diamond-stone" style="color: black" />
                    <div class="flex flex-col">
                      <strong>{{ _.capitalize(project.data.experience_level) ?? 'Any' }}</strong>
                      <small>Experience Level</small>
                    </div>
                  </li>
                  <li class="flex justify-start items-center gap-2 md:gap-3" v-if="project.data.estimated_budget">
                    <Icon icon="fluent-mdl2:money" style="color: black" />
                    <div class="flex flex-col">
                      <strong>{{ project.data.estimated_budget }}</strong>
                      <small>Estimated Budget</small>
                    </div>
                  </li>
                  <li class="flex justify-start items-center gap-2 md:gap-3" v-if="project.data.length">
                    <Icon icon="mingcute:time-duration-line" style="color: black" />
                    <div class="flex flex-col">
                      <strong>{{ _.startCase(project.data.length.toLowerCase()) }}</strong>
                      <small>Duration</small>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div class="ring-1 ring-gray-300 rounded-md px-4 md:px-8 my-3 flex-1" v-if="!isLoading && project">
          <header class="py-4 md:py-6">
            <h3 class="text-base">How long will this project takes?</h3>
          </header>
          <section class="pb-6 md:pb-8">
            <Listbox v-model="form.duration" class="ring-1 ring-gray-300 rounded-md max-w-72">
              <div class="relative mt-1">
                <ListboxButton
                  class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span class="block truncate">
                    <span v-if="!form.duration">Select a duration</span>
                    <span v-else>{{ form.duration }}</span>
                  </span>
                  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </ListboxButton>

                <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
                  leave-to-class="opacity-0">
                  <ListboxOptions
                    class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                    <ListboxOption v-for="(code, index) in durationOptions" v-slot="{ active, selected }" :key="index"
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
          </section>
        </div>

        <div class="ring-1 ring-gray-300 rounded-md px-4 md:px-8 my-3 flex-1" v-if="!isLoading && project">
          <header class="py-4 md:py-6">
            <h3 class="text-base">Terms</h3>
          </header>
          <section class="pb-6 md:pb-8">
            <div class="flex flex-col gap-4 max-w-72">
              <label for="hourly_rate" class="text-sm font-medium text-gray-700">Hourly Rate</label>
              <input
                  type="number"
                  id="hourly_rate"
                  v-model="form.hourly_rate"
                  class="mt-1 block w-full rounded-md ring-1 ring-gray-300 shadow-sm sm:text-sm p-2"
                  placeholder="Enter your hourly rate"
                />
            </div>
          </section>
        </div>

        <div class="flex flex-row gap-2 w-full justify-end">
          <Button text="Submit Proposal" type="button" background="primary" foreground="white" />
          <Button text="Cancel" type="button" background="white" foreground="primary" />
        </div>

      </div>
    </div>
  </div>
</template>