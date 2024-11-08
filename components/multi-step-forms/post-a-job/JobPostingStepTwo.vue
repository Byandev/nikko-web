<script setup lang="ts">
import { helpers, required } from '@vuelidate/validators';
import { Icon } from '@iconify/vue';
import codes from 'iso-language-codes';
import { jobPostingStore } from '~/store/jobPostingStore';
import { Level, Term } from '~/types/models/Project';
import _ from 'lodash';
import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import type { Language } from '~/types/models/Language';

const emits = defineEmits<{ (e: 'submit'): void; (e: 'back'): void; }>();

interface FormData {
    length: Term;
    experience_level: Level;
    languages: Language[];
    estimated_budget: number;
}

const initialValue: FormData = {
    length: Term.LONG_TERM,
    experience_level: Level.ENTRY,
    languages: [],
    estimated_budget: 0,
}

const languagesName = ref<string[]>(codes.map(code => code.name));

const languageOptions = computed<string[]>(() => 
    (languagesName.value ?? []).filter(language => 
        !form.value.languages?.find((i: { name: string }) => i.name === language)
    )
);

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

            <!-- Experience Level -->
            <div class="mt-4 w-full">
                <label for="experience_level" class="block text-sm font-medium leading-6 text-gray-900">
                    Experience Level <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
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

            <!-- Language -->
            <div class="mt-4 w-full">
                <label for="language" class="block text-sm font-medium leading-6 text-gray-900">
                    Language <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <Listbox v-model="formRef.languages" multiple class="ring-1 ring-gray-300 rounded-md">
                        <div class="relative mt-1">
                            <ListboxButton
                                class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                <span class="block truncate">
                                    <span v-if="formRef.languages.length === 0">Select language</span>
                                    <span v-else>
                                        <span v-for="(language, index) in formRef.languages" :key="index">
                                            {{ language.name }}<span v-if="index < formRef.languages.length - 1">, </span>
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
                                    <ListboxOption v-for="(language, index) in languageOptions" v-slot="{ active, selected }"
                                        :key="index" :value="{name: language}" as="template">
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
                        v$.languages.$errors[0].$message }}</span>
                </div>
            </div>

            <div class="mt-5 flex flex-wrap">
                <div v-for="(language, idx) in formRef.languages" :key="`selected-language-${language}`"
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