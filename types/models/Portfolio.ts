import type { Media } from "./Media"

export interface Portfolio {
    id: string
    title: string
    description: string
    url: string
    created_at: string
    updated_at: string
    images: Media[]

}
