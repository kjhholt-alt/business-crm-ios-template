import { useEffect, useMemo, useState } from "react";
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
  useCustomers,
  useCreateReminder,
  useScannerResultsFiltered,
  useScannerStats,
} from "@/hooks/use-crm-data";
import type { Customer, ScanResult } from "@/types/crm";

export default function ScannerScreen() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [accountSearch, setAccountSearch] = useState("");
  const [accountId, setAccountId] = useState("");
  const [autoMatchTarget, setAutoMatchTarget] = useState<ScanResult | null>(null);
  const [autoMatchMessage, setAutoMatchMessage] = useState<string | null>(null);
  const stats = useScannerStats();
  const results = useScannerResultsFiltered({ search, city, state });
  const accounts = useCustomers(accountSearch);
  const createReminder = useCreateReminder();

  const selectedAccountId = useMemo(() => Number(accountId || 0), [accountId]);
  const cityChips = useMemo(() => {
    const all = results.data ?? [];
    const unique = Array.from(new Set(all.map((r) => r.city).filter(Boolean)));
    return unique.slice(0, 8);
  }, [results.data]);
  const defaultChips = ["Davenport", "Moline", "Rock Island", "Cedar Rapids", "Iowa City", "Clinton"];

  useEffect(() => {
    if (!autoMatchTarget) return;
    if (!accounts.data || accounts.data.length === 0) return;

    const best = findBestAccountMatch(accounts.data, autoMatchTarget);
    if (!best) {
      setAutoMatchMessage("No match found. Try searching by business name.");
      setAutoMatchTarget(null);
      return;
    }

    setAccountId(String(best.id));
    setAutoMatchMessage(`Suggested: ${best.business_name}`);
    setAutoMatchTarget(null);
  }, [accounts.data, autoMatchTarget]);

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
          {cityChips.length ? (
            <View style={styles.chips}>
              {cityChips.map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={[styles.chip, city === chip ? styles.chipActive : null]}
                  onPress={() => setCity(chip)}
                >
                  <Text style={[styles.chipText, city === chip ? styles.chipTextActive : null]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              ))}
              {(city || state || search || accountSearch) ? (
                <TouchableOpacity style={styles.clearBtn} onPress={() => {
                  setCity("");
                  setState("");
                  setSearch("");
                  setAccountSearch("");
                }}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.chips}>
              {defaultChips.map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={styles.chip}
                  onPress={() => setCity(chip)}
                >
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TextInput
            value={accountSearch}
            onChangeText={setAccountSearch}
            placeholder="Find account by business/contact/city"
            placeholderTextColor={theme.textMuted}
            style={styles.input}
          />
          <View style={styles.accounts}>
            {(accounts.data ?? []).slice(0, 5).map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountRow,
                  String(account.id) === accountId ? styles.accountRowActive : null,
                ]}
                onPress={() => setAccountId(String(account.id))}
              >
                <Text style={styles.accountName}>{account.business_name}</Text>
                <Text style={styles.accountMeta}>
                  #{account.id} • {account.city}, {account.state}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.selectedAccount}>
            Selected account: {selectedAccountId || "none"}
          </Text>
          {autoMatchMessage ? <Text style={styles.autoMatch}>{autoMatchMessage}</Text> : null}
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
                style={[styles.actionBtn, styles.actionMatch]}
                onPress={() => {
                  setAutoMatchMessage(null);
                  setAutoMatchTarget(item);
                  setAccountSearch(item.city || item.keyword || item.page_title || "");
                }}
              >
                <Text style={styles.actionText}>
                  {autoMatchTarget?.id === item.id ? "Matching..." : "Auto-match"}
                </Text>
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

function findBestAccountMatch(accounts: Customer[], hit: ScanResult) {
  const text = normalize(`${hit.page_title} ${hit.snippet} ${hit.keyword}`);
  const targetCity = normalize(hit.city);
  const targetState = normalize(hit.state);

  let best: { score: number; account: Customer } | null = null;
  accounts.forEach((account) => {
    const name = normalize(account.business_name);
    const city = normalize(account.city);
    const state = normalize(account.state);
    let score = 0;

    if (name && text.includes(name)) score += 5;
    if (targetCity && city === targetCity) score += 2;
    if (targetState && state === targetState) score += 1;
    if (name && text.includes(name.split(" ")[0] ?? "")) score += 1;

    if (!best || score > best.score) {
      best = { score, account };
    }
  });

  if (!best || best.score < 2) return null;
  return best.account;
}

function normalize(value: string | null | undefined) {
  if (!value) return "";
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: 16, gap: 12 },
  title: { color: theme.text, fontSize: 24, fontWeight: "800" },
  metric: { color: theme.text, fontSize: 14 },
  section: { color: theme.text, fontSize: 16, fontWeight: "700" },
  filters: { gap: 8 },
  filterRow: { flexDirection: "row", gap: 8 },
  accounts: { gap: 6 },
  accountRow: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  accountRowActive: { borderColor: theme.amber },
  accountName: { color: theme.text, fontSize: 12, fontWeight: "700" },
  accountMeta: { color: theme.textMuted, fontSize: 11 },
  selectedAccount: { color: theme.amber, fontSize: 12, fontWeight: "700" },
  autoMatch: { color: theme.textMuted, fontSize: 12 },
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
  actionMatch: { backgroundColor: "#0f766e" },
  actionFollowUp: { backgroundColor: theme.amber },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  actionFollowUpText: { color: "#111" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: theme.surface,
  },
  chipActive: { backgroundColor: theme.amber, borderColor: theme.amber },
  chipText: { color: theme.textMuted, fontSize: 11, fontWeight: "700" },
  chipTextActive: { color: "#111" },
  clearBtn: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: theme.surfaceAlt,
  },
  clearText: { color: theme.text, fontSize: 11, fontWeight: "700" },
});
