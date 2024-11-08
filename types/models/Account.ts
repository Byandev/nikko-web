import type { User } from './User';
import type { Skill } from './Skill';
import type { Education } from './Education';
import type { WorkExperience } from './WorkExperience';
import type { Tool } from './Tool';

export enum AccountType {
    FREELANCER = 'FREELANCER',
    CLIENT = 'CLIENT'
}

export interface Account {
    id: number;
    bio: string;
    type: AccountType;
    title: string;
    is_saved: boolean;
    created_at: string;
    updated_at: string;
    user: User;
    tools: Tool[];
    skills: Skill[];
    educations: Education[];
    work_experiences: WorkExperience[];
}