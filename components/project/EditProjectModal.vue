<script setup lang="ts">
import Button from "~/components/ui/Button.vue";
import type { ApiErrorResponse } from "~/types/api/response/error";
import { Level, Term, type Project } from "~/types/models/Project";
import { accountStore } from "~/store/accountStore";
import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import type { Skill } from "~/types/models/Skill";
import codes from 'iso-language-codes';
import { helpers, requiredIf } from "@vuelidate/validators";
import _ from "lodash";
import type { Language } from "~/types/models/Language";

const props = defineProps<{
    project?: Project;
    header: string;
    isOpen: boolean;
    toEdit: string;
}>();

const emit = defineEmits<{
    (e: "toggle-open", isOpen: boolean): void;
}>();

const { account } = storeToRefs(accountStore());

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);


const { sendRequest: updateProject } = useSubmit<{ data: Project }, ApiErrorResponse>();
const { data: skillOptions, fetchData: fetchSkills } = useFetchData<{ data: Skill[] }, ApiErrorResponse>();

fetchSkills('/v1/skills');


const form = reactive({
    title: "",
    description: "",
    skills: [] as Skill[],
    length: "",
    experience_level: "",
    languages: [] as Language[],    
});

watch(
    () => props.project,
    (newProject) => {
        if (newProject) {
            form.title = newProject.title;
            form.description = newProject.description;
            form.skills = newProject.skills ? [...newProject.skills] : [];
            form.length = newProject.length;
            form.experience_level = newProject.experience_level;
            form.languages = newProject.languages ? [...newProject.languages] : [];
        }
    },
    { immediate: true }
);

const rules = {
    title: { required: helpers.withMessage('Title is required', requiredIf(() => props.toEdit === 'title')) },
    description: { required: helpers.withMessage('Description is required', requiredIf(() => props.toEdit === 'description')) },
    skills: { required: helpers.withMessage('Skills is required', requiredIf(() => props.toEdit === 'skills')) },
    length: { required: helpers.withMessage('Length is required', requiredIf(() => props.toEdit === 'length')) },
    experience_level: { required: helpers.withMessage('Experience level is required', requiredIf(() => props.toEdit === 'experience_level')) },
    languages: { required: helpers.withMessage('Languages is required', requiredIf(() => props.toEdit === 'languages')) },
};

const { v$ } = useValidation(form, rules);

const onRemoveSelectedSkill = (idx: number) => {
    if (form?.skills) {
        form.skills.splice(idx, 1);
    }
}

const onRemoveLanguage = (index: number) => {
    form?.languages?.splice(index, 1);
}

const saveProject = async () => {
    v$.value.$touch();
    if (v$.value.$invalid) return;

    await updateProject(`v1/client/projects/${props.project?.id}`, {
        method: "PUT",
        headers: requestHeaders.value,
        body: {
            title: form.title,
            description: form.description,
            skills: form.skills.map((skill) => skill.id) ?? [],
            length: form.length,
            level: form.experience_level,
            languages: form.languages.map((lang) => ({ name: lang.name })) ?? [],
        },
    });
    emit("toggle-open", false);
};
</script>

