<template>
  <div v-if="!channel.loading && !messages.loading" class="flex flex-col h-screen relative md:h-[80vh]">
    <!-- Header -->
    <div class="border-b sticky top-0 bg-white z-10">
      <ChannelMenu :channel="channel.data" is-active />
    </div>
    
    <!-- Messages -->
    <div class="flex-1 space-y-5 p-5 overflow-y-scroll mb-12 md:mb-0" ref="messagesContainer">
      <ChatMessage v-for="message in sortedMessages" :key="`message-${message.id}`" :message="message" />
    </div>

    <!-- Chat Input -->
    <div class="bg-white w-full md:relative md:bottom-0 fixed bottom-0 left-0 border-t">
      <ChatInput :channel-id="channel.data.id" @sent="newMessageSent" />
    </div>
  </div>
</template>


<script lang="ts" setup>
import { chatStore } from "~/store/chatStore";
import ChannelMenu from "~/components/chat/ChannelMenu.vue";
import type { Message } from "~/types/models/Message";
import ChannelDetails from "~/components/chat/ChannelDetails.vue";

const { channel, messages, sortedMessages } = storeToRefs(chatStore());
const { appendMessage } = chatStore();

const messagesContainer = ref<HTMLDivElement | null>(null);

const newMessageSent = (data: Message) => {
  appendMessage(data);

  nextTick(() => {
    scrollToBottom();
  });
};

const scrollToBottom = (): void => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

watch(
  () => sortedMessages.value.length,
  async () => {
    await nextTick();
    scrollToBottom();
  }
);
</script>

<style scoped>
/* Optional: Add padding adjustments for better alignment */
</style>
