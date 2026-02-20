import { config } from "@/services/api/config";
import { fetchJson, qs } from "@/services/api/http";
import type { ScanResult, ScanStats } from "@/types/crm";

export async function getScannerStats() {
  return fetchJson<ScanStats>(`${config.municipalScannerBase}/stats/`);
}

export async function getScannerResults(limit = 25) {
  const query = qs({ limit });
  return fetchJson<ScanResult[]>(
    `${config.municipalScannerBase}/results/?${query}`
  );
}
