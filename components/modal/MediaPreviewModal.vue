
<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white p-4 rounded-lg overflow-auto">
            <img :src="imageUrl ?? ''" class="max-h-[80vh]" />
            <button @click="close" class="mt-2 text-red-500 hover:text-red-700">
                Close
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    show: boolean;
    imageUrl: string | null;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const close = () => {
    emit('close');
};
</script>