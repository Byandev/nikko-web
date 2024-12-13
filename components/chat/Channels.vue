<template>
  <div class="divide-y" v-if="channels.loading">
    <LoadingChannelMenu v-for="i in 4" :key="`loading-channel-${i}`"/>
  </div>

  <div class="divide-y" v-else>
    <ChannelMenu
        v-for="channel in channels.data.data"
        :key="`channel-${channel.id}`"
        :channel="channel"
        @click="() => onChannelClicked(channel)"
        :is-active="channel.id.toString() === route.params.channelId"
    />
  </div>
</template>

<script lang="ts" setup>
import {chatStore} from "~/store/chatStore";
import type {Channel} from "~/types/models/Channel";

import ChannelMenu from "~/components/chat/ChannelMenu.vue";
import LoadingChannelMenu from "~/components/chat/LoadingChannelMenu.vue";
const router = useRouter();
const route = useRoute();

const { channels } = storeToRefs(chatStore());

const onChannelClicked = (channel: Channel) => {
  router.push(`/chat/${channel.id}`)
}
</script>
