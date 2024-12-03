<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Channel } from '~/types/models/Channel';
import { accountStore } from '~/store/accountStore';
import type { Message } from '~/types/models/Message';
import { Icon } from '@iconify/vue';

const { account } = storeToRefs(accountStore());

const { data: channels, fetchData: fetchChannels } = useFetchData<{ data: Channel[] }, ApiErrorResponse>();
const { data: messages, fetchData: fetchMessages, pending: isLoading } = useFetchData<{ data: Message[] }, ApiErrorResponse>();

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
    }
});

const selectChat = async (id: number) => {
    await router.push(`/messages/${id}`);
    currentTab.value = 'chat-section';
}

const viewProfile = async (id: number) => {
    await router.push(`/freelancer/${id}`);
};
</script>


<template>
    <div class="h-full block lg:hidden ">
        <!-- Chat Section -->
        <div v-if="currentTab == 'chat-section'" class="lg:w-2/3 bg-white flex flex-col h-full border-l-2 border-r-2">

            <!-- Chat Header -->
            <div class="flex items-center p-4 bg-gray-50 border-b">
                <button @click="router.push('/messages')" class="mr-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                    <Icon icon="mdi:arrow-left" class="w-5 h-5" />
                </button>
                <img v-if="message && message[0] && !isLoading" :src="message[0].sender.avatar.original_url" alt="User"
                    class="w-10 h-10 rounded-full mr-4" />
                <div v-else>
                    <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
                </div>
                <div class="flex justify-between w-full">
                    <div class="flex-1">
                        <div v-if="message && message[0] && !isLoading" class="text-lg font-semibold">
                            {{ message[0].sender.first_name }} {{ message[0].sender.last_name }}
                        </div>
                        <div v-else>
                            <div class="ml-5 w-20 h-4 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                    <div>
                        <button @click="showDropdown = !showDropdown"
                            class="mr-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                            <Icon icon="bi:three-dots" class="w-5 h-5" />
                        </button>
                        <div v-if="showDropdown"
                            class="absolute mt-2 right-10 w-48 bg-white border rounded-lg shadow-lg z-50">
                            <button @click="currentTab = 'gallery-section'"
                                class="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left">Gallery</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chat Messages -->
            <div v-if="message && message[0] && !isLoading" class="flex-1 p-4 overflow-y-auto">
                <div class="space-y-4">
                    <div v-for="(item, index) in message" :key="index">
                        <div v-if="item.sender.first_name === 'other'" class="flex justify-start">
                            <div class="bg-white p-3 rounded-lg shadow w-max">
                                <p>{{ item.content }}</p>
                                <span class="text-xs text-gray-500">{{ formatDayTime(item.created_at) }}</span>
                            </div>
                        </div>
                        <div v-else class="flex justify-end">
                            <div class="relative group flex flex-row items-center gap-2">
                                <span
                                    class="bg-gray-700 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {{ formatDayTime(item.created_at) }}
                                </span>
                                <div class="bg-primary p-3 rounded-lg shadow max-w-1/4 text-white flex">
                                    <p class="break-words">{{ item.content }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="flex items-center justify-center flex-grow">
                <Icon icon="line-md:loading-loop" width="24" height="24" />
            </div>

            <!-- Chat Input -->
            <div class="flex items-center p-2 bg-gray-100 border-t">
                <input type="text" v-model="newMessage" placeholder="Aa"
                    class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-400" />
                <button @click="" class="ml-4 p-2 bg-primary text-white rounded-full hover:bg-primary/80">
                    <Icon icon="mdi:send" class="w-5 h-5" />
                </button>
            </div>
        </div>

        <!-- Profile Section -->
        <div v-if="currentTab == 'gallery-section'"
            class="lg:w-2/3 bg-white flex flex-col h-full border-l-2 border-r-2">
            <div class="flex items-center justify-start p-4 bg-gray-50 border-b">
                <button @click="{currentTab = 'chat-section';
                    showDropdown = false;
                }" class="mr-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                    <Icon icon="mdi:arrow-left" class="w-5 h-5" />
                </button>
            </div>
            <div v-if="message.length > 0" class="flex flex-col items-center">
                <img :src="message[0].sender.avatar.original_url" alt="User" class="w-24 h-24 rounded-full mb-4" />
                <div class="text-lg font-semibold">{{ message[0].sender.first_name }} {{ message[0].sender.last_name
                    }}</div>
                <div class="mt-4 border-b-2 w-full pb-3">
                    <div class="flex justify-center flex-col items-center">
                        <Icon icon="iconamoon:profile-circle-fill" @click="viewProfile(message[0].sender.id)"
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

    <div class="hidden lg:block my-8 lg:mx-auto mx-5 max-w-7xl ring-1 ring-gray-300 rounded-md h-[80vh]">
        <div class="flex flex-col lg:flex-row h-full">
            <!-- Sidebar -->
            <div class="w-full lg:w-1/3 flex flex-col h-full">
                <!-- Search Bar -->
                <div class="border border-gray-300 rounded-2xl p-2 flex flex-row items-center gap-2 m-4">
                    <Icon icon="material-symbols:search" class=" text-xl text-gray-400" />
                    <input type="text" placeholder="Search chat" class="w-full outline-none border-none" />
                </div>

                <!-- Chat List -->
                <div class="overflow-y-auto flex-grow">
                    <div v-if="isLoading" class="animate-pulse space-y-2" v-for="n in 2" :key="n">
                        <div class="flex items-center p-4 border-b">
                            <div class="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                            <div class="flex-1">
                                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div class="h-4 bg-gray-200 rounded w-12"></div>
                        </div>
                    </div>
                    <div v-if="chats && !isLoading" v-for="chat in chats" :key="chat.id" @click="selectChat(chat.id)"
                        :class="['flex items-center p-4 border-b cursor-pointer', chat.id == Number(route.params.channelId as string)? 'bg-gray-200': 'bg-white']">
                        <img :src="chat.members[1].avatar.original_url" alt="User"
                            class="w-12 h-12 rounded-full mr-4" />
                        <div class="flex-1">
                            <div class="text-lg font-semibold">{{ chat.members[1].first_name }} {{
                                chat.members[1].last_name }}</div>
                            <!-- <div class="text-sm text-gray-600 truncate">{{ chat. }}</div> -->
                        </div>
                        <div class="text-xs text-gray-500">{{ timeAgo(chat.created_at) }}</div>
                    </div>
                </div>
            </div>

            <!-- Chat Section -->
            <div class="w-full lg:w-2/3 bg-white flex flex-col h-full border-l-2 border-r-2">

                <!-- Chat Header -->
                <div class="flex items-center p-4 bg-gray-50 border-b">
                    <img v-if="message && message[0] && !isLoading" :src="message[0].sender.avatar.original_url"
                        alt="User" class="w-10 h-10 rounded-full mr-4" />
                    <div v-else>
                        <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
                    </div>
                    <div class="flex-1">
                        <div v-if="message && message[0] && !isLoading" class="text-lg font-semibold">
                            {{ message[0].sender.first_name }} {{ message[0].sender.last_name }}
                        </div>
                        <div v-else>
                            <div class="ml-5 w-20 h-4 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                </div>

                <div v-if="message && message[0] && !isLoading" class="flex flex-col flex-grow h-full">
                    <!-- Chat Messages -->
                    <div class="flex-1 p-4 overflow-y-auto">
                        <div class="space-y-4">
                            <div v-for="(item, index) in message" :key="index">
                                <div v-if="item.sender.first_name === 'other'" class="flex justify-start">
                                    <div class="bg-white p-3 rounded-lg shadow w-max">
                                        <p>{{ item.content }}</p>
                                        <span class="text-xs text-gray-500">{{ formatDayTime(item.created_at) }}</span>
                                    </div>
                                </div>
                                <div v-else class="flex justify-end">
                                    <div class="relative group flex flex-row items-center gap-2">
                                        <span
                                            class="bg-gray-700 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {{ formatDayTime(item.created_at) }}
                                        </span>
                                        <div class="bg-primary p-3 rounded-lg shadow max-w-1/4 text-white flex">
                                            <p class="break-words">{{ item.content }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="flex items-center justify-center flex-grow">
                    <Icon icon="line-md:loading-loop" width="24" height="24" />
                </div>
                <!-- Chat Input -->
                <div class="flex items-center p-2 bg-gray-100 border-t">
                    <input type="text" v-model="newMessage" placeholder="Aa"
                        class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-400" />
                    <button @click="" class="ml-4 p-2 bg-primary text-white rounded-full hover:bg-primary/80">
                        <Icon icon="mdi:send" class="w-5 h-5" />
                    </button>
                </div>
            </div>

            <!-- Profile Section -->
            <div class="w-full lg:w-1/3 bg-gray-50 flex flex-col h-full p-4 border-l">
                <div v-if="message.length > 0" class="flex flex-col items-center">
                    <img :src="message[0].sender.avatar.original_url" alt="User" class="w-24 h-24 rounded-full mb-4" />
                    <div class="text-lg font-semibold">{{ message[0].sender.first_name }} {{ message[0].sender.last_name
                        }}</div>
                    <div class="mt-4 border-b-2 w-full pb-3">
                        <div class="flex justify-center flex-col items-center">
                            <Icon icon="iconamoon:profile-circle-fill" @click="viewProfile(message[0].sender.id)"
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
