<script setup lang="ts">
import {Icon} from "@iconify/vue";
import type {ApiErrorResponse} from "~/types/api/response/error";
import type {Media} from "~/types/models/Media";
import type {Message} from "~/types/models/Message";
import { ref } from 'vue';
import MediaPreviewModal from '../modal/MediaPreviewModal.vue';

const props = defineProps<{
    channelId: String;
}>();

const emit = defineEmits<{
    (e: 'sent', data: Message): void
}>();

const { sendRequest: sendMessage, pending: isSending } = useSubmit<{ data: Message }, ApiErrorResponse>();
const { sendRequest: sendAttachment } = useSubmit<{ data: Media }, ApiErrorResponse>();

const attachmentFiles = ref<File[]>([]);
const newMessage = ref<string>('');
const attachmentUrls = ref<string[]>([]);
const attachmentNames = ref<string[]>([]);

const showModal = ref(false);
const selectedImage = ref<string | null>(null);

const handleImageClick = (imageUrl: string) => {
    selectedImage.value = imageUrl;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    selectedImage.value = null;
};

const handleAttachment = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        attachmentFiles.value = [...attachmentFiles.value, ...Array.from(target.files)];
        target.value = '';
    }
};

const removeAttachment = (index: number) => {
    const newFiles = [...(attachmentFiles.value || [])];
    newFiles.splice(index, 1);
    attachmentFiles.value = newFiles;
};

const imageURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const handleMessageSubmit = async () => {
    const uploadedImages = ref<number[]>([]);
    if (newMessage.value.trim() || attachmentFiles.value.length > 0) {
        if(attachmentFiles){
            const uploadPromises = attachmentFiles.value
                .filter(file => file instanceof File)
                .map(file => {
                    const formData = new FormData();
                    formData.append('file', file);
                    return sendAttachment('/v1/medias', {
                        method: 'POST',
                        body: formData,
                    });
            });

            const uploadResponses = await Promise.all(uploadPromises);
            uploadedImages.value = uploadResponses.map(response => response.data.id);
        }

        const response = await sendMessage(`/v1/chat/channels/${props.channelId}/messages`, {
            method: 'POST',
            body: {
                ...(newMessage.value.trim() && { content: newMessage.value } ),
                ...(uploadedImages.value.length > 0 && { attachment_ids: uploadedImages.value }),
            }
        });

        newMessage.value = '';
        attachmentFiles.value = [];

        emit('sent', response.data);
    }
};

watch(() => attachmentFiles.value, async (newFiles) => {
    if (newFiles) {
        attachmentUrls.value = await Promise.all(newFiles.map(file => imageURL(file)));
        attachmentNames.value = newFiles.map(file => file.name);
    }
}, { immediate: true });


defineExpose({
    attachmentFiles,
})

</script>

<template>
    <div v-if="attachmentFiles && attachmentFiles.length" class="mr-2 p-2 bg-gray-200 text-gray-600 rounded-t-lg flex items-center">
        <div v-for="(file, index) in attachmentFiles" :key="index" class="flex items-center mr-2">
            <img :src="attachmentUrls[index]" :alt="attachmentNames[index]" class="w-20 h-20 object-cover rounded-lg max-w-[75%]" @click="handleImageClick(attachmentUrls[index])" />
            <button @click="removeAttachment(index)" class="ml-2 text-red-500 hover:text-red-700">
                <Icon icon="mdi:close" class="w-4 h-4" />
            </button>
        </div>
    </div>
    <div class="p-2 bg-gray-100 border-t flex items-center">
        <label class="mr-2 p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 cursor-pointer">
            <Icon icon="mdi:paperclip" class="w-5 h-5" />
            <input type="file" accept="image/*" multiple @change="handleAttachment" class="hidden" />
        </label>
        <input type="text" v-model="newMessage" placeholder="Aa"
            class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-0 " />
        <button @click="handleMessageSubmit" class="ml-4 p-2 bg-primary text-white rounded-full hover:bg-primary/80">
            <Icon :icon="!isSending ? 'mdi:send' : 'line-md:loading-loop'" class="w-5 h-5" />
        </button>
    </div>
    <MediaPreviewModal :show="showModal" :imageUrl="selectedImage" @close="closeModal" />
</template>
