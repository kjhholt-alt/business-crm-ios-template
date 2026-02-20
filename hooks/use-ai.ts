import { useQuery } from "@tanstack/react-query";
import { config } from "@/services/api/config";
import { generateAiBrief } from "@/services/api/ai";
import type { Lead } from "@/types/crm";

export function useAiBrief(leads: Lead[]) {
  return useQuery({
    queryKey: ["ai-brief", leads.map((lead) => lead.id).join("|")],
    queryFn: () => generateAiBrief({ leads }),
    enabled: leads.length > 0 && Boolean(config.aiAssistBase),
    staleTime: 5 * 60_000,
  });
}
