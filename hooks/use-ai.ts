import { useQuery } from "@tanstack/react-query";
import { config } from "@/services/api/config";
import { generateAiBrief, generateFollowUps, summarizeAccountNotes } from "@/services/api/ai";
import type { Lead } from "@/types/crm";
import type { AiNoteSummaryRequest } from "@/types/ai";

export function useAiBrief(leads: Lead[]) {
  return useQuery({
    queryKey: ["ai-brief", leads.map((lead) => lead.id).join("|")],
    queryFn: () => generateAiBrief({ leads }),
    enabled: leads.length > 0 && Boolean(config.aiAssistBase),
    staleTime: 5 * 60_000,
  });
}

export function useAiNoteSummary(input: AiNoteSummaryRequest, enabled = false) {
  return useQuery({
    queryKey: [
      "ai-notes",
      input.customerName ?? "",
      input.notes.length,
      input.activities.length,
    ],
    queryFn: () => summarizeAccountNotes(input),
    enabled: Boolean(config.aiAssistBase) && enabled,
    staleTime: 10 * 60_000,
  });
}

export function useAiFollowUps(input: AiNoteSummaryRequest, enabled = false) {
  return useQuery({
    queryKey: [
      "ai-followups",
      input.customerName ?? "",
      input.notes.length,
      input.activities.length,
    ],
    queryFn: () => generateFollowUps(input),
    enabled: Boolean(config.aiAssistBase) && enabled,
    staleTime: 10 * 60_000,
  });
}
