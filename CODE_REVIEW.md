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
