# AI Review Checklist

## Styling

- [ ] No `sx`
- [ ] No inline `style`
- [ ] No `styled()` in `index.tsx`
- [ ] No raw colors in `elements.tsx`
- [ ] Colors use `theme.vars.palette`
- [ ] Typography uses `theme.typography`
- [ ] Spacing uses `theme.spacing`
- [ ] Breakpoints use `theme.breakpoints`
- [ ] 1440px uses `theme.layout.maxContentWidth`

## Design

- [ ] No gradients
- [ ] No glassmorphism
- [ ] No bento-grid dependency
- [ ] No giant generic SaaS hero
- [ ] No status-pill overload
- [ ] No fake metrics
- [ ] No unnecessary cards
- [ ] Mobile layout is intentional

## Architecture

- [ ] Main component contains behavior/composition only
- [ ] Visual code is in `elements.tsx`
- [ ] Props are in `interface.ts`
- [ ] Route files stay thin
- [ ] Mock service layer remains replaceable

## Accessibility

- [ ] Keyboard accessible
- [ ] Visible focus
- [ ] Form labels
- [ ] Reduced motion
- [ ] Contrast considered
- [ ] Semantic components used
