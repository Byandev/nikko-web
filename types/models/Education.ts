 export interface Education {
    id: number;
    account_id: number;
    country: string;
    degree: string;
    description: string;
    start_month: number;
    start_year: number;
    end_month: number | null;
    end_year: number | null;
    created_at: string;
    updated_at: string;
 }