<script setup lang="ts">
import { Term, type Project, Level } from '~/types/models/Project';
import { Icon } from '@iconify/vue';
import type { Skill } from '~/types/models/Skill';
import { helpers, required } from '@vuelidate/validators';
import { jobPostingStore } from '~/store/jobPostingStore';
import _ from 'lodash';
import codes from 'iso-language-codes';
import type { ApiErrorResponse } from '~/types/api/response/error';
import  { type Media } from '~/types/models/Media';
import { accountStore } from '~/store/accountStore';

const props = defineProps({
    job: {
        type: Object as PropType<Partial<Project>>,
        required: true,
    },
    options: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
});

const {jobPosting} = storeToRefs(jobPostingStore());
const { resetJobPosting } = jobPostingStore();
const { account } = storeToRefs(accountStore());
const status = ref<string | null>(null);
const router = useRouter();

interface FormData {
    title: string;
    description: string;
    length: Term;
    experience_level: string;
    languages: { name: string }[];
    estimated_budget: number;
    images: Media[] | File[];
    skills: Skill[];
}

const emits = defineEmits<{
    (e: 'submit'): void;
    (e: 'delete', jobId: number): void;
}>();

const dropdownOpen = ref(false);

const handleEdit = () => {
    isEditModalOpen.value = true;
};

