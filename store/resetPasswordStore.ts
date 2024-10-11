import { defineStore } from 'pinia'

export const useResetPasswordStore = defineStore("resetPassword", () => {

    const email = ref('');
    const token = ref('');

    const setEmail = (value: string) => {
        email.value = value;
    }

    const setToken = (value: string) => {
        token.value = value;
    }

    const resetData = () => {
        email.value = '';
        token.value = '';
    }   

    return{
        email,
        token,
        setEmail,
        setToken,
        resetData
    }
});