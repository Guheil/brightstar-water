<div align="center">

<table>
<tr>
<td align="center" width="50%">
<img src="public/brand/mrje-gas-logo.png" alt="MRJE Gas" width="360" />
</td>
<td align="center" width="50%">
<img src="public/brand/brightstar-water-logo.png" alt="Bright Star Water" width="360" />
</td>
</tr>
</table>

# MRJE GAS + BRIGHT STAR WATER

### One ordering platform. Two storefronts. Three purpose-built workspaces.

**Customer ordering · Admin operations · Deliverer field workflow**

</div>

---

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                              THE PLATFORM                                    │
├───────────────────────────────┬──────────────────────────────────────────────┤
│            MRJE GAS           │              BRIGHT STAR WATER               │
│        LPG + accessories      │       Water refills + containers             │
├───────────────────────────────┴──────────────────────────────────────────────┤
│                                                                              │
│   CUSTOMER                      ADMIN                      DELIVERER           │
│   Shop + checkout              Operations control         Field workflow      │
│   Delivery pin                 Orders + inventory         Directions          │
│   COD / GCash                  Product management         COD collection      │
│   Order tracking               Payment review             Delivery proof      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## About the system

MRJE Gas + Bright Star Water is a unified local ordering and delivery platform built for two distinct storefronts under one application.

Customers can move between **MRJE Gas** and **Bright Star Water** without maintaining separate accounts. Orders, saved delivery locations, cart activity, loyalty information, delivery tracking, and checkout are connected through one customer experience while each storefront keeps its own products, visual identity, and service presentation.

The application also includes dedicated workspaces for store administrators and deliverers. The Admin side focuses on operations and control. The Deliverer side is mobile-first and focuses on the next delivery, destination, payment state, delivery completion, and field actions.

---

# START HERE

## 1. Install the project

Make sure Node.js and npm are available on your machine, then install the project dependencies.

```bash
npm install
```

## 2. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 3. Create a production build

```bash
npm run build
```

Run the production server with:

```bash
npm start
```

---

# HOW TO USE THE APPLICATION

The platform contains three main experiences.

| Workspace | Designed for | Primary purpose |
|---|---|---|
| Customer | Households and buyers | Browse, order, pay, choose a delivery location, and track orders |
| Administrator | Store operations | Manage products, stock, customers, orders, payments, deliveries, and loyalty |
| Deliverer | Delivery personnel | View assigned work, navigate to customers, collect COD, and complete deliveries |

---

# CUSTOMER GUIDE

```text
CHOOSE A STOREFRONT
        │
        ├─────────────── MRJE GAS
        │
        └─────────────── BRIGHT STAR WATER
                │
                ▼
          BROWSE PRODUCTS
                │
                ▼
            SIGN IN
         or CREATE ACCOUNT
                │
                ▼
             CART
                │
                ▼
        DELIVERY LOCATION
                │
                ▼
        DELIVERY SCHEDULE
                │
                ▼
         COD or GCASH
                │
                ▼
           REVIEW ORDER
                │
                ▼
          TRACK DELIVERY
```

## Browsing while signed out

A visitor can freely browse MRJE Gas and Bright Star Water products without an account.

When signed out, the header intentionally keeps the interface simple:

```text
Shop     Delivery     Search     Sign In
```

**Cart** and **My Orders** only appear after a customer signs in.

If a signed-out visitor attempts an action that requires an account, such as adding a product to the cart or entering a protected customer area, the system asks them to sign in or create an account first.

## Creating a customer account

Registration uses a guided multi-step flow.

### Step 1 · Your details

Enter the customer's basic information:

- Full name
- Email address
- Mobile number

### Step 2 · Password

Create and confirm the account password.

### Step 3 · Verify email

Enter the six-digit verification code using the six-cell OTP input.

```text
[ 7 ]  [ 6 ]  [ 8 ]  [ 3 ]  [ 3 ]  [ 5 ]
```

The field supports normal typing, backspace navigation, arrow-key navigation, and full-code paste.

During local development, the current verification code is shown directly on the verification step so the complete registration journey can be tested without an external email service.

### Step 4 · Continue

After successful verification, the customer account becomes available and the user can continue into the ordering flow.

---

## Ordering from MRJE Gas

Open:

```text
/mrje
```

