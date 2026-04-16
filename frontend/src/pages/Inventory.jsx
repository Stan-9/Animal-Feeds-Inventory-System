import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { Plus, PackageSearch, RefreshCw } from 'lucide-react';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showRestock, setShowRestock] = useState(null); // stores product id
    const [formData, setFormData] = useState({ name: '', category: '', quantity: 0, avg_buying_price: 0, selling_price: 0 });
    const [restockData, setRestockData] = useState({ added_quantity: 0, new_buying_price: 0 });

    const fetchProducts = () => {
        api.get('/api/products').then(res => setProducts(res.data));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddProduct = (e) => {
        e.preventDefault();
        api.post('/api/products', formData).then(() => {
            setShowAdd(false);
            fetchProducts();
        });
    };

    const handleRestock = (e) => {
        e.preventDefault();
        api.post(`/api/products/${showRestock}/restock`, restockData).then(() => {
            setShowRestock(null);
            fetchProducts();
        });
    };

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Inventory Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track and manage your animal feeds stock</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> Add Product
                </button>
            </header>

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Avg Cost</th>
                            <th>Selling Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>#{p.id}</td>
                                <td style={{ fontWeight: '600' }}>{p.name}</td>
                                <td>{p.category}</td>
                                <td style={{ color: p.quantity <= p.low_threshold ? 'var(--danger)' : 'inherit' }}>
                                    {p.quantity} {p.quantity <= p.low_threshold && "(Low)"}
                                </td>
                                <td>KES {p.avg_buying_price.toFixed(2)}</td>
                                <td style={{ fontWeight: '600', color: 'var(--accent)' }}>KES {p.selling_price.toLocaleString()}</td>
                                <td>
                                    <button className="btn" onClick={() => setShowRestock(p.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#f1f5f9' }}>
                                        <RefreshCw size={14} /> Restock
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showAdd && (
                <div className="modal-overlay" style={overlayStyle}>
                    <div className="card" style={{ width: '400px' }}>
                        <h2>New Product</h2>
                        <form onSubmit={handleAddProduct} style={{ marginTop: '1rem' }}>
                            <label>Product Name</label>
                            <input required onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            
                            <label>Category</label>
                            <input onChange={e => setFormData({ ...formData, category: e.target.value })} />
                            
                            <div className="grid grid-cols-2" style={{ marginTop: '0.5rem' }}>
                                <div>
                                    <label>Init Qty</label>
                                    <input type="number" onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })} />
                                </div>
                                <div>
                                    <label>Avg Cost</label>
                                    <input type="number" step="0.01" onChange={e => setFormData({ ...formData, avg_buying_price: parseFloat(e.target.value) })} />
                                </div>
                            </div>

                            <label>Selling Price</label>
                            <input type="number" step="0.01" required onChange={e => setFormData({ ...formData, selling_price: parseFloat(e.target.value) })} />
                            
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" className="btn btn-primary">Save Product</button>
                                <button type="button" className="btn" onClick={() => setShowAdd(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showRestock && (
                <div className="modal-overlay" style={overlayStyle}>
                    <div className="card" style={{ width: '400px' }}>
                        <h2>Restock Product #{showRestock}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Uses Weighted Average Cost Method</p>
                        <form onSubmit={handleRestock} style={{ marginTop: '1rem' }}>
                            <label>Added Quantity</label>
                            <input type="number" required onChange={e => setRestockData({ ...restockData, added_quantity: parseFloat(e.target.value) })} />
                            
                            <label>Purchase Price (per unit)</label>
                            <input type="number" step="0.01" required onChange={e => setRestockData({ ...restockData, new_buying_price: parseFloat(e.target.value) })} />
                            
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" className="btn btn-primary">Update Stock</button>
                                <button type="button" className="btn" onClick={() => setShowRestock(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
};

export default Inventory;
