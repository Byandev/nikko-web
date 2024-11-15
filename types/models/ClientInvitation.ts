import type { Account } from "./Account";
import type { Project } from "./Project";

export enum Status {
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    PROPOSAL_SUBMITTED = 'PROPOSAL_SUBMITTED',
}

export interface ClientInvitation {
    id: number;
    account_id: number;
    project_id: number;
    message: string;
    rejection_message: string | null;
    status: Status;
    account: Account;
    project: Project;
}