import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";
import { AppCard, LoadingBlock } from "@/components/ui";
import { useReminders } from "@/hooks/use-crm-data";

export default function RoutesScreen() {
  const router = useRouter();
  const reminders = useReminders();

  const stops = useMemo(
    () =>
      (reminders.data ?? [])
        .filter(
          (r) =>
            (r.status === "pending" || r.status === "snoozed") &&
            Boolean(r.customer?.bill_to_address)
        )
        .slice(0, 12),
    [reminders.data]
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Route Planner</Text>
      <Text style={styles.subtitle}>Daily stop list generated from open reminders.</Text>

      {reminders.isLoading ? <LoadingBlock label="Building route from reminders..." /> : null}

      <AppCard title="Today Stops" subtitle={`${stops.length} candidate stops`}>
        {stops.length === 0 ? (
          <Text style={styles.item}>No address-linked reminders available.</Text>
        ) : null}
        {stops.map((stop, idx) => (
          <View style={styles.stop} key={stop.id}>
            <Text style={styles.stopTitle}>
              {idx + 1}. {stop.customer?.business_name ?? "Account"}
            </Text>
            <Text style={styles.item}>
              {stop.customer?.bill_to_address}, {stop.customer?.city}, {stop.customer?.state}
            </Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => {
                const q = encodeURIComponent(
                  `${stop.customer?.bill_to_address}, ${stop.customer?.city}, ${stop.customer?.state}`
                );
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
              }}
            >
              <Text style={styles.mapButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        ))}
      </AppCard>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  title: { color: theme.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: theme.textMuted, fontSize: 13 },
  item: { color: theme.text, fontSize: 14 },
  stop: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  stopTitle: { color: theme.text, fontSize: 14, fontWeight: "700" },
  mapButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  mapButtonText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  button: {
    backgroundColor: theme.amber,
    borderRadius: 10,
    alignSelf: "flex-start",
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  buttonText: { color: "#121212", fontWeight: "700" },
});
