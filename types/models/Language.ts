export enum Proficiency {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    FLUENT = 'FLUENT',
}

export interface Language {
    id: number;
    user_id: number;
    name: string;
    proficiency: Proficiency;
    created_at: string;
    updated_at: string;
}