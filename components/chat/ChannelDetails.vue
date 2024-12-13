<template>
  <div class="">
    <div class="space-y-5 flex flex-col justify-center items-center border-b py-5">
      <img :src="avatarUrl" alt="User" class="w-24 h-24 rounded-full border" />

      <h4 class="font-semibold text-2xl tracking-wider">{{user?.first_name}} {{user?.last_name}}</h4>
    </div>

    <div class="flex space-y-1.5 flex-col px-2 py-5">
      <NuxtLink :to="`/jobs/${channel.subject?.project_id}`" class="underline text-primary hover:text-primary-dark py-2 rounded-md px-4 text-sm">View Job</NuxtLink>
      <NuxtLink :to="`/proposal/${channel.subject?.id}`" class="underline text-primary hover:text-primary-dark py-2 rounded-md px-4 text-sm">View Proposal</NuxtLink>
    </div>
  </div>
</template>



<script lang="ts" setup>
import type {Channel} from "~/types/models/Channel";
import type {User} from "~/types/models/User";

const props = defineProps<{ channel: Channel }>()

const {data} = useAuth()

const user = computed<User | undefined>(() => props.channel.members.find(member => member.id !== (data.value as { data?: User }).data?.id));

const avatarUrl = computed<string>(() => {
  return user.value?.avatar?.thumb_url
      ??
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
})
</script>
