<script setup lang="ts">
import { Icon } from '@iconify/vue';
import {chatStore} from "~/store/chatStore";
import Channels from "~/components/chat/Channels.vue";
import ChannelChat from "~/components/chat/ChannelChat.vue";
import type {Message} from "~/types/models/Message";

const {$echo} = useNuxtApp()
const route = useRoute();
const { getChannels, channels, getChannel, getMessages, appendMessage } = chatStore()

if (channels.data.data?.length === 0 ) {
  getChannels();
}

getChannel(parseInt(route.params.channelId as string))
getMessages(parseInt(route.params.channelId as string))

onMounted( () => {
  nextTick(() => {
    $echo.channel(`chat.channels.${route.params.channelId}`)
        .listen('.Modules\\Chat\\Broadcasting\\MessageSent', ({message}: {message: Message}) => {
          appendMessage(message)
        })
  })
});

onUnmounted(() => {
  $echo.leaveChannel(`chat.channels.${route.params.channelId}`)
})
</script>


<template>
  <!-- Mobile View -->
  <div class="h-full block lg:hidden ">
    <!-- Sidebar -->
    <div class="w-full lg:w-1/3 flex flex-col h-full">

      <!-- Search Bar -->
      <div class="border border-gray-300 rounded-2xl p-2 flex flex-row items-center gap-2 m-4">
        <Icon icon="material-symbols:search" class=" text-xl text-gray-400" />
        <input type="text" placeholder="Search chat" class="w-full outline-none border-none" />
      </div>

      <Channels />
    </div>
  </div>

  <!-- Desktop View -->
  <div class="px-8">
    <div class="hidden lg:block my-8 max-w-7xl mx-auto border border-gray-300 rounded-md">
      <div class="flex flex-col lg:flex-row h-full divide-x">

        <!-- Sidebar -->
        <div class="w-full lg:w-1/3 flex flex-col h-[80vh]">

          <!-- Search Bar -->
          <div class="border border-gray-300 rounded-2xl p-2 flex flex-row items-center gap-2 m-4">
            <Icon icon="material-symbols:search" class=" text-xl text-gray-400" />
            <input type="text" placeholder="Search chat" class="w-full outline-none border-none" />
          </div>

          <Channels />
        </div>

        <!-- Chat Section -->
        <div class="w-full lg:w-2/3 bg-white rounded-r-md overflow-hidden">
          <ChannelChat/>
        </div>
      </div>
    </div>
  </div>
</template>
