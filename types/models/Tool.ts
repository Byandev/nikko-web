import type { Pivot } from "./Pivot";

export interface Tool {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  pivot: Pivot;
}