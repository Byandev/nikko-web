import { defineStore } from 'pinia';
import type { User } from '~/types/models/User';
import {accountStore} from "~/store/accountStore";

export const authStore = defineStore('auth', () => {
    const { data, getSession } = useAuth();
    const { account } = storeToRefs(accountStore())

    const user = ref<User>((data.value as { data?: User })?.data as User || null);
    const hasAuthenticatedUser = computed(() => Boolean(user.value));

    watch(
        () => data.value,
        () => {
            if ((data.value as { data?: User })?.data) {
                user.value = (data.value as { data?: User })?.data as User;

                if (!account.value) {
                    account.value = user.value.accounts[0]
                }
            }
        },
        { immediate: true }
    );

    const updateUser = async () => {
        try {
            await getSession();

            if ((data.value as { data?: User })?.data) {
                user.value = (data.value as { data?: User }).data as User;

                if (!account.value) {
                    account.value = user.value.accounts[0]
                }
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    return { user, hasAuthenticatedUser, updateUser };
});
