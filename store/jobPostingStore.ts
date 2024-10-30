import { defineStore } from 'pinia';
import type { Language } from '~/types/models/Language';
import { Level, Term } from '~/types/models/Project';
import type { Skill } from '~/types/models/Skill';

export const jobPostingStore = defineStore('jobPosting', () => {

    //The reason for this is the recreate the interface because I want to image to Array of File type becuase the submission is the end of form. 
    interface Project {
        title: string;
        description: string;
        images: File[];
        skills: Skill[];
        project_length: Term;
        experience_level: Level;
        languages: {name: string}[];
        estimated_budget: number;
    }

    const initialJobPosting: Partial<Project> = {
        title: '',
        description: '',
        images: [],
        skills: [],
        project_length: Term.SHORT_TERM,
        experience_level: Level.ENTRY,
        languages: [],
        estimated_budget: 0
    }
   
    const jobPosting = ref<Partial<Project>>({
        ...initialJobPosting
    });

    const resetJobPosting = () => {
        jobPosting.value = {
            ...initialJobPosting
        }
    }

    return { jobPosting, resetJobPosting };
});