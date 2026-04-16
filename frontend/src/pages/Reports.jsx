import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
    const [data, setData] = useState(null);
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        api.get('/api/reports/dashboard').then(res => setData(res.data));
        api.get('/api/products').then(res => setInventory(res.data));
    }, []);

    if (!data) return <p>Loading Analytics...</p>;

    const chartData = {
        labels: data.topProducts.map(p => p.name),
        datasets: [
            {
                label: 'Units Sold',
                data: data.topProducts.map(p => p.sold),
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: '#10b981',
                borderWidth: 1,
            },
        ],
    };

    const totalInventoryValue = inventory.reduce((sum, p) => sum + (p.quantity * p.avg_buying_price), 0);
    const totalPotentialRevenue = inventory.reduce((sum, p) => sum + (p.quantity * p.selling_price), 0);

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Analytics & Financial Reports</h1>
                <p style={{ color: 'var(--text-muted)' }}>Business performance insights for Peros Animal Feeds</p>
            </header>

            <div className="grid grid-cols-2">
                <div className="card">
                    <h3>Top Selling Products</h3>
                    <div style={{ height: '300px', marginTop: '1.5rem' }}>
                        <Bar data={chartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="card">
                    <h3>Financial Summary</h3>
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total Sales Revenue:</span>
                            <span style={{ fontWeight: '700' }}>KES {data.salesSummary?.totalSales?.toLocaleString() || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Current Inventory Cost:</span>
                            <span style={{ fontWeight: '700' }}>KES {totalInventoryValue.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Potential Revenue:</span>
                            <span style={{ fontWeight: '700', color: 'var(--accent)' }}>KES {totalPotentialRevenue.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginTop: '2rem' }}>
                            <span style={{ fontWeight: '600' }}>Total Outstanding Credit:</span>
                            <span style={{ fontWeight: '800', color: 'var(--danger)' }}>KES {data.totalDebt?.toLocaleString() || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '1rem' }}>
                <h3>Full Inventory Value Report</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>In Stock</th>
                            <th>Avg Cost</th>
                            <th>Total Cost</th>
                            <th>Potential Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map(p => (
                            <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>{p.quantity}</td>
                                <td>{p.avg_buying_price.toFixed(2)}</td>
                                <td>{(p.quantity * p.avg_buying_price).toFixed(2)}</td>
                                <td style={{ color: 'var(--accent)', fontWeight: '600' }}>
                                    {((p.selling_price - p.avg_buying_price) * p.quantity).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
