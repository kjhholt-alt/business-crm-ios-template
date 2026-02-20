import { useMemo } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";
import { AppCard, ErrorBlock, LoadingBlock } from "@/components/ui";
import {
  useCompleteReminder,
  useDashboardSummary,
  useReminders,
  useScannerStats,
  useSnoozeReminder,
} from "@/hooks/use-crm-data";

export default function DashboardScreen() {
  const router = useRouter();
  const summary = useDashboardSummary();
  const scannerStats = useScannerStats();
  const reminders = useReminders();
  const completeReminder = useCompleteReminder();
  const snoozeReminder = useSnoozeReminder();

  const pendingReminders = useMemo(
    () =>
      (reminders.data ?? [])
        .filter((r) => r.status === "pending" || r.status === "snoozed")
        .slice(0, 5),
    [reminders.data]
  );

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

      <AppCard title="My Queue" subtitle="Fast reminder actions">
        {reminders.isLoading ? <LoadingBlock label="Loading reminders..." /> : null}
        {!reminders.isLoading && pendingReminders.length === 0 ? (
          <Text style={styles.emptyText}>No pending reminders right now.</Text>
        ) : null}
        {pendingReminders.map((r) => (
          <View key={r.id} style={styles.reminderRow}>
            <View style={styles.reminderTextWrap}>
              <Text style={styles.reminderTitle}>{r.title}</Text>
              <Text style={styles.reminderMeta}>Due {r.reminder_date}</Text>
            </View>
            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={styles.rowButton}
                disabled={completeReminder.isPending}
                onPress={() => completeReminder.mutate(r.id)}
              >
                <Text style={styles.rowButtonText}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rowButton, styles.rowButtonAlt]}
                disabled={snoozeReminder.isPending}
                onPress={() => snoozeReminder.mutate({ reminderId: r.id, days: 3 })}
              >
                <Text style={styles.rowButtonText}>+3d</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </AppCard>

      <AppCard title="Route Planner" subtitle="Municipal route module placeholder">
        <Text style={styles.metric}>
          Build and launch daily stop plans tied to customers and reminders.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/routes")}>
          <Text style={styles.primaryButtonText}>Open Route Planner</Text>
        </TouchableOpacity>
      </AppCard>

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
  emptyText: { color: theme.textMuted, fontSize: 13 },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  reminderTextWrap: { flex: 1, gap: 2 },
  reminderTitle: { color: theme.text, fontWeight: "700", fontSize: 13 },
  reminderMeta: { color: theme.textMuted, fontSize: 12 },
  rowButtons: { flexDirection: "row", gap: 6 },
  rowButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.forest,
  },
  rowButtonAlt: { backgroundColor: theme.amber },
  rowButtonText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  primaryButton: {
    marginTop: 6,
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: theme.amber,
  },
  primaryButtonText: { color: "#101010", fontWeight: "700" },
});
