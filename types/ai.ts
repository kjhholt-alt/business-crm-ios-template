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

export interface AiNoteSummaryRequest {
  customerName?: string;
  notes: { content: string; created_at: string }[];
  activities: { title: string; description: string; activity_date: string }[];
}

export interface AiNoteSummaryResponse {
  summary: string;
  highlights: string[];
  nextActions: string[];
}

export interface AiFollowUpDraft {
  channel: "email" | "sms" | "call";
  subject?: string;
  body: string;
}

export interface AiFollowUpsResponse {
  followUps: AiFollowUpDraft[];
}

export interface AiLeadFitResponse {
  summary: string;
  reasons: string[];
  risks: string[];
}
