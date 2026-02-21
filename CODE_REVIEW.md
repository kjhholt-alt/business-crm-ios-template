# CODE_REVIEW.md

Date: 2026-02-20
Scope: business-crm-ios-template (pipeline persistence, AI assist, reminders/dashboard lint)

## Findings (ordered by severity)

### High
- None found in this pass.

### Medium
- AI proxy endpoints rely on `AI_ASSIST_TOKEN` being set to enforce auth. If it is unset, the endpoints are open. Recommendation: always set `AI_ASSIST_TOKEN` in production and consider IP allowlisting or server-side rate limits.

### Low
- AI queries cache keys are based on lead IDs and list lengths, not lead content. If a lead’s details change without ID changes, the cached AI brief/summary may not refresh unless manually refetched. Acceptable for now given manual “Generate” buttons.
- Pipeline persistence is local-only (AsyncStorage). Multi-device consistency still requires a server-side store.

## Tests
- `npm run lint` passed after fixes.

## Notes
- No functional regressions detected in the current UI flow.

---

Date: 2026-02-20
Scope: business-crm-ios-template (AI UX + pipeline sync + scanner chips)

## Findings (ordered by severity)

### High
- None found in this pass.

### Medium
- AI calls rely on `EXPO_PUBLIC_AI_ASSIST_BASE` and token; without them, the UX shows “not configured.” This is correct but still a deployment blocker for AI features. Ensure envs are set before any production test.
- Pipeline sync retries are per‑lead; there’s no backoff or aggregated error context. If the backend is unavailable, a user can spam “Sync Local.” Consider disable/lockout for a few seconds on error.

### Low
- Scanner city chips are derived from the current results list. If no results are loaded yet, chips won’t appear; that’s expected but could be confusing for first‑time users.

## Tests
- `npm run lint` passed.

## Notes
- No functional regressions detected in the current UI flow.
