import type { User } from './User';
import type { Language } from './Language';
import type { Skill } from './Skill';
import type { Education } from './Education';
import type { WorkExperience } from './WorkExperience';

export enum AccountType {
    FREELANCER = 'FREELANCER',
    CLIENT = 'CLIENT'
}

export interface Account {
    id: number;
    bio: string;
    type: AccountType;
    title: string;
    created_at: string;
    updated_at: string;
    user: User;
    languages: Language[];
    skills: Skill[];
    educations: Education[];
    work_experiences: WorkExperience[];
     
}