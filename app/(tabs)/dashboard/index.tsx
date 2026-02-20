import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";
import { AppCard, ErrorBlock, LoadingBlock } from "@/components/ui";
import { useDashboardSummary, useScannerStats } from "@/hooks/use-crm-data";

export default function DashboardScreen() {
  const summary = useDashboardSummary();
  const scannerStats = useScannerStats();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Municipal CRM Command Center</Text>
      <Text style={styles.subtitle}>
        Municipal execution + BarrelHouse UX pattern for a mobile-first field app.
      </Text>

      <View style={styles.grid}>
        <Stat title="Overdue" value={summary.data?.overdue ?? 0} />
        <Stat title="Due Today" value={summary.data?.today ?? 0} />
        <Stat title="This Week" value={summary.data?.thisWeek ?? 0} />
        <Stat title="Next 30 Days" value={summary.data?.next30Days ?? 0} />
      </View>

      <AppCard title="Scanner Snapshot" subtitle="Railway scanner service">
        {scannerStats.isLoading ? (
          <LoadingBlock label="Loading scanner stats..." />
        ) : scannerStats.isError ? (
          <ErrorBlock message="Could not load scanner stats." />
        ) : (
          <>
            <Text style={styles.metric}>Mentions: {scannerStats.data?.total_mentions ?? 0}</Text>
            <Text style={styles.metric}>
              Cities with hits: {scannerStats.data?.cities_with_hits ?? 0}
            </Text>
            <Text style={styles.metric}>
              Active keywords: {scannerStats.data?.active_keywords ?? 0}
            </Text>
          </>
        )}
      </AppCard>

      {summary.isLoading ? <LoadingBlock label="Refreshing reminders..." /> : null}
      {summary.isError ? (
        <ErrorBlock message="Failed to load dashboard summary from Supabase reminders." />
      ) : null}
    </ScrollView>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, gap: 14 },
  title: { color: theme.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: theme.textMuted, fontSize: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stat: {
    width: "48%",
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  statValue: { color: theme.amber, fontSize: 24, fontWeight: "800" },
  statTitle: { color: theme.textMuted, fontSize: 12 },
  metric: { color: theme.text, fontSize: 14 },
});
