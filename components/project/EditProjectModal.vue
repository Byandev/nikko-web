<script setup lang="ts">
import { toRefs } from "vue";
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
import { helpers, required } from "@vuelidate/validators";
import _ from "lodash";

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

const {project} = toRefs(props);

const { sendRequest: updateProject } = useSubmit<{ data: Project }, ApiErrorResponse>();
const { data: skillOptions, fetchData: fetchSkills } = useFetchData<{ data: Skill[] }, ApiErrorResponse>();

fetchSkills('/v1/skills');

const onRemoveSelectedSkill = (idx: number) => {
    project.value?.skills.splice(idx, 1);
}

const onRemoveLanguage = (index: number) => {
    project.value?.languages?.splice(index, 1);
}

const rules = {
    title: { required: props.toEdit === 'title' ? helpers.withMessage('Title is required', required) : {} },
    description: { required: props.toEdit === 'description' ? helpers.withMessage('Description is required', required) : {} },
    length: { required: props.toEdit === 'length' ? helpers.withMessage('Length is required', required) : {} },
    experience_level: { required: props.toEdit === 'experience_level' ? helpers.withMessage('Experience level is required', required) : {} },
    languages: { required: props.toEdit === 'languages' ? helpers.withMessage('Languages is required', required) : {} },
    skills: { required: props.toEdit === 'skills' ? helpers.withMessage('Skills is required', required) : false },
    estimated_budget: { required: props.toEdit === 'estimated_budget' ? helpers.withMessage('Estimated budget is required', required) : {} },
};

const { formRef, v$ } = useValidation(project,rules);

const saveProject = () => {
    v$.value.$touch();
    console.log('Errors', v$.value.$errors);
    if (v$.value.$invalid) return;

    console.log("Saving project: ", project.value);
    updateProject(`v1/client/projects/${project.value?.id}`, {
        method: "PUT",
        headers: requestHeaders.value,
        body: {
            title: project.value?.title,
            description: project.value?.description,
            skills: project.value?.skills.map((skill) => skill.id),
            length: project.value?.length,
            level: project.value?.experience_level,
            language: project.value?.languages.map((lang) => lang.id),
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
                        v-if="toEdit === 'title' && project?.title || project?.title == ''">
                        <input v-model="formRef.title" type="text" id="title" name="title"
                            class="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2" />
                        <!-- <span v-if="v$.title.$error" class="text-red-900 text-sm">{{ v$.title.$errors[0].$message
                            }}</span> -->
                    </div>

                    <div class="my-1 text-sm text-gray-900"
                        v-if="toEdit === 'description' && project?.description || project?.description == ''">
                        <textarea v-model="project.description" id="description" name="description"
                            class="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2" />
                    </div>

                    <div class="my-1 text-sm text-gray-900"
                        v-if="toEdit === 'skills' && project?.skills || project?.skills.length == 0">
                        <div class="mt-2">
                            <Listbox v-model="project.skills" multiple class="ring-1 ring-gray-300 rounded-md">
                                <div class="relative mt-1">
                                    <ListboxButton
                                        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span class="block truncate">
                                            <span v-if="project.skills.length === 0">Select Skill</span>
                                            <span v-else>
                                                <span v-for="(skill, index) in project.skills" :key="index">
                                                    {{ skill.name }}<span v-if="index < project.skills.length - 1">,
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
                            <div class="mt-4">
                                <div class="flex flex-wrap mt-2">
                                    <div v-for="(skill, idx) in project.skills" :key="`selected-skill-${skill.id}`"
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

                    <div class="my-1 text-sm text-gray-900"
                        v-if="toEdit === 'length' && project?.length || project?.length.length == 0">
                        <div class="mt-2">
                            <Listbox v-model="project.length" class="ring-1 ring-gray-300 rounded-md">
                                <div class="relative mt-1">
                                    <ListboxButton
                                        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span class="block truncate">
                                            <span v-if="!project.length">Project Length</span>
                                            <span v-else>
                                                <span>
                                                    {{_.capitalize(_.startCase(project.length))}}
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
                        </div>
                    </div>

                    <div class="my-1 text-sm text-gray-900"
                        v-if="toEdit === 'experience_level' && project?.experience_level">
                        <div class="mt-2">
                            <Listbox v-model="project.experience_level" class="ring-1 ring-gray-300 rounded-md">
                                <div class="relative mt-1">
                                    <ListboxButton
                                        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span class="block truncate">
                                            <span v-if="!project.length">Experience Level</span>
                                            <span v-else>
                                                <span>
                                                    {{ _.capitalize(_.startCase(project.experience_level)) }}
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
                        </div>
                    </div>

                    <div class="my-1 text-sm text-gray-900"
                        v-if="toEdit === 'languages' && project?.languages || project?.languages.length == 0">
                        <div class="mt-2">
                            <Listbox v-model="project.languages" multiple class="ring-1 ring-gray-300 rounded-md">
                                <div class="relative mt-1">
                                    <ListboxButton
                                        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span class="block truncate">
                                            <span v-if="project.languages.length === 0">Select Language</span>
                                            <span v-else>
                                                <span v-for="(language, index) in project.languages" :key="index">
                                                    {{ language.name }}<span v-if="index < project.skills.length - 1">,
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
                            <div class="mt-4">
                                <div class="flex flex-wrap mt-2">
                                    <div v-for="(language, idx) in project.languages"
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
            <Button text="Cancel" type="button" background="white" foreground="gray"
                @click="emit('toggle-open', false)" />
            <Button text="Save" type="button" background="primary" foreground="white" @click="saveProject" />
        </template>
    </Modal>
</template>
