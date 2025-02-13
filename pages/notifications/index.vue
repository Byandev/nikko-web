<template>
  <div class="max-w-7xl mx-auto">
    <h2 class="font-bold text-2xl py-8">Notifications</h2>

    <div v-if="notifications?.data?.length">
      <Notification
        :notification="notification"
        v-for="notification in notifications?.data"
        :key="notification.id"
      />
    </div>
    <div v-else>
      <p>No notifications available.</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ApiErrorResponse } from "~/types/api/response/error";
import type { PaginatedList } from "~/types/models/Pagination";
import type { Notification as NotificationType } from "~/types/models/Notification";
import Notification from "~/components/notification/Notification.vue";
import { notificationStore } from "~/store/notificationStore";
import { storeToRefs } from "pinia";
import { useFetchData } from "~/composables/useFetchData";

const { notifications } = storeToRefs(notificationStore());

const { data: fetchedNotifications, fetchData: fetchNotifications } = useFetchData<
  PaginatedList<NotificationType>,
  ApiErrorResponse
>();

fetchNotifications(`/v1/notifications`).then(() => {
  notifications.value = fetchedNotifications?.value?.data ?? [];
});

</script>
