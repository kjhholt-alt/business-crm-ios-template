import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";
import { AppCard } from "@/components/ui";

export default function RoutesScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Route Planner</Text>
      <Text style={styles.subtitle}>Phase 1 placeholder linked to municipal routes flow.</Text>

      <AppCard title="Coming Next" subtitle="Route optimization + stop completion">
        <Text style={styles.item}>1. Select accounts with today/overdue reminders</Text>
        <Text style={styles.item}>2. Generate optimized stop order</Text>
        <Text style={styles.item}>3. Track completion and sync activities</Text>
      </AppCard>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: 16, gap: 12 },
  title: { color: theme.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: theme.textMuted, fontSize: 13 },
  item: { color: theme.text, fontSize: 14 },
  button: {
    backgroundColor: theme.amber,
    borderRadius: 10,
    alignSelf: "flex-start",
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  buttonText: { color: "#121212", fontWeight: "700" },
});
