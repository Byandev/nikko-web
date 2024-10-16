import { defineStore } from 'pinia'

export const useAddDetailsStore = defineStore("addDetails", () => {

    const Profile = ref({
        title: '',
        bio: '',
    });

    const setProfile = (title: string, bio: string) => {
        Profile.value.title = title;
        Profile.value.bio = bio;
    }

    return{
        Profile,
        setProfile,
    }
});