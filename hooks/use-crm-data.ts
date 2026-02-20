import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBarrelhousePipelineStats } from "@/services/api/barrelhouse";
import { config } from "@/services/api/config";
import { getConnectionStatuses } from "@/services/api/connections";
import {
  addCustomerNote,
  completeReminder,
  createCustomerActivity,
  createReminder,
  getCustomer,
  getDashboardSummary,
  listCustomerActivities,
  listCustomerNotes,
  listCustomers,
  listReminders,
  snoozeReminder,
} from "@/services/api/municipal";
import { createPipelineLead, listPipelineLeads, updatePipelineLead } from "@/services/api/pipeline";
import type { Reminder } from "@/types/crm";
import {
  getScannerResults,
  getScannerResultsFiltered,
  getScannerStats,
} from "@/services/api/scanner";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    staleTime: 60_000,
  });
}

export function useCustomers(search: string) {
  return useQuery({
    queryKey: ["customers", search],
    queryFn: () => listCustomers(search),
    staleTime: 60_000,
  });
}

export function useCustomer(customerId: number) {
  return useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomer(customerId),
    enabled: Number.isFinite(customerId) && customerId > 0,
    staleTime: 60_000,
  });
}

export function useCustomerNotes(customerId: number) {
  return useQuery({
    queryKey: ["customer-notes", customerId],
    queryFn: () => listCustomerNotes(customerId),
    enabled: Number.isFinite(customerId) && customerId > 0,
    staleTime: 30_000,
  });
}

export function useCustomerActivities(customerId: number) {
  return useQuery({
    queryKey: ["customer-activities", customerId],
    queryFn: () => listCustomerActivities(customerId),
    enabled: Number.isFinite(customerId) && customerId > 0,
    staleTime: 30_000,
  });
}

export function useReminders() {
  return useQuery({
    queryKey: ["reminders"],
    queryFn: listReminders,
    staleTime: 30_000,
  });
}

export function useAddCustomerNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { customerId: number; content: string }) =>
      addCustomerNote(input.customerId, input.content),
    onSuccess: (_res, vars) => {
      void qc.invalidateQueries({ queryKey: ["customer-notes", vars.customerId] });
    },
  });
}

export function useCreateCustomerActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCustomerActivity,
    onSuccess: (_res, vars) => {
      void qc.invalidateQueries({ queryKey: ["customer-activities", vars.customerId] });
      void qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void qc.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useCompleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reminderId: number) => completeReminder(reminderId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void qc.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useSnoozeReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { reminderId: number; days?: number }) =>
      snoozeReminder(input.reminderId, input.days ?? 3),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void qc.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReminder,
    onSuccess: (_res, vars) => {
      void qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void qc.invalidateQueries({ queryKey: ["reminders"] });
      void qc.invalidateQueries({ queryKey: ["customer", vars.customerId] });
    },
  });
}

export function useCompleteRouteStop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { reminder: Reminder }) => {
      const customerId = input.reminder.customer_id ?? 0;
      if (!customerId) {
        throw new Error("Reminder is missing customer_id for route completion.");
      }

      await createCustomerActivity({
        customerId,
        activityTypeId: 3,
        title: "Route stop completed",
        description: `Completed route stop from reminder: ${input.reminder.title}`,
        createReminder: false,
      });

      await completeReminder(input.reminder.id);
      return { ok: true };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void qc.invalidateQueries({ queryKey: ["reminders"] });
      void qc.invalidateQueries({ queryKey: ["customer-activities"] });
    },
  });
}

export function useScannerStats() {
  return useQuery({
    queryKey: ["scanner-stats"],
    queryFn: getScannerStats,
    staleTime: 120_000,
  });
}

export function useScannerResults() {
  return useQuery({
    queryKey: ["scanner-results"],
    queryFn: () => getScannerResults(20),
    staleTime: 120_000,
  });
}

export function useScannerResultsFiltered(filters: {
  city?: string;
  state?: string;
  keyword?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["scanner-results", filters],
    queryFn: () =>
      getScannerResultsFiltered({
        limit: 30,
        city: filters.city,
        state: filters.state,
        keyword: filters.keyword,
        search: filters.search,
      }),
    staleTime: 120_000,
  });
}

export function useBarrelhouseStats() {
  return useQuery({
    queryKey: ["barrelhouse-pipeline-stats"],
    queryFn: getBarrelhousePipelineStats,
    staleTime: 120_000,
  });
}

export function useConnections() {
  return useQuery({
    queryKey: ["connections"],
    queryFn: getConnectionStatuses,
    staleTime: 30_000,
  });
}

export function usePipelineLeads() {
  return useQuery({
    queryKey: ["pipeline-leads"],
    queryFn: listPipelineLeads,
    enabled: Boolean(config.pipelineBase),
    staleTime: 30_000,
  });
}

export function useCreatePipelineLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPipelineLead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["pipeline-leads"] });
    },
  });
}

export function useUpdatePipelineLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePipelineLead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["pipeline-leads"] });
    },
  });
}
