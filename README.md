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
cd C:\Users\Kruz\Desktop\Projects\municipal-crm\mobile-business-crm-template
Copy-Item .env.example .env -Force
npm install
npx expo start --tunnel
```

## Current Tabs

- `Dashboard`: municipal reminder KPIs + scanner health
- `Accounts`: live customer search/list from Supabase
- `Pipeline`: BarrelHouse-style KPI card + municipal queue
- `Scanner`: real meeting-result feed
- `Connections`: API connection health checks

## Design Direction

- BarrelHouse-inspired palette (charcoal + amber + cream)
- Dense KPI cards and clear field-first hierarchy
- Mobile-first execution for on-the-go rep workflow

## Immediate Next Build Steps

1. Add secure auth (Supabase Auth or backend JWT)
2. Add lead detail + activity logging + reminder actions
3. Add pipeline drag/move actions with backend writes
4. Add AI assist tab for note summarization and follow-up draft
5. Add push notifications for overdue/today reminders
