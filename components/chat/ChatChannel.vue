<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import debounce from 'lodash/debounce';
import type { Channel } from '~/types/models/Channel';
import type { Message } from '~/types/models/Message';
import type ChatMessages from './ChatMessages.vue';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { accountStore } from '~/store/accountStore';
import { Icon } from '@iconify/vue';

const props = defineProps<{
  route: string;
  isMobile?: boolean;
  showLoadMore: boolean;
  messages: Message[];
  isMessagesLoading: boolean;
  page: number;
  searchQuery: string;
  showDropdown: boolean;
}>();

const emit = defineEmits<{
  (e: 'current-page', page: string): void;
  (e: 'page', page: number): void;
  (e: 'update:showDropdown', state: boolean): void;
}>();

const { account } = storeToRefs(accountStore());
const router = useRouter();
const chats = ref<Channel[]>([]);
const chatMessages = ref<InstanceType<typeof ChatMessages> | null>(null);

const { data: channels, fetchData: fetchChannels, pending: isChannelLoading } =
  useFetchData<{ data: Channel[] }, ApiErrorResponse>();

const channelsQueryString = computed(() => {
  const params: Record<string, string> = {
    'filter[search]': props.searchQuery,
  };
  return new URLSearchParams(params).toString();
});

const sortedChats = computed(() =>
  chats.value.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
);

const activeChannel = computed(() => {
  return sortedChats.value.find((chat) => chat.id === Number(props.route));
});

const activeParticipant = computed(() =>
  activeChannel.value?.members.find((member) => account.value?.id !== member.id)
);

const avatar = computed(() => activeParticipant.value?.avatar?.original_url);

const name = computed(
  () => `${activeParticipant.value?.first_name} ${activeParticipant.value?.last_name}`
);

const requestHeaders = computed<HeadersInit | undefined>(() =>
  account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);

const scrollToBottom = () => {
  chatMessages.value?.scrollToBottom();
};

const fetchChannelsData = async () => {
  await fetchChannels(`/v1/chat/channels?${channelsQueryString.value}`, {
    headers: requestHeaders.value,
  });
  if (channels.value?.data) {
    chats.value = channels.value.data;
  }
};

onMounted(async () => {
  await fetchChannelsData();
});

watch(
  [() => channelsQueryString.value],
  debounce(fetchChannelsData, 500)
);

defineExpose ({
  fetchChannelsData,
  isChannelLoading,
  scrollToBottom,
  activeChannel,
  sortedChats,
  avatar,
  name,
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
                        <button @click="emit('update:showDropdown', !showDropdown)"	
                            class="mr-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                            <Icon icon="bi:three-dots" class="w-5 h-5" />
                        </button>
                        <div v-if="showDropdown"
                            class="absolute mt-2 right-10 w-48 bg-white border rounded-lg shadow-lg z-50">
                            <button @click="{
                                emit('current-page', 'chat-option');
                                emit('update:showDropdown', false);
                            }"
                                class="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left">Chat Option</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chat Messages -->
            <ChatMessages ref="chatMessages" :show-load-more="showLoadMore" :messages="messages" :isMessagesLoading="isMessagesLoading" :page="page" @load-more="emit('page', props.page + 1)" />

            <!-- Chat Input -->
            <ChatInput :route="props.route" />

        </div>
</template>