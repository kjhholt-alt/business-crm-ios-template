import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";
import { AppCard, LoadingBlock } from "@/components/ui";
import { useBarrelhouseStats, useDashboardSummary } from "@/hooks/use-crm-data";

export default function PipelineScreen() {
  const barrelhouse = useBarrelhouseStats();
  const municipal = useDashboardSummary();

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

      <AppCard title="Template Stage Model">
        {[
          "New",
          "Contacted",
          "Qualified",
          "Meeting Scheduled",
          "Proposal / Bid Sent",
          "Won / Closed",
        ].map((stage) => (
          <Text style={styles.stage} key={stage}>
            {stage}
          </Text>
        ))}
      </AppCard>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
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
});
