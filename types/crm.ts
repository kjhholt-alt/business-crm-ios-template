export interface Customer {
  id: number;
  business_name: string;
  bill_to_address?: string;
  city: string;
  state: string;
  primary_contact: string;
  main_email?: string;
  main_phone: string;
  next_call_date: string | null;
}

export interface Reminder {
  id: number;
  customer_id?: number;
  title: string;
  description?: string;
  reminder_date: string;
  status: "pending" | "completed" | "snoozed" | "cancelled";
  priority?: "low" | "medium" | "high";
  reminder_type?: string;
  completed_at?: string | null;
  snoozed_until?: string | null;
  customer?: {
    id: number;
    business_name: string;
    city: string;
    state: string;
    main_phone: string | null;
    bill_to_address: string | null;
  };
}

export interface CustomerNote {
  id: number;
  customer_id: number;
  content: string;
  is_current: boolean;
  created_at: string;
  parent_note_id: number | null;
}

export interface CustomerActivity {
  id: number;
  customer_id: number;
  activity_type_id: number;
  title: string;
  description: string;
  activity_date: string;
  status: string;
  created_at: string;
}

export interface DashboardSummary {
  overdue: number;
  today: number;
  thisWeek: number;
  next30Days: number;
  totalPending: number;
}

export interface ScanStats {
  total_mentions: number;
  cities_with_hits: number;
  active_keywords: number;
  last_scan: {
    id: number;
    started_at: string;
    completed_at: string | null;
    status: string;
    cities_scanned: number;
    total_results: number;
  } | null;
}

export interface ScanResult {
  id: number;
  city: string;
  state: string;
  keyword: string;
  snippet: string;
  source_url: string;
  page_title: string;
  meeting_date: string | null;
  found_at: string;
}

export interface BarrelhousePipelineStats {
  total_leads: number;
  qualified_leads: number;
  meetings_this_week: number;
  conversion_rate: number;
}

export interface ConnectionStatus {
  id: string;
  name: string;
  endpoint: string;
  ok: boolean;
  message: string;
}

export type PipelineStage =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Meeting Scheduled"
  | "Proposal / Bid Sent"
  | "Won / Closed";

export interface Lead {
  id: string | number;
  source: "municipal" | "barrelhouse" | "manual";
  title: string;
  city?: string;
  state?: string;
  score: number;
  stage: PipelineStage;
  nextAction?: string;
  customerId?: number;
}

export type PipelineFilterKey = "hot" | "stale" | "follow_up";
