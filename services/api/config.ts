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
  barrelhouseApiBase: process.env.EXPO_PUBLIC_BARRELHOUSE_API_BASE ?? "",
  barrelhouseToken: process.env.EXPO_PUBLIC_BARRELHOUSE_TOKEN ?? "",
};
