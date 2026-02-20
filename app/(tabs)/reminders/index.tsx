import { useMemo } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";
import { AppCard, LoadingBlock } from "@/components/ui";
import { useCompleteReminder, useReminders, useSnoozeReminder } from "@/hooks/use-crm-data";

function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00`);
}

export default function RemindersScreen() {
  const router = useRouter();
  const reminders = useReminders();
  const done = useCompleteReminder();
  const snooze = useSnoozeReminder();

  const buckets = useMemo(() => {
    const all = (reminders.data ?? []).filter(
      (r) => r.status === "pending" || r.status === "snoozed"
    );
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const overdue: typeof all = [];
    const dueToday: typeof all = [];
    const thisWeek: typeof all = [];

    all.forEach((r) => {
      const date = toDateOnly(r.reminder_date);
      const sameDay = date.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);
      if (date < today && !sameDay) overdue.push(r);
      else if (sameDay) dueToday.push(r);
      else if (date <= nextWeek) thisWeek.push(r);
    });

    return { overdue, dueToday, thisWeek };
  }, [reminders.data]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Reminder Queue</Text>
      <Text style={styles.subtitle}>One-tap complete/snooze flow for daily field work.</Text>

      {reminders.isLoading ? <LoadingBlock label="Loading reminder queue..." /> : null}

      <ReminderSection
        title={`Overdue (${buckets.overdue.length})`}
        items={buckets.overdue}
        onAccount={(id) => router.push(`/account/${id}`)}
        onDone={(id) => done.mutate(id)}
        onSnooze={(id) => snooze.mutate({ reminderId: id, days: 3 })}
      />

      <ReminderSection
        title={`Due Today (${buckets.dueToday.length})`}
        items={buckets.dueToday}
        onAccount={(id) => router.push(`/account/${id}`)}
        onDone={(id) => done.mutate(id)}
        onSnooze={(id) => snooze.mutate({ reminderId: id, days: 3 })}
      />

      <ReminderSection
        title={`This Week (${buckets.thisWeek.length})`}
        items={buckets.thisWeek}
        onAccount={(id) => router.push(`/account/${id}`)}
        onDone={(id) => done.mutate(id)}
        onSnooze={(id) => snooze.mutate({ reminderId: id, days: 3 })}
      />
    </ScrollView>
  );
}

function ReminderSection({
  title,
  items,
  onDone,
  onSnooze,
  onAccount,
}: {
  title: string;
  items: Array<{
    id: number;
    title: string;
    reminder_date: string;
    customer_id?: number;
    customer?: { business_name: string; city: string; state: string };
  }>;
  onDone: (id: number) => void;
  onSnooze: (id: number) => void;
  onAccount: (id: number) => void;
}) {
  return (
    <AppCard title={title}>
      {items.length === 0 ? <Text style={styles.empty}>No reminders in this section.</Text> : null}
      {items.map((item) => (
        <View style={styles.row} key={item.id}>
          <View style={styles.rowMeta}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowSub}>
              {item.customer?.business_name ?? "Account"} • {item.reminder_date}
            </Text>
            <Text style={styles.rowSub}>
              {item.customer?.city ?? "-"}, {item.customer?.state ?? "-"}
            </Text>
          </View>
          <View style={styles.actions}>
            {item.customer_id ? (
              <TouchableOpacity style={[styles.btn, styles.info]} onPress={() => onAccount(item.customer_id!)}>
                <Text style={styles.btnText}>Open</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={[styles.btn, styles.done]} onPress={() => onDone(item.id)}>
              <Text style={styles.btnText}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.snooze]} onPress={() => onSnooze(item.id)}>
              <Text style={[styles.btnText, styles.snoozeText]}>+3d</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  title: { color: theme.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: theme.textMuted, fontSize: 13 },
  empty: { color: theme.textMuted, fontSize: 12 },
  row: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  rowMeta: { gap: 3 },
  rowTitle: { color: theme.text, fontWeight: "700", fontSize: 13 },
  rowSub: { color: theme.textMuted, fontSize: 11 },
  actions: { flexDirection: "row", gap: 6 },
  btn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  done: { backgroundColor: theme.forest },
  snooze: { backgroundColor: theme.amber },
  info: { backgroundColor: "#2563eb" },
  btnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  snoozeText: { color: "#111" },
});
