# Agent Brief: Manager Parity With Dispatcher + Responsive (PC and Mobile)

## Goal

Implement manager settings and UX parity with the dispatcher desktop experience, while also making the manager area fully adapted for both desktop and mobile.

In short:

- manager should have the same level of usability/settings structure as dispatcher on PC
- manager UI must be responsive and practical on mobile
- no feature regressions

## Product Intent

The manager role should feel complete, not secondary.

Expected outcome:

- on desktop: manager has comparable navigation clarity, page structure, interaction patterns, and convenience to dispatcher
- on mobile: manager remains simple, touch-friendly, and efficient

## Scope

Apply changes only to manager role pages/layout/components and shared pieces that are required for parity.

Primary targets:

- client/src/features/manager-layout/\*\*
- client/src/pages/manager/\*\*
- client/src/features/warehouses/\*\* (manager-specific hooks/API usage)
- client/src/components/** and client/src/shared/** only when needed for shared UI consistency

Reference for parity patterns:

- client/src/pages/dispatcher/\*\*
- client/src/features/dispatcher-layout/\*\*

## Functional Requirements

1. Manager Desktop Parity

- Mirror dispatcher-level UX quality on desktop.
- Keep navigation and content hierarchy equally clear.
- Ensure manager core actions are discoverable and fast.

2. Manager Mobile Adaptation

- Keep mobile-first behavior intact.
- Bottom navigation or equivalent mobile-friendly primary navigation should remain strong and reachable.
- Components must use touch-appropriate sizing and spacing.

3. Consistent Settings/Interaction Model

- Align manager interaction patterns with dispatcher where appropriate:
  - list/filter/search behavior
  - loading/error/empty states
  - action placement and button hierarchy
- Do not blindly clone dispatcher UI if manager task flow differs.

## UX & Visual Requirements

- Maintain simple, low-friction UX for manager role.
- Keep typography readable and hierarchy clear.
- Use consistent spacing rhythm across manager pages.
- Ensure controls are easy to tap on mobile.
- Preserve app-like feel on mobile and structured clarity on desktop.

## Technical Requirements

- Preserve role-based routing and guards.
- Do not introduce Redux Toolkit.
- Do not change backend contracts unless strictly required.
- Reuse existing shared loader/components for consistency.
- Keep TypeScript strict and avoid any.

## Acceptance Criteria

- Manager desktop UX is on par with dispatcher-level structure and usability.
- Manager pages work cleanly across desktop and mobile breakpoints.
- Navigation is convenient on both device classes.
- No regressions in existing manager workflows:
  - resources visibility
  - incoming/outgoing orders view
  - replenishment request
  - inventory adjustment
- TypeScript and lint pass for touched files.

## Suggested Implementation Order

1. Audit dispatcher desktop patterns that should be mirrored.
2. Update manager layout shell for consistent desktop + mobile behavior.
3. Harmonize manager pages with shared interaction patterns.
4. Verify responsive behavior on phone viewport first, then desktop.
5. Run type check/lint and do a quick role-flow smoke test.

## Non-Goals

- No large backend refactor.
- No redesign of dispatcher pages unless required as a shared-component side effect.
- No heavy animations or decorative complexity.
