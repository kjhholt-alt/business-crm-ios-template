# Implementation Plan - Business CRM iOS Template

## Objective

Create one production iOS CRM app that combines:
- municipal CRM domain depth (accounts, reminders, meeting-minutes scanner)
- BarrelHouse UX quality (pipeline focus, KPI clarity, clean navigation)
- existing app architecture patterns from your iOS work (`golf-swing-ai-coach-iOS-App`, `travelplan-ai-iOS-App`)

## Phase 0 - Foundation (Completed)

- Template scaffold created with Expo Router tabs and shared theme
- Data clients wired for:
  - Supabase municipal customer/reminder data
  - Railway scanner stats/results
  - optional BarrelHouse pipeline stats
- Connection status page added for endpoint debugging

## Phase 1 - Core CRM Workflows

- Accounts detail screen (notes, history, contact actions)
- Activity logging (call/email/meeting) writing to Supabase
- Reminder actions (complete/snooze/create) from mobile
- Route planner placeholder linked to municipal routes module

## Phase 2 - Pipeline + Lead Intelligence

- Unified lead model that can display:
  - municipal procurement leads
  - BarrelHouse franchise leads
- Stage movement actions with optimistic updates
- Scoring badges and priority queues
- Saved filters and "my day" queue

## Phase 3 - AI Assist Layer

- AI note summarizer for meeting minutes and account timelines
- Auto-generated follow-up drafts (email/SMS/call scripts)
- Lead fit score explanation panel (why this is hot/cold)
- Weekly AI brief: opportunities, stale leads, urgent follow-ups

## Phase 4 - Integrations and Reliability

- Auth hardening (JWT or Supabase session + secure storage)
- Background refresh + push notifications
- Offline cache strategy for field usage
- Telemetry events for all primary workflows

## Phase 5 - Ship Readiness

- QA checklist for scanner + account updates + pipeline movement
- Crash/error monitoring setup
- EAS iOS build profile and TestFlight distribution
- Starter tenant setup script for new client instances

## Data Contracts to Unify

- Municipal: `customers`, `reminders`, scanner `/results/`
- BarrelHouse: `/api/leads/`, `/api/pipeline/stats/`
- Shared app model: `Account`, `Lead`, `Task`, `PipelineStage`, `Signal`

## Design Rules

- Keep screens task-first, not report-first
- Max 2 taps to log an activity
- Every list row must show next action
- KPI cards first; details second
