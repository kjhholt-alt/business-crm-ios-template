import { config } from "@/services/api/config";
import { fetchJson } from "@/services/api/http";
import type { BarrelhousePipelineStats } from "@/types/crm";

function authHeaders() {
  if (!config.barrelhouseToken) return undefined;
  return { Authorization: `Bearer ${config.barrelhouseToken}` };
}

export async function getBarrelhousePipelineStats() {
  if (!config.barrelhouseApiBase) return null;
  const url = `${config.barrelhouseApiBase}/api/pipeline/stats/`;
  return fetchJson<BarrelhousePipelineStats>(url, { headers: authHeaders() });
}
