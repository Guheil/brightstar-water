# Theme Contract

Raw visual tokens live only inside the theme.

## Palette

Components consume semantic tokens:

```tsx
theme.vars.palette.primary.main
theme.vars.palette.gas.main
theme.vars.palette.water.main
```

Do not import color constants into `elements.tsx`.

## Typography

Use global variants.

## Spacing

Use `theme.spacing()`.

## Breakpoints

Use `theme.breakpoints`.

## Layout

Use `theme.layout.maxContentWidth`.

## MUI global overrides

Use `theme.components` only for app-wide MUI behavior, not page layouts.
