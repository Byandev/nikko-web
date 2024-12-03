import type { Media } from "./Media";

export interface Member {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email_verified_at: string;
    street_address: string;
    city: string;
    state_code: string;
    country_code: string;
    postal: string;
    created_at: string;
    updated_at: string;
    avatar: Media;
}