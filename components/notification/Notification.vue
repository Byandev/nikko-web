<template>
  <Disclosure as="div" class="mt-2" v-slot="{ open }">
    <DisclosureButton
        class="w-full flex justify-start flex-col bg-slate-100 px-5 py-2.5"
    >
      <p class="font-semibold tracking-wide text-base text-slate-800">{{notification.title}}</p>
      <p class="text-slate-600">{{moment(notification.created_at).fromNow()}}</p>
    </DisclosureButton>
    <DisclosurePanel class="bg-slate-100 text-slate-700 px-5 py-2.5">
      {{notification.message}}
    </DisclosurePanel>
  </Disclosure>
</template>

<script lang="ts" setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import type {Notification} from "~/types/models/Notification";
import moment from "moment";

defineProps<{notification: Notification}>()
</script>
