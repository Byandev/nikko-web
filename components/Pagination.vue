<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { PaginationMeta } from '~/types/models/Pagination';

const props = defineProps<{
    pagination: PaginationMeta;
}>();

const _emit = defineEmits(['prevPage', 'nextPage']);
</script>

<template>
    <div class="flex justify-between items-center mt-4">
        <button
            :disabled="props.pagination.current_page === 1"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            @click="_emit('prevPage')">
            Previous
        </button>
        <span class="text-gray-700 font-semibold">Page {{ props.pagination.current_page }} of {{ props.pagination.last_page }}</span>
        <button
            :disabled="props.pagination.current_page === props.pagination.last_page"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            @click="_emit('nextPage')">
            Next
        </button>
    </div>
</template>

<style scoped>
@tailwind utilities;
</style>