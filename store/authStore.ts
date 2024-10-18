import { defineStore } from 'pinia';
import type { User } from '~/types/models/User';

export const authStore = defineStore('auth', () => {
    const { data, getSession } = useAuth();

    const user = ref<User>(data.value?.data || null);
    const hasAuthenticatedUser = computed(() => Boolean(user.value));

    watch(
        () => data.value,
        () => {
            if (data.value?.data) {
                user.value = data.value?.data;
                console.log('User:', user.value);
            }
        },
        { immediate: true }
    );

    const updateUser = async () => {
        try {
            await getSession();
            if (data.value?.data) {
                user.value = data.value.data;
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    return { user, hasAuthenticatedUser, updateUser };
});