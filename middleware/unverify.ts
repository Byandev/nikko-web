import { authStore } from '~/store/authStore';

export default defineNuxtRouteMiddleware(async (to, from) => {
    const { hasAuthenticatedUser, user } = authStore();

    if (hasAuthenticatedUser && user.email_verified_at) {
        return navigateTo('/find-work');
    }
});
