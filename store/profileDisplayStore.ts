import { defineStore } from 'pinia';

export const profileDisplayStore = defineStore('profileDisplay', () => {

    interface Account {
        id: number;
        user: {
            avatar: {
                original_url: string;
            };
            banner: {
                original_url: string;
            };
            first_name: string;
            last_name: string;
            created_at: string;
            country_code: string;
        };
        title: string;
        skills: { id: number; name: string }[];
        bio: string;
    }

    const initialProfileDisplay: Partial<Account> = {
        id: 0,
        user: {
            avatar: {
                original_url: ''
            },
            banner: {
                original_url: ''
            },
            first_name: '',
            last_name: '',
            created_at: '',
            country_code: ''
        },
        title: '',
        skills: [],
        bio: ''
    }
    
    const profileDisplay = ref<Partial<Account>>({
        ...initialProfileDisplay
    });

    const resetProfileDisplay = () => {
        profileDisplay.value = {
            ...initialProfileDisplay
        }
    }
    

    return { profileDisplay, resetProfileDisplay };
});