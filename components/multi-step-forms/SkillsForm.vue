<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { authStore } from '~/store/authStore';
import { useAddDetailsStore } from '~/store/addDetailsStore';
import type { Account } from '~/types/models/Account';
import type { Skill } from '~/types/models/Skill';

const { user } = storeToRefs(authStore());
const { ListSkills, Skills } = storeToRefs(useAddDetailsStore());

const { setSkills } = useAddDetailsStore();

const { updateUser } = authStore();

interface FormData {
    skills: { id: number, name: string }[];
}

const SkillsForm = ref<FormData>({
    skills: [...Skills.value],
});

const availableSkills = ref<Skill[]>(ListSkills.value?.data);

const selectedSkill = ref<string>('');
const filteredSkills = ref<Skill[]>([]);

const { sendRequest: updateSkills } = useSubmit<{ data: Account }, ApiErrorResponse>();

const SubmitSkills = async () => {
    try {
       await updateSkills(`/v1/auth/accounts/${user.value.id}`, {
            method: 'PUT',
            body: {
                skills: SkillsForm.value.skills.map(skill => skill.id),    
            },
        });
        setSkills(SkillsForm.value.skills);
    } catch (error) {
        console.log('Error updating skills:', error);
    }
};

defineExpose({
    SubmitSkills,
});

const addSkill = () => {
    const skill = availableSkills.value.find(skill => skill.name === selectedSkill.value);
    if (skill && !SkillsForm.value.skills.some(s => s.id === skill.id)) {
        SkillsForm.value.skills.push({ id: skill.id, name: skill.name });
        selectedSkill.value = '';
    }
};  

const removeSkill = (index: number) => {
    SkillsForm.value.skills.splice(index, 1);
};

const filterSkills = () => {
    const query = selectedSkill.value.toLowerCase();
    filteredSkills.value = availableSkills.value.filter(skill => skill.name.toLowerCase().includes(query));
};

const selectSkill = (skill: Skill) => {
    selectedSkill.value = skill.name;
    filteredSkills.value = [];
};
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1 class="text-2xl font-bold mb-4">List Your Skills</h1>
        <span class="text-gray-600 mb-4">Showcase your expertise by listing your skills.</span>

        <div class="flex flex-wrap gap-2 mb-6">
            <div v-for="(skill, index) in SkillsForm.skills" :key="index" class="flex items-center bg-primary-100 text-primary-700 py-1 px-3 rounded-full shadow-sm bg-primary text-white">
                <span class="text-lg">{{ skill.name }}</span>
                <button @click="removeSkill(index)" class="ml-2 text-primary-700 hover:text-primary-900">
                    <Icon icon="mdi:close" />
                </button>
            </div>
        </div>

        <div class="relative w-full">
                <input
                    v-model="selectedSkill"
                    @input="filterSkills"
                    type="text"
                    placeholder="Type a skill"
                    class="block w-full px-4 py-2 rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500"
                />
                <ul v-if="filteredSkills.length" class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                    <li
                        v-for="skill in filteredSkills"
                        :key="skill.id"
                        @click="selectSkill(skill)"
                        class="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                        {{ skill.name }}
                    </li>
                </ul>
            </div>

            <Button text="Add" type="button" background="primary" foreground="white" @click="addSkill" class="mt-5 w-full sm:w-auto px-4 py-2 rounded-md shadow-md bg-primary-600 text-white hover:bg-primary-700 transition duration-300" />
    </div>
</template>