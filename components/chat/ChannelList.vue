<script setup lang="ts">
import type { Channel } from '~/types/models/Channel';
import { accountStore } from '~/store/accountStore';

const { account } = storeToRefs(accountStore());

const props = defineProps({
    channels: {
        type: Array as PropType<Channel[]>,
        required: true,
    },
    isChannelLoading: Boolean,
    activeChannelId: {
        type: String,
        required: false,
    }
});

const emit = defineEmits<{
    (e: 'select-chat', id: number): void;
}>();


</script>

<template>
    <div class="flex-grow overflow-y-auto">
        <div v-if="channels.length === 0 && !isChannelLoading" class="text-center text-gray-500">
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

        <div v-if="channels && !isChannelLoading" v-for="channel in channels" :key="channel.id"
            @click="emit('select-chat',channel.id)"
            :class="['flex items-center p-4 border-b cursor-pointer', channel?.id == Number(props.activeChannelId) ? 'bg-gray-200' : 'bg-white']">
            <img :src="channel?.members.find(member => account?.id != member.id)?.avatar?.original_url"
                alt="User" class="w-12 h-12 rounded-full mr-4" />
            <div class="flex-1">
                <div class="text-lg font-semibold">
                    {{ channel?.members.find(member => account?.id != member.id)?.first_name }}
                    {{ channel?.members.find(member => account?.id != member.id)?.last_name }}
                </div>
            </div>
            <div class="text-xs text-gray-500">{{ timeAgo(channel.created_at) }}</div>
        </div>
    </div>
</template>