From the MRJE storefront, customers can browse LPG products and compatible accessories.

Typical flow:

```text
MRJE GAS
   ↓
Shop LPG
   ↓
Open product
   ↓
Add to cart
   ↓
Checkout
```

MRJE uses its own product catalog and storefront identity while still sharing the customer account, checkout system, and order history with Bright Star Water.

---

## Ordering from Bright Star Water

Open:

```text
/brightstar
```

Bright Star focuses on water refills, containers, and household water products.

Typical flow:

```text
BRIGHT STAR WATER
       ↓
Shop water
       ↓
Select refill / container
       ↓
Add to cart
       ↓
Checkout
```

---

# CHECKOUT GUIDE

Checkout is intentionally guided instead of presenting one oversized form.

```text
01  DELIVERY LOCATION
02  DELIVERY SCHEDULE
03  PAYMENT METHOD
04  PAYMENT DETAILS
05  FINAL REVIEW
```

## Step 1 · Delivery location

Customers can place the delivery pin directly on an interactive map.

```text
┌─────────────────────────────────────────────┐
│                                             │
│                DELIVERY MAP                 │
│                                             │
│                      ●                      │
│                delivery pin                 │
│                                             │
└─────────────────────────────────────────────┘
```

The marker can be moved by clicking the map or dragging the pin.

The system calculates the delivery distance and applies the configured service-zone rules.

| Distance | Delivery fee |
|---|---:|
| 0 to 3 km | Free |
| Over 3 to 6 km | ₱30 |
| Over 6 to 10 km | ₱50 |
| Over 10 km | Outside delivery coverage |

Customers can also provide the recipient name, phone number, address details, and delivery notes.

## Step 2 · Delivery schedule

Choose an available delivery date and time window.

The selected schedule is shown again during final order review.

## Step 3 · Payment method

Choose between:

### Cash on Delivery

The system shows the final amount that should be prepared for the delivery.

### GCash

GCash orders continue into a payment-proof step.

Before uploading proof, the customer is reminded to make sure the screenshot clearly shows the important payment details.

The uploaded image should clearly show:

- Amount
- Date
- Reference number

Accepted proof formats:

```text
PNG
JPEG
WebP
```

Maximum file size:

```text
5 MB
```

The uploaded proof is sent into the Admin payment-review workflow. Uploading a screenshot does not automatically mark the payment as verified.

## Step 5 · Final review

Before placing the order, customers can review:

- Products
- Quantity
- Delivery address
- Map location
- Delivery schedule
- Delivery fee
- Payment method
- Final amount

---

# ADMINISTRATOR GUIDE

The Admin workspace is designed as an operations console rather than a generic dashboard.

Open:

```text
/admin
```

The desktop workspace uses a fixed sidebar while the main operational area scrolls independently.

```text
┌──────────────────┬──────────────────────────────────────────────────────┐
│                  │                                                      │
│  OVERVIEW        │               ADMIN WORKSPACE                        │
│  ORDERS          │                                                      │
│  DELIVERIES      │                                                      │
│  INVENTORY       │                                                      │
│  PRODUCTS        │                                                      │
│  CUSTOMERS       │                                                      │
│  LOYALTY         │                                                      │
│                  │                                                      │
│  ACCOUNT         │                                                      │
│  LOG OUT         │                                                      │
└──────────────────┴──────────────────────────────────────────────────────┘
```

## Overview

The Overview prioritizes work that needs attention.

Use it to quickly identify:

- Orders requiring review
- Delivery issues
- Low stock
- Payment review activity
- Operational shortcuts

## Orders

The Orders workspace is the central order queue.

Administrators can:

- Open an order
- Review customer and delivery information
- Review payment state
- Move orders through valid workflow states
- Review cancellation requests
- Coordinate fulfillment

## Products

The Products area provides catalog control for both storefronts.

Administrators can:

- Add a product
- Edit a product
- Perform quick updates
- Update pricing
- Set featured state
- Activate or deactivate products
- Delete products when deletion is safe

The system protects historical relationships. Products referenced by existing operational records should be deactivated rather than removed when deletion would damage history.

## Inventory

Use Inventory to manage physical stock.

Stock adjustments support:

```text
Increase stock
Decrease stock
Set exact stock
```

Every adjustment includes a reason so changes remain understandable later.

