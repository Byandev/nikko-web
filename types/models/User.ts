import type { Account } from "./Account"
import type { Media } from "./Media"
import type {Language} from "~/types/models/Language";

export interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    phone_number: string | null
    street_address: string | null
    city: string | null
    state_code: string | null
    country_code: string | null
    postal: string | null
    email_verified_at?: Date
    created_at: Date
    updated_at: Date
    avatar: Media | null
    banner: Media | null
    accounts: Account[]
    languages?: Language[]
}
