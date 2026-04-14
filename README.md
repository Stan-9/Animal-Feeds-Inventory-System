# Peros Animal Feeds Inventory System (v2)

A professional, high-performance Inventory and Sales Management System designed for animal feed retail environments. This system prioritizes financial accuracy, stock integrity, and an exceptional user experience.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Peros+Animal+Feeds+Dashboard)

## 🚀 Key Features

- **Advanced Inventory Management**: 
  - Weighted Average Cost (WAC) restocking logic.
  - Low-stock visual alerts and thresholds.
- **Smart POS Terminal**: 
  - Dynamic cart system with real-time total calculation.
  - Multi-method payments: Cash, M-Pesa, and Credit.
  - Automatic receipt generation with unique IDs.
- **Credit & Debt Management**: 
  - Customer ledger for tracking balances and repayments.
  - Debt status monitoring (Active vs. Paid).
- **Analytics & Reporting**: 
  - Weekly sales trends and revenue summaries.
  - Top-selling product charts (Chart.js integration).
  - Estimated profit and potential inventory value reports.
- **Data Integrity**: 
  - Atomic database transactions to prevent negative stock.
  - ACID-compliant SQLite backend.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Lucide Icons, Vanilla CSS (Premium Aesthetics)
- **Backend**: Node.js, Express.js
- **Database**: SQLite (ACID compliant)
- **Charts**: Chart.js / React-Chartjs-2

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Stan-9/Animal-Feeds-Inventory-System.git
   cd Animal-Feeds-Inventory-System
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   node index.js
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the App**:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)

## 🧠 Business Logic

### Weighted Average Cost (WAC)
When new stock is added at a different price, the system automatically adjusts the buying price using:
`New Avg Price = (Old Total Value + New Purchase Value) / New Total Quantity`

### Sales Transactions
All sales follow a strict transaction pattern:
1. Validate stock availability.
2. Deduct stock and log the sale items.
3. Update customer credit balance (if applicable).
4. Commit or rollback on error to ensure consistency.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
*Built with ❤️ for Peros Animal Feeds.*
