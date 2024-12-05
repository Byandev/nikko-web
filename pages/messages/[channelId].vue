<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Channel } from '~/types/models/Channel';
import { accountStore } from '~/store/accountStore';
import type { Message } from '~/types/models/Message';
import { Icon } from '@iconify/vue';
import { formatDayTime } from '~/utils/formatter';

const { account } = storeToRefs(accountStore());

const { data: channels, fetchData: fetchChannels, pending: isChannelLoading } = useFetchData<{ data: Channel[] }, ApiErrorResponse>();
const { data: messages, fetchData: fetchMessages, pending: isMessagesLoading } = useFetchData<{ data: Message[] }, ApiErrorResponse>();
const { sendRequest: sendMesage, pending: isSending } = useSubmit<{ data: Message }, ApiErrorResponse>();

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);

const chats = ref<Channel[]>([]);
const message = ref<Message[]>([]);
const router = useRouter();
const route = useRoute();
const newMessage = ref('');

const currentTab = ref('chat-section');
const showDropdown = ref(false);

onMounted(async () => {
    await fetchChannels(`/v1/chat/channels`, {
        headers: requestHeaders.value
    });
    if (channels.value && channels.value.data) {
        chats.value = channels.value.data
    }

    await fetchMessages(`/v1/chat/channels/${route.params.channelId}/messages`, {
        headers: requestHeaders.value
    });

    if (messages.value && messages.value.data) {
        message.value = messages.value.data
        scrollToBottom();
    }
});

const handleMessageSubmit = async (event: Event) => {
    event.preventDefault();

    if (newMessage.value.trim()) {
        await sendMesage(`/v1/chat/channels/${route.params.channelId}/messages`, {
            method: 'POST',
            headers: requestHeaders.value,
            body: {
                content: newMessage.value.trim()
            }
        });
        newMessage.value = '';
        await fetchMessages(`/v1/chat/channels/${route.params.channelId}/messages`, {
            headers: requestHeaders.value
        });

        if (messages.value && messages.value.data) {
            message.value = messages.value.data
        }

        scrollToBottom();
    }
};

const selectChat = async (id: number) => {
    await router.push(`/messages/${id}`);
    currentTab.value = 'chat-section';
}

const viewProfile = async (id: number) => {
    await router.push(`/${account.value?.type !== 'FREELANCER' ? 'freelancer' : 'client'}/${id}`);
};

const activeChannel = computed(() => {
    return chats.value.find((chat) => chat.id === Number(route.params.channelId as string));
});

const activeParticipant = computed(() => {
    return activeChannel.value?.members.find(member => account.value?.id !== member.id);
});

const avatar = computed(() => activeParticipant.value?.avatar.original_url);
const name = computed(() => `${activeParticipant.value?.first_name} ${activeParticipant.value?.last_name}`);

const sortedChats = computed(() => {
    return chats.value.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
});

const sortedMessages = computed(() => {
    return message.value.sort((a, b) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
});

const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
};

watch(() => newMessage.value, () => {
    scrollToBottom();
});

</script>


