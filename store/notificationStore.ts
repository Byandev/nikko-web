import { defineStore } from 'pinia';
import type { Notification } from "~/types/models/Notification";

export const notificationStore = defineStore('notification', () => {
    const notifications = ref<Notification[]>([]); 

    return { notifications };
});
