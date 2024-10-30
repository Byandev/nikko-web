<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators';
import { Icon } from '@iconify/vue';
import codes from 'iso-language-codes';
import { jobPostingStore } from '~/store/jobPostingStore';
import { ref, computed } from 'vue';
import type { Skill } from '~/types/models/Skill';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { Level, Term } from '~/types/models/Project';  
import _ from 'lodash';

const emits = defineEmits<{ (e: 'submit'): void; (e: 'back'): void; }>();

interface FormData {
    title: string;
    description: string;
    project_length: Term;
    experience_level: string;
    languages: { name: string }[];
    estimated_budget: number;
    images: File[];
    skills: Skill[];
}

const initialValue: FormData = {
    title: '',
    description: '',
    project_length: Term.LONG_TERM,
    experience_level: '',
    languages: [],
    estimated_budget: 0,
    images: [],
    skills: [],
}

const { jobPosting } = storeToRefs(jobPostingStore());

const form = ref<FormData>(jobPosting.value ? {
    title: jobPosting.value.title || '',
    description: jobPosting.value.description || '',
    project_length: jobPosting.value.project_length || Term.LONG_TERM,
    experience_level: jobPosting.value.experience_level || '',
    languages: jobPosting.value.languages ? jobPosting.value.languages.map((lang: { name: string }) => ({ name: lang.name })) : [],
    estimated_budget: jobPosting.value.estimated_budget || 0,
    images: jobPosting.value.images || [],
    skills: jobPosting.value.skills || [],
} : initialValue);

const rules = {
    title: { required: helpers.withMessage('Title is required', required) },
    description: { required: helpers.withMessage('Description is required', required) },
    project_length: { required: helpers.withMessage('Project Length is required', required) },
    experience_level: { required: helpers.withMessage('Experience Level is required', required) },
    languages: { required: helpers.withMessage('Language is required', required) },
    estimated_budget: { required: helpers.withMessage('Estimated Budget is required', required) },
    images: {
       required: helpers.withMessage('Please attach at least one image', required),
    },
    skills: {
       required: helpers.withMessage('Please select at least one skill', required),
    },
};

const { formRef, v$ } = useValidation(form, rules);

const languagesName = ref<string[]>(codes.map(code => code.name));
const selectedLanguageName = ref<string | null>(null);

const languageOptions = computed<string[]>(() => 
    (languagesName.value ?? []).filter(language => 
        !form.value.languages?.find((i: { name: string }) => i.name === language)
    )
);

const onSelectLanguage = () => {
    if (selectedLanguageName.value) {
        const selectedLanguage = languageOptions.value.find(language => language === selectedLanguageName.value);

        if (selectedLanguage && form.value.languages && !form.value.languages.find((lang: { name: string }) => lang.name === selectedLanguageName.value)) {
            form.value.languages.push({
                name: selectedLanguage,
            });
        }

        selectedLanguageName.value = null;
    }
}

const selectedSkillId = ref<number>(0)
const skillOptions = computed<Skill[]>(() => (skills.value?.data ?? []).filter(skill => !form.value.skills?.find(i => i.id === skill.id)))

const { data: skills, fetchData: fetchSkills } = useFetchData<{ data: Skill[] }, ApiErrorResponse>();

fetchSkills('/v1/skills');

const isEditing = ref({
    title: false,
    description: false,
    project_length: false,
    experience_level: false,
    languages: false,
    estimated_budget: false,
    images: false,
    skills: false,
});

