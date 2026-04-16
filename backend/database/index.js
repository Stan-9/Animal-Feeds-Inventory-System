const { db } = require('@vercel/postgres');

const initDB = async () => {
    try {
        const client = await db.connect();
        
        // Products table
        await client.sql`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT,
                quantity FLOAT DEFAULT 0,
                avg_buying_price FLOAT DEFAULT 0,
                selling_price FLOAT DEFAULT 0,
                low_threshold INTEGER DEFAULT 5,
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Customers table
        await client.sql`
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT,
                balance FLOAT DEFAULT 0
            )
        `;

        // Sales table
        await client.sql`
            CREATE TABLE IF NOT EXISTS sales (
                id TEXT PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_amount FLOAT NOT NULL,
                payment_method TEXT CHECK(payment_method IN ('Cash', 'M-Pesa', 'Credit')),
                amount_paid FLOAT DEFAULT 0,
                balance_due FLOAT DEFAULT 0,
                customer_id INTEGER REFERENCES customers(id)
            )
        `;

        // Sale Items table
        await client.sql`
            CREATE TABLE IF NOT EXISTS sale_items (
                id SERIAL PRIMARY KEY,
                sale_id TEXT REFERENCES sales(id),
                product_id INTEGER REFERENCES products(id),
                quantity FLOAT NOT NULL,
                unit_price FLOAT NOT NULL
            )
        `;

        // Payments Table
        await client.sql`
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES customers(id),
                amount FLOAT NOT NULL,
                payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active'
            )
        `;

        // Audit Logs
        await client.sql`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                action TEXT,
                details TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        console.log("Postgres Database initialized successfully.");
    } catch (err) {
        console.error("Postgres Init Error:", err);
        throw err;
    }
};

module.exports = { db, initDB };
