# Peros Animal Feeds Inventory System (v2) - Implementation Plan

## Goal
Build a professional, POS-ready inventory and sales management system for "Peros Animal Feeds". The system will prioritize data integrity (atomicity), accurate profit tracking (Weight Average Cost), and robust credit management.

## User Review Required

> [!IMPORTANT]
> **Database Choice**: The local environment does not have MySQL/PostgreSQL in the PATH. I propose using **SQLite** for development as it is serverless, supports ACID transactions (required), and can be easily migrated to MySQL/PostgreSQL in production.
> **Frontend Choice**: I will use **Vite + React** with **Vanilla CSS** to achieve the "Premium Design" requested while following the constraint of avoiding Tailwind unless requested.

## Proposed Changes

### Backend (Node.js/Express)
- `server.js`: Main entry point.
- `database/`: Schema setup and transaction wrappers.
- `routes/`: API endpoints for Products, Sales, Customers, and Reports.
- `controllers/`: Business logic for stock calculation (WAC), credit handling, and receipt generation.

#### Database Schema
- **Products**: Track stock, prices, and thresholds.
- **Sales & SaleItems**: Store transaction history and product breakdowns.
- **Customers & Payments**: Track credit balances and repayment history.
- **Reports**: Virtual views or logic for daily/weekly/monthly analytics.

### Frontend (React + Vite)
- **Dashboard**: High-level overview (Sales, Stock Alerts, Debtors).
- **Inventory module**: Search, add/edit, restocking logic (Weighted Average Cost).
- **POS module**: Cart system, payment method selection, receipt generation.
- **Creditors module**: Customer balances, repayment tracking, bad debt handling.
- **Reports module**: Chart.js or D3 visual analytics.

### Design System (Premium Aesthetics)
- **Color Palette**: Rich deep blues, emerald greens for "profit", and clean grays.
- **Typography**: "Inter" or "Roboto" for readability.
- **Interactions**: Subtle transitions, hover states, and clear feedback for critical actions (e.g., stock block).

## Verification Plan

### Automated Tests
- Scripted tests for the Weighted Average Cost calculation.
- Transaction tests to ensure "No Negative Stock" logic holds under concurrent requests.

### Manual Verification
1.  **Restocking**: Add stock at a different price and verify Average Price update.
2.  **Sale**: Process a sale and check stock deduction + receipt ID generation.
3.  **Credit**: Mark a sale as "Credit", verify customer balance increases.
4.  **Bad Debt**: Mark a debt as "Bad" and verify deduction from customer balance and entry in Loss Reports.

## Open Questions
1.  Do you have a specific logo or color scheme in mind for "Peros Animal Feeds"?
2.  Is SQLite acceptable for this environment, or should I attempt a full MySQL installation if possible?
3.  For physical printing, do you want a PDF download or a browser print-optimized view?
