import type { Media } from "./Media";
import type { Project } from "./Project";

export interface Proposal {
    account_id: number;
    project_id: number;
    bid: string;
    transaction_fee: string;
    length: string;
    status: string;
    project: Project;
    attachments: Media[];
}