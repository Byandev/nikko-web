import type { Language } from "./Language";
import type { Media } from "./Media";
import type { Skill } from "./Skill";

export enum Level {
    ANY = 'ANY',
    ENTRY = 'ENTRY',
    INTERMEDIATE = 'INTERMEDIATE',
    EXPERT = 'EXPERT',
}

export enum Term {
    SHORT_TERM = 'SHORT_TERM',
    MEDIUM_TERM = 'MEDIUM_TERM',
    LONG_TERM = 'LONG_TERM',
    EXTENDED = 'EXTENDED',
}

export interface Project {
    title: string;
    description: string;
    estimated_budget: string;
    length: Term;
    experience_level: Level;
    languages: Language[];
    images: Media[];
    skills: Skill[];
}
    