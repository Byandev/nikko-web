import type { Media } from "./Media";
import type { User } from "./User";

export interface Message {
    id: number;
    channel_id: number;
    sender_id: number;
    content: string;
    created_at: string;
    updated_at: string;
    sender: User;
    attachments: Media[];
}