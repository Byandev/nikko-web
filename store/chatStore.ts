import { defineStore } from 'pinia';
import type {Channel} from "~/types/models/Channel";
import type {Message} from "~/types/models/Message";
import {initialPaginatedList, type PaginatedList} from "~/types/models/Pagination";
import type {ApiErrorResponse} from "~/types/api/response/error";
import type {ResponseData} from "~/types/api/types";
import {sortBy} from "lodash";

export const chatStore = defineStore('chat', () => {
    const { $api } = useNuxtApp();

    const channel = ref<{loading: boolean, data: Channel | null}>({loading: true, data: null})
    const channels = ref<{loading: boolean, data: PaginatedList<Channel>}>({loading: true, data: initialPaginatedList});
    const messages = ref<{loading: boolean, data: PaginatedList<Message>}>({loading: true, data: initialPaginatedList});

    const sortedMessages = computed(() => sortBy(
        messages.value.data.data.filter(
            data => data.channel_id === channel.value?.data?.id),
        (message: Message) => new Date(message.created_at)
        )
    );

    const getChannels = async (): Promise<PaginatedList<Channel>> => {
        channels.value = {loading: true, data: initialPaginatedList}

        const response = await $api<PaginatedList<Channel>>('/v1/chat/channels')

        channels.value = {loading: false, data: response}

        return response
    }

    const getChannel = async (channelId: number) => {
        channel.value = {loading: true, data: null}

        const response = await $api<ResponseData<Channel>>(`/v1/chat/channels/${channelId}`)

        channel.value = {loading: false, data: response.data}

        return response
    }

    const getMessages = async (channelId: number) => {
        const response = await $api<PaginatedList<Message>>(`/v1/chat/channels/${channelId}/messages`)

        messages.value = {loading: false, data: response}

        return response
    }

    const appendMessage = (message: Message) => {
        console.log(message)
        if (!messages.value.data.data.some(m => m.id === message.id)) {
            messages.value = {
                loading: false,
                data: {
                    ...messages.value.data,
                    data:  [...messages.value.data.data, message]
                }
            }
        }
    }

    return { channels, messages, getChannels, getChannel, getMessages, channel, sortedMessages, appendMessage };
});