const toggleEdit = (field: keyof FormData) => {
    if (isEditing.value[field]) {
        v$.value[field].$touch();
        if (v$.value[field].$invalid) return;

        jobPosting.value[field] = formRef.value[field];
        isEditing.value[field] = !isEditing.value[field];
    } else {
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

const onSelectSkill = () => {
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

const onRemoveLanguage = (index: number) => {
    form.value.languages?.splice(index, 1);
}

const onSelectedLanguage = () => {
    if (selectedLanguageName.value) {
        const selectedLanguage = languageOptions.value.find(language => language === selectedLanguageName.value);

        // Ensure form.value.languages is always an array
        form.value.languages = form.value.languages ?? [];

        if (selectedLanguage && !form.value.languages.find((lang: { name: string }) => lang.name === selectedLanguageName.value)) {
            form.value.languages.push({
                name: selectedLanguage,
            });
        }

        selectedLanguageName.value = null;
    }
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
                    <label for="project_length" class="block text-sm font-medium leading-6 text-gray-900">
                        Project Length <span class="text-red-500">*</span>
                    </label>
                    <div v-if="!isEditing.project_length">
                        <button type="button" @click="toggleEdit('project_length')" class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('project_length')" class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.project_length" class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
                        <p>{{ _.startCase(formRef.project_length.toLowerCase()) }}</p>
                    </div>
                    <div v-else>
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:calendar" :ssr="true" />
                            <select id="project_length" v-model="formRef.project_length"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                                <option v-for="term in Term" :key="term" :value="term">{{ _.startCase(term.toLowerCase()) }}
                                </option>
                            </select>
                        </div>
                        <span v-if="v$.project_length.$error" class="text-red-900 text-sm">{{
                            v$.project_length.$errors[0].$message }}</span>
                    </div>
                </div>
            </div>

            <!-- Experience Level -->
            <div class="mt-4 w-full">
                <div class="flex flex-row justify-between">
                    <label for="experience_level" class="block text-sm font-medium leading-6 text-gray-900">
                        Experience Level <span class="text-red-500">*</span>
                    </label>
                    <div v-if="!isEditing.experience_level">
                        <button type="button" @click="toggleEdit('experience_level')" class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('experience_level')" class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.experience_level" class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
                        <p>{{ _.capitalize(formRef.experience_level) }}</p>
                    </div>
                    <div v-else>
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:account" :ssr="true" />
                            <select id="experience_level" v-model="formRef.experience_level"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                                <option v-for="level in Object.values(Level)" :key="level" :value="level">{{ _.capitalize(level) }}</option>
                            </select>
                        </div>
                        <span v-if="v$.experience_level.$error" class="text-red-900 text-sm">{{
                            v$.experience_level.$errors[0].$message }}</span>
                    </div>
                </div>
            </div>

            <!-- Language -->
            <div class="mt-4 w-full">
                <div class="flex flex-row justify-between">
                    <label for="language" class="block text-sm font-medium leading-6 text-gray-900">
                        Language <span class="text-red-500">*</span>
                    </label>
                    <div v-if="!isEditing.languages">
                        <button type="button" @click="toggleEdit('languages')" class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('languages')" class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.languages" class="flex flex-row ">
                        <div v-for="(language, idx) in formRef.languages" :key="`selected-language-${language.id}`"
                            class="mr-2 my-1">
                            <span
                                class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 whitespace-nowrap">
                                {{ language.name }}
                            </span>
                        </div>
                    </div>
                    <div v-else>
                        <div>
                            <select @change="onSelectedLanguage" v-model="selectedLanguageName"
                                class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                                <option :value=null selected>Select Language</option>
                                <option :value="language" class="truncate text-sm leading-6"
                                    v-for="language in languageOptions" :key="language">
                                    {{ language }}
                                </option>
                            </select>
                        </div>
                        <span v-if="v$.languages.$error" class="text-red-900 text-sm">{{ v$.languages.$errors[0].$message
                            }}</span>
                         <div class="mt-5 flex flex-wrap">
                            <div v-for="(language, idx) in formRef.languages" :key="`selected-language-${language.name}`"
                                class="mr-2 my-1">
                                <span
                                    class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    {{ language.name }}
                                    <button @click="onRemoveLanguage(idx)" type="button"
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

            <!-- Estimated Budget -->
            <div class="mt-4 w-full">
                <div class="flex flex-row justify-between">
                    <label for="estimated_budget" class="block text-sm font-medium leading-6 text-gray-900">
                        Estimated Budget <span class="text-red-500">*</span>
                    </label>
                    <div v-if="!isEditing.estimated_budget">
                        <button type="button" @click="toggleEdit('estimated_budget')" class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('estimated_budget')" class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.estimated_budget" class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
                        <p>{{ formRef.estimated_budget }}</p>
                    </div>
                    <div v-else>
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                            <Icon icon="mdi:currency-usd" :ssr="true" />
                            <input type="text" id="estimated_budget" v-model="formRef.estimated_budget"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                        <span v-if="v$.estimated_budget.$error" class="text-red-900 text-sm">{{
                            v$.estimated_budget.$errors[0].$message }}</span>
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
                        <select id="skills" required @change="onSelectSkill" v-model="selectedSkillId"
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