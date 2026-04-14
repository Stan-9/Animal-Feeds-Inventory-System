import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, AlertTriangle, Users2, DollarSign } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState({
        salesSummary: { totalSales: 0 },
        stockAlerts: [],
        topProducts: [],
        totalDebt: 0
    });

    useEffect(() => {
        axios.get('http://localhost:5000/api/reports/dashboard')
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Dashboard Overview</h1>
                <p style={{ color: 'var(--text-muted)' }}>Real-time summary of Peros Animal Feeds</p>
            </header>

            <div className="grid grid-cols-3">
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Sales</p>
                            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>KES {(data.salesSummary?.totalSales || 0).toLocaleString()}</h3>
                        </div>
                        <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '12px', color: 'var(--accent)' }}>
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Debtors</p>
                            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>KES {(data.totalDebt || 0).toLocaleString()}</h3>
                        </div>
                        <div style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: '12px', color: 'var(--danger)' }}>
                            <Users2 size={24} />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Stock Alerts</p>
                            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{data.stockAlerts.length} Items Low</h3>
                        </div>
                        <div style={{ background: '#fffbeb', padding: '0.75rem', borderRadius: '12px', color: 'var(--warning)' }}>
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2" style={{ marginTop: '1rem' }}>
                <div className="card">
                    <h4 style={{ marginBottom: '1rem' }}>Low Stock Inventory</h4>
                    {data.stockAlerts.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Stock</th>
                                    <th>Threshold</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.stockAlerts.map((item, i) => (
                                    <tr key={i}>
                                        <td>{item.name}</td>
                                        <td style={{ color: 'var(--danger)', fontWeight: '600' }}>{item.quantity}</td>
                                        <td>{item.low_threshold}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>Stock levels are healthy.</p>
                    )}
                </div>

                <div className="card">
                    <h4 style={{ marginBottom: '1rem' }}>Top Selling Products</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Units Sold</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topProducts.map((item, i) => (
                                <tr key={i}>
                                    <td>{item.name}</td>
                                    <td>{item.sold} units</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
