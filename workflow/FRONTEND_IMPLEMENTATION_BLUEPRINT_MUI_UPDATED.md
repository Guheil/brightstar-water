# Frontend-First Implementation Blueprint
## Web-Based Ordering and Inventory Management System for MRJE Gas and Bright Star Water Refilling Station

> **Purpose of this document:**  
> This is the implementation instruction set for the first development phase of the thesis software. The immediate goal is to build a complete, polished, responsive, and fully navigable **frontend prototype** that demonstrates the intended system behavior before any backend, database, payment integration, or production authentication is connected.

---

# 0. Non-Negotiable Phase Rule

## FRONTEND FIRST. NO BACKEND YET.

Build the frontend as a complete working prototype using mock data and frontend state only.

For this phase:

- Do **not** connect Supabase.
- Do **not** create a real database.
- Do **not** create API endpoints.
- Do **not** implement real payment processing.
- Do **not** implement real GCash verification.
- Do **not** store or request real customer personal data.
- Do **not** implement real authentication or authorization.
- Do **not** place secrets, API keys, service-role keys, or private tokens in the frontend.
- Do **not** create server-side business logic for production use.
- Do **not** claim that the frontend-only prototype is production-secure.
- Do **not** add features that are not justified by the thesis or this implementation document.

The frontend must still behave realistically. Use **mock services, mock data, stateful interactions, validation, loading states, empty states, confirmation states, and realistic workflow transitions** so the prototype can be tested and presented as if the system were connected to a backend.

The implementation must be structured so the mock layer can later be replaced with a real backend without redesigning the entire frontend.

---

# 1. System Interpretation

The software is a **single platform with two customer-facing storefronts and one shared operations system** for MRJE Gas and Bright Star Water Refilling Station.

Customer-facing routes must keep the brands visibly separated:

- `/` is a service gateway where the customer chooses MRJE Gas or Bright Star Water.
- `/mrje` is the MRJE Gas storefront and must show gas products only.
- `/brightstar` is the Bright Star Water storefront and must show water products only.
- Customer account, cart, checkout, order history, loyalty, admin, inventory, and deliverer workflows remain shared.
- A customer may keep products from both storefronts in the same cart.
- Storefront styling may differ by brand, but operational business rules and shared customer state must not be duplicated.

It combines:

- Customer ordering
- Product availability
- Delivery scheduling
- Delivery fee calculation
- COD and GCash-oriented payment flows
- Order tracking
- Inventory monitoring
- Customer records
- Loyalty rewards
- Order cancellation and refunds
- Delivery fulfillment

The system must support exactly **three direct user roles**:

1. **Customer**
2. **Admin**
3. **Deliverer**

There is no separate staff role in this implementation.

---

# 1.1 Multi-Storefront Routing Rule

The two brands must feel like separate websites to the customer without becoming separate applications.

Use explicit App Router segments rather than a generic dynamic brand slug:

```text
/
├── /mrje
│   ├── /shop
│   ├── /product/[id]
│   └── /delivery
├── /brightstar
│   ├── /shop
│   ├── /product/[id]
│   └── /delivery
├── /customer
├── /admin
└── /deliverer
```

Rules:

- Never show water catalog items in MRJE storefront product listings.
- Never show gas catalog items in Bright Star storefront product listings.
- Cross-brand product URLs should resolve to the correct storefront rather than rendering the wrong brand shell.
- Legacy `/shop` and `/product/[id]` links should remain compatible through redirects.
- Do not duplicate authentication, cart, checkout, loyalty, order, inventory, or delivery state by storefront.
- Storefront-specific navigation should always provide a clear path to switch to the other brand and return to the service gateway.

---

# 2. Scope Change From the Original Thesis

The original thesis described delivery confirmation as administrator-managed and did not include a dedicated driver application.

For this implementation, **Deliverer is now a direct system user**.

This is an intentional scope adjustment.

The deliverer experience must remain practical and limited. Do not turn it into a logistics platform.

The deliverer should be able to:

- Sign in to a deliverer account in the future production version
- See deliveries assigned to them
- Open a delivery
- View customer delivery information required to complete the delivery
- View order items
- View COD or GCash payment status information that is relevant to fulfillment
- Update delivery progress
- Mark a delivery as delivered or failed
- Add a short delivery note when needed
- Review completed delivery history

Do **not** implement:

- Live GPS tracking
- Background location tracking
- Route optimization
- Fleet management
- Driver-to-driver messaging
- Third-party logistics integration
- Real-time map tracking
- Geofencing

These are outside the current thesis-oriented scope.

---

# 3. Recommended Frontend Technology and MUI Standard

Use the thesis technology direction while keeping the first implementation phase strictly frontend-only.

## Required stack

- **Next.js 14+ using the App Router**
- **React**
- **TypeScript**
- **Material UI v9**
- **MUI System `styled()`**
- **Emotion**, as used by Material UI by default
- **GSAP**
- **GSAP ScrollTrigger**
- **Lenis**
- Semantic HTML
- Responsive design
- WCAG-aware accessibility

At the time this blueprint was updated, the current Material UI documentation is on the v9 release line. Use the latest stable compatible v9 release in the project rather than pinning this document to a specific patch release.

## Strict styling decision

The project must use **MUI `styled()` as the application styling method**.

Import `styled` from:

```ts
import { styled } from '@mui/material/styles';
```

For layout elements, prefer:

```ts
styled(Box)
```

For text:

```ts
styled(Typography)
```

For controls, style the semantic MUI component itself:

```ts
styled(Button)
styled(TextField)
styled(Select)
styled(Table)
styled(TableRow)
styled(Dialog)
```

Do not wrap a `Box` and pretend it is a button, input, link, or other semantic control.

## Styling methods prohibited in application components

Do not use:

```tsx
sx={{}}
style={{}}
```

Do not use:

- CSS Modules for application component styling
- Sass/SCSS for application component styling
- Tailwind utility classes
- styled-components package
- Emotion `css` prop directly
- raw inline CSS objects in `index.tsx`
- raw CSS media query strings
- page-specific global CSS
- design constants declared inside component logic files

The only acceptable global CSS should be minimal framework-level CSS when it cannot reasonably be represented by the theme, such as document-level defaults required outside Material UI. Even then, prefer `CssBaseline` and theme configuration first.

## No design code in main component files

A component or page `index.tsx` must contain:

- imports
- data/state
- hooks
- handlers
- business behavior
- conditions
- component composition
- accessibility relationships

It must **not** contain:

- colors
- padding values
- margins
- border radius
- shadows
- typography definitions
- responsive CSS
- layout CSS
- hover CSS
- animation CSS
- `styled()` declarations
- `sx`
- inline `style`

All visual implementation belongs in `elements.tsx`.

---

## Motion

Use:

- **GSAP**
- **GSAP ScrollTrigger**
- **Lenis**

Motion must remain purposeful.

### Lenis usage

Use Lenis primarily on:

- Customer-facing landing content
- Product browsing experiences where smooth scrolling improves presentation

Avoid forcing smooth scrolling on:

- Admin productivity screens
- Dense tables
- Deliverer workflows
- Forms
- Checkout

Those areas should feel direct and operational.

### GSAP usage

Use GSAP for:

- Controlled section entrances
- Product image reveals
- Header transitions
- Navigation transitions
- Order confirmation transitions
- Small interaction choreography

Do not animate everything.

Respect `prefers-reduced-motion`.

If reduced motion is enabled:

- Remove non-essential scroll animation
- Remove parallax
- Remove large transforms
- Keep only instant or subtle feedback transitions

---

# 4. Strict File and Folder Architecture

Organize the application by routing, feature ownership, reusable components, and a centralized theme.

Next.js route groups may be used to organize public, customer, admin, and deliverer areas without changing the URL path.

Recommended structure:

