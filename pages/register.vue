<script lang="ts" setup>
definePageMeta({
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/',
    },
});
</script>

<template>
    <div class="h-full">
        <RegisterForm />
    </div>
</template>
