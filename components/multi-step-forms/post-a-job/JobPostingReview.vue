<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators';
import { Icon } from '@iconify/vue';
import codes from 'iso-language-codes';
import { jobPostingStore } from '~/store/jobPostingStore';
import { ref, computed } from 'vue';
import type { Skill } from '~/types/models/Skill';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { Level, Term, type Project } from '~/types/models/Project';  
import _ from 'lodash';
import type { Media } from '~/types/models/Media';
import { accountStore } from '~/store/accountStore';
import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

const emits = defineEmits<{ (e: 'submit'): void; (e: 'back'): void; }>();

interface FormData {
    title: string;
    description: string;
    length: Term;
    experience_level: string;
    languages: { name: string }[];
    estimated_budget: number;
    images: File[];
    skills: Skill[];
}

const initialValue: FormData = {
    title: '',
    description: '',
    length: Term.LONG_TERM,
    experience_level: '',
    languages: [],
    estimated_budget: 0,
    images: [],
    skills: [],
}

const { jobPosting } = storeToRefs(jobPostingStore());
const { account } = storeToRefs(accountStore());
const status = ref('');

const form = ref<FormData>(jobPosting.value ? {
    title: jobPosting.value.title || '',
    description: jobPosting.value.description || '',
    length: jobPosting.value.length || Term.LONG_TERM,
    experience_level: jobPosting.value.experience_level || '',
    languages: jobPosting.value.languages ? jobPosting.value.languages.map((lang: { name: string }) => ({ name: lang.name })) : [],
    estimated_budget: jobPosting.value.estimated_budget || 0,
    images: jobPosting.value.images || [],
    skills: jobPosting.value.skills || [],
} : initialValue);

