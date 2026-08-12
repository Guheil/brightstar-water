---
name: mrje-mui-frontend-design-system
description: Use when designing or implementing the MRJE Gas and Bright Star web frontend. Enforces frontend-first development, Customer/Admin/Deliverer roles, Material UI v9, strict MUI styled() architecture, centralized theme tokens, separate visual files, responsive accessibility, secure frontend practices, and anti-AI-slop design rules.
---

# MRJE MUI Frontend Design Skill

## Mission

Design and implement the frontend for the MRJE Gas and Bright Star ordering, inventory, and delivery system.

The current phase is frontend-only.

Do not create a backend, real database, real authentication, real payment integration, or production API unless the user explicitly changes the phase.

## Direct users

Support exactly:

1. Customer
2. Admin
3. Deliverer

Do not introduce a separate Staff role.

## Mandatory stack

- Next.js App Router
- TypeScript
- React
- Material UI v9
- `styled()` from `@mui/material/styles`
- MUI ThemeProvider
- MUI CSS theme variables
- GSAP where purposeful
- Lenis only where smooth scrolling improves customer-facing presentation

## Absolute styling rule

All application styling must use MUI `styled()`.

Use the semantic MUI component:

```tsx
styled(Box)
styled(Typography)
styled(Button)
styled(TextField)
styled(Table)
styled(Dialog)
```

Do not use:

```tsx
sx={}
style={}
```

Do not use CSS Modules, Sass, Tailwind, styled-components, inline styles, or design objects inside main component files.

## File contract

Every significant component or page:

```text
ComponentName/
├── index.tsx
├── elements.tsx
└── interface.ts
```

`index.tsx`:
- behavior
- state
- events
- composition
- accessibility relationships

`elements.tsx`:
- all `styled()` declarations
- layout
- visual design
- responsive styling
- hover/focus/active visual states

`interface.ts`:
- props and component-specific types

Never declare `styled()` components in `index.tsx`.

## Theme contract

All reusable design decisions come from:

```text
theme/
├── theme.ts
├── palette.ts
├── typography.ts
├── breakpoints.ts
├── spacing.ts
├── shape.ts
├── shadows.ts
├── transitions.ts
├── layout.ts
├── mui.d.ts
├── MUIStyleProvider.tsx
└── components/
```

### Colors

Raw colors are allowed only inside the theme palette source.

Use:

```tsx
theme.vars.palette.primary.main
theme.vars.palette.gas.main
theme.vars.palette.water.main
theme.vars.palette.text.primary
theme.vars.palette.background.paper
theme.vars.palette.divider
```

Never write a raw hex color in component/page styling.

### Typography

Use:

```tsx
...theme.typography.h1
...theme.typography.h2
...theme.typography.body1
```

Do not recreate font size, font weight, and line height repeatedly.

### Spacing

Use:

```tsx
theme.spacing(...)
```

### Responsive design

Use:

```tsx
theme.breakpoints.down(...)
theme.breakpoints.up(...)
```

Do not write raw media-query widths.

### Global content width

Use:

```tsx
theme.layout.maxContentWidth
```

Never repeat `1440px` in page components.

### Radius and transitions

Use:

```tsx
theme.shape.borderRadius
theme.transitions.create(...)
```

## Main-file purity test

A main `index.tsx` or route `page.tsx` fails review if it contains any of:

- `sx`
- `style`
- raw hex/RGB/HSL
- `styled(`
- CSS media query strings
- padding/margin styling
- border styling
- typography styling
- visual hover logic

Main component files should look intentionally boring.

## Palette direction

Use:

- Deep ink primary
- Water blue semantic accent
- LPG burnt-orange semantic accent
- Warm off-white background
- Dark readable text
- Restrained success/warning/error colors

No gradients.

No purple gradients.

No neon.

No glassmorphism.

No glowing decorative shapes.

## Anti-AI-slop rules

Avoid:

- generic centered SaaS hero
- tiny eyebrow text above every heading
- huge hero text
- excessive pill UI
- bento-grid dependency
- card-inside-card layouts
- floating glass cards
- meaningless dashboard metrics
- fake analytics
- repeated status pills
- excessive hover lift
- scale-on-hover everywhere
- animation on every section
- decorative sparkles
- fake partner logos
- generic AI assistant bubbles
- empty premium whitespace
- repetitive template sections

Prefer:

- clear functional hierarchy
- image-led customer pages
- dense but readable admin operations
- mobile-first deliverer workflows
- purposeful motion
- real business language
- strong typography
- semantic color
- accessible forms
- direct status communication

## Customer visual behavior

Customer pages may be more editorial and image-led.

They still must remain practical for:
- browsing
- cart
- checkout
- payment selection
- order tracking
- loyalty

## Admin visual behavior

Admin is an operations workspace.

Prioritize:
- tables
- filtering
- scanning
- search
- queues
- exceptions
- inventory information
- delivery assignment

Do not force dashboard cards when a table or list is clearer.

## Deliverer visual behavior

Deliverer UI is mobile-first.

Prioritize:
- assigned delivery list
- customer delivery information
- payment method
- amount to collect for COD
- simple delivery progression
- delivered/failed outcome

Do not add GPS or route optimization.

## Security during frontend-only phase

Do not:
- store real passwords
- store secrets in browser code
- store payment credentials
- use real customer data
- expose service-role keys
- treat frontend role checks as security
- use unsafe HTML rendering

Mock authentication is presentation behavior only.

## Motion

Use GSAP only for interactions that benefit from sequencing or scroll control.

Use CSS transitions via `theme.transitions` for small hover/focus/state changes.

Respect `prefers-reduced-motion`.

Avoid Lenis in dense admin, checkout, form, and deliverer workflows.

## Responsive requirement

Test at minimum:

- 320
- 375
- 390
- 430
- 768
- 1024
- 1280
- 1440

No horizontal overflow.

## Before coding a page

1. Identify the user role.
2. Identify the task the page must complete.
3. Check the thesis/frontend blueprint for scope.
4. Decide whether the information is best represented as a list, table, form, timeline, or editorial section.
5. Reuse theme tokens.
6. Reuse existing components if the responsibility genuinely matches.
7. Create `interface.ts`.
8. Create `elements.tsx`.
9. Create `index.tsx`.
10. Test mobile.
11. Test keyboard navigation.
12. Audit for AI-slop patterns.
13. Audit for forbidden style leakage.

## Reference hierarchy

When rules conflict, follow this order:

1. User's latest explicit instruction
2. `references/FRONTEND_IMPLEMENTATION_BLUEPRINT.md`
3. This `SKILL.md`
4. Existing project design system
5. General framework convention

Do not silently invent business rules that the blueprint marks unresolved.
