<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Skill } from '~/types/models/Skill';
import { Icon } from '@iconify/vue';
import { jobPostingStore } from '~/store/jobPostingStore';

const emits = defineEmits<{ (e: 'submit'): void; (e: 'back'): void; }>();

interface FormData {
    title: string;
    description: string;
    skills: Skill[];
    images: File[];
}

const initialValue: FormData = {
    title: '',
    description: '',
    images: [],
    skills: [],
}

const { jobPosting } = storeToRefs(jobPostingStore());

const selectedSkillId = ref<number>(0)
const isFileAttachmentEmpty = ref(false);

const selectedFiles = ref<File[]>([]);

const watchSelectedFiles = () => {
    if (selectedFiles.value.length > 0 || form.value.images.length > 0) {
        isFileAttachmentEmpty.value = false;
    } else {
        isFileAttachmentEmpty.value = true;
    }
};

const { data: skills, fetchData: fetchSkills } = useFetchData<{ data: Skill[] }, ApiErrorResponse>();

fetchSkills('/v1/skills');

const skillOptions = computed<Skill[]>(() => (skills.value?.data ?? []).filter(skill => !form.value.skills?.find(i => i.id === skill.id)))

const form = ref<FormData>(jobPosting.value ? {
    title: jobPosting.value.title || '',
    description: jobPosting.value.description || '',
    skills: jobPosting.value.skills || [],
    images: jobPosting.value.images || [],
} : initialValue);

const rules = {
    title: { required: helpers.withMessage('Title is required', required) },
    description: { required: helpers.withMessage('Description is required', required) },
    skills: { required: helpers.withMessage('Skills are required', required) },
};

const { formRef, v$ } = useValidation(form, rules);

const onSelect = () => {
    if (selectedSkillId.value) {
        const selectedSkill = skillOptions.value.find(skill => skill.id === selectedSkillId.value)

        if (selectedSkill && !form.value.skills?.find(skill => skill.id === selectedSkillId.value)) {
            form.value.skills?.push(selectedSkill)
        }

        selectedSkillId.value = 0
    }
}

const onRemoveSkill = (index: number) => {
    form.value.skills?.splice(index, 1);
}

const handleClick = () => {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    fileInput.click();
};

const handleRemoveFile = (fileNameToRemove: string) => {
    selectedFiles.value = selectedFiles.value.filter(file => file.name !== fileNameToRemove);
    form.value.images = form.value.images.filter(image => image.name !== fileNameToRemove);
};

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        const newFiles = Array.from(target.files);
        console.log(newFiles);
        selectedFiles.value = selectedFiles.value.concat(newFiles);
        form.value.images = form.value.images.concat(newFiles);
    }
};

const submitForm = () => {
    watchEffect(watchSelectedFiles);
    v$.value.$touch();
    if (v$.value.$invalid) return;
    if (!selectedFiles.value) return;

    jobPosting.value = {
        ...jobPosting.value,
        title: formRef.value.title,
        description: formRef.value.description,
        skills: formRef.value.skills,
        images: formRef.value.images,
    };

    emits('submit');
};
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1 class="text-2xl font-bold mb-4">Post a Job</h1>
        <span class="text-gray-600 mb-4">Provide detailed information about the job to attract the right
            candidates.</span>

        <form @submit.prevent="submitForm" class="w-full max-w-lg text-left">
            <!-- Write a Title for your Job Post -->
            <div class="mt-4 w-full">
                <label for="profileTitle" class="block text-sm font-medium leading-6 text-gray-900">
                    Write a Title for your Job Post <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div
                        class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:account" :ssr="true" />
                        <input type="text" id="profileTitle" v-model="formRef.title"
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                    </div>
                    <span v-if="v$.title.$error" class="text-red-900 text-sm">{{
                        v$.title.$errors[0].$message }}</span>
                </div>
            </div>

            <!-- Describe the Job -->
            <div class="mt-4 w-full">
                <label for="profileBio" class="block text-sm font-medium leading-6 text-gray-900">
                    Describe the Job <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div
                        class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:account" :ssr="true" />
                        <textarea id="profileBio" v-model="formRef.description"
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0"></textarea>
                    </div>
                    <span v-if="v$.description.$error" class="text-red-900 text-sm">{{
                        v$.description.$errors[0].$message }}</span>
                </div>
            </div>

            <!-- File Attachment -->
            <div class="mt-4 w-full">
                <label for="file" class="block text-sm font-medium leading-6 text-gray-900">
                    File Attachments <span class="text-red-500">*</span>
                </label>
                <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 cursor-pointer"
                    @click="handleClick">
                    <Icon icon="mdi:file" :ssr="true" />
                    <input type="file" id="file" multiple @change="handleFileChange" class="hidden" accept="image/*">
                    <p class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        Click to select a file</p>
                </div>
                <span v-if="isFileAttachmentEmpty" class="text-red-900 text-sm">
                    File Attachment is required
                </span>
            </div>

            <div v-if="selectedFiles.length || formRef.images.length" class="mt-4">
                <ul class="mt-2 space-y-4">
                    <li v-for="(image, index) in formRef.images" :key="index"
                        class="flex items-center justify-between p-2 bg-gray-100 rounded-md shadow-sm">
                        <div class="flex items-center space-x-2 w-full">
                            <Icon icon="mdi:file" class="text-gray-500" width="24" height="24" />
                            <span class="text-sm text-gray-900 truncate max-w-52 lg:max-w-96"
                                :title="image.name">{{ image.name }}</span>
                        </div>
                        <button @click="handleRemoveFile(String(image.name))"
                            class="text-red-500 hover:text-red-700">
                            <Icon icon="mdi:close" width="16" height="16" />
                        </button>
                    </li>
                </ul>
            </div>

            <!-- Skills Required -->
            <div class="mt-4">
                <label for="skills" class="block text-sm font-medium leading-6 text-gray-900">
                    Skills <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <select id="skills" required @change="onSelect" v-model="selectedSkillId"
                        class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                        <option :value="0">Select Skill</option>
                        <option class="truncate text-sm leading-6" v-for="skill in skillOptions" :key="skill.id"
                            :value="skill.id">
                            {{ skill.name }}
                        </option>
                    </select>
                    <span v-if="v$.skills.$error" class="text-red-900 text-sm">{{
                        v$.skills.$errors[0].$message }}</span>
                </div>
            </div>

            <div class="mt-5 flex flex-wrap">
                <div v-for="(skill, idx) in formRef.skills" :key="`selected-skill-${skill.id}`" class="mr-2 my-1">
                    <span
                        class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        {{ skill.name }}
                        <button @click="onRemoveSkill(idx)" type="button"
                            class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-green-600/20">
                            <span class="sr-only">Remove</span>
                            <svg viewBox="0 0 14 14"
                                class="h-3.5 w-3.5 stroke-green-700/50 group-hover:stroke-green-700/75">
                                <path d="M4 4l6 6m0-6l-6 6" />
                            </svg>
                            <span class="absolute -inset-1" />
                        </button>
                    </span>
                </div>
            </div>

            <div class="flex mt-5 justify-end w-full">
                <Button text="Back" type="button" background="white" foreground="primary" @click="emits('back')" />
                <Button text="Next" type="submit" background="primary" foreground="white" />
            </div>
        </form>
    </div>
</template>