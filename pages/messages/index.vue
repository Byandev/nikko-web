<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Channel } from '~/types/models/Channel';
import { accountStore } from '~/store/accountStore';
import { Icon } from '@iconify/vue';
import { formatDayTime } from '~/utils/formatter';

const { account } = storeToRefs(accountStore());

const { data: channels, fetchData: fetchChannels, pending: isLoading } = useFetchData<{ data: Channel[] }, ApiErrorResponse>();

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);

const chats = ref<Channel[]>([]);
const router = useRouter();

const selectChat = async (id: number) => {
    await router.push(`/messages/${id}`);
}

const sortedChats = computed(() => {
    return chats.value.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
});

onMounted(async () => {
    await fetchChannels(`/v1/chat/channels`, {
        headers: requestHeaders.value
    });
    if (channels.value && channels.value.data) {
        chats.value = channels.value.data
    }
});

</script>


<template>
    <!-- Mobile View -->
    <div class="h-full block lg:hidden ">
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
                        <div class="w-12 h-12 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
                        <div class="flex-1">
                            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                            <div class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                        <div class="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                    </div>
                </div>
                <div v-if="chats && !isLoading" v-for="chat in chats" :key="chat.id" @click="selectChat(chat.id)"
                    :class="['flex items-center p-4 border-b cursor-pointer bg-white']">
                    <img :src="chat.members.find(member => member.id != account?.id)?.avatar.original_url" alt="User"
                        class="w-12 h-12 rounded-full mr-4" />
                    <div class="flex-1">
                        <div class="text-lg font-semibold">{{ chat.members.find(member => member.id !=
                            account?.id)?.first_name }} {{
                                chat.members.find(member => member.id != account?.id)?.last_name }}</div>
                    </div>
                    <div class="text-xs text-gray-500">{{ timeAgo(chat.created_at) }}</div>
                </div>
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
                    <Icon icon="material-symbols:search" class=" text-xl text-gray-400" />
                    <input type="text" placeholder="Search chat" class="w-full outline-none border-none" />
                </div>

                <!-- Chat List -->
                <div class="overflow-y-auto flex-grow">
                    <div v-if="isLoading" class="animate-pulse space-y-2" v-for="n in 2" :key="n">
                        <div class="flex items-center p-4 border-b">
                            <div class="w-12 h-12 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
                            <div class="flex-1">
                                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                                <div class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                            </div>
                            <div class="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                        </div>
                    </div>
                    <div v-if="chats && !isLoading" v-for="chat in sortedChats" :key="chat.id" @click="selectChat(chat.id)"
                        :class="['flex items-center p-4 border-b cursor-pointer bg-white']">
                        <img :src="chat.members.find(member => member.id != account?.id)?.avatar.original_url"
                            alt="User" class="w-12 h-12 rounded-full mr-4" />
                        <div class="flex-1">
                            <div class="text-lg font-semibold">{{ chat.members.find(member => member.id !=
                                account?.id)?.first_name }} {{
                                    chat.members.find(member => member.id != account?.id)?.last_name }}</div>
                        </div>
                        <div class="text-xs text-gray-500">{{ timeAgo(chat.created_at) }}</div>
                    </div>
                </div>
            </div>

             <!-- Chat Section -->
             <div class="w-full lg:w-2/3 bg-white flex flex-col items-center justify-center h-full border-l-2 border-r-2">
                <span>Select a message</span>
            </div>

            <!-- Profile Section -->
            <div class="w-full lg:w-1/3 bg-gray-50 flex flex-col h-full p-4">
                
            </div>
        </div>
    </div>
</template>
