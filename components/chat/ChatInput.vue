<script setup lang="ts">
import { Icon } from "@iconify/vue";

const props = defineProps({
    message: Array,
    modelValue : {
        type: String,
        default: '',
        required: true,
    },
    isMessagesLoading: Boolean,
    isSending: Boolean,
});


const emit = defineEmits<{
    (e: 'submit-message'): void;
    (e: 'update:modelValue', value: string): void;
}>();

const updateValue = (newValue: string) => {
  emit('update:modelValue', newValue);
};

</script>

<template>
    <div v-if="props.message && !props.isMessagesLoading" class="p-2 bg-gray-100 border-t flex items-center">
        <input type="text" :value="modelValue" placeholder="Aa"
            @input="updateValue(($event.target as HTMLInputElement).value)"
            class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-0 " />
        <button @click="emit('submit-message')" class="ml-4 p-2 bg-primary text-white rounded-full hover:bg-primary/80">
            <Icon :icon="!isSending ? 'mdi:send' : 'line-md:loading-loop'" class="w-5 h-5" />
        </button>
    </div>
</template>