import type { Account } from "./Account";
import type { Project } from "./Project";

export enum Status {
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    PROPOSAL_SUBMITTED = 'PROPOSAL_SUBMITTED',
}

export const StatusToText: Record<Status, string> = {
    [Status.PENDING]: "Pending Approval",
    [Status.REJECTED]: "Rejected Proposal",
    [Status.PROPOSAL_SUBMITTED]: "Submitted Proposal",
};

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