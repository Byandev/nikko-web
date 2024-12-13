<script setup lang="ts">
import { Icon } from '@iconify/vue';
import {chatStore} from "~/store/chatStore";
import Channels from "~/components/chat/Channels.vue";

const { getChannels } = chatStore()
const router = useRouter();

onMounted(() => {
  getChannels().then((channels) => {
    if (channels.data.length) {
      // router.push(`/chat/${channels.data[0].id}`)
    }
  })
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
    <div class="hidden lg:block my-8 max-w-7xl border border-gray-300 rounded-md h-[80vh]">
      <div class="flex flex-col lg:flex-row h-full divide-x">

        <!-- Sidebar -->
        <div class="w-full lg:w-1/3 flex flex-col h-full">

          <!-- Search Bar -->
          <div class="border border-gray-300 rounded-2xl p-2 flex flex-row items-center gap-2 m-4">
            <Icon icon="material-symbols:search" class=" text-xl text-gray-400" />
            <input type="text" placeholder="Search chat" class="w-full outline-none border-none" />
          </div>

          <Channels />
        </div>

        <!-- Chat Section -->
        <div class="w-full lg:w-2/3 bg-white flex flex-col items-center justify-center h-full rounded-r-md">

        </div>
      </div>
    </div>
  </div>
</template>
