import { config } from "@/services/api/config";
import { fetchJson } from "@/services/api/http";
import type {
  AiBriefRequest,
  AiBriefResponse,
  AiFollowUpsResponse,
  AiNoteSummaryRequest,
  AiNoteSummaryResponse,
} from "@/types/ai";

function authHeaders() {
  if (!config.aiAssistToken) return undefined;
  return { Authorization: `Bearer ${config.aiAssistToken}` };
}

export async function generateAiBrief(input: AiBriefRequest): Promise<AiBriefResponse> {
  if (!config.aiAssistBase) {
    throw new Error("AI assist base URL not configured.");
  }
  const url = `${config.aiAssistBase}/ai/brief`;
  return fetchJson<AiBriefResponse>(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(input),
    },
    20_000
  );
}

export async function summarizeAccountNotes(
  input: AiNoteSummaryRequest
): Promise<AiNoteSummaryResponse> {
  if (!config.aiAssistBase) {
    throw new Error("AI assist base URL not configured.");
  }
  const url = `${config.aiAssistBase}/ai/notes`;
  return fetchJson<AiNoteSummaryResponse>(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(input),
    },
    20_000
  );
}

export async function generateFollowUps(
  input: AiNoteSummaryRequest
): Promise<AiFollowUpsResponse> {
  if (!config.aiAssistBase) {
    throw new Error("AI assist base URL not configured.");
  }
  const url = `${config.aiAssistBase}/ai/followups`;
  return fetchJson<AiFollowUpsResponse>(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(input),
    },
    20_000
  );
}
