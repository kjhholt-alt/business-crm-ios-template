import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { ErrorBlock, LoadingBlock } from "@/components/ui";
import { useCustomers } from "@/hooks/use-crm-data";

export default function AccountsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const customers = useCustomers(search);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Accounts</Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search business, city, or contact"
        placeholderTextColor={theme.textMuted}
        style={styles.search}
      />

      {customers.isLoading ? <LoadingBlock label="Loading accounts..." /> : null}
      {customers.isError ? <ErrorBlock message="Could not load customers." /> : null}

      <FlatList
        data={customers.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push(`/account/${item.id}`)}
          >
            <Text style={styles.cardTitle}>{item.business_name}</Text>
            <Text style={styles.cardMeta}>
              {item.city}, {item.state}
            </Text>
            <Text style={styles.cardMeta}>
              {item.primary_contact} | {item.main_phone || "No phone"}
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
  search: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.text,
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  list: { gap: 10, paddingBottom: 40 },
  card: {
    backgroundColor: theme.surfaceAlt,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  cardTitle: { color: theme.text, fontSize: 16, fontWeight: "700" },
  cardMeta: { color: theme.textMuted, fontSize: 13 },
});
