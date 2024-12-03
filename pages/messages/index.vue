<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Channel } from '~/types/models/Channel';
import { accountStore } from '~/store/accountStore';

const { account } = storeToRefs(accountStore());

const { data: channels, fetchData: fetchChannels, pending: isLoading } = useFetchData<{ data: Channel[] }, ApiErrorResponse>();

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);

const chats = ref<Channel[]>([]);
const router = useRouter();

onMounted(async() => {
    await fetchChannels(`/v1/chat/channels`,{
        headers: requestHeaders.value
    });
    if(channels.value && channels.value.data){
        chats.value = channels.value.data
    }
});

const selectChat = async (id: number) => {
    await router.push(`/messages/${id}`);
}

</script>


<template>
    <div class="block lg:hidden w-full lg:w-1/3 flex-col h-full">
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
                :class="['flex items-center p-4 border-b cursor-pointer bg-white']">
                <img :src="chat.members[1].avatar.original_url" alt="User" class="w-12 h-12 rounded-full mr-4" />
                <div class="flex-1">
                    <div class="text-lg font-semibold">{{ chat.members[1].first_name }} {{
                        chat.members[1].last_name }}</div>
                    <!-- <div class="text-sm text-gray-600 truncate">{{ chat. }}</div> -->
                </div>
                <div class="text-xs text-gray-500">{{ timeAgo(chat.created_at) }}</div>
            </div>
        </div>
    </div>

    <div class="hidden lg:block my-8 lg:mx-auto mx-5 max-w-7xl ring-1 ring-gray-300 rounded-md h-full">
        <div class="flex flex-col lg:flex-row h-full">
            <!-- Sidebar -->
            <div class="w-full lg:w-1/3 flex flex-col gap-4 h-full">
                <!-- Search Bar -->
                <div class="p-4 bg-gray-50 border-b">
                    <input type="text" placeholder="Search or start new chat"
                        class="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-400" />
                </div>

                <!-- Chat List -->
                <div class="overflow-y-auto flex-grow">
                    <div v-for="chat in chats" :key="chat.id" @click="selectChat(chat.id)"
                        :class="['flex items-center p-4 border-b cursor-pointer bg-white']">
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
            <div class="w-full lg:w-2/3 bg-gray-50 flex flex-col h-full border-l-2 border-r-2">
                <div class="flex items-center justify-center flex-grow">
                    <p class="text-gray-500">Select a chat to start messaging</p>
                </div>
            </div>

            <!-- Profile Section -->
            <div class="w-full lg:w-1/3 bg-gray-50 flex flex-col h-full p-4 border-l">
                <div class="flex items-center justify-center flex-grow">
                    <p class="text-gray-500">Select a chat to view profile</p>
                </div>
            </div>
        </div>
    </div>
</template>