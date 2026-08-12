# MUI Architecture Reference

## Required flow

```text
theme tokens
    ↓
elements.tsx
    ↓
index.tsx
    ↓
page/feature composition
```

## Never

```text
index.tsx → raw visual values
page.tsx → sx
component → random colors/breakpoints/spacing
```

## Theme token examples

```tsx
theme.vars.palette.primary.main
theme.vars.palette.gas.main
theme.vars.palette.water.main
theme.vars.palette.text.primary
theme.typography.h2
theme.spacing(3)
theme.breakpoints.down('md')
theme.shape.borderRadius
theme.layout.maxContentWidth
```

## Source references

- https://mui.com/system/styled/
- https://mui.com/material-ui/customization/theming/
- https://mui.com/material-ui/customization/css-theme-variables/usage/
- https://mui.com/material-ui/customization/breakpoints/
- https://mui.com/material-ui/customization/theme-components/
- https://mui.com/material-ui/integrations/nextjs/
- https://nextjs.org/docs/app/getting-started/project-structure
- https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