```text
src/
├── app/
│   ├── layout.tsx
│   │
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── shop/
│   │   │   └── page.tsx
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── about-delivery/
│   │       └── page.tsx
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   ├── (customer)/
│   │   └── customer/
│   │       ├── account/
│   │       │   └── page.tsx
│   │       ├── cart/
│   │       │   └── page.tsx
│   │       ├── checkout/
│   │       │   └── page.tsx
│   │       ├── orders/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── loyalty/
│   │       │   └── page.tsx
│   │       └── profile/
│   │           └── page.tsx
│   │
│   ├── (admin)/
│   │   └── admin/
│   │       ├── overview/
│   │       │   └── page.tsx
│   │       ├── orders/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── deliveries/
│   │       │   └── page.tsx
│   │       ├── inventory/
│   │       │   └── page.tsx
│   │       ├── products/
│   │       │   └── page.tsx
│   │       ├── customers/
│   │       │   └── page.tsx
│   │       └── loyalty/
│   │           └── page.tsx
│   │
│   └── (deliverer)/
│       └── deliverer/
│           ├── deliveries/
│           │   ├── page.tsx
│           │   └── [id]/
│           │       └── page.tsx
│           ├── history/
│           │   └── page.tsx
│           └── profile/
│               └── page.tsx
│
├── pages/
│   ├── public/
│   ├── customer/
│   ├── admin/
│   └── deliverer/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── commerce/
│   ├── orders/
│   ├── delivery/
│   ├── inventory/
│   ├── customers/
│   └── loyalty/
│
├── features/
│   ├── auth/
│   ├── cart/
│   ├── checkout/
│   ├── products/
│   ├── orders/
│   ├── inventory/
│   ├── delivery/
│   └── loyalty/
│
├── theme/
│   ├── index.ts
│   ├── theme.ts
│   ├── palette.ts
│   ├── typography.ts
│   ├── breakpoints.ts
│   ├── spacing.ts
│   ├── shape.ts
│   ├── shadows.ts
│   ├── transitions.ts
│   ├── layout.ts
│   ├── mui.d.ts
│   ├── MUIStyleProvider.tsx
│   └── components/
│       ├── button.ts
│       ├── textField.ts
│       ├── table.ts
│       ├── dialog.ts
│       └── index.ts
│
├── mocks/
│   ├── products.ts
│   ├── customers.ts
│   ├── orders.ts
│   ├── deliveries.ts
│   ├── inventory.ts
│   └── loyalty.ts
│
├── services/
│   ├── interfaces/
│   └── mock/
│
├── store/
├── hooks/
├── lib/
├── types/
└── utils/
```

## Route file rule

Files inside `app/**/page.tsx` should remain thin routing adapters whenever possible.

Example:

```tsx
import OrdersPage from '@/pages/admin/OrdersPage';

export default function Page() {
  return <OrdersPage />;
}
```

Do not build a 500-line application screen directly inside a Next.js route file.

---

# 5. Component and Page Folder Contract

Every significant page or reusable component should follow the same predictable structure.

```text
ComponentName/
├── index.tsx
├── elements.tsx
└── interface.ts
```

Additional files are allowed only when the component genuinely requires them:

```text
ComponentName/
├── index.tsx
├── elements.tsx
├── interface.ts
├── constants.ts
├── hooks/
│   └── useComponentName.ts
└── components/
    └── ChildComponent/
        ├── index.tsx
        ├── elements.tsx
        └── interface.ts
```

## `index.tsx`

Owns:

- React composition
- props
- state
- hooks
- event handlers
- conditionals
- orchestration
- accessibility relationships
- calls into services/store

Does not own styling.

## `elements.tsx`

Owns:

- all MUI `styled()` declarations
- layout
- spacing application
- visual hierarchy
- color usage
- typography application
- borders
- radius
- shadows
- responsive rules
- pseudo selectors
- hover/focus/active visual behavior

## `interface.ts`

Owns:

- props
- component-specific interfaces
- component-specific UI state types

Do not duplicate domain types already defined in `/types` or a feature domain.

## Colocation rule

Start a component close to the page or feature that owns it.

Promote it to `/components` only after real reuse exists.

Do not create a huge global component library in advance.

---

# 5A. Global Theme Folder Contract

The `theme/` directory is the single source of truth for reusable visual tokens.

```text
theme/
├── index.ts
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
    ├── button.ts
    ├── textField.ts
    ├── table.ts
    ├── dialog.ts
    └── index.ts
```

## Token ownership

| Design concern | Source |
|---|---|
| Colors | `theme/palette.ts` |
| Typography | `theme/typography.ts` |
| Breakpoints | `theme/breakpoints.ts` |
| Spacing scale | `theme/spacing.ts` |
| Radius | `theme/shape.ts` |
| Shadows | `theme/shadows.ts` |
| Transitions | `theme/transitions.ts` |
| 1440px layout constraint | `theme/layout.ts` |
| Global MUI component defaults | `theme/components/*` |
| Complete theme assembly | `theme/theme.ts` |
| Theme context/provider | `theme/MUIStyleProvider.tsx` |
| Custom theme typing | `theme/mui.d.ts` |

---

# 5B. Palette Rule

All application colors must come from the MUI theme.

Raw hex, RGB, HSL, OKLCH, or named CSS colors are prohibited in page/component `elements.tsx` files.

Raw color definitions belong only in the palette/theme source.

Use:

```tsx
theme.vars.palette.primary.main
theme.vars.palette.primary.dark
theme.vars.palette.primary.contrastText

theme.vars.palette.text.primary
theme.vars.palette.text.secondary

theme.vars.palette.background.default
theme.vars.palette.background.paper

theme.vars.palette.divider

theme.vars.palette.success.main
theme.vars.palette.warning.main
theme.vars.palette.error.main
```

For this business, add semantic palette groups:

```tsx
theme.vars.palette.gas.main
theme.vars.palette.water.main
```

This is the intended meaning of the project's "use palette.main" rule.

A styled file must call semantic theme palette tokens rather than importing color constants or writing raw values.

## Recommended palette shape

```ts
primary.main
secondary.main
gas.main
water.main
success.main
warning.main
error.main
background.default
background.paper
text.primary
text.secondary
divider
```

Do not use `warning` merely because something is orange if it semantically represents LPG. Use `gas.main`.

---

# 5C. CSS Theme Variables

Enable Material UI CSS theme variables:

```ts
const theme = createTheme({
  cssVariables: true,
});
```

When CSS variables are enabled, prefer:

```tsx
theme.vars.palette.primary.main
```

over:

```tsx
theme.palette.primary.main
```

for component color application.

This makes the token relationship explicit in generated CSS and keeps colors aligned with the global theme.

For non-color design tokens, continue using the normal theme APIs:

```tsx
theme.typography.h2
theme.spacing(3)
theme.breakpoints.down('md')
theme.shape.borderRadius
theme.transitions.create(...)
theme.layout.maxContentWidth
```

---

# 5D. Typography Rule

All reusable typography definitions belong in `theme/typography.ts`.

Do not repeatedly define:

```tsx
fontSize
fontWeight
lineHeight
letterSpacing
fontFamily
```

inside page styling unless a genuinely unique one-off typographic treatment is approved.

Prefer:

```tsx
...theme.typography.h1
...theme.typography.h2
...theme.typography.h3
...theme.typography.body1
...theme.typography.body2
...theme.typography.button
```

Example:

```tsx
export const Heading = styled(Typography)(({ theme }) => ({
  ...theme.typography.h2,
  color: theme.vars.palette.text.primary,
}));
```

---

# 5E. Breakpoint Rule

Responsive design must use MUI theme breakpoint helpers.

Use:

```tsx
[theme.breakpoints.down('md')]: {
  // responsive rule
}
```

or:

```tsx
[theme.breakpoints.up('lg')]: {
  // responsive rule
}
```

Do not write:

```tsx
'@media (max-width: 900px)'
```

The project's breakpoint values belong in `theme/breakpoints.ts`.

Recommended values:

```ts
xs: 0
sm: 600
md: 900
lg: 1200
xl: 1440
```

The `xl` value aligns with the project's maximum content width target, but page content must still use a dedicated layout token rather than treating the breakpoint itself as the container width.

---

# 5F. Spacing Rule

Centralize the base spacing scale through MUI.

Recommended base:

```ts
export const spacing = 8;
```

Use:

```tsx
theme.spacing(1)
theme.spacing(2)
theme.spacing(3)
theme.spacing(4)
```

Do not repeatedly use:

```tsx
'16px'
'24px'
'32px'
```

for ordinary spacing.

Small optical exceptions are allowed only when clearly justified and should remain rare.

---

# 5G. Global Layout Tokens

The 1440px content rule must have one source of truth.

Define:

```ts
export const layout = {
  maxContentWidth: 1440,
  desktopGutter: 32,
  tabletGutter: 24,
  mobileGutter: 16,
};
```

Expose it through theme augmentation.

Use:

```tsx
maxWidth: theme.layout.maxContentWidth
```

rather than:

```tsx
maxWidth: '1440px'
```

in every page.

Full-width backgrounds may span the viewport while inner content stays within the global content width.

---

# 5H. Shape, Shadow, and Transition Rules

## Radius

Use theme-based radius.

For ordinary controls:

```tsx
borderRadius: theme.shape.borderRadius
```

If several radius levels are truly needed, extend the theme with semantic radius tokens.

Do not invent arbitrary radius values throughout the application.

## Shadows

Prefer theme shadows or project shadow tokens.

Avoid custom large diffuse shadows.

The design direction intentionally avoids generic AI-generated floating-card visuals.

## Transitions

Use:

```tsx
theme.transitions.create(...)
```

for small CSS state transitions.

Use GSAP only when motion behavior genuinely requires animation sequencing, scroll triggers, or richer interaction.

