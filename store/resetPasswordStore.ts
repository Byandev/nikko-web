import { defineStore } from 'pinia'

export const useResetPasswordStore = defineStore("resetPassword", () => {

    const resetPasswordData = ref<{ email: string; token: string }>({ email: '', token: '' });

    return{
        resetPasswordData
    }
});