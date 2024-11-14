import type { Account } from "./Account";
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

export enum Status {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
}

export interface Project {
    id: number;
    title: string;
    description: string;
    estimated_budget: string;
    length: Term;
    is_saved: boolean;
    experience_level: Level;
    status: Status, 
    languages: Language[];
    account: Account;
    images: Media[];
    skills: Skill[];
    created_at: string,
    updated_at: string,
}
    