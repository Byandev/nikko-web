import { defineStore } from 'pinia';
import type {Skill} from "~/types/models/Skill";
import {useFetchData} from "~/composables/useFetchData";
import type {ApiErrorResponse} from "~/types/api/response/error";

export const skillStore = defineStore('skill', () => {
    const { data: skills, fetchData: fetchSkills } = useFetchData<{ data: Skill[] }, ApiErrorResponse>();
    const getSkills = async () => {
       await fetchSkills('/v1/skills')
    }

    return { skills, getSkills };
});
