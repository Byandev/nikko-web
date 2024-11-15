<script setup lang="ts">
import _ from 'lodash';
import type { Account } from '~/types/models/Account';

const props = defineProps({
    freelancer: {
        type: Object as PropType<Account>,
        required: true,
    },
});

const emit = defineEmits<{
  (e: 'invite', payload: { msg: string, id: number }): void;
}>();

const message = ref('');

const isMessageModalOpen = ref(false);

const showAllDescription = ref(false);
const hasLongDescription = computed(() => props.freelancer.bio && props.freelancer.bio.length > 300);

</script>


<template>
  <div
      class="bg-white hover:bg-gray-100 ring-1 ring-gray-300 rounded-md hover:cursor-pointer flex divide-x text-sm text-gray-800">
    <div class="w-8/12 sm:w-10/12 px-5 py-5 space-y-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h2 class="text-xl font-bold hover:underline">{{ props.freelancer.user.first_name ?? '' }} {{ props.freelancer.user.last_name ?? 'No name provided' }}</h2>
      </div>

      <div class="space-y-1" v-if="props.freelancer.skills && props.freelancer.skills.length">
        <div class="font-medium">Skills:</div>
        <div class="flex flex-wrap gap-1">
           <span v-for="(skill, index) in props.freelancer.skills" :key="index"
                 class="bg-primary/15 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
              {{ skill.name }}
           </span>
        </div>
      </div>

      <p class="">
        {{ hasLongDescription && showAllDescription ? props.freelancer.bio : props?.freelancer.bio?.slice(0, 300) }}
      </p>
      <p class="underline text-primary" v-if="hasLongDescription" @click="showAllDescription = !showAllDescription">
        {{ showAllDescription ? 'Show Less' : 'Show more' }}
      </p>
    </div>

    <div class="w=4/12 sm:w-2/12 divide-y p-4 flex flex-col justify-center gap-2">
        <Button text="Invite" background="white" foreground="primary" class="ring-1 ring-primary w-full"
            @click="isMessageModalOpen = true" type="button" />
    </div>
  </div>

  <Modal :modelValue="isMessageModalOpen" @update:modelValue="isMessageModalOpen = $event">
        <template #title>Invitation message</template>
        <template #content>
            <textarea v-model="message" class="w-full h-32 p-2 border rounded" placeholder="Write your message here..."></textarea>
        </template>
        <template #actions>
            <Button text="Cancel" type="button" background="white" foreground="gray" @click="isMessageModalOpen = false" />
            <Button text="Invite" type="button" background="primary" foreground="white" @click="{emit('invite', { msg: message, id: props.freelancer.id });
          isMessageModalOpen = false;
          }" />
        </template>
    </Modal>
</template>