import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Customers from './pages/Customers';
import Reports from './pages/Reports';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Router>
      <div className="app-container">
        {/* Mobile Header */}
        <header className="mobile-header">
          <button className="menu-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2>PEROS FEEDS</h2>
        </header>

        {/* Sidebar Overlay */}
        {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <h2>PEROS FEEDS</h2>
          <nav>
            <NavLink to="/" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/pos" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShoppingCart size={20} /> POS System
            </NavLink>
            <NavLink to="/inventory" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Package size={20} /> Inventory
            </NavLink>
            <NavLink to="/customers" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={20} /> Creditors
            </NavLink>
            <NavLink to="/reports" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} /> Reports
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
