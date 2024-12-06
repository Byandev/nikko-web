<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Channel } from '~/types/models/Channel';
import { accountStore } from '~/store/accountStore';
import type { Message } from '~/types/models/Message';
import { Icon } from '@iconify/vue';
import type { PaginatedList } from '~/types/models/Pagination';
import type ChatChannel from '~/components/chat/ChatChannel.vue';

const { account } = storeToRefs(accountStore());

const { data: messages, fetchData: fetchMessages, pending: isMessagesLoading } = useFetchData<PaginatedList<Message>, ApiErrorResponse>();

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);

const message = ref<Message[]>([]);

const router = useRouter();
const route = useRoute();
const page = ref(1);
const showDropdown = ref(false);
const searchQuery = ref('');
const currentTab = ref('chat-channel');

const chatChannel = ref<InstanceType<typeof ChatChannel> | null>(null);

const messageQueryString = computed(() => {
    let params: Record<string, string> = {
        page: page.value.toString(),
        'per_page': '20'
    }

    return new URLSearchParams(params).toString();
})

watch(
    [() => page.value],
    debounce(async () => {
        await fetchMessages(`/v1/chat/channels/${route.params.channelId}/messages?${messageQueryString.value}`, {
            headers: requestHeaders.value
        });
        if (messages.value && messages.value.data) {
            message.value = [...message.value, ...messages.value.data];
        }
    }, 500)
);
const selectChat = async (id: number) => {
    await router.push(`/messages/${id}`);
    currentTab.value = 'chat-section';
}

const viewProfile = async (id: number) => {
    await router.push(`/${account.value?.type !== 'FREELANCER' ? 'freelancer' : 'client'}/${id}`);
};

const sortedMessages = computed(() => {
    return message.value.sort((a, b) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
});

const showLoadMore = computed(() => {
    if (messages.value && messages.value.meta) {
        return messages.value.meta.current_page < messages.value.meta.last_page;
    }
});

onMounted(async () => {
    await fetchMessages(`/v1/chat/channels/${route.params.channelId}/messages?${messageQueryString.value}`, {
        headers: requestHeaders.value
    });

    if (messages.value && messages.value.data) {
        message.value = messages.value.data
        chatChannel.value?.scrollToBottom();
    }

    chatChannel.value?.fetchChannelsData();
});

</script>


<template>
    <!-- Mobile View -->
    <div class="h-full block lg:hidden ">

        <!-- Chat Channel -->
        <ChatChannel v-if="currentTab == 'chat-channel'" :show-dropdown="showDropdown" :search-query="searchQuery" :is-messages-loading="isMessagesLoading" :route="route.params.channelId as string" :page="messages?.meta.current_page ?? 0" :showLoadMore="showLoadMore ?? false" @page="page = $event" :isMobile="true" @current_page="currentTab = $event" :messages="sortedMessages" @current-page="currentTab = $event" />

        <!-- Chat Option -->
        <ChatOption v-if="currentTab == 'chat-option'" :isMobile="true" :activeChannel="chatChannel?.activeChannel as Channel" :isChannelLoading="chatChannel?.isChannelLoading" @update:current-page="currentTab = $event" @view-profile="viewProfile" :avatar="chatChannel?.avatar" :name="chatChannel?.name" />
        
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
                <ChatList v-if="chatChannel?.activeChannel" :route="route.params.channelId as string" :chats="chatChannel?.sortedChats" :activeChannel="chatChannel?.activeChannel" :isChannelLoading="chatChannel?.isChannelLoading" @select-chat="selectChat" />
            </div>


            <!-- Chat Channel -->
            <ChatChannel :show-dropdown="showDropdown" :search-query="searchQuery" :is-messages-loading="isMessagesLoading" :route="route.params.channelId as string" :page="messages?.meta.current_page ?? 0" :showLoadMore="showLoadMore ?? false" @page="page = $event" @current_page="currentTab = $event" :messages="sortedMessages" @current-page="currentTab = $event" />


            <!-- Profile Section -->
            <ChatOption v-if="chatChannel?.activeChannel" :activeChannel="chatChannel?.activeChannel" :isChannelLoading="chatChannel?.isChannelLoading" @update:current-page="currentTab = $event" @update:showDropdown="showDropdown = $event" @view-profile="viewProfile" :avatar="chatChannel?.avatar" :name="chatChannel?.name" />
        </div>
    </div>

</template>
