<script lang="ts" setup>
import {HeartIcon} from '@heroicons/vue/24/outline';
import type {Account} from "~/types/models/Account";
import type {ApiDataResponse, ApiErrorResponse} from "~/types/api/response/error";
import {accountStore} from "~/store/accountStore";
import type { Contract } from '~/types/models/Contract';
import currencyFormatter from '~/utils/currencyFormatter';

const props = defineProps<{ freelancer: Account, contract?: Contract, showSaveButton: boolean, hasProposalDetails?: boolean, hasContractDetails?: boolean, hasHireButton?: boolean, hasViewContractButton?: boolean, hasFavoriteButton?: boolean }>();
const emit = defineEmits<{
  (e: 'click', id: number): void;
  (e: 'hire', id: number): void;
  (e: 'save', id: number): void;
  (e: 'un-save', id: number): void;
  (e: 'view-contract', id: number): void;
}>();

const {account} = storeToRefs(accountStore());

const {sendRequest: toggleSaveProject} = useSubmit<ApiDataResponse<Account>, ApiErrorResponse>();

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? {'X-ACCOUNT-ID': account.value.id.toString()} : undefined
);

const {freelancer, showSaveButton} = toRefs(props)

const name = computed(
    () => freelancer.value.user.first_name && freelancer.value.user.last_name ?
        `${freelancer.value.user.first_name} ${freelancer.value.user.last_name}` :
        'No name provided'
);

const avatarUrl = computed(
    () => props.freelancer.user?.avatar?.original_url ??
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
);

const showAllBio = ref(false);
const hasLongBio = computed(() => freelancer.value.bio?.length > 300);

const toggleSave = async () => {
  const isSaved = !freelancer.value.is_saved;

  freelancer.value.is_saved = isSaved;

  isSaved ? emit('save', freelancer.value.id) : emit('un-save', freelancer.value.id);

  try {
    await toggleSaveProject(`v1/accounts/${freelancer.value.id}/${isSaved ? 'save' : 'un-save'}`,
        {
          method: isSaved ? 'POST' : 'DELETE',
          headers: requestHeaders.value,
        }
    );
  } catch (e) {
    console.log("Failed to marked the project: ", e.message)
  }
}

</script>
<template>
  <div
    class="bg-white hover:bg-gray-100 ring-1 ring-gray-300 rounded-md hover:cursor-pointer flex flex-col lg:flex-row divide-y lg:divide-y-0 divide-x-0 lg:divide-x text-sm text-gray-800">
    <div class="w-full lg:w-8/12 px-5 py-5">
      <div class="flex space-x-4">
        <img :src="avatarUrl" :alt="name" class="w-16 h-16 rounded-full">

        <div class="space-y-4 grow">
          <div class="flex justify-between">
            <h2 @click="emit('click', freelancer.id)" class="text-xl font-bold hover:underline">{{ name }}</h2>

            <div v-if="hasFavoriteButton" class="flex items-center gap-2">
              <HeartIcon v-if="showSaveButton" @click="toggleSave" class="w-5 h-5 text-primary-dark cursor-pointer"
                :class="freelancer.is_saved ? 'fill-primary': ''" />
            </div>
          </div>

          <div class="space-y-1" v-if="freelancer.skills && freelancer.skills.length">
            <div class="font-medium">Skills:</div>
            <div class="flex flex-wrap gap-1">
              <span v-for="(skill, index) in freelancer.skills" :key="index"
                class="bg-primary/15 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                {{ skill.name }}
              </span>
            </div>
          </div>


          <p class="">
            {{ hasLongBio && showAllBio ? freelancer.bio : freelancer.bio?.slice(0, 300) }}
          </p>
          <p class="underline text-primary" v-if="hasLongBio" @click="showAllBio = !showAllBio">
            {{ showAllBio ? 'Show Less' : 'Show more' }}
          </p>
        </div>
      </div>
    </div>

    <div class="w-full lg:w-4/12 divide-y">
      <div class="pt-5 pb-5 space-y-3 px-8">
        <Button text="View Profile" background="white" foreground="primary" class="ring-1 ring-primary w-full font-base"
          @click="emit('click', freelancer.id)" type="button" />

        <Button v-if="hasHireButton" text="Hire" background="primary" foreground="white"
          class="ring-1 ring-primary w-full font-base" @click="emit('hire', freelancer.id)" type="button" />

        <Button v-if="hasViewContractButton" text="View Contract" background="primary" foreground="white"
          class="ring-1 ring-primary w-full font-base" @click="emit('view-contract', contract?.id ?? 0)"
          type="button" />
      </div>

      <div v-if="hasProposalDetails" class="py-2 space-y-1 px-5">
        <p>Total earning: <span>$0</span></p>
        <p v-if="freelancer.user.country_code">Location: <span>{{ freelancer.user.country_code }}</span></p>
      </div>

      <div v-if="hasContractDetails" class="py-2 space-y-1 px-5">
        <p>Amount: <span>{{ currencyFormatter(contract?.amount ?? 0) }}</span></p>
        <p>End Date: <span>{{ contract?.end_date ?? 0 }}</span></p>
      </div>

    </div>
  </div>
</template>
