import type { Media } from "./Media"

export interface Certificate {
    id: string
    account_id: number;
    title: string
    issued_date: string
    reference_id: string
    url: string
    created_at: string
    updated_at: string
    image: Media
}
