export interface Customer {
  id: number;
  business_name: string;
  city: string;
  state: string;
  primary_contact: string;
  main_phone: string;
  next_call_date: string | null;
}

export interface Reminder {
  id: number;
  title: string;
  reminder_date: string;
  status: "pending" | "completed" | "snoozed" | "cancelled";
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
