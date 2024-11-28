<template>
    <Modal :modelValue="props.showModal" @close="closeModal">
        <template #title>
            <h2>Delete Confirmation</h2>
        </template>
        <template #content>
            <p>Are you sure you want to delete this offer?</p>
        </template>
        <template #actions>
            <Button text="Cancel" type="button" background="white" foreground="gray"
                @click="closeModal" />
            <Button text="Delete" type="button" background="primary" foreground="white"
                @click="confirmDeletion" />
        </template>
    </Modal>
</template>

<script setup lang="ts">

const props = defineProps({
    showModal: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['close', 'confirm']);

const closeModal = () => {
    console.log('close');
    emit('close');
};

const confirmDeletion = () => {
    emit('confirm');
};
</script>