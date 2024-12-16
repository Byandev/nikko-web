<template>
  <div v-if="!channel.loading && !messages.loading" class="grid grid-cols-3 divide-x h-full">
    <!-- Mobile View: Overlay Toggle -->
    <div class="col-span-3 md:hidden absolute">
      <transition name="fade">
        <div v-if="isOverlayOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div class="bg-white p-5 rounded shadow-lg w-11/12 max-w-md">
            <div class="flex justify-end">
              <button @click="toggleOverlay">
                &times;
              </button>
            </div>
            <ChannelDetails v-if="channel.data" :channel="channel.data" />
          </div>
        </div>
      </transition>
    </div>

    <!-- Main Chat View -->
    <div class="col-span-3 md:col-span-2 flex flex-col h-full md:h-[80vh]">
      <div class="border-b flex items-center justify-between bg-slate-100">
        <ChannelMenu :channel="channel.data" is-active />
        <button class="bg-transparent text-blue-600 py-2 pr-5 rounded mb-2 block md:hidden" @click="toggleOverlay">
          <Icon icon="eva:info-outline" class="w-6 h-6" />
        </button>
      </div>

      <!-- Chat Messages Container -->
      <div class="space-y-5 p-5 overflow-y-auto grow" ref="messagesContainer" style="max-height: calc(100vh - 205px);">
        <ChatMessage v-for="message in sortedMessages" :key="`message-${message.id}`" :message="message" />
      </div>

      <ChatInput :channel-id="channel.data.id" @sent="newMessageSent" />
    </div>

    <!-- Desktop View: Channel Details -->
    <div class="hidden md:col-span-1 md:block">
      <ChannelDetails :channel="channel.data" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { storeToRefs } from 'pinia';
import { chatStore } from '~/store/chatStore';
import type { Message } from '~/types/models/Message';

const { channel, messages, sortedMessages } = storeToRefs(chatStore());
const { appendMessage } = chatStore();

const messagesContainer = ref<HTMLDivElement | null>(null);
const isOverlayOpen = ref(false); // State for overlay

const toggleOverlay = () => {
  isOverlayOpen.value = !isOverlayOpen.value;
};

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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
