import { useQuery } from "@tanstack/react-query";
import { getBarrelhousePipelineStats } from "@/services/api/barrelhouse";
import { getConnectionStatuses } from "@/services/api/connections";
import { getDashboardSummary, listCustomers } from "@/services/api/municipal";
import { getScannerResults, getScannerStats } from "@/services/api/scanner";

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
