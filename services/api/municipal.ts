import { config } from "@/services/api/config";
import { fetchJson, qs } from "@/services/api/http";
import type {
  Customer,
  CustomerActivity,
  CustomerNote,
  DashboardSummary,
  Reminder,
} from "@/types/crm";

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

export async function getCustomer(customerId: number): Promise<Customer> {
  const url = `${restBase}/customers?${qs({
    select:
      "id,business_name,bill_to_address,city,state,primary_contact,main_email,main_phone,next_call_date",
    id: `eq.${customerId}`,
    limit: 1,
  })}`;
  const data = await fetchJson<Customer[]>(url, { headers });
  if (!data[0]) {
    throw new Error(`Customer ${customerId} not found`);
  }
  return data[0];
}

export async function listCustomerNotes(customerId: number): Promise<CustomerNote[]> {
  const url = `${restBase}/customer_notes?${qs({
    select: "id,customer_id,content,is_current,created_at,parent_note_id",
    customer_id: `eq.${customerId}`,
    order: "created_at.desc",
  })}`;
  return fetchJson<CustomerNote[]>(url, { headers });
}

export async function addCustomerNote(customerId: number, content: string) {
  const url = `${restBase}/customer_notes`;
  return fetchJson<CustomerNote[]>(
    url,
    {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify([{ customer_id: customerId, content, is_current: true }]),
    },
    12_000
  ).then((rows) => rows[0]);
}

export async function listCustomerActivities(
  customerId: number
): Promise<CustomerActivity[]> {
  const url = `${restBase}/activities?${qs({
    select:
      "id,customer_id,activity_type_id,title,description,activity_date,status,created_at",
    customer_id: `eq.${customerId}`,
    order: "activity_date.desc",
    limit: 50,
  })}`;
  return fetchJson<CustomerActivity[]>(url, { headers });
}

export async function createCustomerActivity(input: {
  customerId: number;
  activityTypeId: number;
  title: string;
  description: string;
  activityDate?: string;
  createReminder?: boolean;
  reminderDays?: number;
}) {
  const activityDate = input.activityDate ?? new Date().toISOString().slice(0, 10);
  const activityRows = await fetchJson<CustomerActivity[]>(
    `${restBase}/activities`,
    {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify([
        {
          customer_id: input.customerId,
          activity_type_id: input.activityTypeId,
          title: input.title,
          description: input.description,
          activity_date: activityDate,
          status: "completed",
          outcome: "",
          follow_up_needed: Boolean(input.createReminder),
          follow_up_date: null,
          custom_fields: {},
        },
      ]),
    },
    12_000
  );

  if (input.createReminder) {
    const days = input.reminderDays ?? 30;
    const due = new Date();
    due.setDate(due.getDate() + days);
    await createReminder({
      customerId: input.customerId,
      title: "Follow-up",
      description: `Follow-up from activity: ${input.title}`,
      reminderDate: due.toISOString().slice(0, 10),
      priority: "medium",
      reminderType: "follow_up",
    });
  }

  return activityRows[0];
}

export async function listReminders(): Promise<Reminder[]> {
  const url = `${restBase}/reminders?${qs({
    select:
      "id,customer_id,title,description,reminder_date,status,priority,reminder_type,completed_at,snoozed_until",
    order: "reminder_date.asc",
    status: "neq.cancelled",
  })}`;
  return fetchJson<Reminder[]>(url, { headers });
}

export async function completeReminder(reminderId: number) {
  const now = new Date().toISOString();
  const url = `${restBase}/reminders?id=eq.${reminderId}`;
  const data = await fetchJson<Reminder[]>(
    url,
    {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify({
        status: "completed",
        completed_at: now,
        updated_at: now,
      }),
    },
    12_000
  );
  return data[0];
}

export async function snoozeReminder(reminderId: number, days = 3) {
  const next = new Date();
  next.setDate(next.getDate() + days);
  const nextDate = next.toISOString().slice(0, 10);
  const now = new Date().toISOString();
  const url = `${restBase}/reminders?id=eq.${reminderId}`;
  const data = await fetchJson<Reminder[]>(
    url,
    {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify({
        status: "snoozed",
        reminder_date: nextDate,
        snoozed_until: next.toISOString(),
        updated_at: now,
      }),
    },
    12_000
  );
  return data[0];
}

export async function createReminder(input: {
  customerId: number;
  title: string;
  description?: string;
  reminderDate: string;
  priority?: "low" | "medium" | "high";
  reminderType?: string;
}) {
  const now = new Date().toISOString();
  const rows = await fetchJson<Reminder[]>(
    `${restBase}/reminders`,
    {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify([
        {
          customer_id: input.customerId,
          title: input.title,
          description: input.description ?? "",
          reminder_date: input.reminderDate,
          status: "pending",
          priority: input.priority ?? "medium",
          reminder_type: input.reminderType ?? "follow_up",
          created_at: now,
          updated_at: now,
        },
      ]),
    },
    12_000
  );
  return rows[0];
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