Do not use GSAP to replace simple hover/focus CSS.

---

# 5I. Global MUI Component Overrides

Use `theme/components/*` only for application-wide MUI defaults.

Good examples:

- Button text casing
- Default button elevation
- Default field radius
- Table density
- Dialog radius
- Input focus appearance

Example concept:

```ts
MuiButton: {
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      textTransform: 'none',
      borderRadius: theme.shape.borderRadius,
    }),
  },
}
```

Do not put page-specific layouts inside `theme.components`.

Bad examples:

- Admin order page layout
- Checkout sidebar positioning
- Product hero composition
- Delivery detail page spacing

Those belong in each page/component `elements.tsx`.

---

# 5J. MUIStyleProvider and Next.js App Router Integration

Create a project-owned provider:

```text
theme/MUIStyleProvider.tsx
```

Its responsibility is to apply:

- `ThemeProvider`
- `CssBaseline`
- any theme-level provider behavior

Example:

```tsx
'use client';

import type { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

interface MUIStyleProviderProps {
  children: ReactNode;
}

export default function MUIStyleProvider({
  children,
}: MUIStyleProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
```

For Next.js App Router, also use Material UI's official `AppRouterCacheProvider` integration so MUI server-generated styles are collected correctly during streamed rendering.

The exact import path depends on the Next.js major version.

Follow the installed version using the documented form:

```ts
@mui/material-nextjs/v1X-appRouter
```

Do not blindly copy a provider path for a different Next.js major version.

Conceptual root layout:

```tsx
import { AppRouterCacheProvider } from '@mui/material-nextjs/v1X-appRouter';
import MUIStyleProvider from '@/theme/MUIStyleProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <MUIStyleProvider>
            {children}
          </MUIStyleProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

---

# 5K. Example of the Required Component Separation

## `interface.ts`

```ts
export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  onAddToCart: () => void;
}
```

## `elements.tsx`

```tsx
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px solid ${theme.vars.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

export const Content = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
}));

export const Title = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  color: theme.vars.palette.text.primary,
}));

export const Price = styled(Typography)(({ theme }) => ({
  ...theme.typography.h6,
  color: theme.vars.palette.primary.main,
}));

export const AddButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(6),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },

  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));
```

## `index.tsx`

```tsx
import {
  Root,
  Content,
  Title,
  Price,
  AddButton,
} from './elements';

import type { ProductCardProps } from './interface';

export default function ProductCard({
  name,
  price,
  stock,
  onAddToCart,
}: ProductCardProps) {
  const available = stock > 0;

  return (
    <Root>
      <Content>
        <Title>{name}</Title>
        <Price>₱{price}</Price>

        <AddButton
          disabled={!available}
          onClick={onAddToCart}
        >
          {available ? 'Add to Cart' : 'Out of Stock'}
        </AddButton>
      </Content>
    </Root>
  );
}
```

The main component does not know how the component looks.

---

# 5L. Styling Audit Rules

The implementing AI must reject these patterns during code review.

## Prohibited in `index.tsx` and `page.tsx`

```tsx
sx={{ p: 2 }}

style={{ marginTop: 20 }}

<Box bgcolor="#fff">

<div className="mt-4">

const styles = {
  padding: 24,
};
```

## Prohibited in ordinary `elements.tsx`

```tsx
color: '#17201D'
backgroundColor: '#FFFFFF'
padding: '24px'
maxWidth: '1440px'
'@media (max-width: 900px)': {}
```

## Correct

```tsx
color: theme.vars.palette.text.primary
backgroundColor: theme.vars.palette.background.paper
padding: theme.spacing(3)
maxWidth: theme.layout.maxContentWidth
[theme.breakpoints.down('md')]: {}
```

Exceptions for values that are inherently CSS mechanics rather than design tokens are allowed, such as:

```tsx
width: '100%'
display: 'flex'
position: 'relative'
overflow: 'hidden'
gridTemplateColumns: '1fr 1fr'
```

The rule is not to convert every CSS keyword into a theme token. The rule is to centralize **design decisions**.

---

# 5M. Architecture Dependency Rule

Use this mental model:

```text
GLOBAL THEME
     ↓
elements.tsx
     ↓
index.tsx
     ↓
page / feature composition
```

Avoid:

```text
index.tsx
     ↓
raw visual values
```

Avoid:

```text
page.tsx
     ↓
sx
```

Avoid:

```text
component
     ↓
its own random colors / breakpoints / spacing system
```

---

# 6. Frontend Architecture and Mock Service Rule

The UI must not directly depend on hardcoded mock arrays everywhere.

Create a **mock service layer**.

Example concept:

```text
UI
↓
feature hook / store
↓
service interface
↓
mock implementation
↓
mock fixtures
```

Later:

```text
UI
↓
feature hook / store
↓
service interface
↓
real API implementation
↓
backend
```

This prevents the frontend from being rewritten when backend development starts.

## Separation of concerns

Use:

```text
theme/
```

for reusable design tokens.

Use:

```text
elements.tsx
```

for visual implementation.

Use:

```text
index.tsx
```

for component behavior and composition.

Use:

```text
features/
```

for business feature logic.

Use:

```text
services/
```

for mock or future backend access contracts.

Use:

```text
store/
```

for shared client state.

Do not place business calculations inside `elements.tsx`.

Do not place theme definitions inside feature code.

---

# 7. Required Frontend Behavior

The prototype must feel functional.

It must support:

- Product browsing
- Searching
- Filtering
- Add to cart
- Quantity changes
- Cart totals
- Delivery fee simulation
- Checkout progression
- COD / GCash selection
- Mock order submission
- Order creation
- Mock order tracking
- Mock cancellations
- Mock refund states
- Mock loyalty calculations
- Admin order updates
- Admin delivery assignment
- Deliverer status updates
- Inventory changes
- Product availability changes
- Empty states
- Error states
- Loading states
- Success states

Use mock state to make changes visible across the frontend during the session.

Where useful, use local persistence for **non-sensitive demo state**.

---

# 8. Frontend Demo Data Rules

All prototype data must be fictional.

Never use actual:

- Customer names
- Phone numbers
- Addresses
- GCash accounts
- Payment screenshots
- Passwords
- IDs
- Employee data

Use obviously fictional but realistic examples.

Example:

```text
Customer: Maria Santos
Address: Sample Subdivision, San Pedro, Laguna
Mobile: 09XX-XXX-XXXX
```

The prototype must make it impossible to confuse demo information with real production data.

---

# 9. Mock Authentication Strategy

Because there is no backend yet, authentication is only simulated.

Do not build fake security and then treat it as production authentication.

## Prototype behavior

Create a normal login interface that remains password-manager friendly, allows password paste, uses generic invalid-credential messaging, and offers a show/hide password control.

For the frontend prototype, login fields should start empty. Fictional demo accounts may be exposed through clearly labeled prototype shortcuts that populate the form, but the interface must not present a public role selector.

The authentication shell should use full-bleed service photography on desktop while keeping meaningful copy and form content within the shared 1440px content system. On tablet and mobile, authentication must recompose intentionally: show the platform identity first, use a compact full-width service-image strip, then prioritize the form and prototype controls without preserving a desktop split layout.

During development, provide test accounts such as:

```text
customer.demo@example.test
admin.demo@example.test
deliverer.demo@example.test
```

Use fixed non-sensitive demo credentials.

Alternatively, add a **development-only demo role switcher** that is clearly marked as a prototype tool.

The final presentation UI should not contain a public role selector that makes it appear users choose their own authorization level.

In the final backend:

- Role must come from trusted server-side identity data.
- Users must never be allowed to grant themselves Admin or Deliverer privileges.

---

# 10. Visual Direction

## Overall Design Character

The visual identity should feel:

- Professional
- Local-business appropriate
- Trustworthy
- Modern
- Practical
- Warm
- Clean
- Product-focused
- Operationally clear
- Distinct from generic AI-generated startup dashboards

The system combines **energy / LPG** and **water delivery**, so the identity can reference both without becoming literal or gimmicky.

Do not create a tech-startup aesthetic.

Do not use neon, futuristic cyber visuals, glass panels, floating gradient blobs, or glowing UI.

The interface should look like a **carefully designed commerce and service system**, not a SaaS template.

---

# 11. Color Palette

## Core Neutral Palette

### Deep Ink
`#0E2A36`

Use for:

- Primary navigation
- Primary buttons
- Strong headings
- Important UI anchors
- Admin navigation

This is the main brand anchor.

---

### Main Text
`#17201D`

Use for:

- Body copy
- Product information
- Labels
- Tables
- Form text

---

### Muted Text
`#5E6965`

Use for:

- Secondary information
- Supporting descriptions
- Timestamps
- Less-important metadata

Do not use lighter gray text when it hurts contrast.

---

### Warm Canvas
`#F7F5EF`

