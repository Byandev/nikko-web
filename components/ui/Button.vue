<script setup lang="ts">
import LoadingIcon from '~/assets/icons/loading.svg';

const props = withDefaults(defineProps<{
    text: string;
    background: string;
    foreground: string;
    type: 'button' | 'submit' | 'reset';
    isLoading?: boolean;
    isWide?: boolean;
}>(), {
    type: 'button',
    isWide: false,
});
</script>

<template>
    <button :type="props.type" :class="[
        `flex justify-center items-center gap-3 rounded-lg bg-${props.background} px-5 py-2 text-sm font-base text-${props.foreground}`,
        `hover:opacity-75`,
        `${props.isWide ? 'w-full' : ''}`,
        props.isLoading ? 'opacity-50 cursor-not-allowed' : ''
    ]" :disabled="props.isLoading">
        <LoadingIcon v-if="props.isLoading" class="animate-spin h-5 w-5 text-white" />
        <span>{{ props.text }}</span>
    </button>
</template>