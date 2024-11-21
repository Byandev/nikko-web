<script lang="ts" setup>

definePageMeta({
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/',
    },
});
</script>

<template>
    <ClientOnly>
        <div class="h-full">
            <LoginForm />
        </div>
    </ClientOnly>
</template>
