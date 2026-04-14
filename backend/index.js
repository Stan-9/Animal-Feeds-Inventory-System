const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { db, initDB } = require('./database/index');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize Database
initDB().catch(err => console.error("DB Init Error:", err));

// Helper for DB queries
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const getQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const getOneQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await getQuery("SELECT * FROM products");
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    const { name, category, quantity, avg_buying_price, selling_price, low_threshold } = req.body;
    try {
        await runQuery(
            "INSERT INTO products (name, category, quantity, avg_buying_price, selling_price, low_threshold) VALUES (?, ?, ?, ?, ?, ?)",
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
    
    try {
        db.serialize(async () => {
            db.get("SELECT quantity, avg_buying_price FROM products WHERE id = ?", [id], async (err, product) => {
                if (!product) return res.status(404).json({ error: "Product not found" });

                const oldQty = product.quantity;
                const oldAvgPrice = product.avg_buying_price;
                const newQty = oldQty + added_quantity;
                
                // Weighted Average Cost Logic
                const oldTotalValue = oldQty * oldAvgPrice;
                const newTotalValue = added_quantity * new_buying_price;
                const updatedAvgPrice = (oldTotalValue + newTotalValue) / newQty;

                await runQuery(
                    "UPDATE products SET quantity = ?, avg_buying_price = ? WHERE id = ?",
                    [newQty, updatedAvgPrice, id]
                );
                
                await runQuery("INSERT INTO audit_logs (action, details) VALUES (?, ?)", 
                    ['RESTOCK', `Restocked product ${id}: +${added_quantity} units at ${new_buying_price} each. New Avg: ${updatedAvgPrice}`]);

                res.json({ message: "Stock updated successfully", newQty, updatedAvgPrice });
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CUSTOMERS ---
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await getQuery("SELECT * FROM customers");
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    const { name, phone } = req.body;
    try {
        await runQuery("INSERT INTO customers (name, phone) VALUES (?, ?)", [name, phone]);
        res.status(201).json({ message: "Customer registered" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SALES (POS) ---
app.post('/api/sales', async (req, res) => {
    const { cart, payment_method, amount_paid, customer_id } = req.body;
    const saleId = uuidv4().substring(0, 8).toUpperCase();
    
    db.serialize(async () => {
        try {
            // 1. Calculate Total and Check Stock
            let totalAmount = 0;
            for (const item of cart) {
                const product = await getOneQuery("SELECT quantity, selling_price FROM products WHERE id = ?", [item.id]);
                if (!product || product.quantity < item.qty) {
                    return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
                }
                totalAmount += product.selling_price * item.qty;
            }

            const balanceDue = (payment_method === 'Credit') ? totalAmount - (amount_paid || 0) : 0;

            // 2. Start Transaction
            db.run("BEGIN TRANSACTION");

            // Insert Sale Record
            await runQuery(
                "INSERT INTO sales (id, total_amount, payment_method, amount_paid, balance_due, customer_id) VALUES (?, ?, ?, ?, ?, ?)",
                [saleId, totalAmount, payment_method, amount_paid || 0, balanceDue, customer_id]
            );

            // 3. Process Items and Update Stock
            for (const item of cart) {
                const product = await getOneQuery("SELECT selling_price FROM products WHERE id = ?", [item.id]);
                await runQuery(
                    "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
                    [saleId, item.id, item.qty, product.selling_price]
                );
                await runQuery("UPDATE products SET quantity = quantity - ? WHERE id = ?", [item.qty, item.id]);
            }

            // 4. Update Customer Balance if Credit
            if (payment_method === 'Credit' && customer_id) {
                await runQuery("UPDATE customers SET balance = balance + ? WHERE id = ?", [balanceDue, customer_id]);
            }

            db.run("COMMIT");
            res.json({ message: "Sale successful", saleId, totalAmount, balanceDue });

        } catch (err) {
            db.run("ROLLBACK");
            res.status(500).json({ error: err.message });
        }
    });
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
            GROUP BY p.id 
            ORDER BY sold DESC LIMIT 5
        `);
        const totalDebt = await getOneQuery("SELECT SUM(balance) as totalDebt FROM customers");

        res.json({
            salesSummary,
            stockAlerts,
            topProducts,
            totalDebt: totalDebt.totalDebt || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Repayment Handling
app.post('/api/customers/:id/repay', async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    try {
        db.serialize(async () => {
            await runQuery("UPDATE customers SET balance = balance - ? WHERE id = ?", [amount, id]);
            await runQuery("INSERT INTO payments (customer_id, amount) VALUES (?, ?)", [id, amount]);
            res.json({ message: "Payment recorded successfully" });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
