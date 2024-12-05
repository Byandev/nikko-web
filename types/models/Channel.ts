import type { User } from "./User";

export interface Channel {
    id: number;
    subject_id: number;
    subject_type: string;
    title: string;
    last_activity_at: string;
    created_at: string;
    updated_at: string;
    members: User[];
}