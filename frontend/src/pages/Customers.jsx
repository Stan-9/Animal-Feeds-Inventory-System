import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { UserPlus, Wallet, AlertCircle } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [showRegister, setShowRegister] = useState(false);
    const [showRepay, setShowRepay] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [repayAmount, setRepayAmount] = useState(0);

    const fetchCustomers = () => {
        api.get('/api/customers').then(res => setCustomers(res.data));
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleRegister = (e) => {
        e.preventDefault();
        api.post('/api/customers', formData).then(() => {
            setShowRegister(false);
            fetchCustomers();
        });
    };

    const handleRepayment = (e) => {
        e.preventDefault();
        api.post(`/api/customers/${showRepay.id}/repay`, { amount: parseFloat(repayAmount) })
            .then(() => {
                setShowRepay(null);
                fetchCustomers();
            });
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="header-text">
                    <h1>Creditors & Debts</h1>
                    <p>Manage customer accounts and credit balances</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowRegister(true)}>
                    <UserPlus size={18} /> Register Customer
                </button>
            </header>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>Phone</th>
                                <th>Outstanding Balance</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: '600' }}>{c.name}</td>
                                    <td>{c.phone}</td>
                                    <td style={{ fontWeight: '700', color: c.balance > 0 ? 'var(--danger)' : 'var(--accent)' }}>
                                        KES {c.balance.toLocaleString()}
                                    </td>
                                    <td>
                                        {c.balance > 0 ? (
                                            <span style={{ color: 'var(--danger)', fontSize: '0.8rem', background: '#fef2f2', padding: '4px 12px', borderRadius: '12px', fontWeight: '600' }}>
                                                Active Debt
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--accent)', fontSize: '0.8rem', background: '#ecfdf5', padding: '4px 12px', borderRadius: '12px', fontWeight: '600' }}>
                                                Clear
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {c.balance > 0 && (
                                            <button className="btn" onClick={() => setShowRepay(c)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#f1f5f9' }}>
                                                <Wallet size={14} /> Record Payment
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showRegister && (
                <div className="modal-overlay" style={overlayStyle}>
                    <div className="card modal-card">
                        <h2>Register New Customer</h2>
                        <form onSubmit={handleRegister} style={{ marginTop: '1rem' }}>
                            <label>Full Name</label>
                            <input required onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            
                            <label>Phone Number</label>
                            <input required onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            
                            <div className="modal-actions">
                                <button type="submit" className="btn btn-primary">Save Customer</button>
                                <button type="button" className="btn" onClick={() => setShowRegister(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showRepay && (
                <div className="modal-overlay" style={overlayStyle}>
                    <div className="card modal-card">
                        <h2>Repayment: {showRepay.name}</h2>
                        <p style={{ color: 'var(--danger)', fontWeight: '600' }}>Current Balance: KES {showRepay.balance}</p>
                        <form onSubmit={handleRepayment} style={{ marginTop: '1rem' }}>
                            <label>Payment Amount</label>
                            <input type="number" step="0.01" required onChange={e => setRepayAmount(e.target.value)} />
                            
                            <div className="modal-actions">
                                <button type="submit" className="btn btn-primary">Submit Payment</button>
                                <button type="button" className="btn" onClick={() => setShowRepay(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, padding: '1rem'
};

export default Customers;
