<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators';
import { Icon } from '@iconify/vue';
import codes from 'iso-language-codes';
import { jobPostingStore } from '~/store/jobPostingStore';
import { Level, Term } from '~/types/models/Project';
import _ from 'lodash';

const emits = defineEmits<{ (e: 'submit'): void; (e: 'back'): void; }>();

interface FormData {
    length: Term;
    experience_level: Level;
    languages: { name: string }[];
    estimated_budget: number;
}

const initialValue: FormData = {
    length: Term.LONG_TERM,
    experience_level: Level.ENTRY,
    languages: [],
    estimated_budget: 0,
}

const languagesName = ref<string[]>(codes.map(code => code.name));
const selectedLanguageName = ref<string | null>(null);

const languageOptions = computed<string[]>(() => 
    (languagesName.value ?? []).filter(language => 
        !form.value.languages?.find((i: { name: string }) => i.name === language)
    )
);

const onSelect = () => {
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
const { jobPosting } = storeToRefs(jobPostingStore());
const form = ref(jobPosting.value ? {
    length: jobPosting.value.length,
    experience_level: jobPosting.value.experience_level,
    languages: jobPosting.value.languages,
    estimated_budget: jobPosting.value.estimated_budget,
} : initialValue);

const rules = {
    length: { required: helpers.withMessage('Project Length is required', required) },
    experience_level: { required: helpers.withMessage('Experience Level is required', required) },
    languages: { required: helpers.withMessage('Language is required', required) },
    estimated_budget: { required: helpers.withMessage('Estimated Budget is required', required) },
};

const { formRef, v$ } = useValidation(form, rules);

const submitForm = () => {
    v$.value.$touch();
    if (v$.value.$invalid) return;

    jobPosting.value = {
        ...jobPosting.value,
        length: formRef.value.length,
        experience_level: formRef.value.experience_level,
        languages: formRef.value.languages,
        estimated_budget: formRef.value.estimated_budget,
    };

    emits('submit');
};

const onRemoveLanguage = (index: number) => {
    form.value.languages?.splice(index, 1);
}
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1 class="text-2xl font-bold mb-4">Post a Job</h1>
        <span class="text-gray-600 mb-4">Provide detailed information about the job to attract the right
            candidates.</span>

        <form @submit.prevent="submitForm" class="w-full max-w-lg text-left">
            <!-- Project Length -->
            <div class="mt-4 w-full">
                <label for="length" class="block text-sm font-medium leading-6 text-gray-900">
                    Project Length <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div
                        class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:calendar" :ssr="true" />
                        <select id="length" v-model="formRef.length"
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                            <option v-for="term in Term" :key="term" :value="term">{{ _.startCase(term.toLowerCase()) }}
                            </option>
                        </select>
                    </div>
                    <span v-if="v$.length.$error" class="text-red-900 text-sm">{{
                        v$.length.$errors[0].$message }}</span>
                </div>
            </div>

            <!-- Experience Level -->
            <div class="mt-4 w-full">
                <label for="experience_level" class="block text-sm font-medium leading-6 text-gray-900">
                    Experience Level <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
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

            <!-- Language -->
            <div class="mt-4 w-full">
                <label for="language" class="block text-sm font-medium leading-6 text-gray-900">
                    Language <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div>
                        <select @change="onSelect" v-model="selectedLanguageName"
                            class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <option :value=null selected>Select Language</option>
                            <option :value="language" class="truncate text-sm leading-6"
                                v-for="language in languageOptions" :key="language">
                                {{ language }}
                            </option>
                        </select>
                    </div>
                    <span v-if="v$.languages.$error" class="text-red-900 text-sm">{{
                        v$.languages.$errors[0].$message }}</span>
                </div>
            </div>

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

            <!-- Estimated Budget -->
            <div class="mt-4 w-full">
                <label for="estimated_budget" class="block text-sm font-medium leading-6 text-gray-900">
                    Estimated Budget <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div
                        class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="mdi:currency-usd" :ssr="true" />
                        <input type="number" id="estimated_budget" v-model="formRef.estimated_budget"
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                    </div>
                    <span v-if="v$.estimated_budget.$error" class="text-red-900 text-sm">{{
                        v$.estimated_budget.$errors[0].$message }}</span>
                </div>
            </div>

            <div class="flex mt-5 justify-end w-full">
                <Button text="Back" type="button" background="white" foreground="primary" @click="emits('back')" />
                <Button text="Next" type="submit" background="primary" foreground="white" />
            </div>
        </form>
    </div>
</template>