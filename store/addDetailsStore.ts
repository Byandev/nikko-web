import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Language {
    name: string;
    proficiency: string;
}

export const useAddDetailsStore = defineStore("addDetails", () => {

    const Profile = ref({
        title: '',
        bio: '',
    });

    const Languages = ref<Language[]>([]);

    const setProfile = (title: string, bio: string) => {
        Profile.value.title = title;
        Profile.value.bio = bio;
    }

    const setLanguages = (languages: Language[]) => {
        console.log(languages);
        Languages.value = languages;
    }

    return {
        Profile,
        setProfile,
        Languages,
        setLanguages
    }
});