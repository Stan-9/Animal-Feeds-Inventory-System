import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Trash2, Printer } from 'lucide-react';

const POS = () => {
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [amountPaid, setAmountPaid] = useState(0);
    const [customerId, setCustomerId] = useState('');
    const [receipt, setReceipt] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5000/api/products').then(res => setProducts(res.data));
        axios.get('http://localhost:5000/api/customers').then(res => setCustomers(res.data));
    }, []);

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const addToCart = (product) => {
        const existing = cart.find(c => c.id === product.id);
        if (existing) {
            setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const total = cart.reduce((sum, item) => sum + (item.selling_price * item.qty), 0);

    const handleCheckout = () => {
        if (cart.length === 0) return alert("Cart is empty");
        if (paymentMethod === 'Credit' && !customerId) return alert("Select a customer for credit sales");

        const saleData = {
            cart,
            payment_method: paymentMethod,
            amount_paid: parseFloat(amountPaid) || 0,
            customer_id: customerId
        };

        axios.post('http://localhost:5000/api/sales', saleData)
            .then(res => {
                setReceipt({ ...res.data, cart, timestamp: new Date().toLocaleString() });
                setCart([]);
                setAmountPaid(0);
                setCustomerId('');
            })
            .catch(err => alert(err.response?.data?.error || "Sale failed"));
    };

    return (
        <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
                <header style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Sales Terminal</h1>
                    <div style={{ position: 'relative', marginTop: '1rem' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} size={20} />
                        <input 
                            placeholder="Scan or search products..." 
                            style={{ paddingLeft: '2.5rem' }} 
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                <div className="grid grid-cols-2" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                    {filteredProducts.map(p => (
                        <div key={p.id} className="card" style={{ cursor: 'pointer', border: p.quantity === 0 ? '1px dashed var(--danger)' : 'none' }} onClick={() => p.quantity > 0 && addToCart(p)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem' }}>{p.name}</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stock: {p.quantity}</p>
                                </div>
                                <p style={{ fontWeight: '700', color: 'var(--accent)' }}>KES {p.selling_price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pos-cart" style={{ width: '400px' }}>
                <div className="card" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingCart size={20} /> Checkout Balance
                    </h3>

                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
                        {cart.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Cart is empty</p>}
                        {cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                                <div>
                                    <p style={{ fontWeight: '600' }}>{item.name}</p>
                                    <p style={{ color: 'var(--text-muted)' }}>{item.qty} x KES {item.selling_price}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <p style={{ fontWeight: '600' }}>KES {item.qty * item.selling_price}</p>
                                    <button onClick={() => removeFromCart(item.id)} style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--accent)' }}>KES {total.toLocaleString()}</span>
                        </div>

                        <label>Payment Method</label>
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                            <option>Cash</option>
                            <option>M-Pesa</option>
                            <option>Credit</option>
                        </select>

                        {paymentMethod === 'Credit' && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <label>Customer</label>
                                <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} (Bal: {c.balance})</option>)}
                                </select>
                            </div>
                        )}

                        <div style={{ marginTop: '0.5rem' }}>
                            <label>Amount Paid</label>
                            <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
                        </div>

                        {paymentMethod !== 'Credit' && amountPaid > 0 && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: 'var(--danger)' }}>
                                <span>Change Due</span>
                                <span>KES {(amountPaid - total).toLocaleString()}</span>
                            </div>
                        )}

                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} onClick={handleCheckout}>
                            Confirm Sale & Generate Receipt
                        </button>
                    </div>
                </div>
            </div>

            {receipt && (
                <div className="modal-overlay" style={overlayStyle}>
                    <div className="card" style={{ width: '350px', padding: '2rem', textAlign: 'center' }}>
                        <h2 style={{ color: 'var(--primary)' }}>Peros Animal Feeds</h2>
                        <p style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>Receipt ID: #{receipt.saleId}</p>
                        <div style={{ textAlign: 'left', borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '1rem 0' }}>
                            {receipt.cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span>{item.name} x {item.qty}</span>
                                    <span>{item.qty * item.selling_price}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <p style={{ fontWeight: '800' }}>TOTAL: KES {receipt.totalAmount}</p>
                            <p style={{ fontSize: '0.8rem' }}>Method: {paymentMethod}</p>
                            {receipt.balanceDue > 0 && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>Balance Due: KES {receipt.balanceDue}</p>}
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => window.print()}>
                           <Printer size={18} /> Print Receipt
                        </button>
                        <button className="btn" style={{ marginTop: '0.5rem', width: '100%' }} onClick={() => setReceipt(null)}>CLOSE</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

export default POS;
