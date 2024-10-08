import type { Account } from "./Account"

export interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    email_verified_at?: Date
    created_at: Date
    updated_at: Date
    accounts: Account[]
}
