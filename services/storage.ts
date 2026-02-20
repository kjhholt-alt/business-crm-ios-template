import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Lead, PipelineFilterKey, PipelineStage } from "@/types/crm";

const KEYS = {
  leads: "pipeline.leads",
  filters: "pipeline.filters",
  myDay: "pipeline.myday",
};

export async function loadPipelineLeads(): Promise<Lead[] | null> {
  const raw = await AsyncStorage.getItem(KEYS.leads);
  if (!raw) return null;
  return JSON.parse(raw) as Lead[];
}

export async function savePipelineLeads(leads: Lead[]) {
  await AsyncStorage.setItem(KEYS.leads, JSON.stringify(leads));
}

export async function loadPipelineFilters(): Promise<PipelineFilterKey[] | null> {
  const raw = await AsyncStorage.getItem(KEYS.filters);
  if (!raw) return null;
  return JSON.parse(raw) as PipelineFilterKey[];
}

export async function savePipelineFilters(filters: PipelineFilterKey[]) {
  await AsyncStorage.setItem(KEYS.filters, JSON.stringify(filters));
}

export async function loadMyDayStages(): Promise<PipelineStage[] | null> {
  const raw = await AsyncStorage.getItem(KEYS.myDay);
  if (!raw) return null;
  return JSON.parse(raw) as PipelineStage[];
}

export async function saveMyDayStages(stages: PipelineStage[]) {
  await AsyncStorage.setItem(KEYS.myDay, JSON.stringify(stages));
}
