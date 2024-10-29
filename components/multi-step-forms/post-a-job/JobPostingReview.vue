<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators';
import { Icon } from '@iconify/vue';
import codes from 'iso-language-codes';
import { jobPostingStore } from '~/store/jobPostingStore';
import { ref } from 'vue';
import type { Skill } from '~/types/models/Skill';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { Level } from '~/types/models/Job';  
import _ from 'lodash';

const emits = defineEmits<{ (e: 'submit'): void; (e: 'back'): void; }>();

interface FormData {
    title: string;
    description: string;
    projectLength: string;
    experienceLevel: string;
    language: string;
    estimatedBudget: string;
    images: File[];
    skills: { id: number; name: string }[];
}

const initialValue: FormData = {
    title: '',
    description: '',
    projectLength: '',
    experienceLevel: '',
    language: '',
    estimatedBudget: '',
    images: [],
    skills: [],
}

const { jobPosting } = storeToRefs(jobPostingStore());
const form = ref<FormData>(jobPosting.value ? {
    title: jobPosting.value.title || '',
    description: jobPosting.value.description || '',
    projectLength: jobPosting.value.projectLength || '',
    experienceLevel: jobPosting.value.experienceLevel || '',
    language: jobPosting.value.language || '',
    estimatedBudget: jobPosting.value.estimatedBudget || '',
    images: jobPosting.value.images || [],
    skills: jobPosting.value.skills || [],
} : initialValue);

const rules = {
    title: { required: helpers.withMessage('Title is required', required) },
    description: { required: helpers.withMessage('Description is required', required) },
    projectLength: { required: helpers.withMessage('Project Length is required', required) },
    experienceLevel: { required: helpers.withMessage('Experience Level is required', required) },
    language: { required: helpers.withMessage('Language is required', required) },
    estimatedBudget: { required: helpers.withMessage('Estimated Budget is required', required) },
    images: {
       required: helpers.withMessage('Please attach at least one image', required),
    },
    skills: {
       required: helpers.withMessage('Please select atleast one skill', required),
    },
};

const { formRef, v$ } = useValidation(form, rules);
const selectedSkillId = ref<number>(0)
const skillOptions = computed<Skill[]>(() => (skills.value?.data ?? []).filter(skill => !form.value.skills?.find(i => i.id === skill.id)))

const { data: skills, fetchData: fetchSkills } = useFetchData<{ data: Skill[] }, ApiErrorResponse>();

fetchSkills('/v1/skills');

const isEditing = ref({
    title: false,
    description: false,
    projectLength: false,
    experienceLevel: false,
    language: false,
    estimatedBudget: false,
    images: false,
    skills: false,
});

const toggleEdit = (field: keyof FormData) => {

    if (isEditing.value[field]) {
        v$.value[field].$touch();
        if (v$.value[field].$invalid) return;

        jobPosting.value[field] = formRef.value[field];
        isEditing.value[field] = !isEditing.value[field];
    }
    else {
        isEditing.value[field] = !isEditing.value[field];
    }
};

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        const newFiles = Array.from(target.files);
        form.value.images = form.value.images.concat(newFiles);
    }
};

const handleRemoveFile = (fileNameToRemove: string) => {
    form.value.images = form.value.images.filter(file => file.name !== fileNameToRemove);
};

const handleClick = () => {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    fileInput.click();
};

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


