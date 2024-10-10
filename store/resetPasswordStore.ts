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

    return{
        email,
        token,
        setEmail,
        setToken
    }
});