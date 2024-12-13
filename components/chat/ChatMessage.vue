<template>
  <div class="space-y-1">
    <div :class="['flex items-center space-x-2', isSentByMe ? 'justify-end': 'justify-start']">
      <div v-if="!isSentByMe">
        <img :src="senderAvatarUrl" alt="avatar" class="min-w-8 h-8 rounded-full border"/>
      </div>

      <div :class="['flex']">
        <div v-if="message.content" :class="[
          'py-2 px-4 shadow rounded-tr-2xl rounded-tl-2xl space-y-0',
          isSentByMe ? 'bg-primary text-white rounded-bl-2xl' : 'bg-slate-100 text-slate-800 rounded-br-2xl'
        ]">
          <p>{{ message.content }}</p>
        </div>

        <div :class="['space-y-1 flex',  isSentByMe ? 'justify-end': 'justify-start']" v-if="message.attachments?.length">
          <img v-for="attachment in message.attachments" :src="attachment.original_url"
               alt="attachment" class="h-auto rounded-lg bg-white p-1 shadow w-2/5"/>
        </div>
      </div>

      <div v-if="isSentByMe">
        <img :src="senderAvatarUrl" alt="avatar" class="min-w-8 h-8 rounded-full border"/>
      </div>
    </div>

    <p :class="[isSentByMe ? 'text-right mr-10': 'text-left ml-10']" class="text-[10px]">{{ timestamp }}</p>
  </div>
</template>

<script lang="ts" setup>
import moment from "moment";
import type {Message} from "~/types/models/Message";
import type {User} from "~/types/models/User";

const props = defineProps<{ message: Message }>()
const {data} = useAuth();

const timestamp = computed<string>(() => {
  return moment(props.message.created_at).fromNow()
})

const isSentByMe = computed<boolean>(() => {
  return props.message.sender_id === (data.value as { data?: User })?.data?.id
})

const senderAvatarUrl = computed<string>(() => {
  return props.message.sender?.avatar?.original_url
      ??
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
})
</script>

