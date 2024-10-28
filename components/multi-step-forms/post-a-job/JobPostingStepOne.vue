<script setup lang="ts">
const emits = defineEmits<{ (e: 'submit'): void; }>();

const submitForm = () => {
    emits('submit');
};
</script>

<template>
    Step 1
    <button @click="submitForm">Next</button>
</template>
