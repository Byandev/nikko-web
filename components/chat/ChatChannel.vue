<script setup lang="ts">
const router = useRouter();
import type { Channel } from '~/types/models/Channel';
import type { Message } from '~/types/models/Message';
import { Icon } from '@iconify/vue';
import type ChatMessages from './ChatMessages.vue';

const props = defineProps({
    avatar: String,
    name: String,
    channels: {
        type: Array as PropType<Channel[]>,
        required: true,
    },
    messages: {
        type: Array as PropType<Message[]>,
        required: true,
    },
    activeChannel: {
        type: Object as PropType<Channel>,
        required: true,
    },
    isChannelLoading: Boolean,
    isMessagesLoading: Boolean,
    isSending: Boolean,
    modelValue : {
        type: String,
        default: '',
        required: true,
    },
    showDropdown: Boolean,
    showLoadMore: Boolean,
    page: {
        type: Number,
        default: 1,
    },
    isMobile: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits<{
  (e: 'current-page', page: string): void;
  (e: 'page', page: number): void;
  (e: 'submit-message'): void;
  (e: 'update:modelValue', value: string): void;
  (e: 'update:showDropdown', value: boolean): void;
}>();

const chatMessages = ref<InstanceType<typeof ChatMessages> | null>(null);

const scrollToBottom = () => {
    chatMessages.value?.scrollToBottom();
};

defineExpose({
    scrollToBottom,
});

</script>

<template>
    <div class="w-full lg:w-2/3 bg-white flex flex-col border-l-2 border-r-2" :class="isMobile ? 'h-full ':'h-[80vh]'">

            <!-- Channel Header -->
            <div class="flex items-center p-4 bg-gray-50 border-b">
                <button v-if="isMobile" @click="router.push('/messages')" class="mr-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                    <Icon icon="mdi:arrow-left" class="w-5 h-5" />
                </button>
                <img v-if="channels && !isChannelLoading && activeChannel" :src="avatar" alt="User"
                    class="w-10 h-10 rounded-full mr-4" />
                <div v-else>
                    <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
                </div>
                <div class="flex justify-between w-full">
                    <div class="flex-1">
                        <div v-if="channels && !isChannelLoading && activeChannel"
                            class="text-lg font-semibold flex flex-col">
                            <span>{{ name }}</span>
                            <span v-if="activeChannel" class="text-xs text-gray-500">{{
                                timeAgo(activeChannel?.last_activity_at) }}</span>
                        </div>
                        <div v-else>
                            <div class="ml-5 w-20 h-4 bg-gray-300 rounded"></div>
                            <div class="mt-2 ml-5 w-12 h-4 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                    <div v-if="isMobile">
                        <button @click="emit('update:showDropdown',!props.showDropdown);"	
                            class="mr-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                            <Icon icon="bi:three-dots" class="w-5 h-5" />
                        </button>
                        <div v-if="props.showDropdown"
                            class="absolute mt-2 right-10 w-48 bg-white border rounded-lg shadow-lg z-50">
                            <button @click="{
                                emit('current-page', 'chat-option');
                                emit('update:showDropdown',false);
                            }"
                                class="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left">Chat Option</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chat Messages -->
            <ChatMessages ref="chatMessages" :show-load-more="props.showLoadMore" :messages="messages" :isMessagesLoading="isMessagesLoading" :page="page" @load-more="emit('page', props.page + 1)" />

            <!-- Chat Input -->
            <ChatInput :modelValue="props.modelValue" :message="messages" :isMessagesLoading="isMessagesLoading" :isSending="isSending" @submit-message="emit('submit-message')" @update:modelValue="emit('update:modelValue', $event);" />

        </div>
</template>