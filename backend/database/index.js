const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'peros_feeds.db');
const db = new sqlite3.Database(dbPath);

const initDB = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Products table
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT,
                quantity REAL DEFAULT 0,
                avg_buying_price REAL DEFAULT 0,
                selling_price REAL DEFAULT 0,
                low_threshold INTEGER DEFAULT 5,
                date_added DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Customers table
            db.run(`CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                balance REAL DEFAULT 0
            )`);

            // Sales table
            db.run(`CREATE TABLE IF NOT EXISTS sales (
                id TEXT PRIMARY KEY,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                total_amount REAL NOT NULL,
                payment_method TEXT CHECK(payment_method IN ('Cash', 'M-Pesa', 'Credit')),
                amount_paid REAL DEFAULT 0,
                balance_due REAL DEFAULT 0,
                customer_id INTEGER,
                FOREIGN KEY(customer_id) REFERENCES customers(id)
            )`);

            // Sale Items table
            db.run(`CREATE TABLE IF NOT EXISTS sale_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sale_id TEXT,
                product_id INTEGER,
                quantity REAL NOT NULL,
                unit_price REAL NOT NULL,
                FOREIGN KEY(sale_id) REFERENCES sales(id),
                FOREIGN KEY(product_id) REFERENCES products(id)
            )`);

            // Payments Table (for credit repayments)
            db.run(`CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                sale_id TEXT,
                amount REAL NOT NULL,
                payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active', -- active, paid, bad_debt
                FOREIGN KEY(customer_id) REFERENCES customers(id),
                FOREIGN KEY(sale_id) REFERENCES sales(id)
            )`);

            // Audit Logs
            db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT ,
                details TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            console.log("Database initialized successfully.");
            resolve();
        });
    });
};

module.exports = { db, initDB };
