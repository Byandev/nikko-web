<template>
  <div class="space-y-5 p-5 overflow-y-scroll flex-1">
    <Message v-for="message in sortedMessages" :key="`message-${message.id}`" :message="message"/>
  </div>
</template>

<script setup lang="ts">
import Message from "~/components/chat/Message.vue";

import {chatStore} from "~/store/chatStore";

const {sortedMessages} = storeToRefs(chatStore())
</script>
