# Mobile Business CRM Template (iOS-first)

Template goal: merge the strongest workflow features from `municipal-crm` with the cleaner, KPI-heavy UX direction from `BarrelHouseCRM`, using the same mobile stack pattern as your recent iOS app builds.

## Stack

- Expo Router + React Native + TypeScript
- React Query for data/state orchestration
- Supabase REST for municipal CRM records
- Railway scanner API for meeting minutes lead signals
- Optional BarrelHouse API for pipeline KPI sync

## Quick Start

```powershell
cd C:\Users\Kruz\Desktop\Projects\business-crm-ios-template
Copy-Item .env.example .env -Force
npm install
npx expo start --tunnel
```

## Current Tabs

- `Today`: municipal reminder KPIs + quick queue actions + route launch
- `Accounts`: live customer search/list from Supabase
- `Reminders`: overdue/today/week buckets with one-tap complete/snooze
- `Scanner`: real meeting-result feed
- `Connections`: API connection health checks

## Municipal Parity Status (Single-User Rollout)

- Account detail now includes:
  - tap-to-call/text/email
  - note creation + history
  - activity logging to Supabase
  - quick reminder creation
- Reminder workflow now includes:
  - overdue/today/week queue
  - complete + snooze actions
- Scanner workflow now includes:
  - city/state/search filters
  - account quick-search + select
  - create follow-up reminder action from scanner hit
- Route module now includes:
  - stop list generated from real reminders with customer addresses
  - open each stop in maps

See `STEPDAD_INTEGRATION_PLAN.md` for full integration map.

## Design Direction

- BarrelHouse-inspired palette (charcoal + amber + cream)
- Dense KPI cards and clear field-first hierarchy
- Mobile-first execution for on-the-go rep workflow

## Immediate Next Build Steps

1. Add secure auth (Supabase Auth or backend JWT)
2. Add route optimization and stop-complete writeback
3. Add scanner hit -> customer match suggestions (no manual account ID)
4. Add AI assist tab for note summarization and follow-up draft
5. Add push notifications for overdue/today reminders
