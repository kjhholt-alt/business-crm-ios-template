import { config } from "@/services/api/config";
import { fetchJson, qs } from "@/services/api/http";
import type { Customer, DashboardSummary, Reminder } from "@/types/crm";

const restBase = `${config.supabaseUrl}/rest/v1`;
const headers = {
  apikey: config.supabaseAnonKey,
  Authorization: `Bearer ${config.supabaseAnonKey}`,
  "Content-Type": "application/json",
};

function sameDay(a: Date, b: Date) {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

export async function listCustomers(search = ""): Promise<Customer[]> {
  const where = search
    ? `&or=${encodeURIComponent(
        `business_name.ilike.%${search}%,city.ilike.%${search}%,primary_contact.ilike.%${search}%`
      )}`
    : "";
  const url = `${restBase}/customers?${qs({
    select:
      "id,business_name,city,state,primary_contact,main_phone,next_call_date",
    order: "business_name.asc",
    is_active: "eq.true",
  })}${where}`;
  return fetchJson<Customer[]>(url, { headers });
}

export async function listReminders(): Promise<Reminder[]> {
  const url = `${restBase}/reminders?${qs({
    select: "id,title,reminder_date,status",
    order: "reminder_date.asc",
    status: "neq.cancelled",
  })}`;
  return fetchJson<Reminder[]>(url, { headers });
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const reminders = await listReminders();
  const today = new Date();
  const week = new Date();
  week.setDate(today.getDate() + 7);
  const d30 = new Date();
  d30.setDate(today.getDate() + 30);

  let overdue = 0;
  let dueToday = 0;
  let thisWeek = 0;
  let next30Days = 0;

  reminders.forEach((r) => {
    if (r.status !== "pending" && r.status !== "snoozed") return;
    const dt = new Date(`${r.reminder_date}T00:00:00`);
    if (dt < today && !sameDay(dt, today)) overdue += 1;
    if (sameDay(dt, today)) dueToday += 1;
    if (dt >= today && dt <= week) thisWeek += 1;
    if (dt >= today && dt <= d30) next30Days += 1;
  });

  return {
    overdue,
    today: dueToday,
    thisWeek,
    next30Days,
    totalPending: reminders.filter((r) => r.status === "pending").length,
  };
}
