</template>
<template>
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50">
        <div class="fixed inset-0 bg-black opacity-50" @click="closeModal"></div>
        <div class="bg-white p-6 rounded-lg shadow-lg z-50">
            <h3 class="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p class="mb-6">Are you sure you want to delete this item?</p>
            <div class="flex justify-end space-x-4">
                <button @click="confirmDeletion" class="bg-red-500 text-white px-4 py-2 rounded">Yes, Delete</button>
                <button @click="closeModal" class="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    showModal: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['close', 'confirm']);

const closeModal = () => {
    emit('close');
};

const confirmDeletion = () => {
    emit('confirm');
};
</script>