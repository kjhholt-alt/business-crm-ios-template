import { useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { theme } from "@/constants/theme";
import { AppCard, ErrorBlock, LoadingBlock } from "@/components/ui";
import { useAiFollowUps, useAiNoteSummary } from "@/hooks/use-ai";
import { config } from "@/services/api/config";
import {
  useAddCustomerNote,
  useCreateCustomerActivity,
  useCreateReminder,
  useCustomer,
  useCustomerActivities,
  useCustomerNotes,
} from "@/hooks/use-crm-data";

const activityTypes = [
  { id: 1, label: "Call" },
  { id: 2, label: "Email" },
  { id: 3, label: "Meeting" },
];

export default function AccountDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const customerId = Number(params.id ?? 0);

  const customer = useCustomer(customerId);
  const notes = useCustomerNotes(customerId);
  const activities = useCustomerActivities(customerId);
  const aiSummary = useAiNoteSummary(
    {
      customerName: customer.data?.business_name,
      notes:
        (notes.data ?? []).map((note) => ({
          content: note.content,
          created_at: note.created_at,
        })) ?? [],
      activities:
        (activities.data ?? []).map((activity) => ({
          title: activity.title,
          description: activity.description,
          activity_date: activity.activity_date,
        })) ?? [],
    },
    false
  );
  const aiFollowUps = useAiFollowUps(
    {
      customerName: customer.data?.business_name,
      notes:
        (notes.data ?? []).map((note) => ({
          content: note.content,
          created_at: note.created_at,
        })) ?? [],
      activities:
        (activities.data ?? []).map((activity) => ({
          title: activity.title,
          description: activity.description,
          activity_date: activity.activity_date,
        })) ?? [],
    },
    false
  );
  const addNote = useAddCustomerNote();
  const addActivity = useCreateCustomerActivity();
  const addReminder = useCreateReminder();

  const [noteText, setNoteText] = useState("");
  const [activityTypeId, setActivityTypeId] = useState(1);
  const [activityText, setActivityText] = useState("");

  const canSubmit = useMemo(
    () => noteText.trim().length > 0 && customerId > 0,
    [noteText, customerId]
  );

  const canSubmitActivity = useMemo(
    () => activityText.trim().length > 0 && customerId > 0,
    [activityText, customerId]
  );

  const phone = customer.data?.main_phone ?? "";
  const email = customer.data?.main_email ?? "";

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{customer.data?.business_name ?? "Account"}</Text>
      <Text style={styles.subtitle}>
        {customer.data?.city}, {customer.data?.state}
      </Text>

      {customer.isLoading ? <LoadingBlock label="Loading account..." /> : null}
      {customer.isError ? <ErrorBlock message="Could not load account details." /> : null}

      <AppCard title="Contact Actions">
        <View style={styles.actionRow}>
          <SmallAction
            label="Call"
            onPress={() => (phone ? Linking.openURL(`tel:${phone}`) : undefined)}
            disabled={!phone}
          />
          <SmallAction
            label="Text"
            onPress={() => (phone ? Linking.openURL(`sms:${phone}`) : undefined)}
            disabled={!phone}
          />
          <SmallAction
            label="Email"
            onPress={() => (email ? Linking.openURL(`mailto:${email}`) : undefined)}
            disabled={!email}
          />
        </View>
      </AppCard>

      <AppCard title="Quick Reminder">
        <Text style={styles.meta}>Create a 7-day follow-up reminder from mobile.</Text>
        <TouchableOpacity
          style={styles.button}
          disabled={!customerId || addReminder.isPending}
          onPress={() => {
            const due = new Date();
            due.setDate(due.getDate() + 7);
            addReminder.mutate({
              customerId,
              title: "7-day follow-up",
              description: "Created from account detail mobile action",
              reminderDate: due.toISOString().slice(0, 10),
              priority: "medium",
              reminderType: "follow_up",
            });
          }}
        >
          <Text style={styles.buttonText}>Create Reminder</Text>
        </TouchableOpacity>
      </AppCard>

      <AppCard title="Log Activity">
        <View style={styles.actionRow}>
          {activityTypes.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.chip, activityTypeId === t.id ? styles.chipActive : null]}
              onPress={() => setActivityTypeId(t.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  activityTypeId === t.id ? styles.chipTextActive : null,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          placeholder="What happened?"
          placeholderTextColor={theme.textMuted}
          value={activityText}
          onChangeText={setActivityText}
          multiline
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.button}
          disabled={!canSubmitActivity || addActivity.isPending}
          onPress={() =>
            addActivity.mutate(
              {
                customerId,
                activityTypeId,
                title: `${activityTypes.find((a) => a.id === activityTypeId)?.label ?? "Activity"} update`,
                description: activityText.trim(),
                createReminder: false,
              },
              { onSuccess: () => setActivityText("") }
            )
          }
        >
          <Text style={styles.buttonText}>Save Activity</Text>
        </TouchableOpacity>
      </AppCard>

      <AppCard title="Notes">
        <TextInput
          placeholder="Add a note..."
          placeholderTextColor={theme.textMuted}
          value={noteText}
          onChangeText={setNoteText}
          multiline
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.button}
          disabled={!canSubmit || addNote.isPending}
          onPress={() =>
            addNote.mutate(
              { customerId, content: noteText.trim() },
              { onSuccess: () => setNoteText("") }
            )
          }
        >
          <Text style={styles.buttonText}>Save Note</Text>
        </TouchableOpacity>
        <View style={styles.list}>
          {(notes.data ?? []).slice(0, 8).map((note) => (
            <View key={note.id} style={styles.item}>
              <Text style={styles.itemText}>{note.content}</Text>
              <Text style={styles.itemMeta}>{new Date(note.created_at).toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard title="AI Summary">
        <Text style={styles.meta}>Summarize notes + activity history.</Text>
        {!config.aiAssistBase ? (
          <Text style={styles.errorText}>AI assist not configured.</Text>
        ) : null}
        {aiSummary.isError ? (
          <Text style={styles.errorText}>AI summary failed. Check AI proxy.</Text>
        ) : null}
        {aiSummary.data ? (
          <View style={styles.list}>
            <Text style={styles.itemText}>{aiSummary.data.summary}</Text>
            <View style={styles.list}>
              {aiSummary.data.highlights.map((item, idx) => (
                <Text key={`highlight-${idx}`} style={styles.itemMeta}>
                  • {item}
                </Text>
              ))}
            </View>
            {aiSummary.data.nextActions.length ? (
              <View style={styles.list}>
                {aiSummary.data.nextActions.map((item, idx) => (
                  <Text key={`next-${idx}`} style={styles.itemMeta}>
                    → {item}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
        <TouchableOpacity
          style={styles.button}
          disabled={aiSummary.isLoading || !config.aiAssistBase}
          onPress={() => aiSummary.refetch()}
        >
          <Text style={styles.buttonText}>
            {aiSummary.isLoading ? "Summarizing..." : "Generate Summary"}
          </Text>
        </TouchableOpacity>
      </AppCard>

      <AppCard title="AI Follow-ups">
        <Text style={styles.meta}>Drafts for email/SMS/call scripts.</Text>
        {!config.aiAssistBase ? (
          <Text style={styles.errorText}>AI assist not configured.</Text>
        ) : null}
        {aiFollowUps.isError ? (
          <Text style={styles.errorText}>AI follow-ups failed. Check AI proxy.</Text>
        ) : null}
        {aiFollowUps.data?.followUps?.length ? (
          <View style={styles.list}>
            {aiFollowUps.data.followUps.map((item, idx) => (
              <View key={`draft-${idx}`} style={styles.item}>
                <Text style={styles.itemText}>
                  {item.channel.toUpperCase()}
                  {item.subject ? ` • ${item.subject}` : ""}
                </Text>
                <Text style={styles.itemMeta}>{item.body}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => Clipboard.setStringAsync(item.body)}
                >
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}
        <TouchableOpacity
          style={styles.button}
          disabled={aiFollowUps.isLoading || !config.aiAssistBase}
          onPress={() => aiFollowUps.refetch()}
        >
          <Text style={styles.buttonText}>
            {aiFollowUps.isLoading ? "Generating..." : "Generate Drafts"}
          </Text>
        </TouchableOpacity>
      </AppCard>

      <AppCard title="Activity History">
        {activities.isLoading ? <LoadingBlock /> : null}
        <View style={styles.list}>
          {(activities.data ?? []).slice(0, 10).map((activity) => (
            <View key={activity.id} style={styles.item}>
              <Text style={styles.itemText}>{activity.title}</Text>
              <Text style={styles.itemMeta}>
                {activity.activity_date} • {activity.description}
              </Text>
            </View>
          ))}
        </View>
      </AppCard>
    </ScrollView>
  );
}

function SmallAction({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.smallButton, disabled ? styles.smallButtonDisabled : null]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.smallButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  title: { color: theme.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: theme.textMuted, fontSize: 13 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: {
    backgroundColor: theme.amber,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  buttonText: { color: "#111", fontWeight: "700" },
  smallButton: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  smallButtonDisabled: { opacity: 0.4 },
  smallButtonText: { color: theme.text, fontSize: 13, fontWeight: "700" },
  chip: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: theme.surface,
  },
  chipActive: { backgroundColor: theme.amber, borderColor: theme.amber },
  chipText: { color: theme.textMuted, fontSize: 12, fontWeight: "700" },
  chipTextActive: { color: "#111" },
  meta: { color: theme.textMuted, fontSize: 13 },
  errorText: { color: "#ef4444", fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    backgroundColor: theme.surface,
    color: theme.text,
    minHeight: 84,
    padding: 10,
    textAlignVertical: "top",
  },
  list: { gap: 8 },
  item: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  itemText: { color: theme.text, fontSize: 13 },
  itemMeta: { color: theme.textMuted, fontSize: 11 },
  copyButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  copyButtonText: { color: "#fff", fontWeight: "700", fontSize: 11 },
});
