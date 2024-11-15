import type { Account } from "./Account";
import type { Language } from "./Language";
import type { Media } from "./Media";
import type { Skill } from "./Skill";
import type { Proposal } from "./Proposal"

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
    estimated_budget: number;
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
    my_proposal?: Proposal
    proposals_count?: number
}



export const ExperienceLevelToText: Record<Level, string> = {
    [Level.ANY]: "Any Experience Level",
    [Level.ENTRY]: "Entry",
    [Level.INTERMEDIATE]: "Intermediate",
    [Level.EXPERT]: "Expert",
};


export const ProjectLengthToText: Record<Term, string> = {
    [Term.SHORT_TERM]: "Under a month",
    [Term.MEDIUM_TERM]: "1 to 3 months",
    [Term.LONG_TERM]: "3 to 6 months",
    [Term.EXTENDED]: "Over 6 months",
};
