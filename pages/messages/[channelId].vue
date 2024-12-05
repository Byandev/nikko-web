<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Channel } from '~/types/models/Channel';
import { accountStore } from '~/store/accountStore';
import type { Message } from '~/types/models/Message';
import { Icon } from '@iconify/vue';
import type { PaginatedList } from '~/types/models/Pagination';
import type ChatChannel from '~/components/chat/ChatChannel.vue';
import type { Media } from '~/types/models/Media';

const { account } = storeToRefs(accountStore());

const { data: channels, fetchData: fetchChannels, pending: isChannelLoading } = useFetchData<{ data: Channel[] }, ApiErrorResponse>();
const { data: messages, fetchData: fetchMessages, pending: isMessagesLoading } = useFetchData<PaginatedList<Message>, ApiErrorResponse>();
const { sendRequest: sendMesage, pending: isSending } = useSubmit<{ data: Message }, ApiErrorResponse>();
const { sendRequest: sendAttachment, pending: isSendingAttachment } = useSubmit<{ data: Media }, ApiErrorResponse>();

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);

const chats = ref<Channel[]>([]);
const message = ref<Message[]>([]);
const attachmentFiles = ref<File[] | string[]>([]);

const router = useRouter();
const route = useRoute();
const newMessage = ref<string>('');
const page = ref(1);

const currentTab = ref('chat-channel');
const showDropdown = ref(false);
const searchQuery = ref('');

const chatChannel = ref<InstanceType<typeof ChatChannel> | null>(null);

const channelsQueryString = computed(() => {
    let params: Record<string, string> = {
        'filter[search]': searchQuery.value,
    }

    return new URLSearchParams(params).toString();
})

const messageQueryString = computed(() => {
    let params: Record<string, string> = {
        page: page.value.toString(),
        'per_page': '20'
    }

    return new URLSearchParams(params).toString();
})

watch(
    [() => channelsQueryString.value],
    debounce(async () => {
        await fetchChannels(`/v1/chat/channels?${channelsQueryString.value}`, {
            headers: requestHeaders.value
        });
        if (channels.value && channels.value.data) {
            chats.value = channels.value.data
            chatChannel.value?.scrollToBottom();
        }
    }, 500)
);

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


onMounted(async () => {
    await fetchChannels(`/v1/chat/channels?${channelsQueryString.value}`, {
        headers: requestHeaders.value
    });
    if (channels.value && channels.value.data) {
        chats.value = channels.value.data
    }

    await fetchMessages(`/v1/chat/channels/${route.params.channelId}/messages?${messageQueryString.value}`, {
        headers: requestHeaders.value
    });

    if (messages.value && messages.value.data) {
        message.value = messages.value.data
        chatChannel.value?.scrollToBottom();
    }
});

const handleMessageSubmit = async () => {
    const uploadedImages = ref<number[]>([]);
    if (newMessage.value.trim() || attachmentFiles.value.length > 0) {
        if(attachmentFiles){
            const uploadPromises = attachmentFiles.value
                .filter(file => file instanceof File)
                .map(file => {
                    const formData = new FormData();
                    formData.append('file', file);
                    return sendAttachment('/v1/medias', {
                        method: 'POST',
                        body: formData,
                    });
            });
        
            const uploadResponses = await Promise.all(uploadPromises);
            uploadedImages.value = uploadResponses.map(response => response.data.id);
        }

        await sendMesage(`/v1/chat/channels/${route.params.channelId}/messages`, {
            method: 'POST',
            headers: requestHeaders.value,
            body: {
                ...(newMessage.value.trim() && { content: newMessage.value } ),
                ...(uploadedImages.value.length > 0 && { attachment_ids: uploadedImages.value }),
            }
        });
        newMessage.value = '';
        attachmentFiles.value = [];
        await fetchMessages(`/v1/chat/channels/${route.params.channelId}/messages`, {
            headers: requestHeaders.value
        });

        if (messages.value && messages.value.data) {
            message.value = messages.value.data
        }
        chatChannel.value?.scrollToBottom();
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
    if(chats.value) {
        return chats.value.find(chat => chat.id === Number(route.params.channelId));
    }
});

const activeParticipant = computed(() => {
    return activeChannel.value?.members.find(member => account.value?.id !== member.id);
});

const avatar = computed(() => activeParticipant.value?.avatar?.original_url);
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

const showLoadMore = computed(() => {
    if (messages.value && messages.value.meta) {
        return messages.value.meta.current_page < messages.value.meta.last_page;
    }
});

</script>


<template>
    <!-- Mobile View -->
    <div class="h-full block lg:hidden ">

        <!-- Chat Channel -->
        <ChatChannel v-if="currentTab == 'chat-channel' && activeChannel" @update:attachments="attachmentFiles = $event" :attachmentFiles="attachmentFiles as File[]" :page="messages?.meta.current_page" :showLoadMore="showLoadMore" @page="page = $event" :isMobile="true" :avatar="avatar" :name="name" :activeChannel="activeChannel" :chats="sortedChats" :isChannelLoading="isChannelLoading" @current_page="currentTab = $event" :channels="chats" :messages="sortedMessages" @submit-message="handleMessageSubmit" :modelValue="newMessage" @update:modelValue="newMessage = $event" @update:showDropdown="showDropdown = $event" :showDropdown="showDropdown" @current-page="currentTab = $event" />

        <!-- Chat Option -->
        <ChatOption v-if="currentTab == 'chat-option' && activeChannel" :isMobile="true" :activeChannel="activeChannel" :isChannelLoading="isChannelLoading" @update:current-page="currentTab = $event" @update:showDropdown="showDropdown = $event" @view-profile="viewProfile" :avatar="avatar" :name="name" />
        
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
                <ChatList v-if="activeChannel" :route="route.params.channelId as string" :chats="sortedChats" :activeChannel="activeChannel" :isChannelLoading="isChannelLoading" @select-chat="selectChat" />
            </div>


            <!-- Chat Channel -->
            <ChatChannel ref="chatChannel" v-if="activeChannel" @update:attachments="attachmentFiles = $event" :attachmentFiles="attachmentFiles as File[]" :isSending="isSending || isSendingAttachment" :page="messages?.meta.current_page" @page="page = $event" :showLoadMore="showLoadMore" :avatar="avatar" :name="name" :activeChannel="activeChannel" :chats="chats" :isChannelLoading="isChannelLoading" @current_page="currentTab = $event" :channels="chats" :messages="sortedMessages" @submit-message="handleMessageSubmit" :modelValue="newMessage" @update:modelValue="newMessage = $event" @update:showDropdown="showDropdown = $event" :showDropdown="showDropdown" @current-page="currentTab = $event" />


            <!-- Profile Section -->
            <ChatOption v-if="activeChannel" :activeChannel="activeChannel" :isChannelLoading="isChannelLoading" @update:current-page="currentTab = $event" @update:showDropdown="showDropdown = $event" @view-profile="viewProfile" :avatar="avatar" :name="name" />
        </div>
    </div>

</template>
