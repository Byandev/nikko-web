<script setup lang="ts">
import type { Message } from '~/types/models/Message';
import { Icon } from '@iconify/vue';

const props = defineProps({
    messages: {
        type: Array as PropType<Message[]>,
        required: true,
    },
    isMessagesLoading: Boolean,
    showLoadMore: Boolean,
    page: Number,
});

const emit = defineEmits<{
    (e: 'load-more'): void;
}>();

const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            console.log(messagesContainer.value.scrollHeight);
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
};

defineExpose({
    scrollToBottom,
});

</script>

<template>
    <div ref="messagesContainer" v-if="messages && messages[0] && !isMessagesLoading"
        class="flex-1 p-4 overflow-y-auto flex-grow">
        <div class="text-center my-4" v-if="props.showLoadMore">
            <button @click="emit('load-more')"
                class="ml-5 ring-1 ring-primary px-4 py-2 bg-white text-primary rounded-full hover:bg-white/80">
                <Icon v-if="isMessagesLoading" icon="line-md:loading-loop" class="w-5 h-5" />
                <span v-else>Load more</span>
            </button>
        </div>
        <div class="space-y-4">
            <div v-if="messages.length === 0 && !isMessagesLoading" class="text-center text-gray-500">
                No messages yet. Start the conversation!
            </div>
            <ChatMessage :messages="messages" />
        </div>
    </div>
    <div v-else class="flex items-center justify-center flex-grow">
        <Icon icon="line-md:loading-loop" width="24" height="24" />
    </div>
</template>