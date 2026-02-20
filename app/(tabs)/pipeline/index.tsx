import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";
import { AppCard, LoadingBlock } from "@/components/ui";
import { useBarrelhouseStats, useDashboardSummary, useReminders } from "@/hooks/use-crm-data";
import type { Lead, PipelineStage, Reminder } from "@/types/crm";

export default function PipelineScreen() {
  const barrelhouse = useBarrelhouseStats();
  const municipal = useDashboardSummary();
  const reminders = useReminders();
  const [leads, setLeads] = useState<Lead[]>(seedLeads);

  const municipalLeads = useMemo(
    () =>
      (reminders.data ?? [])
        .filter((r) => r.status === "pending" || r.status === "snoozed")
        .slice(0, 8),
    [reminders.data]
  );

  const stageCounts = useMemo(() => {
    const counts: Record<PipelineStage, number> = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      "Meeting Scheduled": 0,
      "Proposal / Bid Sent": 0,
      "Won / Closed": 0,
    };
    leads.forEach((lead) => {
      counts[lead.stage] += 1;
    });
    return counts;
  }, [leads]);

  const priorityQueues = useMemo(() => buildPriorityQueues(leads), [leads]);
  const myDay = useMemo(
    () =>
      leads.filter((lead) =>
        ["Contacted", "Qualified", "Meeting Scheduled"].includes(lead.stage)
      ),
    [leads]
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pipeline</Text>
      <Text style={styles.subtitle}>
        BarrelHouse structure merged with municipal follow-up workflow.
      </Text>

      <AppCard title="BarrelHouse Pipeline KPIs" subtitle="Optional external CRM API">
        {barrelhouse.isLoading ? <LoadingBlock /> : null}
        {!barrelhouse.data ? (
          <Text style={styles.note}>
            Not connected yet. Set `EXPO_PUBLIC_BARRELHOUSE_API_BASE` to enable.
          </Text>
        ) : (
          <View style={styles.metrics}>
            <Metric label="Total Leads" value={barrelhouse.data.total_leads} />
            <Metric label="Qualified" value={barrelhouse.data.qualified_leads} />
            <Metric label="Meetings" value={barrelhouse.data.meetings_this_week} />
            <Metric
              label="Conversion"
              value={`${barrelhouse.data.conversion_rate.toFixed(1)}%`}
            />
          </View>
        )}
      </AppCard>

      <AppCard title="Municipal Follow-up Queue">
        <Metric label="Overdue" value={municipal.data?.overdue ?? 0} />
        <Metric label="Due Today" value={municipal.data?.today ?? 0} />
        <Metric label="This Week" value={municipal.data?.thisWeek ?? 0} />
      </AppCard>

      <AppCard title="Municipal Leads" subtitle="Pull open reminders into pipeline">
        {reminders.isLoading ? <LoadingBlock label="Loading reminders..." /> : null}
        {municipalLeads.length === 0 ? (
          <Text style={styles.note}>No open reminders to add.</Text>
        ) : (
          municipalLeads.map((reminder) => (
            <View key={reminder.id} style={styles.leadRow}>
              <View style={styles.leadInfo}>
                <Text style={styles.leadTitle}>
                  {reminder.customer?.business_name ?? reminder.title}
                </Text>
                <Text style={styles.leadMeta}>
                  Due {reminder.reminder_date} â€¢ {reminder.customer?.city}, {reminder.customer?.state}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  setLeads((prev) => addLeadFromReminder(prev, reminder))
                }
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </AppCard>

      <AppCard title="My Day" subtitle="Leads needing action today">
        {myDay.length === 0 ? (
          <Text style={styles.note}>No priority leads right now.</Text>
        ) : (
          myDay.map((lead) => (
            <View key={`day-${lead.id}`} style={styles.pipelineCard}>
              <View style={styles.pipelineHeader}>
                <Text style={styles.leadTitle}>{lead.title}</Text>
                <Text style={styles.score}>{lead.score}</Text>
              </View>
              <Text style={styles.leadMeta}>
                {lead.city ?? "—"} {lead.state ? `• ${lead.state}` : ""}
              </Text>
              <Text style={styles.stageTag}>{lead.stage}</Text>
              {lead.nextAction ? (
                <Text style={styles.nextAction}>Next: {lead.nextAction}</Text>
              ) : null}
            </View>
          ))
        )}
      </AppCard>

      <AppCard title="Priority Queues" subtitle="Hot, stale, and needs follow-up">
        {priorityQueues.hot.length === 0 ? (
          <Text style={styles.note}>No hot leads yet.</Text>
        ) : (
          priorityQueues.hot.map((lead) => (
            <View key={`hot-${lead.id}`} style={styles.queueRow}>
              <Text style={styles.queueLabel}>Hot</Text>
              <Text style={styles.queueTitle}>{lead.title}</Text>
            </View>
          ))
        )}
        {priorityQueues.stale.length === 0 ? null : (
          priorityQueues.stale.map((lead) => (
            <View key={`stale-${lead.id}`} style={styles.queueRow}>
              <Text style={[styles.queueLabel, styles.queueStale]}>Stale</Text>
              <Text style={styles.queueTitle}>{lead.title}</Text>
            </View>
          ))
        )}
        {priorityQueues.needsFollowUp.length === 0 ? null : (
          priorityQueues.needsFollowUp.map((lead) => (
            <View key={`follow-${lead.id}`} style={styles.queueRow}>
              <Text style={[styles.queueLabel, styles.queueFollow]}>Follow-up</Text>
              <Text style={styles.queueTitle}>{lead.title}</Text>
            </View>
          ))
        )}
      </AppCard>

      <AppCard title="Active Pipeline" subtitle="Stage movement (local)">
        <View style={styles.stageGrid}>
          {pipelineStages.map((stage) => (
            <View key={stage} style={styles.stagePill}>
              <Text style={styles.stageLabel}>{stage}</Text>
              <Text style={styles.stageCount}>{stageCounts[stage]}</Text>
            </View>
          ))}
        </View>
        {leads.length === 0 ? (
          <Text style={styles.note}>No leads in pipeline yet.</Text>
        ) : (
          leads.map((lead) => (
            <View key={lead.id} style={styles.pipelineCard}>
              <View style={styles.pipelineHeader}>
                <Text style={styles.leadTitle}>{lead.title}</Text>
                <Text style={styles.score}>{lead.score}</Text>
              </View>
              <Text style={styles.leadMeta}>
                {lead.city ?? "â€”"} {lead.state ? `â€¢ ${lead.state}` : ""}
              </Text>
              <Text style={styles.stageTag}>{lead.stage}</Text>
              {lead.nextAction ? (
                <Text style={styles.nextAction}>Next: {lead.nextAction}</Text>
              ) : null}
              <View style={styles.pipelineActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionGhost]}
                  onPress={() => setLeads((prev) => moveLead(prev, lead.id, -1))}
                >
                  <Text style={[styles.actionText, styles.actionTextDark]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setLeads((prev) => moveLead(prev, lead.id, 1))}
                >
                  <Text style={styles.actionText}>Advance</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </AppCard>
    </ScrollView>
  );
}

const pipelineStages: PipelineStage[] = [
  "New",
  "Contacted",
  "Qualified",
  "Meeting Scheduled",
  "Proposal / Bid Sent",
  "Won / Closed",
];

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const seedLeads: Lead[] = [
  {
    id: "seed-1",
    source: "manual",
    title: "City of Rock Falls",
    city: "Rock Falls",
    state: "IL",
    score: 82,
    stage: "Qualified",
    nextAction: "Schedule on-site meeting",
  },
  {
    id: "seed-2",
    source: "manual",
    title: "Clinton Parks Dept.",
    city: "Clinton",
    state: "IA",
    score: 64,
    stage: "Contacted",
    nextAction: "Follow up with specs",
  },
];

function addLeadFromReminder(current: Lead[], reminder: Reminder) {
  const id = `reminder-${reminder.id}`;
  if (current.some((lead) => lead.id === id)) return current;
  const score = reminder.priority === "high" ? 85 : reminder.priority === "low" ? 45 : 65;
  const title = reminder.customer?.business_name ?? reminder.title;
  return [
    {
      id,
      source: "municipal",
      title,
      city: reminder.customer?.city,
      state: reminder.customer?.state,
      score,
      stage: "Contacted",
      nextAction: reminder.title,
      customerId: reminder.customer?.id,
    },
    ...current,
  ];
}

function moveLead(current: Lead[], leadId: string, delta: number) {
  return current.map((lead) => {
    if (lead.id !== leadId) return lead;
    const idx = pipelineStages.indexOf(lead.stage);
    const nextIdx = Math.max(0, Math.min(pipelineStages.length - 1, idx + delta));
    return { ...lead, stage: pipelineStages[nextIdx] };
  });
}

function buildPriorityQueues(leads: Lead[]) {
  const hot = leads.filter((lead) => lead.score >= 80 && lead.stage !== "Won / Closed");
  const stale = leads.filter((lead) => lead.stage === "Contacted" && lead.score < 60);
  const needsFollowUp = leads.filter(
    (lead) => lead.stage === "Qualified" || lead.stage === "Meeting Scheduled"
  );
  return { hot, stale, needsFollowUp };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, gap: 12 },
  title: { color: theme.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: theme.textMuted, fontSize: 13 },
  note: { color: theme.textMuted, fontSize: 13 },
  metrics: { gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: theme.textMuted, fontSize: 13 },
  value: { color: theme.amber, fontWeight: "700" },
  stage: {
    color: theme.text,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  stageGrid: { gap: 8 },
  stagePill: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.surface,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stageLabel: { color: theme.text, fontSize: 12, fontWeight: "700" },
  stageCount: { color: theme.amber, fontSize: 12, fontWeight: "700" },
  leadRow: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: theme.surfaceAlt,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  leadInfo: { flex: 1, gap: 2 },
  leadTitle: { color: theme.text, fontSize: 13, fontWeight: "700" },
  leadMeta: { color: theme.textMuted, fontSize: 11 },
  addButton: {
    backgroundColor: theme.amber,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  addButtonText: { color: "#111", fontWeight: "700", fontSize: 12 },
  pipelineCard: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.surface,
    gap: 6,
  },
  pipelineHeader: { flexDirection: "row", justifyContent: "space-between" },
  score: { color: theme.amber, fontWeight: "800" },
  stageTag: {
    alignSelf: "flex-start",
    backgroundColor: "#1f2937",
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  nextAction: { color: theme.textMuted, fontSize: 12 },
  pipelineActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: "#2563eb",
  },
  actionGhost: { backgroundColor: theme.surfaceAlt, borderWidth: 1, borderColor: theme.border },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  actionTextDark: { color: theme.text },
  queueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceAlt,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  queueLabel: {
    backgroundColor: "#dc2626",
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  queueStale: { backgroundColor: "#6b7280" },
  queueFollow: { backgroundColor: "#0f766e" },
  queueTitle: { color: theme.text, fontSize: 12, fontWeight: "700" },
});
