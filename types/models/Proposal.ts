import type { Account } from "./Account";
import type { Contract } from "./Contract";
import type { Media } from "./Media";
import type { Project } from "./Project";

export interface Proposal {
    id: number;
    account_id: number;
    project_id: number;
    bid: number;
    transaction_fee: number;
    length: string;
    status: string;
    is_saved: boolean;
    cover_letter: string;
    project: Project;
    account: Account;
    contract: Contract;
    attachments: Media[];
}