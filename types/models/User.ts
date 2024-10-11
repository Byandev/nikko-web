import type { Account } from "./Account"
import type { Media } from "./Media"

export interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    email_verified_at?: Date
    created_at: Date
    updated_at: Date
    avatar: Media | null
    banner: Media | null
    accounts: Account[]
}
