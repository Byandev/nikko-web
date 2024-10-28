<script setup lang="ts">
const emits = defineEmits<{ (e: 'submit'): void; (e: 'back'): void; }>();

const submitForm = () => {
    emits('submit');
};

const back = () => {
    emits('back');
};
</script>

<template>
    Step 2
    <button @click="back">Back</button>
    <button @click="submitForm">Next</button>
</template>
