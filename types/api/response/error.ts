import type {FetchError} from "ofetch";

export interface ApiErrorResponse extends FetchError {
    data: {
        message: string
        errors: {
            [key: string]: string[]
        }
    }
}
