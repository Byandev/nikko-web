import type {User} from "~/types/models/User";

export interface AuthenticationResponse {
    access_token: string,
    user: User
}