<template>
    <Modal :modelValue="isOpen" @update:modelValue="emit('toggle-open', !isOpen)" @close="emit('toggle-open', false)">
        <template #title>
            <h2>Edit {{ header }}</h2>
        </template>
        <template #content>
            <div class="space-y-6">
                <div class="flex flex-col">
                    <div class="my-1 text-sm text-gray-900"
                        v-if="props.toEdit === 'title' && form?.title || form?.title == ''">
                        <input v-model="form.title" type="text" id="title" name="title"
                            class="w-full ring-1 ring-gray-300 rounded-md shadow-sm focus:ring-opacity-50 p-2" />
                        <span v-if="v$.title.$error" class="text-red-900 text-sm mt-3">{{ v$.title.$errors[0].$message
                            }}</span>
                    </div>

                    <div class="my-1 text-sm text-gray-900" v-if="toEdit === 'description' && form?.description || form?.description == ''">
                        <textarea v-model="form.description" id="description" name="description"
                            class="w-full ring-1 ring-gray-300 rounded-md shadow-sm focus:ring-opacity-50 p-2" />
                        <span v-if="v$.description.$error" class="text-red-900 text-sm mt-3">{{
                            v$.description.$errors[0].$message
                            }}</span>
                    </div>

                    <div class="my-1 text-sm text-gray-900" v-if="toEdit === 'skills' && form.skills || form.skills.length == 0">
                        <div class="mt-2">
                            <Listbox v-model="form.skills" multiple class="ring-1 ring-gray-300 rounded-md">
                                <div class="relative mt-1">
                                    <ListboxButton
                                        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span class="block truncate">
                                            <span v-if="(form.skills ?? []).length === 0">Select Skill</span>
                                            <span v-else>
                                                <span v-for="(skill, index) in form.skills" :key="index">
                                                    {{ skill.name }}<span
                                                        v-if="form.skills && index < form.skills.length - 1">,
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                        <span
                                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </span>
                                    </ListboxButton>

                                    <transition leave-active-class="transition duration-100 ease-in"
                                        leave-from-class="opacity-100" leave-to-class="opacity-0">
                                        <ListboxOptions
                                            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                            <ListboxOption v-for="(skill, index) in skillOptions?.data"
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
                            <span v-if="v$.skills.$error" class="text-red-900 text-sm mt-3">{{
                                v$.skills.$errors[0].$message
                                }}</span>
                            <div class="mt-4">
                                <div class="flex flex-wrap mt-2">
                                    <div v-for="(skill, idx) in form.skills" :key="`selected-skill-${skill.id}`"
                                        class="mr-2 my-1">
                                        <span
                                            class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                            {{ skill.name }}
                                            <button @click="onRemoveSelectedSkill(idx)" type="button"
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

                    <div class="my-1 text-sm text-gray-900" v-if="toEdit === 'length' && form?.length || form?.length.length == 0">
                        <div class="mt-2">
                            <Listbox v-model="form.length" class="ring-1 ring-gray-300 rounded-md">
                                <div class="relative mt-1">
                                    <ListboxButton
                                        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span class="block truncate">
                                            <span v-if="!form.length">Project Length</span>
                                            <span v-else>
                                                <span>
                                                    {{_.capitalize(_.startCase(form.length))}}
                                                </span>
                                            </span>
                                        </span>
                                        <span
                                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
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
                            <span v-if="v$.length.$error" class="text-red-900 text-sm mt-3">{{
                                v$.length.$errors[0].$message
                                }}</span>
                        </div>
                    </div>

                    <div class="my-1 text-sm text-gray-900"
                        v-if="toEdit === 'experience_level' && form?.experience_level">
                        <div class="mt-2">
                            <Listbox v-model="form.experience_level" class="ring-1 ring-gray-300 rounded-md">
                                <div class="relative mt-1">
                                    <ListboxButton
                                        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span class="block truncate">
                                            <span v-if="!form.length">Experience Level</span>
                                            <span v-else>
                                                <span>
                                                    {{ _.capitalize(_.startCase(form.experience_level)) }}
                                                </span>
                                            </span>
                                        </span>
                                        <span
                                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </span>
                                    </ListboxButton>

                                    <transition leave-active-class="transition duration-100 ease-in"
                                        leave-from-class="opacity-100" leave-to-class="opacity-0">
                                        <ListboxOptions
                                            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                            <ListboxOption v-for="(level, index) in Level" v-slot="{ active, selected }"
                                                :key="index" :value="level" as="template">
                                                <li
                                                    :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                                                    <span
                                                        :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                                                        _.capitalize(_.startCase(level))
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
                            <span v-if="v$.experience_level.$error" class="text-red-900 text-sm mt-3">{{
                                v$.experience_level.$errors[0].$message
                                }}</span>
                        </div>
                    </div>

                    <div class="my-1 text-sm text-gray-900" v-if="toEdit === 'languages' && form.languages || form.languages.length == 0">
                        <div class="mt-2">
                            <Listbox v-model="form.languages" multiple class="ring-1 ring-gray-300 rounded-md">
                                <div class="relative mt-1">
                                    <ListboxButton
                                        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span class="block truncate">
                                            <span v-if="(form.languages ?? []).length === 0">Select Language</span>
                                            <span v-else>
                                                <span v-for="(language, index) in form.languages" :key="index">
                                                    {{ language.name }}<span
                                                        v-if="index < (form.skills ?? []).length - 1">,
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                        <span
                                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </span>
                                    </ListboxButton>

                                    <transition leave-active-class="transition duration-100 ease-in"
                                        leave-from-class="opacity-100" leave-to-class="opacity-0">
                                        <ListboxOptions
                                            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                            <ListboxOption v-for="(language, index) in codes"
                                                v-slot="{ active, selected }" :key="index" :value="language"
                                                as="template">
                                                <li
                                                    :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                                                    <span
                                                        :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                                                        language.name
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
                            <span v-if="v$.languages.$error" class="text-red-900 text-sm mt-3">{{
                                v$.languages.$errors[0].$message
                                }}</span>
                            <div class="mt-4">
                                <div class="flex flex-wrap mt-2">
                                    <div v-for="(language, idx) in form.languages"
                                        :key="`selected-language-${language.id}`" class="mr-2 my-1">
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
                </div>
            </div>
        </template>
        <template #actions>
            <Button text="Close" type="button" background="primary" foreground="white" @click="saveProject" />
        </template>
    </Modal>
</template>
