import type { Media } from "./Media";
import type { Skill } from "./Skill";

export enum Level {
    ENTRY = 'ENTRY',
    INTERMEDIATE = 'INTERMEDIATE',
    EXPERT = 'EXPERT',
}

export interface Job {
    title: string;
    description: string;
    images: Media[];
    skills: Skill[];
    projectLength: string;
    experienceLevel: Level;
    language: string;
    estimatedBudget: string;
}
    