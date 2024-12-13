<template>
  <div
      :class="[
          'w-full h-20 p-4 flex space-x-2 hover:cursor-pointer',
          isActive ? 'bg-slate-100 text-white' : 'hover:bg-slate-50'
      ]">
    <div>
      <img :src="avatarUrl" alt="User" class="w-12 h-12 rounded-full mr-4 border" />
    </div>
    <div class="w-full">
      <p class="text-base text-slate-900">{{ channel.title }}</p>
      <p class="text-xs text-slate-700">{{ moment(channel.last_activity_at).fromNow() }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import moment from "moment";
import type {User} from "~/types/models/User";
import type {Channel} from "~/types/models/Channel";

const props = defineProps<{ channel: Channel, isActive?: boolean }>()

const {data} = useAuth()
const {channel} = toRefs(props)


const avatarUrl = computed<string>(() => {
  return channel.value.members
          .find(member => member.id !== (data.value as { data?: User })?.data?.id)?.avatar?.thumb_url
      ??
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
})

</script>
