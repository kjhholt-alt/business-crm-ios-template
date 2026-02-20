import type { Lead } from "@/types/crm";

export interface AiBriefRequest {
  leads: Lead[];
}

export interface AiBriefFollowUp {
  id: string;
  title: string;
  suggestion: string;
}

export interface AiBriefResponse {
  summary: string;
  hotInsight: string;
  followUps: AiBriefFollowUp[];
}