Use as the primary customer-facing background.

It gives the product a warmer physical-business character than sterile SaaS gray.

---

### Surface White
`#FFFFFF`

Use for:

- Forms
- Operational panels
- Product surfaces where separation is necessary
- Admin work areas

Do not put every section inside a white card.

---

### Soft Neutral
`#EEF1ED`

Use for:

- Subtle section separation
- Table hover backgrounds
- Disabled regions
- Neutral information surfaces

---

### Border
`#D8DDD9`

Use sparingly.

Borders should communicate structure, not decorate every object.

---

# 12. Functional Accent Colors

## Gas / Energy Accent
`#B95418`

Use for:

- LPG category identity
- Gas-related product markers
- Selected gas category controls
- Occasional visual accents

White text on this color has sufficient contrast for regular UI text.

Do not turn the entire website orange.

---

## Water Accent
`#1F6C8A`

Use for:

- Water products
- Water-category identity
- Delivery/service visuals
- Secondary emphasis

---

## Success
`#2E6B4F`

Use for:

- Confirmed
- Delivered
- Successful
- In-stock confirmation

---

## Danger
`#B23A34`

Use for:

- Cancellation
- Failed delivery
- Destructive actions
- Important errors

---

## Warning

Use a warm amber-brown with high contrast.

Do not use bright yellow text on white.

---

# 13. Color Usage Rules

- Never use gradients.
- Never use purple as a primary interface color.
- Never use purple-to-blue AI gradients.
- Never use cyan glow on dark backgrounds.
- Never use gradient text.
- Never rely on color alone to communicate status.
- Always pair meaningful color with text and/or iconography.
- Maintain at least WCAG AA text contrast.
- Use dark text on light surfaces.
- Use white text only on sufficiently dark colors.
- Do not invent dozens of shades just to make the theme look sophisticated.

---

# 14. Typography

Use a two-family system to avoid the generic one-font-everywhere appearance while preserving readability.

## Interface Font

**IBM Plex Sans**

Use for:

- Navigation
- Forms
- Tables
- Buttons
- Prices
- Operational UI
- Product descriptions

## Display Font

**IBM Plex Serif**

Use sparingly for:

- Customer homepage hero
- Selected category headings
- Editorial-style promotional headings

Do not use display typography inside dense admin tables or deliverer workflows.

---

# 15. Type Scale

Suggested responsive hierarchy:

```text
Display / Hero:
Desktop: 52–60px
Mobile: 36–42px

H1:
Desktop: 40–48px
Mobile: 32–36px

H2:
Desktop: 30–36px
Mobile: 26–30px

H3:
22–26px

Body Large:
18px

Body:
16px

Body Small:
14px

Fine Print:
12–13px only when necessary
```

## Rules

- Do not create giant 90px+ startup hero headings.
- Do not use tiny uppercase eyebrow text above every heading.
- Do not use all caps for paragraphs.
- Avoid extremely light font weights.
- Use comfortable line height.
- Keep body copy widths readable.
- Do not use heading sizes that are almost identical.
- Do not make every section heading centered.

---

# 16. Spacing System

Use an intentional 8px-based spacing scale:

```text
4
8
12
16
24
32
40
48
64
80
96
```

Do not randomly use arbitrary gaps unless an optical adjustment is genuinely required.

## Page container

```text
max-width: 1440px
```

Full-width backgrounds are allowed.

Content must remain inside the 1440px content container with responsive side padding.

Suggested horizontal padding:

```text
Desktop: 32px
Tablet: 24px
Mobile: 16px
```

---

# 17. Radius and Shape System

Avoid the over-rounded AI-generated SaaS look.

Suggested:

```text
Buttons: 8px
Inputs: 8px
Small utility containers: 8px
Product media: 10–12px
Major surfaces: 12px maximum
```

Do not use:

- 24px rounded cards everywhere
- giant pill buttons
- pill navigation everywhere
- rounded rectangles around every piece of text

Status indicators should normally use:

- Text
- Small icon or dot
- Optional restrained label

Do not automatically render every status as a pill.

---

# 18. Shadows

Use shadows rarely.

Prefer:

- Surface contrast
- Spacing
- Borders
- Typography
- Background shifts

Avoid the AI-generated pattern of:

> 1px border + giant soft shadow + rounded card

If elevation is needed, keep it subtle and limited to:

- Floating menus
- Dialogs
- Sticky checkout summaries
- Temporary overlays

---

# 19. Iconography

Use a consistent icon library such as **Lucide**.

Icons must communicate a function.

Do not:

- Put every icon inside a colored circle
- Use oversized icons above text
- Use icons as filler
- Use emojis as interface icons
- Add decorative sparkles
- Add generic AI stars
- Add robot icons unless genuinely required

---

# 20. Anti-AI-Slop Design Doctrine

Research into current AI-generated interface patterns shows recurring visual defaults such as purple gradients, glassmorphism, glowing accents, nested cards, oversized rounded surfaces, repeated hero/metric/card templates, generic typography, decorative animation, and redundant UX writing.

This project must deliberately reject those defaults.

## Forbidden or Strongly Discouraged Patterns

### 1. Purple gradients
Do not use them.

### 2. Gradients in general
Avoid them entirely for this system.

### 3. Glassmorphism
No frosted glass cards, blurred panels, or transparent neon surfaces.

### 4. Glowing orbs
No decorative background spheres or hazy radial lights.

### 5. Neon-on-dark styling
This is not a gaming or crypto interface.

### 6. Gradient text
Use solid typography.

### 7. Generic centered SaaS hero
Avoid the pattern:

```text
tiny eyebrow
giant centered heading
generic paragraph
two pill buttons
floating dashboard screenshot
```

### 8. Tiny text above every heading
Do not use repetitive eyebrow labels.

### 9. Massive hero typography
The brand should not depend on huge text filling the entire viewport.

### 10. Cardocalypse
Do not place every piece of content in a card.

### 11. Cards inside cards
Avoid nested surfaces unless hierarchy genuinely requires it.

### 12. Bento-grid obsession
Do not turn ordinary content into a bento grid.

### 13. Random metric cards
Only show metrics that help the user make a decision.

### 14. Side-tab accent cards
Avoid the common thick colored stripe on the left of every card.

### 15. Hairline border + diffuse shadow on every surface
Choose structure deliberately.

### 16. Oversized icon boxes
Icons should not overpower content.

### 17. One font with no typographic personality
Use the defined type system.

### 18. Overused AI-default font combinations
Do not automatically reach for Inter, Geist, Space Grotesk, or Instrument Serif simply because they are common in generated interfaces.

### 19. Over-rounding
Do not make every component look like a pill.

### 20. Excessive status pills
Status should be readable without turning the page into rows of colored capsules.

### 21. Fake statistics
Never invent business metrics to make a dashboard look impressive.

### 22. Generic "future" language
Avoid phrases such as:

- Experience the future
- Revolutionize your experience
- Seamless innovation
- Elevate your journey
- Next-generation platform

Write concrete business language.

### 23. Redundant UX copy
Do not use a label, subtitle, helper sentence, and tooltip that all say the same thing.

### 24. Animation without purpose
Do not bounce, wiggle, float, rotate, or pulse elements just because motion is available.

### 25. Hover lift on everything
Do not translate every card upward on hover.

### 26. Scale-on-hover everywhere
Use selective image or button feedback.

### 27. Constant scroll reveal
Not every paragraph needs to fade upward.

### 28. Typewriter animations
Avoid them.

### 29. Decorative marquees
Do not create infinite logo or text marquees unless a real use case exists.

### 30. Fake 3D elements
Do not add random 3D shapes.

### 31. Modal abuse
Complex workflows deserve full pages.

### 32. Overloaded dashboards
The dashboard should answer operational questions, not display every possible statistic.

### 33. Unnecessary lines above headings
Do not add decorative rules just to style sections.

### 34. Empty "premium" whitespace
Whitespace must improve reading and hierarchy, not artificially inflate page length.

### 35. Repeated section templates
Each section should be composed based on its content.

### 36. Generic testimonial sections
Do not add testimonials unless the thesis/business actually requires them.

### 37. Fake brand logos
Do not fill the homepage with invented partner logos.

### 38. AI assistant floating button
Do not add an AI chat bubble unless AI support is a real requirement.

### 39. Decorative badges everywhere
Badges are for meaningful state or classification.

### 40. Surprise without usability
Creative interactions must still be predictable enough for customers to complete an order.

---

# 21. Preferred Visual Composition

The design should rely on:

- Strong photography
- Product detail
- Purposeful whitespace
- Typographic contrast
- Functional color
- Real service information
- Clear hierarchy
- Direct calls to action
- Intentional layout variation
- Calm motion

Customer pages can be more expressive.

Admin and deliverer pages must prioritize speed and clarity.