## Customers

Customer records allow administrators to:

- View customer information
- Review addresses
- Review order history
- Review loyalty activity
- Edit account information
- Activate or deactivate accounts

## Deliveries

The Admin delivery area is used to coordinate fulfillment.

Administrators can:

- Review unassigned deliveries
- Assign a deliverer
- Reassign deliveries
- Review delivery failures
- Review delivery progress

## GCash review

When a customer submits GCash proof, Admin can open the related order and review the uploaded screenshot before marking the payment as verified.

Admin remains responsible for payment review. Deliverers do not approve GCash payments.

## Loyalty

Use the Loyalty area to review customer balances and adjustment history.

Loyalty activity is treated like a ledger so changes remain traceable rather than appearing as an unexplained total.

---

# DELIVERER GUIDE

The Deliverer workspace is mobile-first and built around one question:

> What needs to be delivered next?

Open:

```text
/deliverer
```

On mobile, the main navigation stays close to the thumb:

```text
┌─────────────────────────────────────────────┐
│                                             │
│                FIELD WORKSPACE              │
│                                             │
├─────────────────────────────────────────────┤
│ Home      Deliveries      History      Me   │
└─────────────────────────────────────────────┘
```

## Home

The Deliverer Home screen shows:

- Remaining active deliveries
- Next delivery
- Customer name
- Storefront
- Schedule
- Destination
- Distance
- Payment state
- COD amount when applicable

The next delivery is intentionally the most prominent element.

## Active deliveries

Open **Deliveries** to see assigned work.

Each record emphasizes the information needed in the field:

```text
Customer
Storefront
Delivery time
Destination
Distance
Payment
Amount to collect
```

## Delivery detail

Opening a delivery provides field actions such as:

```text
Call customer
Copy address
Open directions
View map pin
Review delivery notes
Review order contents
Review payment status
```

## Delivery progression

The interface exposes the correct next action according to the current delivery state.

```text
Assigned
   ↓
On the way
   ↓
Arrived
   ↓
Delivered
```

## Cash on Delivery

For COD orders, the Deliverer sees the exact amount expected from the customer.

Before the delivery is closed, the collected amount must be confirmed.

## GCash

For GCash orders, the Deliverer sees the payment-review state but does not approve the payment.

Payment verification remains an Admin responsibility.

## Proof of delivery

The Deliverer can attach a delivery photo when completing a delivery.

Accepted formats:

```text
PNG
JPEG
WebP
```

The Deliverer can also add an optional completion note.

## Failed delivery

If delivery cannot be completed, the failure workflow allows the Deliverer to select a reason such as:

- Customer unavailable
- Address could not be found
- Customer requested reschedule
- Payment issue
- Vehicle issue
- Other

An additional note can be supplied when necessary.

## History

Completed delivery activity is grouped chronologically so the Deliverer can review previous work without navigating a dense desktop-style table.

---

# AUTHENTICATION BEHAVIOR

The public storefront changes automatically depending on session state.

## Signed out

```text
Shop     Delivery     Search     Sign In
```

Hidden while signed out:

```text
Cart
My Orders
Account
Log out
```

Protected actions request authentication only when the action actually requires an account.

## Signed in as Customer

```text
Shop     Delivery     My Orders     Search     Cart     Account     Log out
```

## Logout confirmation

Customer, Administrator, and Deliverer logout actions all require confirmation before ending the session.

---

# ROUTE MAP

<details>
<summary><strong>Public storefront routes</strong></summary>

```text
/                         Service gateway
/mrje                     MRJE Gas landing page
/mrje/shop                MRJE Gas catalog
/mrje/product/[id]        MRJE Gas product detail
/mrje/delivery            MRJE delivery information

/brightstar               Bright Star Water landing page
/brightstar/shop          Bright Star Water catalog
/brightstar/product/[id]  Bright Star Water product detail
/brightstar/delivery      Bright Star delivery information
```

</details>

<details>
<summary><strong>Customer routes</strong></summary>

```text
/login
/register
/customer/account
/customer/cart
/customer/checkout
/customer/orders
/customer/loyalty
/customer/profile
```

</details>

<details>
<summary><strong>Administrator routes</strong></summary>

```text
/admin/overview
/admin/orders
/admin/deliveries
/admin/inventory
/admin/products
/admin/customers
/admin/loyalty
/admin/account
```