const handleDelete = () => {
    if (props?.job.id !== undefined) {
        emits('delete', props.job.id);
    }
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

const isEditModalOpen = ref(false);

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


const form = ref<FormData>(props.job ? {
    title: props.job.title || '',
    description: props.job.description || '',
    length: props.job.length || Term.LONG_TERM,
    experience_level: props.job.experience_level || '',
    languages: props.job.languages ? props.job.languages.map((lang: { name: string }) => ({ name: lang.name })) : [],
    estimated_budget: Number(props.job.estimated_budget) || 0,
    images: props.job.images || [],
    skills: props.job.skills || [],
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
const selectedLanguageName = ref<string | null>(null);

const languageOptions = computed<string[]>(() => 
    (languagesName.value ?? []).filter(language => 
        !form.value.languages?.find((i: { name: string }) => i.name === language)
    )
);

const selectedSkillId = ref<number>(0)
const skillOptions = computed<Skill[]>(() => (skills.value?.data ?? []).filter(skill => !form.value.skills?.find(i => i.id === skill.id)))

const { data: skills, fetchData: fetchSkills } = useFetchData<{ data: Skill[] }, ApiErrorResponse>();

fetchSkills('/v1/skills');

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
        form.value.images = form.value.images.concat(newFiles) as File[];
    }
};

const handleRemoveFile = (fileNameToRemove: string) => {
    form.value.images = form.value.images.filter(file => file.name !== fileNameToRemove) as File[];
};

const handleClick = () => {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    fileInput.click();
};

const {sendRequest: updateJob, pending: isSubmitting} = useSubmit<{ data: Project }, ApiErrorResponse>();
const {sendRequest: uploadMedia, pending: isUploading} = useSubmit<{ data: Media }, ApiErrorResponse>();

const submitForm = async () => {
    v$.value.$touch();
    if (v$.value.$invalid) return;

    try {
        const uploadPromises = form.value.images
            .filter(file => file instanceof File)
            .map(file => {
                const formData = new FormData();
                formData.append('file', file);
                return uploadMedia('/v1/medias', {
                    method: 'POST',
                    body: formData,
                });
            });
        
        const uploadResponses = await Promise.all(uploadPromises);
        const uploadedImages = uploadResponses.map(response => response.data.id);
        
        // Extract only the id from Media objects
        const mediaData = form.value.images
            .filter(file => !(file instanceof File))
            .map(media => (media as Media).id);

        const body = ref({
            ...form.value,
            ...(status.value ? { status: status.value } : {}),
            skills: form.value.skills.map(skill => skill.id),
            images: [...uploadedImages, ...mediaData],
        });

        await updateJob(`/v1/client/projects/${props.job.id}`, {
            method: 'PUT',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
            body: body.value,
        });

        isEditModalOpen.value = false;
        emits('submit');
    } catch (error) {
        
    }finally {
        resetJobPosting();
    }
};

</script>

<template>
    <div class="job-card bg-white p-5 ring-1 ring-gray-300 rounded-md hover:cursor-pointer">
        <div class=" border-b-2 border-gray-300 mb-5 pb-3 flex gap-3">
            <Button text="View Job" background="white" foreground="primary" class="ring-1 ring-primary"
                @click="router.push(`/posts/${props.job.id}/details`)" type="button" />
            <Button text="All Proposal" background="white" foreground="primary" class="ring-1 ring-primary"
                @click="router.push(`/posts/${props.job.id}/proposals`)" type="button" />
            <Button text="Invite Freelancers" background="white" foreground="primary" class="ring-1 ring-primary"
                @click="router.push(`/posts/${props.job.id}/invite`)" type="button" />
            <Button text="Hired" background="white" foreground="primary" class="ring-1 ring-primary"
                @click="router.push(`/posts/${props.job.id}/hires`)" type="button" />
        </div>
        <div>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-800">{{ props.job.title }}</h2>
                <div class="relative mt-2 sm:mt-0" v-if="props.options">
                    <Icon @click="dropdownOpen = !dropdownOpen" icon="mi:options-vertical"
                        class="text-2xl hover:cursor-pointer" />
                    <div v-if="dropdownOpen"
                        class="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button @click="handleEdit"
                            class="flex flex-row px-4 py-2 items-center text-gray-700 hover:bg-gray-100 w-full">
                            <Icon icon="mdi:pencil" class="mr-2" />
                            Edit
                        </button>
                        <button @click="handleDelete"
                            class="flex flex-row px-4 py-2 items-center text-gray-700 hover:bg-gray-100 w-full">
                            <Icon icon="mdi:trash-can" class="mr-2" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
            <p class="text-gray-600 mb-4">{{ props.job.description }}</p>
            <div
                class="mt-5 flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between gap-3">
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500">Experience Level:</span>
                    <span class="text-sm font-medium text-gray-700">{{ _.capitalize(props.job.experience_level)
                        }}</span>
                </div>
                <div class="flex items-center space-x-2 mt-2 lg:mt-0">
                    <span class="text-sm text-gray-500">Project Length:</span>
                    <span class="text-sm font-medium text-gray-700">{{ _.startCase(props.job.length?.toLowerCase() ||
                        '') }}</span>
                </div>
            </div>
            <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-2"
                v-if="props.job.languages">
                <span class="text-sm text-gray-500">Languages:</span>
                <div class="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    <span v-for="(language, index) in props.job.languages" :key="index"
                        class="bg-primary/15 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                        {{ language.name }}
                    </span>
                </div>
            </div>
            <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-2"
                v-if="props.job.skills">
                <span class="text-sm text-gray-500">Skills:</span>
                <div class="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    <span v-for="(skill, index) in props.job.skills" :key="index"
                        class="bg-primary/15 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                        {{ skill.name }}
                    </span>
                </div>
            </div>
            <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <span class="text-lg font-semibold text-gray-800">${{ props.job.estimated_budget }}</span>
                <div class="flex flex-col gap-2 sm:gap-3 mt-2 sm:mt-0">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>

    <Modal :modelValue="isEditModalOpen" @update:modelValue="isEditModalOpen = $event">
        <template #title>Job Details</template>
        <template #content>
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
                        <div v-if="!isEditing.title"
                            class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
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
                        <div v-if="!isEditing.length"
                            class="flex flex-row justify-between px-2 py-1 rounded bg-gray-100">
                            <p>{{ _.startCase(formRef.length.toLowerCase()) }}</p>
                        </div>
                        <div v-else>
                            <div
                                class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                                <Icon icon="mdi:calendar" :ssr="true" />
                                <select id="length" v-model="formRef.length"
                                    class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                                    <option v-for="term in Term" :key="term" :value="term">{{
                                        _.startCase(term.toLowerCase()) }}
                                    </option>
                                </select>
                            </div>
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
                            <div
                                class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                                <Icon icon="mdi:account" :ssr="true" />
                                <select id="experience_level" v-model="formRef.experience_level"
                                    class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                                    <option v-for="level in Object.values(Level)" :key="level" :value="level">{{
                                        _.capitalize(level) }}</option>
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
                        <div v-if="!isEditing.languages" class="flex flex-row flex-wrap">
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
                        <div v-if="!isEditing.skills" class="flex flex-row flex-wrap gap-2">
                            <div v-for="(skill, idx) in formRef.skills" :key="`selected-skill-${skill.id}`">
                                <span
                                    class="rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 whitespace-nowrap">
                                    {{ skill.name }}
                                </span>
                            </div>
                        </div>
                        <div v-else>
                            <select id="skills" required @change="onSelectSkill" v-model="selectedSkillId"
                                class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                                <option :value="0">Select Skill</option>
                                <option class="truncate text-sm leading-6 whitespace-nowrap"
                                    v-for="skill in skillOptions" :key="skill.id" :value="skill.id">
                                    {{ skill.name }}
                                </option>
                            </select>
                            <span v-if="v$.skills.$error" class="text-red-900 text-sm">{{ v$.skills.$errors[0].$message
                                }}</span>
                            <div v-if="formRef.skills.length" class="mt-4 flex flex-row flex-wrap">
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

                <div class="flex mt-5 w-full flex-wrap"
                    :class="job.status == 'DRAFT' ? 'justify-between' : 'justify-end'">
                    <Button text="Cancel" type="button" background="white" foreground="primary" @click="{isEditModalOpen = false;
                    resetJobPosting();
                }" />
                    <div class="flex flex-row flex-wrap">
                        <Button v-if="job.status == 'DRAFT'" text="Save as Publish" type="submit" background="white"
                            foreground="primary" @click="{isEditModalOpen = false;
                        status = 'ACTIVE'
                    }" />
                        <Button :is-loading="isSubmitting || isUploading" text="Publish" type="submit"
                            background="primary" foreground="white" />
                    </div>
                </div>
            </form>
        </template>
        <template #actions>

        </template>
    </Modal>
</template>