---

# 22. Customer Experience

## Customer Navigation

Primary navigation:

- Shop
- Gas
- Water
- My Orders
- Loyalty

Utilities:

- Search
- Cart
- Account

Mobile navigation should be compact.

Do not reproduce a desktop menu at mobile width.

---

# 23. Customer Pages

## 23.1 Homepage

### Purpose

Introduce the business and move users into ordering quickly.

### Required sections

The root `/` page is a short service gateway. The full landing-page depth belongs to `/mrje` and `/brightstar`. Each storefront landing page must contain enough service information to feel complete without copying the other brand's composition.

MRJE Gas should include, at minimum:

1. Brand header and image-led hero
2. Gas product preview
3. Everyday cooking / service context
4. LPG ordering and product-selection guidance
5. Delivery coverage and transparent fee explanation
6. COD and simulated GCash payment explanation
7. Shared account and order-tracking explanation
8. Loyalty information without inventing unresolved reward formulas
9. Strong storefront closing action
10. Footer

Bright Star Water should include, at minimum:

1. Brand header and image-led hero
2. Water product preview
3. Refill / container service explanation
4. Repeat-ordering and household routine context
5. Delivery coverage and scheduling explanation
6. COD and simulated GCash payment explanation
7. Shared account and order-history explanation
8. Loyalty information without inventing unresolved reward formulas
9. Strong storefront closing action
10. Footer

The two storefronts may share system behavior and theme tokens, but their section order, imagery, pacing, and visual composition should remain intentionally distinct. Representative service photography must never be described as an actual MRJE or Bright Star facility unless it is verified as such.

### Hero direction

Use an image-led split or asymmetric editorial composition.

Potential structure:

```text
Left:
Clear headline
Short service statement
Primary Shop button
Secondary delivery information link

Right:
Strong product or delivery imagery
```

Do not use a generic abstract tech illustration.

---

## 23.2 Shop / Product Listing

### Purpose

Allow customers to browse available items efficiently.

### Required features

- Search
- Category filter
- Gas
- Water
- Accessories where applicable
- Availability
- Sort when useful
- Product image
- Product name
- Price
- Stock / availability message
- Add to cart

### Layout

Desktop:

- Optional compact left filter region
- Product grid with consistent card dimensions

Mobile:

- Filter button or horizontal category controls
- 2-column or 1-column product layout depending on content density

Do not use bento cards.

---

## 23.3 Product Detail

### Required information

- Product image
- Product name
- Category
- Price
- Availability
- Product description
- Quantity
- Add to cart
- Delivery eligibility reminder where relevant

Avoid excessive tabs.

Keep core purchase information visible without making users hunt for it.

---

## 23.4 Cart

### Required

- Product list
- Quantity controls
- Remove
- Item subtotal
- Estimated order subtotal
- Loyalty preview when applicable
- Delivery fee note
- Checkout CTA

Do not calculate final delivery cost until the delivery location is known.

---

## 23.5 Checkout

Use a clear multi-stage flow.

Do not use numbered circles.

Suggested progress presentation:

```text
Delivery  /  Payment  /  Review
```

Current stage can use:

- Stronger text
- Underline
- Accent color

### Delivery stage

Collect mock:

- Customer name
- Contact
- Delivery address
- Delivery schedule
- Delivery notes

Calculate mock delivery zone.

### Payment stage

Allow:

- Cash on Delivery
- GCash

For the prototype, GCash is simulated.

Do not request real payment credentials.

Use a mock QR graphic or clearly marked placeholder.

### Review stage

Show:

- Products
- Quantity
- Product subtotal
- Delivery fee
- Loyalty discount if applicable
- Final total
- Delivery schedule
- Payment method
- Delivery address

Require explicit confirmation.

---

## 23.6 Order Confirmation

Do not use confetti.

Use a calm confirmation transition.

Show:

- Order reference
- Order date
- Delivery schedule
- Payment method
- Amount
- Current order state
- View Order CTA
- Continue Shopping CTA

---

## 23.7 My Orders

Show:

- Active orders first
- Past orders after
- Search when history becomes large
- Order reference
- Date
- Total
- Delivery schedule
- Current state

Use a clean list rather than dozens of isolated cards.

---

## 23.8 Order Detail / Tracking

### Must include

- Order reference
- Current status
- Timeline
- Delivery schedule
- Delivery address
- Products
- Payment method
- Totals
- Loyalty effect
- Cancellation action when allowed
- Refund information when applicable

### Suggested mock order states

These states are recommended for the prototype and must be confirmed before backend implementation:

```text
Pending Review
Confirmed
Preparing
Assigned for Delivery
Out for Delivery
Delivered
Cancelled
Refund Pending
Refunded
Delivery Failed
```

Do not treat these as thesis-confirmed business rules until stakeholders approve them.

---

## 23.9 Loyalty

Show:

- Current points
- Peso-equivalent value
- How points are earned
- Recent loyalty activity
- Qualification progress for any bonus rule
- Redemption explanation

### Important

The thesis contains conflicting loyalty descriptions.

Until the researchers approve one final formula, isolate the loyalty calculation in a configuration file.

Do not scatter the formula throughout components.

Example:

```text
loyaltyConfig.ts
```

The frontend should make the rule easily replaceable.

---

## 23.10 Customer Account

Include:

- Profile
- Saved delivery information
- Order history link
- Loyalty link

Do not add dozens of account settings that are not required.

---

# 24. Admin Experience

Admin is an operations workspace.

The admin interface should feel dense, clear, and efficient.

Do not make it look like a startup analytics dashboard.

---

# 25. Admin Navigation

Suggested primary navigation:

- Overview
- Orders
- Deliveries
- Inventory
- Products
- Customers
- Loyalty

Secondary:

- Account
- Sign out

Use a left sidebar on desktop.

On smaller screens use a drawer.

---

# 26. Admin Overview

The Overview page should answer:

- What needs attention right now?
- How many active orders exist?
- Are any deliveries overdue?
- Which products are low in stock?
- Are there cancellations/refunds needing review?

Avoid fake charts.

### Suggested layout

1. Page title and date
2. Simple inline operational summary
3. Active order queue
4. Delivery attention list
5. Low-stock list
6. Recent activity

Metrics should not all be separate floating cards.

Use a restrained summary strip.

---

# 27. Admin Orders

Use a high-density table on desktop.

Suggested columns:

- Order
- Customer
- Date
- Delivery schedule
- Payment
- Total
- Order status
- Delivery state
- Action

Support:

- Search
- Status filter
- Payment filter
- Date filter
- Sort
- Pagination or mock pagination

Mobile should become a structured list.

Do not horizontally squeeze a desktop table until it becomes unreadable.

---

# 28. Admin Order Detail

This is one of the most important admin screens.

Include:

- Customer information
- Order products
- Payment information
- Delivery details
- Inventory impact
- Loyalty impact
- Order timeline
- Cancellation state
- Refund state
- Assigned deliverer
- Internal operational notes

Prototype interactions:

- Confirm order
- Update order state
- Assign deliverer
- Approve/reject mock cancellation where applicable
- Advance refund state
- Record mock payment verification
- View timeline

---

# 29. Admin Deliveries

Purpose:

Coordinate deliveries without becoming fleet-management software.

Show:

- Unassigned deliveries
- Assigned deliveries
- Out-for-delivery items
- Failed deliveries
- Completed deliveries

Admin can:

- Assign a mock deliverer
- Reassign before delivery begins
- View delivery detail
- Review failed delivery notes
- Confirm exceptions

---

# 30. Admin Inventory

Required:

- Product
- SKU or simple reference
- Category
- Current stock
- Availability
- Low-stock condition
- Last mock update

Actions:

- Increase stock
- Decrease stock
- Set stock
- Record adjustment reason in the frontend mock

Do not build warehouse complexity that the thesis does not require.

Stock adjustment is a small, focused operation and may use a modal from the inventory page or a row action. Require a reason and confirm before applying the adjustment. Do not expose arbitrary inventory-record deletion.

---

# 31. Admin Products

Admin should be able to simulate:

- Add product
- Edit product
- Activate/deactivate product
- Update price
- Update image
- Update description
- Update category

Product availability should reflect inventory in the mock state.

Admin product controls should include a visible Add Product action plus a compact per-row action menu. Full product editing remains a dedicated page because it is a large form. Small pricing/visibility changes may use a modal. Hard deletion is only allowed for prototype products without order, cart, reserved-stock, or inventory-history references; otherwise preserve history and require deactivation instead.

---

# 32. Admin Customers

Use a table/list.

Show:

- Customer
- Contact placeholder
- Order count
- Last order
- Loyalty balance
- Account state

Customer detail:

- Profile
- Purchase history
- Loyalty activity
- Current active orders

Do not add invasive customer analytics.

