 export interface WorkExperience {
    id: number;
    account_id: number;
    job_title: string;
    company: string;
    website: string;
    country: string;
    employment: string;
    description: string;
    start_month: number;
    start_year: number;
    end_month: number | null;
    end_year: number | null;
    is_current: boolean;
    created_at: string;
    updated_at: string;
 }