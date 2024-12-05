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
    attachmentFiles: {
        type: Array as PropType<File[]>,
        required: false, 
    }
});


const emit = defineEmits<{
    (e: 'submit-message'): void;
    (e: 'update:modelValue', value: string): void;
    (e: 'update:attachments', file: File[]): void;
}>();

const updateValue = (newValue: string) => {
  emit('update:modelValue', newValue);
};
const handleAttachment = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        const newFiles = [...(props.attachmentFiles || []), ...Array.from(target.files)];
        emit('update:attachments', newFiles);
    }
};

const removeAttachment = (index: number) => {
    const newFiles = [...(props.attachmentFiles || [])];
    newFiles.splice(index, 1);
    emit('update:attachments', newFiles);
};

const imageURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const attachmentUrls = ref<string[]>([]);
const attachmentNames = ref<string[]>([]);

watch(() => props.attachmentFiles, async (newFiles) => {
    if (newFiles) {
        attachmentUrls.value = await Promise.all(newFiles.map(file => imageURL(file)));
        attachmentNames.value = newFiles.map(file => file.name);
    }
}, { immediate: true });

</script>

<template>
    <div v-if="props.attachmentFiles && props.attachmentFiles.length" class="mr-2 p-2 bg-gray-200 text-gray-600 rounded-t-lg flex items-center">
        <div v-for="(file, index) in props.attachmentFiles" :key="index" class="flex items-center mr-2">
            <img :src="attachmentUrls[index]" :alt="attachmentNames[index]" class="w-20 h-20 object-cover rounded-lg max-w-[75%]" />
            <button @click="removeAttachment(index)" class="ml-2 text-red-500 hover:text-red-700">
                <Icon icon="mdi:close" class="w-4 h-4" />
            </button>
        </div>
    </div>
    <div v-if="props.message && !props.isMessagesLoading" class="p-2 bg-gray-100 border-t flex items-center">        
        <label class="mr-2 p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 cursor-pointer">
            <Icon icon="mdi:paperclip" class="w-5 h-5" />
            <input type="file" multiple @change="handleAttachment" class="hidden" />
        </label>
        <input type="text" :value="modelValue" placeholder="Aa"
            @input="updateValue(($event.target as HTMLInputElement).value)"
            class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-0 " />
        <button @click="emit('submit-message')" class="ml-4 p-2 bg-primary text-white rounded-full hover:bg-primary/80">
            <Icon :icon="!isSending ? 'mdi:send' : 'line-md:loading-loop'" class="w-5 h-5" />
        </button>
    </div>
</template>