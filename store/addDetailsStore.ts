import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';
import type { Language } from '~/types/models/Language';
import type { Skill } from '~/types/models/Skill';
import { useFetchData } from '~/composables/useFetchData';
import type { ApiErrorResponse } from '~/types/api/response/error';

export const useAddDetailsStore = defineStore("addDetails", () => {

    const { data: ListSkills, fetchData: fetchSkills } = useFetchData<{ data: Skill[] }, ApiErrorResponse>();

    const Profile = ref({
        title: '',
        bio: '',
    });

    const Languages = ref<Language[]>([]);
    const Skills = ref<Skill[]>([]);

    const setProfile = (title: string, bio: string) => {
        Profile.value.title = title;
        Profile.value.bio = bio;
    }

    const setLanguages = (languages: Language[]) => {
        Languages.value = languages;
    }

    const setSkills = (skills: Skill[]) => {
        Skills.value = skills;
    }

    onMounted(async () => {
        await fetchSkills('/v1/skills');
    });

    return {
        Profile,
        setProfile,
        Languages,
        setLanguages,
        Skills,
        setSkills,
        ListSkills
    }
});