import type { AccountType } from "./Account";
import type { Skill } from "./Skill";
import type { User } from "./User";

export interface Freelancer {
    id: number;
    bio: string | null;
    type: AccountType;
    title: string | null;
    created_at: string;
    updated_at: string;
    is_saved: boolean;
    user: User;
    skills: Skill[];
}