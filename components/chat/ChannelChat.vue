<template>
  <div v-if="!channel.loading && !messages.loading" class="grid grid-cols-3 divide-x h-full">
    <div class="col-span-2 flex flex-col h-[80vh]">
      <div class="border-b">
        <ChannelMenu :channel="channel.data" is-active/>
      </div>

      <div class="space-y-5 p-5 overflow-y-scroll flex-1" ref="messagesContainer">
        <Message v-for="message in sortedMessages" :key="`message-${message.id}`" :message="message"/>
      </div>

      <ChatInput :channel-id="channel.data.id" @sent="newMessageSent"/>
    </div>

    <div class="col-span-1">ds</div>
  </div>
</template>

<script lang="ts" setup>
import {chatStore} from "~/store/chatStore";
import ChannelMenu from "~/components/chat/ChannelMenu.vue";
import type {Message} from "~/types/models/Message";

const {channel, messages, sortedMessages} = storeToRefs(chatStore())
const {appendMessage} = chatStore()

const messagesContainer = ref<HTMLDivElement | null>(null);

const newMessageSent = (data: Message) => {
  appendMessage(data)

  nextTick(() => {
    scrollToBottom();
  });
}

const scrollToBottom = (): void => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

</script>
