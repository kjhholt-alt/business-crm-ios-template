import { config } from "@/services/api/config";
import { fetchJson } from "@/services/api/http";
import type { Lead } from "@/types/crm";

function authHeaders() {
  if (!config.pipelineToken) return undefined;
  return { Authorization: `Bearer ${config.pipelineToken}` };
}

export async function listPipelineLeads(): Promise<Lead[]> {
  if (!config.pipelineBase) {
    throw new Error("Pipeline base URL not configured.");
  }
  const url = `${config.pipelineBase}/pipeline/leads/`;
  return fetchJson<Lead[]>(url, { headers: authHeaders() });
}

export async function getPipelinePreferences(): Promise<{
  filters: string[];
  my_day_stages: string[];
}> {
  if (!config.pipelineBase) {
    throw new Error("Pipeline base URL not configured.");
  }
  const url = `${config.pipelineBase}/pipeline/preferences/`;
  return fetchJson<{ filters: string[]; my_day_stages: string[] }>(url, {
    headers: authHeaders(),
  });
}

export async function savePipelinePreferences(input: {
  filters: string[];
  my_day_stages: string[];
}) {
  if (!config.pipelineBase) {
    throw new Error("Pipeline base URL not configured.");
  }
  const url = `${config.pipelineBase}/pipeline/preferences/`;
  return fetchJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });
}

export async function createPipelineLead(input: Lead): Promise<Lead> {
  if (!config.pipelineBase) {
    throw new Error("Pipeline base URL not configured.");
  }
  const url = `${config.pipelineBase}/pipeline/leads/`;
  return fetchJson<Lead>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(mapLeadPayload(input)),
  });
}

export async function updatePipelineLead(input: Lead): Promise<Lead> {
  if (!config.pipelineBase) {
    throw new Error("Pipeline base URL not configured.");
  }
  const url = `${config.pipelineBase}/pipeline/leads/${input.id}/`;
  return fetchJson<Lead>(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(mapLeadPayload(input)),
  });
}

function mapLeadPayload(lead: Lead) {
  return {
    source: lead.source,
    title: lead.title,
    city: lead.city ?? null,
    state: lead.state ?? null,
    score: lead.score,
    stage: lead.stage,
    next_action: lead.nextAction ?? null,
    customer_id: lead.customerId ?? null,
  };
}
