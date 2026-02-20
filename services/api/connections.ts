import { config } from "@/services/api/config";
import type { ConnectionStatus } from "@/types/crm";

async function probe(url: string) {
  try {
    const res = await fetch(url, { method: "GET" });
    return { ok: res.ok, message: res.ok ? "Connected" : `HTTP ${res.status}` };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Request failed",
    };
  }
}

export async function getConnectionStatuses(): Promise<ConnectionStatus[]> {
  const targets = [
    {
      id: "supabase",
      name: "Municipal CRM Supabase",
      endpoint: `${config.supabaseUrl}/rest/v1/customers?select=id&limit=1`,
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
      },
    },
    {
      id: "scanner",
      name: "Municipal Scanner API",
      endpoint: `${config.municipalScannerBase}/stats/`,
    },
  ];

  const results: ConnectionStatus[] = [];
  for (const target of targets) {
    if (target.endpoint === "Not configured") {
      results.push({
        id: target.id,
        name: target.name,
        endpoint: target.endpoint,
        ok: false,
        message: "Not configured",
      });
      continue;
    }
    const r = await probe(target.endpoint);
    results.push({
      id: target.id,
      name: target.name,
      endpoint: target.endpoint,
      ok: r.ok,
      message: r.message,
    });
  }
  return results;
}
