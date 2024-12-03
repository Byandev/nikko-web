import type { Member } from "./Member";

export interface Channel {
    id: number;
    subject_id: number;
    subject_type: string;
    title: string;
    last_activity_at: string;
    created_at: string;
    updated_at: string;
    members: Member[];
}