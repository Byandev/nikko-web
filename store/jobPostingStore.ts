import { defineStore } from 'pinia';
import { Level } from '~/types/models/Job';
import type { Skill } from '~/types/models/Skill';

export const jobPostingStore = defineStore('jobPosting', () => {

    interface Job {
        title: string;
        description: string;
        images: File[];
        skills: Skill[];
        projectLength: string;
        experienceLevel: Level;
        language: string;
        estimatedBudget: string;
    }
   
    const jobPosting = ref<Partial<Job>>({
        title: '',
        description: '',
        images: [],
        skills: [],
        projectLength: '',
        experienceLevel: Level.ENTRY,
        language: '',
        estimatedBudget: ''
    });

    const resetJobPosting = () => {
        jobPosting.value = {
            title: '',
            description: '',
            images: [],
            skills: [],
            projectLength: '',
            experienceLevel: Level.ENTRY,
        }
    }

    return { jobPosting, resetJobPosting };
});