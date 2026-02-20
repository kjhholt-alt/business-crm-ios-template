import { useMemo, useState } from "react";
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "@/constants/theme";
import { AppCard, ErrorBlock, LoadingBlock } from "@/components/ui";
import {
  useCreateReminder,
  useScannerResultsFiltered,
  useScannerStats,
} from "@/hooks/use-crm-data";

export default function ScannerScreen() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [accountId, setAccountId] = useState("");
  const stats = useScannerStats();
  const results = useScannerResultsFiltered({ search, city, state });
  const createReminder = useCreateReminder();

  const selectedAccountId = useMemo(() => Number(accountId || 0), [accountId]);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Meeting Scanner</Text>

      <AppCard title="Scanner Health">
        {stats.isLoading ? <LoadingBlock /> : null}
        {stats.isError ? <ErrorBlock message="Scanner API unavailable." /> : null}
        {stats.data ? (
          <>
            <Text style={styles.metric}>Mentions: {stats.data.total_mentions}</Text>
            <Text style={styles.metric}>Cities: {stats.data.cities_with_hits}</Text>
            <Text style={styles.metric}>Keywords: {stats.data.active_keywords}</Text>
          </>
        ) : null}
      </AppCard>

      <AppCard title="Filters" subtitle="City/state/keyword search">
        <View style={styles.filters}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Keyword or title"
            placeholderTextColor={theme.textMuted}
            style={styles.input}
          />
          <View style={styles.filterRow}>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor={theme.textMuted}
              style={[styles.input, styles.half]}
            />
            <TextInput
              value={state}
              onChangeText={setState}
              placeholder="State"
              placeholderTextColor={theme.textMuted}
              style={[styles.input, styles.half]}
            />
          </View>
          <TextInput
            value={accountId}
            onChangeText={setAccountId}
            keyboardType="numeric"
            placeholder="Account ID for follow-up actions"
            placeholderTextColor={theme.textMuted}
            style={styles.input}
          />
        </View>
      </AppCard>

      <Text style={styles.section}>Recent Hits</Text>
      {results.isLoading ? <LoadingBlock label="Loading latest hits..." /> : null}
      <FlatList
        data={results.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.result}
            onPress={() => Linking.openURL(item.source_url)}
          >
            <Text style={styles.resultTitle}>{item.page_title || item.keyword}</Text>
            <Text style={styles.resultMeta}>
              {item.city}, {item.state} | {item.keyword}
            </Text>
            <Text numberOfLines={2} style={styles.resultSnippet}>
              {item.snippet}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Linking.openURL(item.source_url)}
              >
                <Text style={styles.actionText}>Open Source</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionFollowUp]}
                disabled={!selectedAccountId || createReminder.isPending}
                onPress={() => {
                  const due = new Date();
                  due.setDate(due.getDate() + 2);
                  createReminder.mutate({
                    customerId: selectedAccountId,
                    title: `Scanner follow-up: ${item.keyword}`,
                    description: `${item.page_title} (${item.city}, ${item.state})`,
                    reminderDate: due.toISOString().slice(0, 10),
                    priority: "high",
                    reminderType: "scanner_hit",
                  });
                }}
              >
                <Text style={[styles.actionText, styles.actionFollowUpText]}>
                  Create Follow-up
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: 16, gap: 12 },
  title: { color: theme.text, fontSize: 24, fontWeight: "800" },
  metric: { color: theme.text, fontSize: 14 },
  section: { color: theme.text, fontSize: 16, fontWeight: "700" },
  filters: { gap: 8 },
  filterRow: { flexDirection: "row", gap: 8 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    color: theme.text,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  half: { flex: 1 },
  list: { gap: 10, paddingBottom: 40 },
  result: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    gap: 5,
  },
  resultTitle: { color: theme.text, fontSize: 15, fontWeight: "700" },
  resultMeta: { color: theme.amber, fontSize: 12 },
  resultSnippet: { color: theme.textMuted, fontSize: 12 },
  actions: { marginTop: 8, flexDirection: "row", gap: 8 },
  actionBtn: {
    borderRadius: 8,
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  actionFollowUp: { backgroundColor: theme.amber },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  actionFollowUpText: { color: "#111" },
});
