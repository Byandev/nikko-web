<template>
  <div class="max-w-7xl mx-auto">
    <h2 class="font-bold text-2xl  py-8">Notifications</h2>


    <div v-if="notifications?.data?.length">
      <Notification :notification="notification" v-for="notification in notifications?.data" :key="notification.id"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {ApiErrorResponse} from "~/types/api/response/error";
import type {PaginatedList} from "~/types/models/Pagination";
import Notification from "~/components/notification/Notification.vue";


const { data: notifications, fetchData: fetchNotifications, pending: isLoading } = useFetchData<PaginatedList<Notification>, ApiErrorResponse>();



fetchNotifications(`/v1/notifications`).then(() => console.log(notifications.value))
</script>
