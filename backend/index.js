const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { db, initDB } = require('./database/index');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize Database
// Note: In Vercel, this usually runs on every cold start or you can run it as a migration script.
initDB().catch(err => console.error("DB Init Error:", err));

// Helper for DB queries (Postgres use $1, $2 placeholders)
const runQuery = async (sql, params = []) => {
    return await db.query(sql, params);
};

const getQuery = async (sql, params = []) => {
    const result = await db.query(sql, params);
    return result.rows;
};

const getOneQuery = async (sql, params = []) => {
    const result = await db.query(sql, params);
    return result.rows[0];
};

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await getQuery("SELECT * FROM products ORDER BY id DESC");
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    const { name, category, quantity, avg_buying_price, selling_price, low_threshold } = req.body;
    try {
        await runQuery(
            "INSERT INTO products (name, category, quantity, avg_buying_price, selling_price, low_threshold) VALUES ($1, $2, $3, $4, $5, $6)",
            [name, category, quantity || 0, avg_buying_price || 0, selling_price || 0, low_threshold || 5]
        );
        res.status(201).json({ message: "Product added" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products/:id/restock', async (req, res) => {
    const { id } = req.params;
    const { added_quantity, new_buying_price } = req.body;
    
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        const product = (await client.query("SELECT quantity, avg_buying_price FROM products WHERE id = $1", [id])).rows[0];
        if (!product) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Product not found" });
        }

        const oldQty = product.quantity;
        const oldAvgPrice = product.avg_buying_price;
        const newQty = oldQty + added_quantity;
        
        // Weighted Average Cost Logic
        const oldTotalValue = oldQty * oldAvgPrice;
        const newTotalValue = added_quantity * new_buying_price;
        const updatedAvgPrice = (oldTotalValue + newTotalValue) / newQty;

        await client.query(
            "UPDATE products SET quantity = $1, avg_buying_price = $2 WHERE id = $3",
            [newQty, updatedAvgPrice, id]
        );
        
        await client.query("INSERT INTO audit_logs (action, details) VALUES ($1, $2)", 
            ['RESTOCK', `Restocked product ${id}: +${added_quantity} units at ${new_buying_price} each. New Avg: ${updatedAvgPrice}`]);

        await client.query('COMMIT');
        res.json({ message: "Stock updated successfully", newQty, updatedAvgPrice });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// --- CUSTOMERS ---
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await getQuery("SELECT * FROM customers ORDER BY balance DESC");
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    const { name, phone } = req.body;
    try {
        await runQuery("INSERT INTO customers (name, phone) VALUES ($1, $2)", [name, phone]);
        res.status(201).json({ message: "Customer registered" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SALES (POS) ---
app.get('/api/sales', async (req, res) => {
    try {
        const sales = await getQuery(`
            SELECT s.*, c.name as customer_name 
            FROM sales s 
            LEFT JOIN customers c ON s.customer_id = c.id 
            ORDER BY s.timestamp DESC
        `);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/sales', async (req, res) => {
    const { cart, payment_method, amount_paid, customer_id } = req.body;
    const saleId = crypto.randomUUID().substring(0, 8).toUpperCase();
    
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Calculate Total and Check Stock
        let totalAmount = 0;
        for (const item of cart) {
            const result = await client.query("SELECT quantity, selling_price FROM products WHERE id = $1", [item.id]);
            const product = result.rows[0];
            
            if (!product || product.quantity < item.qty) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
            }
            totalAmount += product.selling_price * item.qty;
        }

        const balanceDue = (payment_method === 'Credit') ? totalAmount - (amount_paid || 0) : 0;

        // 2. Insert Sale Record
        await client.query(
            "INSERT INTO sales (id, total_amount, payment_method, amount_paid, balance_due, customer_id) VALUES ($1, $2, $3, $4, $5, $6)",
            [saleId, totalAmount, payment_method, amount_paid || 0, balanceDue, customer_id || null]
        );

        // 3. Process Items and Update Stock
        for (const item of cart) {
            const productRes = await client.query("SELECT selling_price FROM products WHERE id = $1", [item.id]);
            const product = productRes.rows[0];
            
            await client.query(
                "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
                [saleId, item.id, item.qty, product.selling_price]
            );
            await client.query("UPDATE products SET quantity = quantity - $1 WHERE id = $2", [item.qty, item.id]);
        }

        // 4. Update Customer Balance if Credit
        if (payment_method === 'Credit' && customer_id) {
            await client.query("UPDATE customers SET balance = balance + $1 WHERE id = $2", [balanceDue, customer_id]);
        }

        await client.query('COMMIT');
        res.json({ message: "Sale successful", saleId, totalAmount, balanceDue });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// --- REPORTS ---
app.get('/api/reports/dashboard', async (req, res) => {
    try {
        const salesSummary = await getOneQuery("SELECT SUM(total_amount) as totalSales, COUNT(*) as salesCount FROM sales");
        const stockAlerts = await getQuery("SELECT name, quantity, low_threshold FROM products WHERE quantity <= low_threshold");
        const topProducts = await getQuery(`
            SELECT p.name, SUM(si.quantity) as sold 
            FROM sale_items si 
            JOIN products p ON si.product_id = p.id 
            GROUP BY p.id, p.name
            ORDER BY sold DESC LIMIT 5
        `);
        const totalDebt = await getOneQuery("SELECT SUM(balance) as totalDebt FROM customers");

        res.json({
            salesSummary: {
                totalSales: salesSummary.totalsales || 0,
                salesCount: salesSummary.salescount || 0
            },
            stockAlerts,
            topProducts,
            totalDebt: totalDebt.totaldebt || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Repayment Handling
app.post('/api/customers/:id/repay', async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        await client.query("UPDATE customers SET balance = balance - $1 WHERE id = $2", [amount, id]);
        await client.query("INSERT INTO payments (customer_id, amount) VALUES ($1, $2)", [id, amount]);
        await client.query('COMMIT');
        res.json({ message: "Payment recorded successfully" });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
