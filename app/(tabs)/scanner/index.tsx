import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";
import { AppCard, ErrorBlock, LoadingBlock } from "@/components/ui";
import { useScannerResults, useScannerStats } from "@/hooks/use-crm-data";

export default function ScannerScreen() {
  const stats = useScannerStats();
  const results = useScannerResults();

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
});