const submitForm = () => {
    v$.value.$touch();
    if (v$.value.$invalid) return;

    emits('submit');
};
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1 class="text-2xl font-bold mb-4">Review Your Job Posting</h1>
        <span class="text-gray-600 mb-4">Please review the details of your job posting below. Ensure all information is
            accurate to attract the best candidates.</span>

        <form @submit.prevent="submitForm" class="w-full max-w-lg text-left">
            <!-- Title -->
            <div class="mt-4 w-full">
                <div class="flex flex-row justify-between">
                    <label for="title" class="block text-sm font-medium leading-6 text-gray-900">
                        Title <span class="text-red-500">*</span>
                    </label>
                    <div v-if="!isEditing.title">
                        <button type="button" @click="toggleEdit('title')" class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('title')" class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.title" class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
                        <p>{{ formRef.title }}</p>
                    </div>
                    <div v-else>
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:account" :ssr="true" />
                            <input type="text" id="title" v-model="formRef.title"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                        <span v-if="v$.title.$error" class="text-red-900 text-sm">{{ v$.title.$errors[0].$message
                            }}</span>
                    </div>
                </div>
            </div>

            <!-- Description -->
            <div class="mt-4 w-full">
                <div class="flex flex-row justify-between">
                    <label for="description" class="block text-sm font-medium leading-6 text-gray-900">
                        Description <span class="text-red-500">*</span>
                    </label>
                    <div v-if="!isEditing.description">
                        <button type="button" @click="toggleEdit('description')" class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('description')" class="text-blue-500">Save</button>
                    </div>
                </div>

                <div class="mt-2">
                    <div v-if="!isEditing.description" class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
                        <p>{{ formRef.description }}</p>
                    </div>
                    <div v-else>
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:account" :ssr="true" />
                            <textarea id="description" v-model="formRef.description"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0"></textarea>
                        </div>
                        <span v-if="v$.description.$error" class="text-red-900 text-sm">{{
                            v$.description.$errors[0].$message }}</span>
                    </div>
                </div>
            </div>

            <!-- Project Length -->
            <div class="mt-4 w-full">
                <div class="flex flex-row justify-between">
                    <label for="projectLength" class="block text-sm font-medium leading-6 text-gray-900">
                        Project Length <span class="text-red-500">*</span>
                    </label>
                    <div v-if="!isEditing.projectLength">
                        <button type="button" @click="toggleEdit('projectLength')" class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('projectLength')" class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.projectLength" class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
                        <p>{{ formRef.projectLength }}</p>
                    </div>
                    <div v-else>
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:calendar" :ssr="true" />
                            <input type="text" id="projectLength" v-model="formRef.projectLength"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                        <span v-if="v$.projectLength.$error" class="text-red-900 text-sm">{{
                            v$.projectLength.$errors[0].$message }}</span>
                    </div>
                </div>
            </div>

            <!-- Experience Level -->
            <div class="mt-4 w-full">
                <div class="flex flex-row justify-between">
                    <label for="experienceLevel" class="block text-sm font-medium leading-6 text-gray-900">
                        Experience Level <span class="text-red-500">*</span>
                    </label>
                    <div v-if="!isEditing.experienceLevel">
                        <button type="button" @click="toggleEdit('experienceLevel')" class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('experienceLevel')" class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.experienceLevel" class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
                        <p>{{ _.capitalize(formRef.experienceLevel) }}</p>
                    </div>
                    <div v-else>
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:account" :ssr="true" />
                            <select id="experienceLevel" v-model="formRef.experienceLevel"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                                <option v-for="level in Object.values(Level)" :key="level" :value="level">{{ _.capitalize(level) }}</option>
                            </select>
                        </div>
                        <span v-if="v$.experienceLevel.$error" class="text-red-900 text-sm">{{
                            v$.experienceLevel.$errors[0].$message }}</span>
                    </div>
                </div>
            </div>

            <!-- Language -->
            <div class="mt-4 w-full">
                <div class="flex flex-row justify-between">
                    <label for="language" class="block text-sm font-medium leading-6 text-gray-900">
                        Language <span class="text-red-500">*</span>
                    </label>
                    <div v-if="!isEditing.language">
                        <button type="button" @click="toggleEdit('language')" class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('language')" class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.language" class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
                        <p>{{ formRef.language }}</p>
                    </div>
                    <div v-else>
                        <select v-model="formRef.language"
                            class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <option :value="language.name" class="truncate text-sm leading-6" v-for="language in codes"
                                :key="language.name">
                                {{ language.name }}
                            </option>
                        </select>
                        <span v-if="v$.language.$error" class="text-red-900 text-sm">{{ v$.language.$errors[0].$message
                            }}</span>
                    </div>
                </div>
            </div>

            <!-- Estimated Budget -->
            <div class="mt-4 w-full">
                <div class="flex flex-row justify-between">
                    <label for="estimatedBudget" class="block text-sm font-medium leading-6 text-gray-900">
                        Estimated Budget <span class="text-red-500">*</span>
                    </label>
                    <div v-if="!isEditing.estimatedBudget">
                        <button type="button" @click="toggleEdit('estimatedBudget')" class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('estimatedBudget')" class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.estimatedBudget" class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
                        <p>{{ formRef.estimatedBudget }}</p>
                    </div>
                    <div v-else>
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:currency-usd" :ssr="true" />
                            <input type="text" id="estimatedBudget" v-model="formRef.estimatedBudget"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                        <span v-if="v$.estimatedBudget.$error" class="text-red-900 text-sm">{{
                            v$.estimatedBudget.$errors[0].$message }}</span>
                    </div>
                </div>
            </div>

            <!-- Images -->
            <div class="mt-4 w-full">
                <div class="flex flex-row justify-between">
                    <label for="images" class="block text-sm font-medium leading-6 text-gray-900">
                        Images
                    </label>
                    <div v-if="!isEditing.images">
                        <button type="button" @click="toggleEdit('images')" class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('images')" class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.images">
                        <ul class="mt-2 space-y-4">
                            <li v-for="(image, index) in formRef.images" :key="index"
                                class="flex items-center justify-between px-2 py-1 rounded bg-gray-100 shadow-sm">
                                <div class="flex items-center space-x-2 w-full">
                                    <Icon icon="mdi:file" class="text-gray-500" width="24" height="24" />
                                    <span class="text-sm text-gray-900 truncate max-w-52 lg:max-w-96"
                                        :title="image.name">{{ image.name }}</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div v-else>
                        <div class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 cursor-pointer"
                            @click="handleClick">
                            <Icon icon="mdi:file" :ssr="true" />
                            <input type="file" id="file" multiple @change="handleFileChange" class="hidden"
                                accept="image/*">
                            <p
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                                Click to select a file</p>
                        </div>
                        <span v-if="v$.images.$error" class="text-red-900 text-sm">{{ v$.images.$errors[0].$message
                            }}</span>
                        <div v-if="formRef.images.length" class="mt-4">
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
                    </div>
                </div>
            </div>

            <!-- Skills -->
            <div class="mt-4 w-full">
                <div class="flex flex-row justify-between">
                    <label for="skills" class="block text-sm font-medium leading-6 text-gray-900">
                        Skills
                    </label>
                    <div v-if="!isEditing.skills">
                        <button type="button" @click="toggleEdit('skills')" class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('skills')" class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.skills" class="flex flex-row ">
                        <div v-for="(skill, idx) in formRef.skills" :key="`selected-skill-${skill.id}`"
                            class="mr-2 my-1">
                            <span
                                class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 whitespace-nowrap">
                                {{ skill.name }}
                            </span>
                        </div>
                    </div>
                    <div v-else>
                        <select id="skills" required @change="onSelect" v-model="selectedSkillId"
                            class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <option :value="0">Select Skill</option>
                            <option class="truncate text-sm leading-6 whitespace-nowrap" v-for="skill in skillOptions" :key="skill.id"
                                :value="skill.id">
                                {{ skill.name }}
                            </option>
                        </select>
                        <span v-if="v$.skills.$error" class="text-red-900 text-sm">{{ v$.skills.$errors[0].$message
                            }}</span>
                        <div v-if="formRef.skills.length" class="mt-4 flex flex-row">
                            <div v-for="(skill, idx) in formRef.skills" :key="`selected-skill-${skill.id}`"
                                class="mr-2 my-1">
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
                    </div>
                </div>
            </div>

            <div class="flex mt-5 justify-end w-full">
                <Button text="Back" type="button" background="white" foreground="primary" @click="emits('back')" />
                <Button text="Publish" type="submit" background="primary" foreground="white" />
            </div>
        </form>
    </div>
</template>