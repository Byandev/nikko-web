import type { Account } from "./Account";
import type { Proposal } from "./Proposal";

export interface Contract {
  id: number;
  account_id: number;
  project_id: number;
  proposal_id: number;
  amount: number;
  platform_fee_percentage: number;
  total_amount: number;
  end_date: string;
  status: string;
  account: Account;
  proposal: Proposal;
  created_at: string;
  updated_at: string;
}