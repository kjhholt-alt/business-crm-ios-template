export const config = {
  supabaseUrl:
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    "https://ytvtaorgityczrdhhzqv.supabase.co",
  supabaseAnonKey:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    "REPLACE_ME",
  municipalScannerBase:
    process.env.EXPO_PUBLIC_MUNICIPAL_SCANNER_BASE ??
    "https://tender-cooperation-production.up.railway.app/scanner",
  aiAssistBase: process.env.EXPO_PUBLIC_AI_ASSIST_BASE ?? "",
  aiAssistToken: process.env.EXPO_PUBLIC_AI_ASSIST_TOKEN ?? "",
  pipelineBase: process.env.EXPO_PUBLIC_PIPELINE_BASE ?? "",
  pipelineToken: process.env.EXPO_PUBLIC_PIPELINE_TOKEN ?? "",
};
