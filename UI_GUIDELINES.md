# TexForge UI Guidelines

This document defines how to extend TexForge's UI system without regressing usability, accessibility, or performance.

## Design Principles

- Keep editor productivity first. Visual effects must never block writing or preview workflows.
- Use semantic tokens over hard-coded colors.
- Prefer reusable patterns over per-page one-off styling.
- Animate with purpose and provide reduced-motion alternatives.
- Keep visual hierarchy clear: shell -> section -> content -> actions.

## Token System

Primary token source:
- `src/app/globals.css`
- `tailwind.config.ts` (token mappings + shadows + animations)

Token categories:
- **Core semantic:** `background`, `foreground`, `card`, `border`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `ring`
- **Brand semantic:** `brand-violet`, `brand-cyan`, `brand-rose`, `brand-gold`
- **Status semantic:** `success`, `warning`, `info`

Guidelines:
- Always use semantic tokens/classes (`bg-card`, `text-muted-foreground`) instead of direct hex values.
- Use gradients through token-based utilities (`hero-text-gradient`, `bg-hero-gradient`) so dark/light support remains consistent.
- Keep contrast strong for body text, status labels, and actionable controls.

## Shared Utility Classes

Defined in `src/app/globals.css`:

- `page-shell`: max-width + responsive horizontal padding
- `surface`: base elevated panel
- `surface-elevated`: stronger elevated panel
- `surface-glass`: glass effect panel with blur and soft border
- `hero-text-gradient`: gradient text treatment for hero headings
- `status-pill` + status variants (`success`, `warning`, `error`, `info`)
- `interactive-focus`: shared keyboard focus ring behavior

Use these before creating ad-hoc class stacks.

## Component Pattern Layer

Reusable page patterns:
- `components/page-shell.tsx` - route-level framing and backdrop support
- `components/section-header.tsx` - title/description/action block
- `components/stat-card.tsx` - compact metrics/status cards
- `components/empty-state.tsx` - consistent no-data states

Primitive components:
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/dialog.tsx`
- `components/ui/input.tsx`

When adding new primitives, keep:
- consistent border radius
- shared focus ring behavior
- hover/disabled states aligned with existing variants

## Motion Rules

Library:
- Framer Motion

Rules:
- Use subtle durations (roughly 180-450ms).
- Prefer opacity + small translate transitions over large movement.
- Never rely on motion to communicate critical state alone.
- Always guard animation behavior with reduced-motion checks where logic branches.

Current examples:
- Login content entrance transitions
- Project list card entrance transitions
- Editor panel transitions
- Share dialog state transitions

## 3D Rules

Libraries:
- `three`
- `@react-three/fiber`
- `@react-three/drei`

Scope:
- Allowed only on non-editor brand surfaces (currently login + dashboard).
- Not allowed in editor or share preview workspace.

Capability gates:
- `src/hooks/use-visual-effects.ts`

Fallback rules:
- If reduced motion, low-power hints, small viewport, or no WebGL: render static gradients.
- Pause rendering when the tab is hidden (`frameloop="never"`).
- Keep scene complexity low (few meshes, no postprocessing, no shadows).

## Accessibility and Interaction

- All icon-only buttons must include `aria-label`.
- Keep keyboard interactions first-class (focus-visible ring on interactive controls).
- Maintain readable text hierarchy in each route.
- Use `aria-busy` for long-running regions where helpful.
- Preserve clear empty/loading/error states.

## Performance Checklist for UI Changes

Before merging visual updates:

1. Confirm reduced-motion fallback behavior.
2. Confirm 3D capability gating and static fallback.
3. Verify no editor interaction regressions.
4. Run:
   - `pnpm test`
   - `pnpm lint`
   - `pnpm build`
