# Stepdad Integration Plan (Municipal CRM -> New iOS App)

## Goal

Run one improved iOS app while keeping all existing municipal data and workflows intact for a single user rollout.

## Source of Truth (No Migration in Phase A)

- Supabase (current municipal CRM tables):
  - `customers`
  - `customer_notes`
  - `activities`
  - `reminders`
  - `regions`
- Railway scanner API:
  - `/scanner/stats/`
  - `/scanner/results/`
  - `/scanner/history/`

## What We Preserve from Existing Municipal CRM

1. Customer list and detail workflow
2. Notes history
3. Activity logging (call/email/meeting)
4. Reminder lifecycle (pending/completed/snoozed)
5. Meeting-minutes scanner and filtering
6. Route planning from open follow-ups

## What We Improve in Mobile UX

1. Faster daily queue actions (Done / +3 days in-line)
2. Cleaner account detail flow (contact + note + activity in one place)
3. Scanner-to-action path (convert hit to reminder quickly)
4. Route launch from real due stops

## Data Mapping

- `customers` -> `Customer`
- `reminders` + joined `customers` -> `Reminder` queue cards
- `customer_notes` -> Notes timeline
- `activities` -> Activity timeline
- scanner hits -> follow-up reminder seed

## Rollout Steps

1. Phase A (now): parity on current data and actions
2. Field test with stepdad for 3-5 days
3. Capture friction points (missing fields, extra taps, unclear labels)
4. Phase B: auto-match scanner hits to accounts + route completion writes
5. Phase C: auth hardening and TestFlight deployment

## Guardrails

- No breaking schema changes in Supabase during Phase A
- Any new column must be optional/backward compatible
- Keep web municipal-crm fully operational while mobile rolls out
