<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { authStore } from '~/store/authStore';
import type { Account } from '~/types/models/Account';
import { useAddDetailsStore } from '~/store/addDetailsStore';

const { user } = storeToRefs(authStore());

const { updateUser } = authStore();

interface FormData {
    skills: { name: string }[];
}

const SkillsForm = ref<FormData>({
    skills: [],
});

const { sendRequest: updateSkills } = useSubmit<{ data: Account }, ApiErrorResponse>();

const SubmitSkills = async () => {
    try {
       await updateSkills(`/v1/auth/accounts/${user.value.id}`, {
            method: 'PUT',
            body: {
                skills: SkillsForm.value.skills.map(skill => skill.name),	
            },
        });
        // Update the store with the local copy if needed
    } catch (error) {
        console.log('Error updating skills:', error);
    }
};

defineExpose({
    SubmitSkills,
});

const addSkill = () => {
    SkillsForm.value.skills.push({ name: '' });
};  
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1 class="text-2xl font-bold mb-4">Write a Title for your Profile</h1>
        <span class="text-gray-600 mb-4">Your impression matters. Describe your expertise uniquely to stand out.</span>

        <div v-for="(skill, index) in SkillsForm.skills" :key="index" class="flex flex-row gap-5">
            <!-- Skill -->
            <div class="mt-4 w-full max-w-lg">
                <label for="skillName" class="block text-sm font-medium leading-6 text-gray-900">
                    Skill <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div
                        class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500">
                        <Icon icon="flowbite:language-outline" :ssr="true" />
                        <input type="text" id="skillName" v-model="skill.name"
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                    </div>
                </div>
            </div>
        </div>
        <Button text="Add" type="button" background="primary" foreground="white" @click="addSkill" class="mt-5" />
    </div>
</template>
