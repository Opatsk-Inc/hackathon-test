# Agent Brief: Manager Mobile App Redesign

## Goal

Redesign the warehouse manager area so it feels like a mobile app, not a desktop dashboard.

The main idea:

- mobile-first layout
- bottom navigation instead of side-heavy navigation on small screens
- simple, clean, touch-friendly UI
- fast access to the most important actions

## Product Direction

Manager pages should feel lightweight and practical for daily work.

Design goals:

- easy to use with one hand on a phone
- clear hierarchy of content
- large tap targets
- minimal friction
- no cluttered admin-dashboard feel
- strong focus on readability and speed

## What to Redesign

Focus on the manager area only:

- resources availability
- orders
- replenishment request
- inventory
- manager layout / navigation shell

## Layout Requirements

1. Use a mobile-first layout as the default experience.
2. Put the primary navigation at the bottom on mobile.
3. Keep the top area minimal, for title and context only.
4. Make the content area feel like a mobile screen, not a web admin page.
5. On larger screens, the layout can expand, but it should keep the same app-like visual language.

## Navigation Requirements

- Bottom navigation should be the main pattern on mobile.
- Use clear icons and short labels.
- Show active state clearly.
- Keep navigation fixed and always reachable.
- Avoid a heavy left sidebar on mobile.

## Visual Style

- Use a modern app-style visual language.
- Avoid dense tables when possible; prefer cards, lists, segmented controls, and compact summaries.
- Use spacing carefully so the screen feels breathable.
- Use typography that is clean and readable on small screens.
- Keep colors simple and purposeful.
- Status colors should be obvious but not loud.
- The interface should feel polished, but not flashy.

## UX Rules

- Prioritize the most common manager actions.
- Reduce the number of taps needed for core flows.
- Keep actions near where the user needs them.
- Make forms and lists easy to scan on mobile.
- Use sticky or fixed controls only when they genuinely help.
- Avoid desktop-only interaction patterns.

## Page-Specific Guidance

### Resources

- Show resources as cards or compact list items.
- Make quantity and stock status immediately visible.
- Keep filters simple and mobile-friendly.

### Orders

- Use tabs or segmented controls for incoming/outgoing orders.
- Keep cards compact and scannable.
- Show key information first: resource, quantity, status, date.

### Replenishment

- Make the form feel like a simple mobile flow.
- Keep field spacing comfortable.
- Show validation clearly and immediately.
- Keep the submit action obvious.

### Inventory

- Make inventory editing straightforward.
- Use inline editing or a compact edit mode.
- Highlight changed rows clearly.

## Constraints

- Do not introduce Redux Toolkit.
- Do not change backend behavior unless absolutely necessary.
- Do not overcomplicate the UI with dashboard widgets.
- Do not make it look like a desktop ERP system.
- Preserve existing role protection and routing.

## Implementation Expectations

- Reuse existing project components where possible.
- Keep the redesign consistent across all manager pages.
- If a shared shell or navigation component is needed, create one reusable structure.
- Keep mobile behavior as the primary design target.

## Acceptance Criteria

- Manager screens feel like a mobile app.
- Bottom navigation exists on mobile.
- The UI is simple, clean, and fast to use.
- Core manager actions are easy to reach.
- The design looks intentional on both mobile and desktop.
- Existing functionality still works.

## Suggested Execution Order

1. Redesign the manager layout shell.
2. Add bottom navigation for mobile.
3. Restyle the pages with mobile-first spacing and cards.
4. Simplify forms and actions.
5. Validate usability on small screens first.
