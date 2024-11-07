import { defineStore } from 'pinia';
import { AccountType, type Account } from '~/types/models/Account';

export const profileDisplayStore = defineStore('profileDisplay', () => {

    const initialProfileDisplay: Partial<Account> = {
        id: 0,
        bio: '',
        type: AccountType.FREELANCER,
        title: '',
        created_at: '',
        updated_at: '',
        is_saved: false,
        skills: []
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