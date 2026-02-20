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

export async function getScannerResultsFiltered(params: {
  limit?: number;
  city?: string;
  state?: string;
  keyword?: string;
  search?: string;
}) {
  const query = qs({
    limit: params.limit ?? 25,
    city: params.city,
    state: params.state,
    keyword: params.keyword,
    search: params.search,
  });
  return fetchJson<ScanResult[]>(
    `${config.municipalScannerBase}/results/?${query}`
  );
}