</details>

<details>
<summary><strong>Deliverer routes</strong></summary>

```text
/deliverer
/deliverer/deliveries
/deliverer/history
/deliverer/profile
```

</details>

---

# PROJECT ARCHITECTURE

```text
src/
│
├── app/                  Next.js App Router routes
│
├── screens/
│   ├── public/           Storefront and public experiences
│   ├── customer/         Customer account and checkout
│   ├── admin/            Admin operations workspace
│   ├── deliverer/        Mobile-first field workflow
│   └── auth/             Login and registration
│
├── components/
│   ├── layout/           Shared shells, headers, footers
│   └── ui/               Shared UI controls and dialogs
│
├── data/                 Local application data
├── services/             Application service layer
├── store/                Zustand application state
├── config/               Delivery, storefront, payment, workflow config
├── theme/                MUI theme and design tokens
├── types/                Domain TypeScript types
└── utils/                Business and formatting utilities
```

Significant screens and components follow the project convention:

```text
ComponentName/
├── index.tsx
├── elements.tsx
└── interface.ts
```

`index.tsx` handles rendering and behavior.

`elements.tsx` contains MUI styled components.

`interface.ts` contains component-local TypeScript contracts.

---

# TECHNOLOGY

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3 App Router |
| UI runtime | React 19 |
| Language | TypeScript |
| Component system | Material UI |
| State | Zustand |
| Validation | Zod |
| Motion | GSAP |
| Smooth scrolling | Lenis |
| Delivery map | MapLibre GL JS |
| Map data | OpenStreetMap-compatible tiles |

---

# DESIGN SYSTEM

The interface follows a deliberate shared system while allowing each workspace to serve a different job.

```text
CUSTOMER
Image-led commerce and ordering

ADMIN
Dense operational control

DELIVERER
Fast mobile-first field workflow
```

Core design rules:

- Maximum meaningful content width: `1440px`
- Full-width backgrounds may extend beyond the content shell
- Responsive behavior is designed from mobile through ultrawide desktop
- MRJE Gas uses warm gas/orange signals
- Bright Star Water uses cooler water/blue signals
- Shared operations surfaces primarily use navy and neutral tones
- No gradients
- No decorative line motifs without semantic purpose
- No glassmorphism
- No generic bento-dashboard dependency
- No excessive card nesting
- Motion must explain state, hierarchy, or interaction
- Reduced-motion preferences are respected

---

# COMMON DEVELOPMENT COMMANDS

```bash
# Start development
npm run dev

# Create production build
npm run build

# Start production server
npm start

# Run tests when configured by the project
npm test
```

---

# FIRST-TIME WALKTHROUGH

If this is your first time opening the application, use this order:

```text
1. Open /
2. Choose MRJE Gas or Bright Star Water
3. Browse products while signed out
4. Click Sign In or attempt to add a product
5. Create a customer account
6. Complete email verification
7. Add a product to the cart
8. Open checkout
9. Pin the delivery location
10. Choose a delivery schedule
11. Choose COD or GCash
12. Place the order
13. Open Admin and review the order
14. Assign the delivery
15. Open Deliverer and complete the delivery workflow
16. Return to Customer and review the completed order
```

This sequence demonstrates the complete system from storefront discovery to delivery completion.

---

# SYSTEM FLOW

```text
CUSTOMER
   │
   │ places order
   ▼
ORDER QUEUE
   │
   │ reviewed by
   ▼
ADMIN
   │
   │ assigns delivery
   ▼
DELIVERER
   │
   │ completes delivery
   ▼
ORDER HISTORY
   │
   └──────────────► CUSTOMER
```

For GCash:

```text
Customer uploads proof
        │
        ▼
Admin reviews payment
        │
        ▼
Order proceeds through fulfillment
        │
        ▼
Deliverer sees payment state
```

For COD:

```text
Customer chooses COD
        │
        ▼
Order is assigned
        │
        ▼
Deliverer collects displayed amount
        │
        ▼
Collection is confirmed during delivery completion
```

---

<div align="center">

## MRJE GAS + BRIGHT STAR WATER

**Built around the full local-delivery journey, not just the storefront.**

Customer order → Operations review → Delivery assignment → Field fulfillment → Order history

</div>
