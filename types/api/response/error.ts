import type {FetchError} from "ofetch";

export interface FormErrorsType {
    [key: string]: string | string[];
}


export interface ApiErrorResponse extends FetchError {
    data: {
        message: string
        errors: FormErrorsType
    }
}
