<script setup lang="ts">
import type { PaginationMeta } from '~/types/models/Pagination';

const props = defineProps<{
    pagination: PaginationMeta;
}>();

const _emit = defineEmits(['prevPage', 'nextPage']);

</script>

<template>
    <div class="flex justify-between items-center mt-4">
        <span class="text-black px-4 py-2 rounded-md">Showing {{ props.pagination.from }}
            to {{ props.pagination.to }} of {{ props.pagination.total }} results</span>

        <div class="flex flex-row gap-2">
            <button :disabled="props.pagination.current_page === 1"
                class="ring-1 ring-gray-300 px-4 py-2 bg-white text-gray-700 rounded hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                @click="_emit('prevPage')">
                Previous
            </button>
            <button :disabled="props.pagination.current_page === props.pagination.last_page"
                class="ring-1 ring-gray-300 px-4 py-2 bg-white text-gray-700 rounded hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                @click="_emit('nextPage')">
                Next
            </button>
        </div>
    </div>
</template>

<style scoped>
@tailwind utilities;
</style>