import { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

export function AppCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export function LoadingBlock({ label = "Loading..." }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={theme.amber} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <View style={styles.error}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    gap: 8,
  },
  cardTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: theme.textMuted,
    fontSize: 12,
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    color: theme.textMuted,
  },
  error: {
    paddingVertical: 8,
  },
  errorText: {
    color: theme.danger,
  },
});