Admin may edit prototype customer contact details and activate/deactivate the prototype account through a small modal. Do not hard-delete customers because order, address, and loyalty history must remain coherent.

---

# 33. Admin Loyalty

This page exists to understand and manage the loyalty system at a high level.

Show:

- Customer
- Points
- Peso equivalent
- Recent activity
- Qualification information

For the prototype:

- Provide controlled mock adjustments
- Require an adjustment reason
- Record the change in a mock history

In the real backend this must become audited and permission-controlled.

---

# 34. Deliverer Experience

The deliverer interface must be **mobile-first**.

Assume a deliverer is using a phone while working.

The design should be simpler than the admin interface.

---

# 35. Deliverer Navigation

Recommended:

- Active
- History
- Profile

A bottom navigation can be appropriate for this role.

Keep it to three or four destinations maximum.

---

# 36. Deliverer Active Deliveries

Show deliveries in chronological or priority order.

Each row should show:

- Scheduled time
- Customer
- Delivery area/address summary
- Order reference
- Payment method
- Current delivery state

Avoid giant cards.

Use compact, touch-friendly list rows.

---

# 37. Deliverer Delivery Detail

Must include:

- Customer name
- Contact placeholder
- Delivery address
- Delivery note
- Order items
- Quantity
- Payment method
- Amount to collect for COD where applicable
- Payment status where relevant
- Delivery timeline
- Status action

Suggested actions:

```text
Accept Assignment
Start Delivery
Mark Delivered
Report Failed Delivery
```

These are prototype recommendations and must later be aligned with the approved business workflow.

---

# 38. Failed Delivery Flow

Do not use a tiny modal for a complex failure reason.

Use a compact dedicated state or sheet with:

- Reason
- Optional note
- Confirmation

Suggested mock reasons:

- Customer unavailable
- Incorrect address
- Customer requested reschedule
- Payment issue
- Other

Final business-approved reasons must be confirmed before backend implementation.

---

# 39. Deliverer History

Show:

- Completed deliveries
- Failed deliveries
- Date
- Order reference
- Customer
- Completion result

Search by order reference if useful.

---

# 40. Responsive Design Requirements

The entire frontend must be designed mobile-first and tested across realistic widths.

Minimum testing widths:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px
```

## Requirements

- No horizontal overflow
- No clipped buttons
- No text collisions
- No fixed widths that break mobile
- Forms must stack naturally
- Tables must adapt
- Touch controls must remain comfortable
- Sticky elements must not cover content
- Header navigation must become mobile-appropriate

---

# 41. Accessibility Requirements

Target WCAG 2.2 AA where applicable.

## Required

- Semantic HTML
- Correct heading hierarchy
- Labels for all form inputs
- Keyboard-accessible controls
- Visible focus states
- Skip link
- Meaningful alt text
- Decorative imagery with empty alt
- Do not rely on color alone
- Minimum text contrast of 4.5:1 for regular text
- Clear error messages
- Error summary for important forms where useful
- Proper button vs link semantics
- Accessible dialogs
- Reduced motion support
- Touch targets comfortably sized, preferably around 44px for primary controls
- Do not remove focus outlines unless replacing them with a stronger accessible indicator

---

# 42. Form UX

Forms are critical to checkout and account workflows.

## Rules

- Labels must remain visible.
- Do not use placeholders as the only label.
- Group related fields.
- Avoid unnecessary fields.
- Validate when useful without aggressively interrupting typing.
- Display errors adjacent to the field.
- Provide a clear summary when submission fails.
- Preserve user-entered values after validation errors.
- Use appropriate input types.
- Support browser autofill where appropriate.
- Never ask users to re-enter information unnecessarily.

---

# 43. Motion Design

Motion must explain:

- Entry
- Change
- Relationship
- Feedback
- Completion

## Good motion examples

- Header background changing after scroll
- Product image revealing as a category enters
- Cart count transitioning when an item is added
- Checkout section transition
- Order confirmation state
- Admin row background transition after an update
- Deliverer status control feedback

## Bad motion examples

- Floating cards
- Constant bouncing
- Rotating icons
- Parallax on every section
- Full-screen page zooms
- Excessive text splitting
- Animated counters everywhere
- Cursor followers
- Scroll-jacking

---

# 44. Microinteraction Ideas

Use a few memorable but restrained interactions.

## Customer

### Product image hover

Desktop only:

- Image crop gently shifts or scales around 1.02
- Product name underline responds
- No entire-card floating effect

### Add to Cart

- Button text briefly changes to "Added"
- Cart count updates
- Tiny directional motion toward the cart is optional
- Do not show confetti

### Category switch

Gas and Water category changes can use a short masked image transition.

---

## Admin

### Table row update

When a status changes:

- Row briefly uses a subtle neutral highlight
- Update timestamp changes
- No toast explosion

### Low stock

Use clear text and a small semantic signal.

Do not use a huge red card.

---

## Deliverer

### Delivery completion

Use:

- Clear success state
- Short check animation
- Next delivery CTA

Keep it quick.

---

# 45. Loading States

Do not use generic skeletons for everything.

Use:

- Skeleton only where layout stability matters
- Small inline spinners for actions
- Explicit loading labels for significant operations

Prototype delays can be introduced intentionally to demonstrate states.

Keep them short.

---

# 46. Empty States

Empty states must be specific.

Bad:

> Nothing here yet.

Better:

> No active deliveries are assigned to you.

With a useful next action where appropriate.

Do not add giant illustrations unless they genuinely improve clarity.

---

# 47. Error States

Error messages should explain:

1. What failed
2. What the user can do next

Examples:

```text
We couldn't update this delivery status. Try again.
```

For the prototype, errors can be simulated through developer controls or predetermined scenarios.

---

# 48. Frontend Security Requirements

A frontend alone cannot enforce the complete security model.

Security must be designed from the beginning, but final authorization, validation, rate limiting, payment verification, and data protection must be enforced by the future backend.

## During this frontend phase

### Never place secrets in browser code

Do not expose:

- Supabase service-role keys
- Database passwords
- Payment secrets
- Private API tokens
- Administrative tokens

Anything bundled into client-side JavaScript must be treated as public.

---

## Do not store sensitive data in localStorage

Do not store real:

- Passwords
- Session secrets
- Payment data
- GCash transaction data
- Personal identity documents
- Private customer information

For the prototype, only non-sensitive fictional mock data may be persisted.

---

## Avoid unsafe HTML

Do not use `dangerouslySetInnerHTML` unless there is a proven business requirement and a rigorous sanitization strategy.

Prefer rendering text as text.

Never build DOM content from untrusted strings using unsafe HTML insertion.

---

## Input handling

Frontend validation is for UX.

It is **not a security boundary**.

Still implement:

- Length limits
- Expected character sets where appropriate
- Numeric bounds
- Date validation
- File type constraints for future upload interfaces
- Safe URL handling

The backend must later repeat and enforce all validation independently.

---

## Third-party scripts

Avoid unnecessary third-party JavaScript.

Install trusted libraries as controlled project dependencies.

Do not paste random CDN scripts into the layout.

Maintain a small dependency surface.

---

## Dependency security

- Keep dependencies current.
- Remove unused packages.
- Use lockfiles.
- Audit vulnerable dependencies.
- Avoid abandoned libraries.
- Avoid installing a library for functionality that can be implemented safely with the platform.

---

# 49. Future Production Security Requirements

These are **not to be implemented as fake frontend security**, but the frontend must be designed so they can be added later.

The production system must eventually include:

- Server-enforced authentication
- Server-enforced role-based authorization
- Customer/Admin/Deliverer separation
- Secure session management
- Rate limiting
- Input validation
- Output encoding
- XSS prevention
- SQL injection prevention
- CSRF protection where applicable
- Secure cookies
- HTTPS
- Security headers
- Content Security Policy
- Safe redirects
- Audit logs for high-impact administrative actions
- Secure password storage through the chosen authentication provider
- Payment verification on trusted infrastructure
- Secure file handling if uploads are later introduced
- Authorization checks on every protected operation
- Least privilege
- Sensitive-data minimization
- Error responses that do not expose system internals

Never trust the frontend role, route, button visibility, or hidden field as proof of authorization.

---

# 50. Content Security Policy Direction

When backend/deployment work begins, configure a strict Content Security Policy.

Prefer:

- First-party application code
- npm-installed dependencies
- No inline script dependence
- Minimal external origins

A CSP must complement proper XSS prevention rather than replace it.

---

# 51. Role Security Model for the Future Backend

## Customer

Can access only:

- Their own account
- Their own addresses
- Their own orders
- Their own loyalty data
- Their own cancellations/refunds

Cannot:

- Edit inventory
- View other customers
- Assign deliveries
- Change product prices
- Grant loyalty points manually

---

## Admin

Can access authorized business operations.

Potential privileges:

- Products
- Inventory
- Orders
- Customers
- Deliveries
- Loyalty
- Refund/cancellation management

High-impact actions should eventually be logged.

---

## Deliverer

Can access only:

- Deliveries assigned to them
- Minimum customer information required to complete those deliveries
- Status update capabilities allowed by the business

Deliverers must not automatically have access to:

- Full customer histories
- All customer accounts
- Product administration
- Inventory administration
- Loyalty balances unrelated to delivery
- Business analytics

---

# 52. Frontend State Strategy

Suggested state separation:

## Local component state

Use for:

- Open menus
- Dialog state
- Form interaction
- Temporary UI state

## Shared frontend store

Use for:

- Cart
- Demo authenticated user
- Orders
- Inventory
- Deliveries
- Loyalty demo state

Avoid one giant global state object.

Organize state by business domain.

---

# 53. Mock Business Logic

Create configurable functions for business rules.

Examples:

```text
calculateDeliveryFee()
calculateCartSubtotal()
calculateLoyaltyPoints()
calculateLoyaltyDiscount()
canCancelOrder()
getOrderProgress()
getAvailableStock()
assignDelivery()
updateDeliveryStatus()
```

Do not put business calculations directly inside presentation components.

---

# 54. Delivery Fee Configuration

Use a centralized configuration.

```text
0–3 km      → Free
>3–6 km     → ₱30
>6–10 km    → ₱50
>10 km      → Outside service area
```

For the frontend prototype, distance can be simulated using a dropdown or demo address fixture.

Do not pretend this is live GPS distance.

---

# 55. Loyalty Configuration

The thesis contains an unresolved conflict.

One section defines:

- One point for every ₱100 spent
- Minimum qualifying transaction of ₱500
- Bonus after three qualifying orders of ₱500 or more within two weeks
- One point equals ₱1

Another flow description references rewards after the 3rd, 5th, or 10th purchase.

Therefore:

## Do not hardcode a final rule as if it is confirmed.

Create:

```text
loyaltyConfig.ts
```

Document the rule used for the prototype.

Label it:

> Prototype loyalty configuration pending final thesis/business confirmation.

---

# 56. Cancellation and Refund Rules

These are also insufficiently defined by the thesis.

The frontend should demonstrate the workflow without claiming that the rules are final.

Centralize:

```text
cancellationPolicy.ts
refundPolicy.ts
```

Prototype states can include:

```text
Cancellation Requested
Cancellation Approved
Cancellation Rejected

