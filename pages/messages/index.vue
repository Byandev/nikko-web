<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Channel } from '~/types/models/Channel';
import { accountStore } from '~/store/accountStore';
import { Icon } from '@iconify/vue';

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
    if (chats.value) {
        return chats.value.sort((a, b) => {
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
    }
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
            <ChatList v-if="sortedChats" :chats="sortedChats" :isChannelLoading="isLoading" @select-chat="selectChat" />
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
                <ChatList v-if="sortedChats" :chats="sortedChats" :isChannelLoading="isLoading" @select-chat="selectChat" />
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
