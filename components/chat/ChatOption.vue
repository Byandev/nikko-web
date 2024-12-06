<script setup lang="ts">
import type { Channel } from '~/types/models/Channel';
import { accountStore } from '~/store/accountStore';
import { Icon } from '@iconify/vue';

const { account } = storeToRefs(accountStore());

const props = defineProps({
    avatar: String,
    name: String,
    activeChannel: {
        type: Object as PropType<Channel>,
        required: true,
    },
    isChannelLoading: Boolean,
    isMobile: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits<{
    (e: 'update:current-page', page: string): void;
    (e: 'view-profile', id: number): void;
}>();

</script>

<template>
    <div class="w-full lg:w-1/3 bg-gray-50 flex flex-col h-full p-4">
            <div v-if="props.isMobile">
                <button @click="{
                    emit('update:current-page', 'chat-channel');	
                }" class="mr-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                    <Icon icon="mdi:arrow-left" class="w-5 h-5" />
                </button>
            </div>
            <div v-if="activeChannel && !isChannelLoading" class="flex flex-col items-center">
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
                            @click="emit('view-profile',activeChannel?.members.find(member => account?.id != member.id)?.id ?? 0)"
                            class="w-12 h-12 text-gray-500  hover:cursor-pointer hover:bg-gray-200 rounded-full p-1" />
                        <span class="text-sm text-gray-500">Profile</span>
                    </div>
                </div>
            </div>
            <div v-else class="flex items-center justify-center flex-grow">
                <Icon icon="line-md:loading-loop" width="24" height="24" />
            </div>
        </div>
</template>