Refund Pending
Refund Processing
Refunded
Refund Rejected
```

Do not scatter decision logic through UI components.

---

# 57. Inventory Behavior

The thesis mixes "real-time inventory" language with manual staff updates.

For the frontend prototype, use this practical interpretation:

- Admin manually adjusts physical stock.
- Successful order events can simulate stock reservation/deduction.
- Product availability updates immediately throughout the frontend state.
- Cancelled mock orders can restore stock if the prototype policy says inventory had already been reserved.

Mark this as a **prototype interpretation requiring confirmation before backend development**.

---

# 58. Design System Components

Build reusable primitives.

## Core UI

- Button
- IconButton
- TextField
- Select
- Checkbox
- Radio
- TextArea
- SearchField
- Dialog
- Drawer
- Tooltip
- Toast / Notice
- Tabs
- Pagination
- EmptyState
- LoadingState
- ErrorState
- StatusText
- Breadcrumb
- QuantityControl

## Commerce

- ProductTile
- ProductPrice
- ProductAvailability
- CartItem
- CartSummary
- CheckoutSummary
- PaymentMethodOption
- DeliveryFeeSummary

## Order

- OrderRow
- OrderSummary
- OrderStatusTimeline
- OrderItems
- OrderTotals
- CancellationPanel
- RefundPanel

## Admin

- AdminTable
- FilterBar
- SummaryStrip
- InventoryRow
- CustomerRow
- DeliveryAssignment

## Deliverer

- DeliveryRow
- DeliverySummary
- DeliveryStatusAction
- FailedDeliveryForm

---

# 59. Table Design

Tables are appropriate for admin operations.

Do not turn every table into cards because cards look "modern."

## Requirements

- Sticky header when useful
- Clear column alignment
- Numeric values right-aligned
- Sort indicators
- Search
- Filters
- Pagination
- Row focus/hover
- Keyboard accessibility
- Responsive fallback

Use tabular numerals for totals and quantities where supported.

---

# 60. Modal Policy

Use a modal only for:

- Short confirmations
- Small decisions
- Simple forms

Do not use a modal for:

- Full order detail
- Complex refund workflow
- Customer record review
- Large product editing
- Delivery failure investigation

Those deserve a page, drawer, or dedicated workspace.

---

# 61. Confirmation Policy

Destructive actions require a clear confirmation.

Examples:

- Cancel order
- Remove product
- Deactivate product
- Mark delivery failed
- Clear cart

Confirmation copy must state the consequence.

---

# 62. Customer Homepage Motion Concept

Suggested choreography:

1. Header loads instantly.
2. Hero content enters with a short opacity/position transition.
3. Hero image reveals using a restrained clip or mask.
4. Product category imagery responds as it enters the viewport.
5. Product tiles do not all fly upward individually.
6. Loyalty/service explanation can use a simple stagger if motion is allowed.
7. Footer appears normally.

Keep total motion calm.

---

# 63. Header Behavior

## Customer

At the top:

- Slightly more open, integrated into hero

After scrolling:

- Solid background
- Compact height
- Clear cart/account controls

No glass blur.

## Admin

Always stable.

Do not animate the sidebar dramatically.

## Deliverer

Keep navigation fixed and practical.

---

# 64. Image Direction

Use high-quality realistic imagery when assets are available.

Preferred subjects:

- LPG cylinders
- Gas accessories
- Water containers
- Bottled water
- Delivery operations
- Store environment

Avoid:

- AI-generated futuristic delivery trucks
- Abstract 3D ecommerce illustrations
- People pointing at floating UI
- Generic corporate stock photos with fake holograms

Product images should have consistent framing.

---

# 65. Customer Content Tone

Use direct language.

Examples:

Good:

> LPG and purified water delivered within our service area.

> Choose a delivery schedule that works for you.

> Your order is being prepared.

Avoid:

> Experience seamless convenience.

> Elevate your everyday essentials.

> Revolutionizing delivery for modern lifestyles.

The interface should sound like a real local business.

---

# 66. Prototype Completion Criteria

The frontend phase is complete only when the following can be demonstrated without a backend:

## Customer demo

- Register/login simulation
- Browse products
- Search/filter
- Product detail
- Add/remove/update cart
- Checkout
- Delivery zone simulation
- COD/GCash mock selection
- Order confirmation
- Order history
- Order status
- Mock cancellation
- Mock refund status
- Loyalty display

## Admin demo

- View operational overview
- Search/filter orders
- Open order
- Change mock order state
- Assign mock deliverer
- View deliveries
- Update stock
- Edit products
- View customers
- View loyalty records
- Handle mock cancellation/refund state

## Deliverer demo

- View assigned deliveries
- Open delivery
- Start delivery
- Mark delivered
- Mark failed
- Add mock failure note
- View history

---

# 67. Quality Checklist Before Backend Work

## Visual

- [ ] No gradients
- [ ] No purple gradient
- [ ] No glowing UI
- [ ] No glassmorphism
- [ ] No bento-grid dependency
- [ ] No giant AI-style hero copy
- [ ] No tiny eyebrow label repeated above headings
- [ ] No unnecessary decorative lines above headings
- [ ] No card-inside-card overload
- [ ] No pill-everything design
- [ ] No fake analytics
- [ ] No generic filler sections

## Responsive

- [ ] Works at 320px
- [ ] Works at 375px
- [ ] Works at 430px
- [ ] Works at 768px
- [ ] Works at 1024px
- [ ] Works at 1440px
- [ ] No horizontal overflow
- [ ] Mobile checkout is usable
- [ ] Admin tables have a mobile fallback
- [ ] Deliverer UI is phone-friendly

## Accessibility

- [ ] Keyboard navigation works
- [ ] Visible focus
- [ ] Labels are present
- [ ] Contrast passes
- [ ] Reduced motion works
- [ ] Meaningful images have alt text
- [ ] Status is not communicated by color alone
- [ ] Dialog focus management works

## Functionality

- [ ] Mock customer flow works end-to-end
- [ ] Mock admin flow works end-to-end
- [ ] Mock deliverer flow works end-to-end
- [ ] State updates propagate correctly
- [ ] Empty states work
- [ ] Errors can be demonstrated
- [ ] Loading states work
- [ ] Confirmation flows work

## Security-readiness

- [ ] No secrets in client code
- [ ] No production credentials
- [ ] No real personal data
- [ ] No unsafe HTML rendering
- [ ] No unnecessary third-party scripts
- [ ] Role UI is separated
- [ ] Mock auth is clearly labeled non-production
- [ ] Backend security requirements are documented

---

# 68. Testing Direction

Before connecting a backend, test the frontend independently.

## Component tests

Test:

- Totals
- Quantity controls
- Delivery fee display
- Loyalty display
- Form validation
- Status rendering

## Integration-style frontend tests

Test:

- Add to cart → checkout
- Checkout → order confirmation
- Admin order update → customer order state update
- Admin assignment → deliverer queue
- Deliverer completion → admin/customer state update
- Inventory update → product availability

## End-to-end tests

Recommended scenarios:

### Customer happy path

```text
Login
→ Browse
→ Add product
→ Checkout
→ Choose COD
→ Place order
→ View order
```

### Admin fulfillment

```text
Open order
→ Confirm
→ Assign deliverer
→ Update preparation state
```

### Deliverer completion

```text
Open assigned delivery
→ Start
→ Deliver
→ Confirm
```

### Cancellation

```text
Customer requests cancellation
→ Admin reviews
→ Order updates
→ Inventory/loyalty mock state remains consistent
```

---

# 69. Performance Requirements for the Frontend

- Optimize product imagery.
- Use modern formats such as WebP/AVIF where appropriate.
- Lazy-load offscreen imagery.
- Avoid huge animation bundles.
- Import GSAP modules intentionally.
- Avoid unnecessary client components.
- Keep admin productivity screens lightweight.
- Avoid rerendering large lists unnecessarily.
- Use pagination or virtualization if mock datasets become large.
- Keep layout stable while images load.

---

# 70. Backend Handoff Preparation

Even though there is no backend in this phase, document every mock service interface.

Examples:

```text
AuthService
ProductService
OrderService
InventoryService
DeliveryService
CustomerService
LoyaltyService
PaymentService
```

Each interface should describe what the frontend expects.

Do not implement the real endpoints yet.

This creates a clean contract for the backend phase.

---

# 71. Do Not Start Backend Until These Business Rules Are Confirmed

Before database/API development, obtain final decisions for:

1. Exact loyalty formula
2. Loyalty bonus calculation
3. Loyalty redemption rules
4. Cancellation eligibility
5. Refund workflow
6. GCash verification process
7. Inventory deduction/reservation timing
8. Final order statuses
9. Final delivery statuses
10. Delivery scheduling capacity/rules
11. How the 10 km distance is calculated
12. Admin permissions
13. Deliverer permissions
14. Delivery failure handling
15. Whether delivered orders can ever be reversed

These decisions affect data models and should not be guessed.

---

# 72. Final Frontend Interpretation

The first implementation milestone is not simply a set of static pages.

It must be a **complete interactive frontend prototype** demonstrating how Customer, Admin, and Deliverer experiences connect.

The prototype should make this complete relationship understandable:

```text
CUSTOMER
Browses
→ Orders
→ Schedules
→ Pays
→ Tracks

