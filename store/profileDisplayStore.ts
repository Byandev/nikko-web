import { defineStore } from 'pinia';
import { AccountType } from '~/types/models/Account';
import type { Freelancer } from '~/types/models/Freelancer';

export const profileDisplayStore = defineStore('profileDisplay', () => {

    const initialProfileDisplay: Partial<Freelancer> = {
        id: 0,
        bio: '',
        type: AccountType.FREELANCER,
        title: '',
        created_at: '',
        updated_at: '',
        is_saved: false,
        skills: []
    }
    
    const profileDisplay = ref<Partial<Freelancer>>({
        ...initialProfileDisplay
    });

    const resetProfileDisplay = () => {
        profileDisplay.value = {
            ...initialProfileDisplay
        }
    }
    

    return { profileDisplay, resetProfileDisplay };
});