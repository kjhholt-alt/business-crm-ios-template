import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";
import { AppCard, LoadingBlock } from "@/components/ui";
import { useConnections } from "@/hooks/use-crm-data";

export default function ConnectionsScreen() {
  const connections = useConnections();

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Connections</Text>
        <TouchableOpacity style={styles.button} onPress={() => connections.refetch()}>
          <Text style={styles.buttonText}>Recheck</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        This is where iOS CRM talks to Supabase, scanner, and optional BarrelHouse APIs.
      </Text>

      {connections.isLoading ? <LoadingBlock label="Checking endpoints..." /> : null}

      {(connections.data ?? []).map((conn) => (
        <AppCard key={conn.id} title={conn.name} subtitle={conn.endpoint}>
          <Text style={[styles.status, { color: conn.ok ? theme.forest : theme.danger }]}>
            {conn.ok ? "Connected" : conn.message}
          </Text>
        </AppCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: 16, gap: 12 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { color: theme.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: theme.textMuted, fontSize: 13 },
  button: {
    backgroundColor: theme.amber,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: { color: "#111", fontWeight: "700" },
  status: { fontSize: 14, fontWeight: "700" },
});