ADMIN
Reviews
→ Manages stock
→ Processes order
→ Assigns delivery
→ Handles exceptions

DELIVERER
Receives assignment
→ Fulfills delivery
→ Updates result

SYSTEM
Keeps the mock state of products, inventory, orders, delivery, customer history,
payment state, and loyalty behavior synchronized.
```

The visual system must remain distinctive, restrained, accessible, and grounded in the needs of a real LPG and water-refilling business.

---


## MUI and Next.js Architecture Research

The strict architecture in Sections 3 through 6 follows current official guidance from Material UI and Next.js:

1. [Material UI: styled() utility](https://mui.com/system/styled/)
2. [Material UI: Theming and ThemeProvider](https://mui.com/material-ui/customization/theming/)
3. [Material UI: CSS theme variables usage](https://mui.com/material-ui/customization/css-theme-variables/usage/)
4. [Material UI: CSS theme variables overview](https://mui.com/material-ui/customization/css-theme-variables/overview/)
5. [Material UI: Breakpoints](https://mui.com/material-ui/customization/breakpoints/)
6. [Material UI: Themed components and styleOverrides](https://mui.com/material-ui/customization/theme-components/)
7. [Material UI: Next.js integration](https://mui.com/material-ui/integrations/nextjs/)
8. [Material UI: Versions](https://mui.com/material-ui/getting-started/versions/)
9. [Next.js: Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
10. [Next.js: Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)

### Research conclusions applied to this project

- Material UI itself uses the `styled()` utility, making strict MUI `styled()` a valid first-class styling strategy.
- `ThemeProvider` is the correct mechanism for distributing the global theme.
- With CSS theme variables enabled, `theme.vars.palette.*` is the recommended color-token access pattern.
- Breakpoint values belong in the theme and should be consumed through `theme.breakpoints`.
- App-wide MUI defaults belong under `theme.components`, while substantial custom page/component styling should remain in dedicated custom components.
- Next.js route groups are appropriate for organizing customer, admin, deliverer, auth, and public areas without changing URL paths.
- MUI recommends `AppRouterCacheProvider` for Next.js App Router streamed rendering.


# 73. Research Basis: Anti-AI-Slop and UX

The design rules above were informed by current anti-AI-slop discussion together with established usability and design-system guidance.

## AI-Slop Pattern Research

1. [Impeccable: Slop - AI UI patterns and production defects](https://impeccable.style/slop/)
2. [NN/g: Good Visual Design, Explained](https://www.nngroup.com/articles/good-visual-design/)
3. [NN/g: Visual Hierarchy in UX](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/)
4. [NN/g: 5 Principles of Visual Design in UX](https://www.nngroup.com/articles/principles-visual-design/)
5. [NN/g: Homepage Design - 5 Fundamental Principles](https://www.nngroup.com/articles/homepage-design-principles/)

## E-commerce UX Research

6. [Baymard: Cart and Checkout Usability](https://baymard.com/research/checkout-usability)
7. [Baymard: Product List UX](https://baymard.com/blog/current-state-product-list-and-filtering)
8. [Baymard: Mobile E-Commerce Usability](https://baymard.com/research/mcommerce-usability)
9. [Baymard: Product Page UX](https://baymard.com/blog/current-state-ecommerce-product-page-ux)
10. [Baymard: E-Commerce UX Best Practices](https://baymard.com/learn/ecommerce-ux-best-practices)

## Design Systems and Accessibility

11. [GOV.UK Design System](https://design-system.service.gov.uk/)
12. [GOV.UK Accessibility Strategy](https://design-system.service.gov.uk/accessibility/accessibility-strategy/)
13. [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
14. [W3C WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
15. [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
16. [Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
17. [Apple HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color)
18. [Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
19. [Material Design 3](https://m3.material.io/)
20. [Material Design 3: Typography](https://m3.material.io/styles/typography/applying-type)
21. [Material Design 3: Color](https://m3.material.io/styles/color/system/overview)
22. [Atlassian Design System: Foundations](https://atlassian.design/foundations)
23. [Atlassian Design System: Spacing](https://atlassian.design/foundations/spacing)
24. [Atlassian Design System: Typography](https://atlassian.design/foundations/typography/applying-typography)
25. [Atlassian Design System: Accessibility](https://atlassian.design/foundations/accessibility)

## Motion

26. [GSAP: ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
27. [GSAP: matchMedia and prefers-reduced-motion](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/)
28. [Lenis Smooth Scroll](https://lenis.darkroom.engineering/)
29. [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)
30. [web.dev: Animation and Motion Accessibility](https://web.dev/learn/accessibility/motion)

---

# 74. Research Basis: Security

Security requirements are based primarily on OWASP and NIST secure-development guidance.

1. [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
2. [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
3. [OWASP DOM-Based XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
4. [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
5. [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
6. [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
7. [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
8. [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
9. [OWASP Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
10. [OWASP Third-Party JavaScript Management](https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html)
11. [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
12. [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
13. [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
14. [OWASP Vulnerable Dependency Management](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html)
15. [NIST Secure Software Development Framework](https://csrc.nist.gov/projects/ssdf)
16. [NIST SP 800-218 Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)

---

# 75. Instruction to the Implementing AI

Before writing code:

1. Read this entire document.
2. Create a page/route inventory.
3. Create the design token system.
4. Create the mock domain models.
5. Create the mock service interfaces.
6. Create reusable layout primitives.
7. Create the Customer shell.
8. Create the Admin shell.
9. Create the Deliverer shell.
10. Implement one complete end-to-end Customer → Admin → Deliverer mock workflow.
11. Only then expand the remaining pages.
12. Test mobile behavior continuously.
13. Audit the result against the Anti-AI-Slop checklist.
14. Audit accessibility.
15. Audit all frontend code for unsafe browser practices.
16. Do not begin backend implementation.

The result should be presentation-ready and realistic enough that stakeholders can validate the software workflow before backend development begins.
