import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { toast } from "@/components/ui/toast";
import { theme } from "@/constants/theme";
import { AppCard, LoadingBlock } from "@/components/ui";
import { useAiBrief, useLeadFitExplanation } from "@/hooks/use-ai";
import {
  useBarrelhouseStats,
  useCreatePipelineLead,
  useDashboardSummary,
  usePipelineLeads,
  usePipelinePreferences,
  useReminders,
  useSavePipelinePreferences,
  useUpdatePipelineLead,
} from "@/hooks/use-crm-data";
import {
  loadMyDayStages,
  loadPipelineFilters,
  loadPipelineLeads,
  saveMyDayStages,
  savePipelineFilters,
  savePipelineLeads,
} from "@/services/storage";
import { config } from "@/services/api/config";
import type { Lead, PipelineFilterKey, PipelineStage, Reminder } from "@/types/crm";

export default function PipelineScreen() {
  const barrelhouse = useBarrelhouseStats();
  const municipal = useDashboardSummary();
  const reminders = useReminders();
  const serverLeads = usePipelineLeads();
  const serverPrefs = usePipelinePreferences();
  const savePrefs = useSavePipelinePreferences();
  const createLead = useCreatePipelineLead();
  const updateLead = useUpdatePipelineLead();
  const [leads, setLeads] = useState<Lead[]>(seedLeads);
  const [myDayStages, setMyDayStages] = useState<PipelineStage[]>([
    "Contacted",
    "Qualified",
    "Meeting Scheduled",
  ]);
  const [activeFilters, setActiveFilters] = useState<PipelineFilterKey[]>([
    "hot",
    "stale",
    "follow_up",
  ]);
  const [isHydrated, setIsHydrated] = useState(false);

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
  const myDay = useMemo(() => leads.filter((lead) => myDayStages.includes(lead.stage)), [
    leads,
    myDayStages,
  ]);
  const aiBrief = useMemo(() => buildAIBrief(leads), [leads]);
  const aiBriefQuery = useAiBrief(leads);
  const [leadForExplain, setLeadForExplain] = useState<Lead | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const leadFit = useLeadFitExplanation(leadForExplain, false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [storedLeads, storedFilters, storedMyDay] = await Promise.all([
          loadPipelineLeads(),
          loadPipelineFilters(),
          loadMyDayStages(),
        ]);
        if (!mounted) return;
        if (serverLeads.data && serverLeads.data.length) {
          setLeads(serverLeads.data);
        } else if (storedLeads && storedLeads.length) {
          setLeads(storedLeads);
        }
        if (serverPrefs.data?.filters?.length) {
          setActiveFilters(serverPrefs.data.filters as PipelineFilterKey[]);
        } else if (storedFilters && storedFilters.length) {
          setActiveFilters(storedFilters);
        }
        if (serverPrefs.data?.my_day_stages?.length) {
          setMyDayStages(serverPrefs.data.my_day_stages as PipelineStage[]);
        } else if (storedMyDay && storedMyDay.length) {
          setMyDayStages(storedMyDay);
        }
      } catch {
        // ignore persistence failures
      } finally {
        if (mounted) setIsHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [serverLeads.data, serverPrefs.data]);

  useEffect(() => {
    if (!isHydrated) return;
    void savePipelineLeads(leads);
  }, [leads, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    void savePipelineFilters(activeFilters);
    if (config.pipelineBase) {
      savePrefs.mutate({ filters: activeFilters, my_day_stages: myDayStages });
    }
  }, [activeFilters, isHydrated, myDayStages, savePrefs]);

  useEffect(() => {
    if (!isHydrated) return;
    void saveMyDayStages(myDayStages);
    if (config.pipelineBase) {
      savePrefs.mutate({ filters: activeFilters, my_day_stages: myDayStages });
    }
  }, [myDayStages, isHydrated, activeFilters, savePrefs]);

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
        {config.pipelineBase ? (
          <Text style={styles.note}>Syncing pipeline to server.</Text>
        ) : (
          <Text style={styles.note}>Using local-only pipeline storage.</Text>
        )}
        {syncMessage ? <Text style={styles.syncBanner}>{syncMessage}</Text> : null}
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
                onPress={() => {
                  const next = addLeadFromReminder(leads, reminder);
                  setLeads(next);
                  const added = next.find(
                    (lead) => lead.customerId === reminder.customer?.id && lead.source === "municipal"
                  );
                  if (added && config.pipelineBase && isLocalLead(added.id)) {
                    createLead.mutate(added, {
                      onSuccess: (saved) => {
                        setLeads((prev) => replaceLeadId(prev, added.id, saved.id));
                      },
                    });
                  }
                }}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </AppCard>

      <AppCard title="My Day" subtitle="Leads needing action today">
        <View style={styles.filterRow}>
          {pipelineStages.map((stage) => (
            <TouchableOpacity
              key={`myday-${stage}`}
              style={[
                styles.filterChip,
                myDayStages.includes(stage) ? styles.filterChipActive : null,
              ]}
              onPress={() =>
                setMyDayStages((prev) =>
                  prev.includes(stage)
                    ? prev.filter((s) => s !== stage)
                    : [...prev, stage]
                )
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  myDayStages.includes(stage) ? styles.filterChipTextActive : null,
                ]}
              >
                {stage}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
        <View style={styles.filterRow}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                activeFilters.includes(filter.key) ? styles.filterChipActive : null,
              ]}
              onPress={() =>
                setActiveFilters((prev) =>
                  prev.includes(filter.key)
                    ? prev.filter((id) => id !== filter.key)
                    : [...prev, filter.key]
                )
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilters.includes(filter.key) ? styles.filterChipTextActive : null,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {activeFilters.includes("hot") && priorityQueues.hot.length === 0 ? (
          <Text style={styles.note}>No hot leads yet.</Text>
        ) : activeFilters.includes("hot") ? (
          priorityQueues.hot.map((lead) => (
            <View key={`hot-${lead.id}`} style={styles.queueRow}>
              <Text style={styles.queueLabel}>Hot</Text>
              <Text style={styles.queueTitle}>{lead.title}</Text>
            </View>
          ))
        ) : null}
        {activeFilters.includes("stale") && priorityQueues.stale.length === 0 ? null : activeFilters.includes("stale") ? (
          priorityQueues.stale.map((lead) => (
            <View key={`stale-${lead.id}`} style={styles.queueRow}>
              <Text style={[styles.queueLabel, styles.queueStale]}>Stale</Text>
              <Text style={styles.queueTitle}>{lead.title}</Text>
            </View>
          ))
        ) : null}
        {activeFilters.includes("follow_up") && priorityQueues.needsFollowUp.length === 0 ? null : activeFilters.includes("follow_up") ? (
          priorityQueues.needsFollowUp.map((lead) => (
            <View key={`follow-${lead.id}`} style={styles.queueRow}>
              <Text style={[styles.queueLabel, styles.queueFollow]}>Follow-up</Text>
              <Text style={styles.queueTitle}>{lead.title}</Text>
            </View>
          ))
        ) : null}
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
              {leadForExplain?.id === lead.id && leadFit.data ? (
                <View style={styles.aiExplain}>
                  <Text style={styles.aiExplainTitle}>Fit Summary</Text>
                  <Text style={styles.aiBody}>{leadFit.data.summary}</Text>
                  {leadFit.data.reasons.map((reason, idx) => (
                    <Text key={`reason-${idx}`} style={styles.aiBullet}>
                      • {reason}
                    </Text>
                  ))}
                  {leadFit.data.risks.length ? (
                    <View>
                      <Text style={styles.aiExplainTitle}>Risks</Text>
                      {leadFit.data.risks.map((risk, idx) => (
                        <Text key={`risk-${idx}`} style={styles.aiBullet}>
                          – {risk}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}
              {leadForExplain?.id === lead.id && leadFit.isError ? (
                <Text style={styles.errorText}>AI fit explanation failed.</Text>
              ) : null}
              <View style={styles.pipelineActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionGhost]}
                  onPress={() => {
                    const next = moveLead(leads, lead.id, -1);
                    setLeads(next);
                    const updated = next.find((item) => item.id === lead.id);
                    if (updated && config.pipelineBase && isServerLead(updated.id)) {
                      updateLead.mutate(updated);
                    }
                  }}
                >
                  <Text style={[styles.actionText, styles.actionTextDark]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionGhost]}
                  onPress={() => {
                    if (!config.pipelineBase) {
                      toast.error("Pipeline sync not configured.");
                      setSyncMessage("Pipeline sync not configured.");
                      return;
                    }
                    const localLeads = leads.filter((lead) => isLocalLead(lead.id));
                    if (localLeads.length === 0) {
                      toast.success("All leads already synced.");
                      setSyncMessage("All leads already synced.");
                      return;
                    }
                    let completed = 0;
                    localLeads.forEach((lead) => {
                      createLead.mutate(lead, {
                        onSuccess: (saved) => {
                          setLeads((prev) => replaceLeadId(prev, lead.id, saved.id));
                          completed += 1;
                          if (completed === localLeads.length) {
                            toast.success("Local leads synced.");
                            setSyncMessage("Local leads synced.");
                          }
                        },
                        onError: () => {
                          toast.error("Failed to sync one or more leads.");
                          setSyncMessage("Failed to sync one or more leads.");
                        },
                      });
                    });
                  }}
                >
                  <Text style={[styles.actionText, styles.actionTextDark]}>Sync Local</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionGhost]}
                  onPress={() => {
                    setLeadForExplain(lead);
                    void leadFit.refetch();
                  }}
                >
                  <Text style={[styles.actionText, styles.actionTextDark]}>
                    {leadForExplain?.id === lead.id && leadFit.isFetching
                      ? "Explaining..."
                      : "Explain Fit"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    const next = moveLead(leads, lead.id, 1);
                    setLeads(next);
                    const updated = next.find((item) => item.id === lead.id);
                    if (updated && config.pipelineBase && isServerLead(updated.id)) {
                      updateLead.mutate(updated);
                    }
                  }}
                >
                  <Text style={styles.actionText}>Advance</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </AppCard>

      <AppCard title="AI Assist" subtitle="Drafts and insights">
        {!aiBriefQuery.data && !aiBriefQuery.isLoading ? (
          <Text style={styles.note}>
            Connect AI assist to replace this preview.
          </Text>
        ) : null}
        {aiBriefQuery.isError ? (
          <Text style={styles.errorText}>AI assist failed. Showing preview copy.</Text>
        ) : null}
        <Text style={styles.aiHeadline}>Weekly Brief</Text>
        <Text style={styles.aiBody}>{aiBriefQuery.data?.summary ?? aiBrief.summary}</Text>

        <Text style={styles.aiHeadline}>Hot Lead Insight</Text>
        <Text style={styles.aiBody}>
          {aiBriefQuery.data?.hotInsight ?? aiBrief.hotInsight}
        </Text>

        <Text style={styles.aiHeadline}>Suggested Follow-ups</Text>
        {(aiBriefQuery.data?.followUps ?? aiBrief.followUps).map((item) => (
          <View key={item.id} style={styles.aiRow}>
            <Text style={styles.aiRowTitle}>{item.title}</Text>
            <Text style={styles.aiRowBody}>{item.suggestion}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => aiBriefQuery.refetch()}
          disabled={aiBriefQuery.isLoading}
        >
          <Text style={styles.aiButtonText}>
            {aiBriefQuery.isLoading ? "Generating..." : "Generate Real Brief"}
          </Text>
        </TouchableOpacity>
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

const filterOptions: { key: PipelineFilterKey; label: string }[] = [
  { key: "hot", label: "Hot" },
  { key: "stale", label: "Stale" },
  { key: "follow_up", label: "Follow-up" },
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
  const existing = current.find(
    (lead) => lead.customerId === reminder.customer?.id && lead.source === "municipal"
  );
  if (existing) return current;
  const id = `reminder-${reminder.id}`;
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

function moveLead(current: Lead[], leadId: string | number, delta: number) {
  return current.map((lead) => {
    if (lead.id !== leadId) return lead;
    const idx = pipelineStages.indexOf(lead.stage);
    const nextIdx = Math.max(0, Math.min(pipelineStages.length - 1, idx + delta));
    return { ...lead, stage: pipelineStages[nextIdx] };
  });
}

function replaceLeadId(current: Lead[], oldId: string | number, newId: string | number) {
  return current.map((lead) => (lead.id === oldId ? { ...lead, id: newId } : lead));
}

function isServerLead(id: string | number) {
  return typeof id === "number";
}

function isLocalLead(id: string | number) {
  return typeof id === "string";
}

function buildPriorityQueues(leads: Lead[]) {
  const hot = leads.filter((lead) => lead.score >= 80 && lead.stage !== "Won / Closed");
  const stale = leads.filter((lead) => lead.stage === "Contacted" && lead.score < 60);
  const needsFollowUp = leads.filter(
    (lead) => lead.stage === "Qualified" || lead.stage === "Meeting Scheduled"
  );
  return { hot, stale, needsFollowUp };
}

function buildAIBrief(leads: Lead[]) {
  const hot = leads.filter((lead) => lead.score >= 80);
  const next = hot[0] ?? leads[0];
  const summary = hot.length
    ? `${hot.length} hot leads ready for action. Focus on ${hot
        .slice(0, 2)
        .map((l) => l.title)
        .join(", ")}.`
    : "No hot leads detected. Promote new leads with quick outreach today.";
  const hotInsight = next
    ? `${next.title} is trending with a score of ${next.score}. Prioritize a call or on-site visit.`
    : "No active leads yet. Add reminders to seed the pipeline.";
  const followUps = (leads.length ? leads : seedLeads).slice(0, 3).map((lead) => ({
    id: lead.id,
    title: lead.title,
    suggestion: lead.nextAction
      ? `Next step: ${lead.nextAction}.`
      : "Draft a short follow-up email and confirm timeline.",
  }));
  return { summary, hotInsight, followUps };
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
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: theme.surface,
  },
  filterChipActive: { backgroundColor: theme.amber, borderColor: theme.amber },
  filterChipText: { color: theme.textMuted, fontSize: 11, fontWeight: "700" },
  filterChipTextActive: { color: "#111" },
  aiHeadline: { color: theme.text, fontSize: 13, fontWeight: "800" },
  aiBody: { color: theme.textMuted, fontSize: 12, marginBottom: 6 },
  errorText: { color: "#ef4444", fontSize: 12 },
  aiRow: {
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceAlt,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  aiRowTitle: { color: theme.text, fontSize: 12, fontWeight: "700" },
  aiRowBody: { color: theme.textMuted, fontSize: 12 },
  aiButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  aiButtonText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  aiExplain: {
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceAlt,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  aiExplainTitle: { color: theme.text, fontSize: 12, fontWeight: "700" },
  aiBullet: { color: theme.textMuted, fontSize: 12 },
  syncBanner: {
    alignSelf: "flex-start",
    backgroundColor: theme.surfaceAlt,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: theme.text,
    fontSize: 12,
  },
});
