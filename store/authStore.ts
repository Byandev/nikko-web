import {defineStore} from 'pinia';
import type {User} from '~/types/models/User';

export const authStore = defineStore('auth', () => {
    const {data} = useAuth();

    const user = ref<User>(data.value?.data || null);
    const hasAuthenticatedUser = computed(() => Boolean(user.value));

    watch(
        () => data.value,
        () => {
            if (data.value?.data) {
                user.value = data.value?.data;
            }
        },
        {immediate: true}
    );

    return {user, hasAuthenticatedUser};
});
