# Agent Brief: Manager Settings Item Only

## Goal

Implement only one change: add a "Налаштування" item for the manager role, matching dispatcher desktop behavior.

## Strict Scope (Do Not Expand)

Do only this:

1. Add a manager "Налаштування" entry in desktop navigation.
2. Place it in the same area/pattern as dispatcher desktop settings.
3. Open a settings modal/panel using the same interaction pattern as dispatcher.

Do NOT do:

- full manager redesign
- layout overhaul
- navigation refactor
- page restyling
- backend changes
- unrelated cleanup

## Placement Decision

Desktop (required):

- Put "Налаштування" at the bottom of the manager sidebar, same pattern as dispatcher desktop.
- Keep it visually separate from main nav items (after divider/top border area).

Mobile (minimal adaptation):

- Keep current mobile navigation unchanged unless manager has no way to access settings.
- If there is no settings access on mobile, add one minimal entry point only (prefer a small button in mobile top area or bottom nav action).
- Do not redesign mobile shell.

## Files to touch (expected)

- client/src/features/manager-layout/components/ManagerLayout.tsx

Optional only if needed:

- manager layout constants file for nav items
- shared dialog component if already used by dispatcher pattern

## UX Requirements

- Label must be exactly: "Налаштування"
- Icon and button style should be consistent with dispatcher settings item.
- Keep interactions simple and predictable.

## Acceptance Criteria

- On desktop manager layout, "Налаштування" exists and is easy to find.
- Position and behavior match dispatcher desktop pattern.
- No unrelated UI/UX changes appear in manager pages.
- Existing manager routes and flows are not affected.
- TypeScript/lint stay green for touched files.

## Validation Checklist

1. Compare manager desktop sidebar with dispatcher sidebar settings placement.
2. Verify settings action opens and closes correctly.
3. Verify logout and other existing controls still work.
4. Verify no additional redesign changes were introduced.
