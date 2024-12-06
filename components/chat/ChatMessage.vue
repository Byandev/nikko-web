<script setup lang="ts">
import type { Message } from '~/types/models/Message';
import { accountStore } from '~/store/accountStore';

const { account } = storeToRefs(accountStore());

const props = defineProps({
    messages: {
        type: Array as PropType<Message[]>,
        required: true,
    },
    isMessagesLoading: Boolean,
});

</script>

<template>
    <div v-for="(message, index) in props.messages" :key="index">
                <div v-if="message.sender.id != account?.id" class="flex justify-start">
                    <div class="flex flex-col gap-2">
                        <div class="flex flex-row">
                            <div class="flex items-center" v-if="message.content">
                                <img :src="message.sender.avatar?.thumb_url" alt="avatar"
                                    class="w-8 h-8 rounded-full mr-2 border" />
                            </div>
                            <div class="bg-white p-3 rounded-lg shadow" v-if="message.content">
                                <p>{{ message.content }}</p>
                                <span class="text-xs text-gray-500">{{ formatDayTime(message.created_at) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="flex justify-end">
                    <div class="flex flex-col gap-2">
                        <div class="flex flex-row">
                            <div class="bg-primary text-white p-3 rounded-lg shadow" v-if="message.content">
                                <p>{{ message.content }}</p>
                                <span class="text-xs text-gray-100">{{ formatDayTime(message.created_at) }}</span>
                            </div>
                            <div class="flex items-center" v-if="message.content">
                                <img :src="message.sender.avatar?.thumb_url" alt="avatar"
                                    class="w-8 h-8 rounded-full ml-2 border" />
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="message.sender.id != account?.id" class="flex justify-start">
                    <div class="text-left">
                        <div v-if="message.attachments.length > 0" class="flex items-start">
                            <!-- Avatar -->
                            <div class="flex items-center mr-2">
                                <img :src="message.sender.avatar?.thumb_url" alt="avatar"
                                    class="min-w-8 h-8 rounded-full border" />
                            </div>

                            <!-- Images -->
                            <div class="flex flex-col items-start">
                                <img v-for="attachment in message.attachments" :src="attachment.original_url"
                                    alt="attachment" class="h-auto rounded-lg bg-white p-3 shadow w-2/5" />
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="flex justify-end">
                    <div class="text-right">
                        <div v-if="message.attachments.length > 0" class="flex items-end">
                            <!-- Images -->
                            <div class="flex flex-col items-end">
                                <img v-for="attachment in message.attachments" :src="attachment.original_url"
                                    alt="attachment" class="h-auto rounded-lg bg-white p-3 shadow w-2/5" />
                            </div>

                            <!-- Avatar -->
                            <div class="flex items-center ml-2">
                                <img :src="message.sender.avatar?.thumb_url" alt="avatar"
                                    class="min-w-8 h-8 rounded-full border" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
</template>