import { defineStore } from 'pinia';
import type {Account} from "~/types/models/Account";

export const accountStore = defineStore('account', () => {
    const account = ref<Account | null>();

    return { account };
});