const rules = {
    title: { required: helpers.withMessage('Title is required', required) },
    description: { required: helpers.withMessage('Description is required', required) },
    length: { required: helpers.withMessage('Project Length is required', required) },
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

const languageOptions = computed<string[]>(() => 
    (languagesName.value ?? []).filter(language => 
        !form.value.languages?.find((i: { name: string }) => i.name === language)
    )
);

const skillOptions = computed<Skill[]>(() => (skills.value?.data ?? []).filter(skill => !form.value.skills?.find(i => i.id === skill.id)))

const { data: skills, fetchData: fetchSkills } = useFetchData<{ data: Skill[] }, ApiErrorResponse>();

fetchSkills('/v1/skills');

const isEditing = ref({
    title: false,
    description: false,
    length: false,
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

const onRemoveSkill = (index: number) => {
    form.value.skills?.splice(index, 1);
}

const onRemoveLanguage = (index: number) => {
    form.value.languages?.splice(index, 1);
}

const {sendRequest: createJob, pending: isSubmitting} = useSubmit<{ data: Project }, ApiErrorResponse>();
const {sendRequest: uploadMedia, pending: isUploading} = useSubmit<{ data: Media }, ApiErrorResponse>();

const submitForm = async () => {
    v$.value.$touch();
    console.log('Errors', v$.value.$errors);
    if (v$.value.$invalid) return;

    try {
        
        // Upload each file and collect the responses
        const uploadPromises = form.value.images.map(file => {
            const formData = new FormData();
            formData.append('file', file);
            return uploadMedia('/v1/medias', {
                method: 'POST',
                body: formData,
            });
        });

        const uploadResponses = await Promise.all(uploadPromises);
        const uploadedImages = uploadResponses.map(response => response.data.id);

        const body = ref({
            title: form.value.title,
            description: form.value.description,
            estimated_budget: form.value.estimated_budget,
            length: form.value.length,
            status: status.value,
            experience_level: form.value.experience_level,
            languages: form.value.languages,
            skills: form.value.skills.map(skill => skill.id),
            images: uploadedImages,
        });

        await createJob("/v1/client/projects", {
            method: 'POST',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
            body: body.value,
        });

    } catch (error) {
        console.error(error);
    }

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
                    <div v-if="!isEditing.description"
                        class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
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
                    <label for="length" class="block text-sm font-medium leading-6 text-gray-900">
                        Project Length <span class="text-red-500">*</span>
                    </label>
                    <div v-if="!isEditing.length">
                        <button type="button" @click="toggleEdit('length')" class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('length')" class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.length" class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
                        <p>{{ _.startCase(formRef.length.toLowerCase()) }}</p>
                    </div>
                    <div v-else>
                        <Listbox v-model="formRef.length" class="ring-1 ring-gray-300 rounded-md">
                            <div class="relative mt-1">
                                <ListboxButton
                                    class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                    <span class="block truncate">
                                        <span>
                                            <span v-if="!formRef.length">Select length</span>
                                            <span v-else>
                                                {{ _.capitalize(_.startCase(formRef.length)) }}
                                            </span>
                                        </span>
                                    </span>
                                    <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </ListboxButton>

                                <transition leave-active-class="transition duration-100 ease-in"
                                    leave-from-class="opacity-100" leave-to-class="opacity-0">
                                    <ListboxOptions
                                        class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                        <ListboxOption v-for="(term, index) in Term" v-slot="{ active, selected }"
                                            :key="index" :value="term" as="template">
                                            <li
                                                :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                                                <span
                                                    :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                                                    _.capitalize(_.startCase(term))
                                                    }}</span>
                                                <span v-if="selected"
                                                    class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            </li>
                                        </ListboxOption>
                                    </ListboxOptions>
                                </transition>
                            </div>
                        </Listbox>
                        <span v-if="v$.length.$error" class="text-red-900 text-sm">{{
                            v$.length.$errors[0].$message }}</span>
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
                        <button type="button" @click="toggleEdit('experience_level')"
                            class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('experience_level')"
                            class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.experience_level"
                        class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
                        <p>{{ _.capitalize(formRef.experience_level) }}</p>
                    </div>
                    <div v-else>
                        <Listbox v-model="formRef.experience_level" class="ring-1 ring-gray-300 rounded-md">
                            <div class="relative mt-1">
                                <ListboxButton
                                    class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                    <span class="block truncate">
                                        <span>
                                            <span v-if="!formRef.experience_level">Select experience_level</span>
                                            <span v-else>
                                                {{ _.capitalize(_.startCase(formRef.experience_level)) }}
                                            </span>
                                        </span>
                                    </span>
                                    <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </ListboxButton>

                                <transition leave-active-class="transition duration-100 ease-in"
                                    leave-from-class="opacity-100" leave-to-class="opacity-0">
                                    <ListboxOptions
                                        class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                        <ListboxOption v-for="(level, index) in Object.values(Level)"
                                            v-slot="{ active, selected }" :key="index" :value="level" as="template">
                                            <li
                                                :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                                                <span
                                                    :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                                                    _.capitalize(level)
                                                    }}</span>
                                                <span v-if="selected"
                                                    class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            </li>
                                        </ListboxOption>
                                    </ListboxOptions>
                                </transition>
                            </div>
                        </Listbox>
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
                        <Listbox v-model="formRef.languages" multiple class="ring-1 ring-gray-300 rounded-md">
                            <div class="relative mt-1">
                                <ListboxButton
                                    class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                    <span class="block truncate">
                                        <span v-if="formRef.languages.length === 0">Select language</span>
                                        <span v-else>
                                            <span v-for="(language, index) in formRef.languages" :key="index">
                                                {{ language.name }}<span v-if="index < formRef.languages.length - 1">,
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                    <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </ListboxButton>

                                <transition leave-active-class="transition duration-100 ease-in"
                                    leave-from-class="opacity-100" leave-to-class="opacity-0">
                                    <ListboxOptions
                                        class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                        <ListboxOption v-for="(language, index) in languageOptions"
                                            v-slot="{ active, selected }" :key="index" :value="{ name: language }"
                                            as="template">
                                            <li
                                                :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                                                <span
                                                    :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                                                    language
                                                    }}</span>
                                                <span v-if="selected"
                                                    class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            </li>
                                        </ListboxOption>
                                    </ListboxOptions>
                                </transition>
                            </div>
                        </Listbox>
                        <span v-if="v$.languages.$error" class="text-red-900 text-sm">{{
                            v$.languages.$errors[0].$message
                            }}</span>
                        <div class="mt-5 flex flex-wrap">
                            <div v-for="(language, idx) in formRef.languages"
                                :key="`selected-language-${language.name}`" class="mr-2 my-1">
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
                        <button type="button" @click="toggleEdit('estimated_budget')"
                            class="text-blue-500">Edit</button>
                    </div>
                    <div v-else>
                        <button type="button" @click="toggleEdit('estimated_budget')"
                            class="text-blue-500">Save</button>
                    </div>
                </div>
                <div class="mt-2">
                    <div v-if="!isEditing.estimated_budget"
                        class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
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
                        Images <span class="text-red-500">*</span>
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
                        Skills <span class="text-red-500">*</span>
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
                        <Listbox v-model="formRef.skills" multiple class="ring-1 ring-gray-300 rounded-md">
                            <div class="relative mt-1">
                                <ListboxButton
                                    class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                    <span class="block truncate">
                                        <span v-if="formRef.skills.length === 0">Select Skill</span>
                                        <span v-else>
                                            <span v-for="(skill, index) in formRef.skills" :key="index">
                                                {{ skill.name }}<span v-if="index < formRef.skills.length - 1">, </span>
                                            </span>
                                        </span>
                                    </span>
                                    <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </ListboxButton>

                                <transition leave-active-class="transition duration-100 ease-in"
                                    leave-from-class="opacity-100" leave-to-class="opacity-0">
                                    <ListboxOptions
                                        class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                        <ListboxOption v-for="(skill, index) in skillOptions"
                                            v-slot="{ active, selected }" :key="index" :value="skill" as="template">
                                            <li
                                                :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                                                <span
                                                    :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                                                        skill.name
                                                    }}</span>
                                                <span v-if="selected"
                                                    class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            </li>
                                        </ListboxOption>
                                    </ListboxOptions>
                                </transition>
                            </div>
                        </Listbox>
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

            <div class="flex mt-5 justify-between w-full">
                <Button text="Back" type="button" background="white" foreground="primary" @click="emits('back')" />
                <div class="flex flex-row">
                    <Button :isLoading="isUploading || isSubmitting" text="Save Draft" type="submit" background="white"
                        @click="status = 'DRAFT'" foreground="primary" />
                    <Button :isLoading="isUploading || isSubmitting" text="Publish" type="submit" background="primary"
                        @click="status = 'ACTIVE'" foreground="white" />
                </div>
            </div>
        </form>
    </div>
</template>