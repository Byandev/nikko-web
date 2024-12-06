<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Channel } from '~/types/models/Channel';
import type { Message } from '~/types/models/Message';
import type { PaginatedList } from '~/types/models/Pagination';
import { Icon } from '@iconify/vue';
import type ChatChannel from '~/components/chat/ChatChannel.vue';

import { accountStore } from '~/store/accountStore';

const { account } = storeToRefs(accountStore());

const messages = ref<Message[]>([]);
const channels = ref<Channel[]>([]);
const page = ref(1);
const showDropdown = ref(false);
const searchQuery = ref('');
const currentTab = ref('chat-channel');
const chatChannel = ref<InstanceType<typeof ChatChannel> | null>(null);

const router = useRouter();
const route = useRoute();

const { data: fetchedMessages, fetchData: fetchMessages, pending: isMessagesLoading } = useFetchData<PaginatedList<Message>, ApiErrorResponse>();
const { data: fetchedChannels, fetchData: fetchChannels, pending: isChannelLoading } = useFetchData<{ data: Channel[] }, ApiErrorResponse>();

const requestHeaders = computed<HeadersInit | undefined>(() =>
  account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);

const messageQueryString = computed(() => {
  const params: Record<string, string> = {
    page: page.value.toString(),
    per_page: '20',
  };
  return new URLSearchParams(params).toString();
});

const channelsQueryString = computed(() => {
  const params: Record<string, string> = {
    'filter[search]': searchQuery.value,
  };
  return new URLSearchParams(params).toString();
});

const activeChannel = computed(() => 
  channels.value.find((channel) => channel.id === Number(route.params.channelId))
);

const activeParticipant = computed(() => 
  activeChannel.value?.members.find((member) => account.value?.id !== member.id)
);

const avatar = computed(() => activeParticipant.value?.avatar?.original_url);

const name = computed(() => 
  `${activeParticipant.value?.first_name} ${activeParticipant.value?.last_name}`
);

const id = computed(() => activeParticipant.value?.id);

const showLoadMore = computed(() => {
  if (fetchedMessages.value && fetchedMessages.value.meta) {
    return fetchedMessages.value.meta.current_page < fetchedMessages.value.meta.last_page;
  }
});

const fetchData = async (url: string, type: 'messages' | 'channels') => {
  try {
    const headers = requestHeaders.value;
    if (type === 'messages') {
      await fetchMessages(url, { headers });
      if (fetchedMessages.value && fetchedMessages.value.data) {
        messages.value = [...messages.value, ...fetchedMessages.value.data];
      }
    } else if (type === 'channels') {
      await fetchChannels(url, { headers });
      if (fetchedChannels.value?.data) {
        channels.value = fetchedChannels.value.data;
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const selectChat = async (id: number) => {
  await router.push(`/messages/${id}`);
  currentTab.value = 'chat-section';
};

const refreshMessages = async () => {
  await fetchData(`/v1/chat/channels/${route.params.channelId}/messages?${messageQueryString.value}`, 'messages');
  chatChannel.value?.scrollToBottom();
};

watch(
  [() => page.value],
  debounce(async () => {
    await fetchData(`/v1/chat/channels/${route.params.channelId}/messages?${messageQueryString.value}`, 'messages');
  }, 500)
);

onMounted(async () => {
  await fetchData(`/v1/chat/channels?${channelsQueryString.value}`, 'channels');
  await fetchData(`/v1/chat/channels/${route.params.channelId}/messages?${messageQueryString.value}`, 'messages');
  chatChannel.value?.scrollToBottom();
});
</script>

<template>
    <!-- Mobile View -->
    <div class="h-full block lg:hidden ">

        <!-- Chat Channel -->
        <ChatChannel v-if="currentTab == 'chat-channel'" @refresh="refreshMessages" ref="chatChannel" :active-channel="activeChannel" :channels="channels" :route="route.params.channelId as string" :show-dropdown="showDropdown"  :search-query="searchQuery" :is-messages-loading="isMessagesLoading" :page="fetchedMessages?.meta.current_page ?? 0" :showLoadMore="showLoadMore ?? false" @page="page = $event" :isMobile="true" @update:show-dropdown="showDropdown = $event" :messages="messages" @current-page="currentTab = $event" :is-channel-loading="isChannelLoading" :avatar="avatar ?? ''" :name="name" />

        <!-- Chat Option -->
        <ChatOption v-if="currentTab == 'chat-option'" :channel-id="Number(route.params.channelId as string)" :isMobile="true" :isChannelLoading="isChannelLoading" :avatar="avatar" :name="name" :id="id ?? 0" />
        
    </div>

    <!-- Desktop View -->
    <div class="hidden lg:block my-8 lg:mx-auto mx-5 max-w-7xl ring-1 ring-gray-300 rounded-md h-[80vh]">
        <div class="flex flex-col lg:flex-row h-full">

            <!-- Sidebar -->
            <div class="w-full lg:w-1/3 flex flex-col h-full">
                <!-- Search Bar -->
                <div class="border border-gray-300 rounded-2xl p-2 flex flex-row items-center gap-2 m-4">
                    <Icon icon="material-symbols:search" class="text-xl text-gray-400" />
                    <input type="text" v-model="searchQuery" placeholder="Search chat"
                        class="w-full outline-none border-none" />
                </div>

                <!-- Chat List -->
                <ChannelList :route="route.params.channelId as string" :channels="channels" :isChannelLoading="isChannelLoading" @select-chat="selectChat" />
            </div>


            <!-- Chat Channel -->
            <ChatChannel ref="chatChannel" @refresh="refreshMessages" :active-channel="activeChannel" :channels="channels" :route="route.params.channelId as string" :show-dropdown="showDropdown"  :search-query="searchQuery" :is-messages-loading="isMessagesLoading" :page="fetchedMessages?.meta.current_page ?? 0" :showLoadMore="showLoadMore ?? false" @page="page = $event" :isMobile="true" @update:show-dropdown="showDropdown = $event" :messages="messages" @current-page="currentTab = $event" :is-channel-loading="isChannelLoading" :avatar="avatar ?? ''" :name="name" />


            <!-- Profile Section -->
            <ChatOption :isChannelLoading="isChannelLoading" :channel-id="Number(route.params.channelId as string)" :avatar="avatar" :name="name" :id="id ?? 0" />
        </div>
    </div>

</template>