<template>
    <!-- Mobile View -->
    <div class="h-full block lg:hidden ">
        <!-- Chat Section -->
        <div v-if="currentTab == 'chat-section'" class="lg:w-2/3 bg-white flex flex-col h-full border-l-2 border-r-2">
            <!-- Chat Header -->
            <div class="flex items-center p-4 bg-gray-50 border-b">
                <button @click="router.push('/messages')" class="mr-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                    <Icon icon="mdi:arrow-left" class="w-5 h-5" />
                </button>
                <img v-if="chats && !isChannelLoading && activeChannel" :src="avatar" alt="User"
                    class="w-10 h-10 rounded-full mr-4" />
                <div v-else>
                    <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
                </div>
                <div class="flex justify-between w-full">
                    <div class="flex-1">
                        <div v-if="chats && !isChannelLoading && activeChannel"
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
                    <div>
                        <button @click="showDropdown = !showDropdown"
                            class="mr-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                            <Icon icon="bi:three-dots" class="w-5 h-5" />
                        </button>
                        <div v-if="showDropdown"
                            class="absolute mt-2 right-10 w-48 bg-white border rounded-lg shadow-lg z-50">
                            <button @click="{currentTab = 'gallery-section';
                                showDropdown=false;
                            }"
                                class="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left">Gallery</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chat Messages -->
            <div ref="messagesContainer" v-if="message && message[0] && !isMessagesLoading"
                class="flex-1 p-4 overflow-y-auto flex-grow">
                <div class="space-y-4">
                    <div v-if="message.length === 0 && !isMessagesLoading" class="text-center text-gray-500">
                        No messages yet. Start the conversation!
                    </div>
                    <div v-for="(item, index) in sortedMessages" :key="index">
                        <div v-if="item.sender.id != account?.id" class="flex justify-start">
                            <div class="bg-white p-3 rounded-lg shadow">
                                <p>{{ item.content }}</p>
                                <span class="text-xs text-gray-500">{{ formatDayTime(item.created_at) }}</span>
                            </div>
                        </div>
                        <div v-else class="flex justify-end">
                            <div class="bg-primary text-white p-3 rounded-lg shadow">
                                <p>{{ item.content }}</p>
                                <span class="text-xs text-gray-100">{{ formatDayTime(item.created_at) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="flex items-center justify-center flex-grow">
                <Icon icon="line-md:loading-loop" width="24" height="24" />
            </div>

            <!-- Chat Input -->
            <div v-if="message && message[0] && !isMessagesLoading" class="p-2 bg-gray-100 border-t flex items-center">
                <input type="text" v-model="newMessage" placeholder="Aa"
                    class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-0 " />
                <button @click="handleMessageSubmit"
                    class="ml-4 p-2 bg-primary text-white rounded-full hover:bg-primary/80">
                    <Icon :icon="!isSending ? 'mdi:send' : 'line-md:loading-loop'" class="w-5 h-5" />
                </button>
            </div>
        </div>

        <!-- Profile Section -->
        <div v-if="currentTab == 'gallery-section'" class="w-full lg:w-1/3 bg-gray-50 flex flex-col h-full p-4">
            <div>
                <button @click="{currentTab = 'chat-section';
                    showDropdown=false;
                }" class="mr-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <Icon icon="mdi:arrow-left" class="w-5 h-5" />
            </button>
            </div>
            <div v-if="chats && !isChannelLoading" class="flex flex-col items-center">
                <img v-if="activeChannel" :src="avatar" alt="User" class="w-24 h-24 rounded-full" />
                <div v-else>
                    <div class="w-24 h-24 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
                <div v-if="activeChannel" class="text-lg font-semibold">{{ name }}</div>
                <div v-else>
                    <div class="mt-2 w-28 h-6 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div class="mt-2 border-b-2 w-full pb-3">
                    <div class="flex justify-center flex-col items-center">
                        <Icon icon="iconamoon:profile-circle-fill"
                            @click="viewProfile(activeChannel?.members.find(member => account?.id != member.id)?.id ?? 0)"
                            class="w-12 h-12 text-gray-500  hover:cursor-pointer hover:bg-gray-200 rounded-full p-1" />
                        <span class="text-sm text-gray-500">Profile</span>
                    </div>
                </div>
            </div>
            <div v-else class="flex items-center justify-center flex-grow">
                <Icon icon="line-md:loading-loop" width="24" height="24" />
            </div>
        </div>
    </div>

    <!-- Desktop View -->
    <div class="hidden lg:block my-8 lg:mx-auto mx-5 max-w-7xl ring-1 ring-gray-300 rounded-md h-[80vh]">
        <div class="flex flex-col lg:flex-row h-full">

            <!-- Sidebar -->
            <div class="w-full lg:w-1/3 flex flex-col h-full">
                <!-- Search Bar -->
                <div class="border border-gray-300 rounded-2xl p-2 flex flex-row items-center gap-2 m-4">
                    <Icon icon="material-symbols:search" class="text-xl text-gray-400" />
                    <input type="text" placeholder="Search chat" class="w-full outline-none border-none" />
                </div>

                <!-- Chat List -->
                <div class="flex-grow overflow-y-auto">
                    <div v-if="chats.length === 0 && !isChannelLoading" class="text-center text-gray-500">
                        No chats available.
                    </div>
                    <div v-if="isChannelLoading" class="animate-pulse space-y-2" v-for="n in 2" :key="n">
                        <div class="flex items-center p-4 border-b">
                            <div class="w-12 h-12 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
                            <div class="flex-1">
                                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                                <div class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                            </div>
                            <div class="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                        </div>
                    </div>

                    <div v-if="chats && !isChannelLoading" v-for="chat in sortedChats" :key="chat.id"
                        @click="selectChat(chat.id)"
                        :class="['flex items-center p-4 border-b cursor-pointer', chat.id == Number(route.params.channelId as string) ? 'bg-gray-200' : 'bg-white']">
                        <img :src="activeChannel?.members.find(member => account?.id != member.id)?.avatar.original_url"
                            alt="User" class="w-12 h-12 rounded-full mr-4" />
                        <div class="flex-1">
                            <div class="text-lg font-semibold">
                                {{ activeChannel?.members.find(member => account?.id != member.id)?.first_name }}
                                {{ activeChannel?.members.find(member => account?.id != member.id)?.last_name }}
                            </div>
                        </div>
                        <div class="text-xs text-gray-500">{{ timeAgo(chat.created_at) }}</div>
                    </div>
                </div>
            </div>


            <!-- Chat Section -->
            <div class="w-full lg:w-2/3 bg-white flex flex-col border-l-2 border-r-2 h-[80vh]">

                <!-- Chat Header -->
                <div class="flex items-center p-4 bg-gray-50 border-b">
                    <img v-if="chats && !isChannelLoading && activeChannel"
                        :src="activeChannel?.members.find(member => account?.id != member.id)?.avatar.original_url"
                        alt="User" class="w-10 h-10 rounded-full mr-4" />
                    <div v-else>
                        <div class="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
                    </div>
                    <div class="flex-1">
                        <div v-if="chats && !isChannelLoading && activeChannel"
                            class="text-lg font-semibold flex flex-col">
                            <span>{{ name }}</span>
                            <span v-if="activeChannel" class="text-xs text-gray-500">
                                {{ timeAgo(activeChannel?.last_activity_at) }}
                            </span>
                        </div>
                        <div v-else>
                            <div class="ml-5 w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
                            <div class="mt-2 ml-5 w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <!-- Chat Messages -->
                <div ref="messagesContainer" v-if="message && message[0] && !isMessagesLoading"
                    class="flex-1 p-4 overflow-y-auto flex-grow">
                    <div class="space-y-4">
                        <div v-if="message.length === 0 && !isMessagesLoading" class="text-center text-gray-500">
                            No messages yet. Start the conversation!
                        </div>
                        <div v-for="(item, index) in sortedMessages" :key="index">
                            <div v-if="item.sender.id != account?.id" class="flex justify-start">
                                <div class="bg-white p-3 rounded-lg shadow">
                                    <p>{{ item.content }}</p>
                                    <span class="text-xs text-gray-500">{{ formatDayTime(item.created_at) }}</span>
                                </div>
                            </div>
                            <div v-else class="flex justify-end">
                                <div class="bg-primary text-white p-3 rounded-lg shadow">
                                    <p>{{ item.content }}</p>
                                    <span class="text-xs text-gray-100">{{ formatDayTime(item.created_at) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chat Input -->
                <div v-if="message && message[0] && !isMessagesLoading"
                    class="p-2 bg-gray-100 border-t flex items-center">
                    <input type="text" v-model="newMessage" placeholder="Aa"
                        class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-0 " />
                    <button @click="handleMessageSubmit"
                        class="ml-4 p-2 bg-primary text-white rounded-full hover:bg-primary/80">
                        <Icon :icon="!isSending ? 'mdi:send' : 'line-md:loading-loop'" class="w-5 h-5" />
                    </button>
                </div>

            </div>


            <!-- Profile Section -->
            <div class="w-full lg:w-1/3 bg-gray-50 flex flex-col h-full p-4">
                <div v-if="chats && !isChannelLoading" class="flex flex-col items-center">
                    <img v-if="activeChannel" :src="avatar" alt="User" class="w-24 h-24 rounded-full" />
                    <div v-else>
                        <div class="w-24 h-24 bg-gray-300 rounded-full animate-pulse"></div>
                    </div>
                    <div v-if="activeChannel" class="text-lg font-semibold">{{ name }}</div>
                    <div v-else>
                        <div class="mt-2 w-28 h-6 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                    <div class="mt-2 border-b-2 w-full pb-3">
                        <div class="flex justify-center flex-col items-center">
                            <Icon icon="iconamoon:profile-circle-fill"
                                @click="viewProfile(activeChannel?.members.find(member => account?.id != member.id)?.id ?? 0)"
                                class="w-12 h-12 text-gray-500  hover:cursor-pointer hover:bg-gray-200 rounded-full p-1" />
                            <span class="text-sm text-gray-500">Profile</span>
                        </div>
                    </div>
                </div>
                <div v-else class="flex items-center justify-center flex-grow">
                    <Icon icon="line-md:loading-loop" width="24" height="24" />
                </div>
            </div>
        </div>
    </div>

</template>
