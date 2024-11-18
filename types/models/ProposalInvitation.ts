import type { Project } from "./Project";
import type {Account} from "~/types/models/Account";

export enum ProposalInvitationStatus {
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    PROPOSAL_SUBMITTED = 'PROPOSAL_SUBMITTED',
}

export interface ProposalInvitation {
    id: number;
    account_id: number;
    project_id: number;
    message: number;
    rejection_message: number;
    status: ProposalInvitationStatus;
    account: Account;
    project?: Project;
}
