import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Megaphone, Users, Store, Bike, Settings, LogOut,
  Bell, ChevronLeft, ChevronRight, BarChart2, Search, Package,
  Eye, EyeOff, Lock, Mail, ShoppingBag
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AdsManagement from './pages/AdsManagement';
import UsersList from './pages/UsersList';
import Marketplace from './pages/Marketplace';
import Essentials from './pages/Essentials';
import SettingsPage from './pages/Settings';
import Analytics from './pages/Analytics';
import Orders from './pages/Orders';
import ShopsManagement from './pages/ShopsManagement';
import DeliveryManagement from './pages/DeliveryManagement';
import CommissionManagement from './pages/CommissionManagement';
import NotificationCenter from './pages/NotificationCenter';
import DisputeResolution from './pages/DisputeResolution';
import { getNotifications, markAllNotifsRead, getStats, timeAgo } from './dataStore';

/* ═══ MOCK AUTH ═══ */
const ADMIN_CREDS = { email: 'admin@apnabetul.com', password: 'admin123' };

/* ═══ LOGIN PAGE ═══ */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 800));
    if (email === ADMIN_CREDS.email && password === ADMIN_CREDS.password) {
      onLogin();
    } else {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🏙️</div>
          <h1 className="login-title">Apna Betul</h1>
          <p className="login-subtitle">Admin Panel — Secure Login</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="search-input-wrap">
              <Mail size={16} />
              <input type="email" className="form-control" placeholder="admin@apnabetul.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="search-input-wrap">
              <Lock size={16} />
              <input type={showPass ? 'text' : 'password'} className="form-control" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: '44px' }} required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', fontWeight: 600 }}>⚠️ {error}</div>}
          <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', padding: '14px', fontSize: '15px', marginBottom: '16px' }} disabled={loading}>
            {loading ? '⏳ Signing in...' : '🔐 Sign In to Admin Panel'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>Demo: admin@apnabetul.com / admin123</p>
        </form>
      </div>
    </div>
  );
}

/* ═══ ADMIN LAYOUT ═══ */
function AdminLayout({ children, onLogout }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState(() => getNotifications(true));
  const notifRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  const [stats, setStats] = useState(getStats());

  useEffect(() => {
    const reload = () => {
      setNotifications(getNotifications(true));
      setStats(getStats());
    };
    const i = setInterval(reload, 5000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    markAllNotifsRead(true);
    setNotifications(n => n.map(x => ({ ...x, read: true })));
  };

  const getPageTitle = () => {
    const titles = {
      '/': 'Dashboard Overview', '/ads': 'Ads Management',
      '/users': 'User Management', '/marketplace': 'Marketplace Approvals',
      '/essentials': 'Daily Essentials Orders', '/settings': 'App Settings',
      '/analytics': 'Analytics & Reports', '/orders': 'All Orders',
      '/shops': 'Shops Management', '/delivery': 'Delivery Partners',
      '/commission': 'Commission Management', '/notifications': 'Notification Center',
      '/disputes': 'Dispute Resolution',
    };
    return titles[location.pathname] || 'Apna Betul Admin';
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', badge: null, end: true },
    { to: '/ads', icon: <Megaphone size={18} />, label: 'Shop Ads', badge: stats.pendingAds > 0 ? stats.pendingAds : null },
    { to: '/shops', icon: <Store size={18} />, label: 'Shops', badge: stats.pendingShops > 0 ? stats.pendingShops : null },
    { to: '/delivery', icon: <Bike size={18} />, label: 'Delivery Team', badge: null },
    { to: '/marketplace', icon: <Package size={18} />, label: 'Marketplace', badge: stats.pendingListings > 0 ? stats.pendingListings : null },
    { to: '/essentials', icon: <Bike size={18} />, label: 'Daily Orders', badge: stats.pendingOrders > 0 ? stats.pendingOrders : null },
    { to: '/orders', icon: <ShoppingBag size={18} />, label: 'All Orders', badge: null },
    { to: '/analytics', icon: <BarChart2 size={18} />, label: 'Analytics', badge: null },
  ];

  const navItems2 = [
    { to: '/users', icon: <Users size={18} />, label: 'App Users', badge: null },
    { to: '/commission', icon: <BarChart2 size={18} />, label: 'Commission', badge: null },
    { to: '/notifications', icon: <Bell size={18} />, label: 'Notifications', badge: null },
    { to: '/disputes', icon: <Package size={18} />, label: 'Disputes', badge: 2 },
    { to: '/settings', icon: <Settings size={18} />, label: 'Settings', badge: null },
  ];

  return (
    <div className="app-container">
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">🏙️</div>
          <div className="sidebar-brand"><h2>Apna Betul</h2><span>Admin Panel</span></div>
        </div>
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)} title="Toggle Sidebar">
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} title={collapsed ? item.label : ''}>
              {item.icon}
              <span className="nav-item-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
          <hr className="sidebar-divider" />
          <div className="nav-section-label">Management</div>
          {navItems2.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} title={collapsed ? item.label : ''}>
              {item.icon}
              <span className="nav-item-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">A</div>
            <div className="sidebar-user-info"><strong>Admin Panel</strong><span>Super Admin</span></div>
          </div>
          <button className="nav-item" style={{ marginTop: '4px', color: 'rgba(239,68,68,0.8)' }} onClick={onLogout} title={collapsed ? 'Logout' : ''}>
            <LogOut size={18} />
            <span className="nav-item-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-left"><h1 className="header-title">{getPageTitle()}</h1></div>
          <div className="header-right">
            <div className="header-search">
              <Search size={14} /><span>Quick search...</span>
            </div>
            {/* Notifications */}
            <div className="notif-wrapper" ref={notifRef}>
              <button className="icon-btn" onClick={() => setShowNotifs(!showNotifs)}>
                <Bell size={17} />
                {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
              </button>
              {showNotifs && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <h3>🔔 Notifications</h3>
                    <button onClick={markAllRead}>Mark all read</button>
                  </div>
                  {notifications.slice(0, 8).map(n => (
                    <div key={n.id} className={`notif-item${n.unread || !n.read ? ' unread' : ''}`}>
                      <div className="notif-icon" style={{ background: '#FFF3E0' }}>{n.icon}</div>
                      <div className="notif-content">
                        <p style={{ fontWeight: !n.read ? 700 : 400 }}>{n.title}</p>
                        <span>{timeAgo(n.time)}</span>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && <p style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications</p>}
                </div>
              )}
            </div>
            {/* Admin Profile */}
            <div className="admin-profile">
              <div className="avatar">A</div>
              <div className="admin-info"><strong>Admin Panel</strong><span>Super Admin</span></div>
            </div>
          </div>
        </header>
        <div className="content-scroll">{children}</div>
      </main>
    </div>
  );
}

/* ═══ ROOT APP ═══ */
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('ab_admin_auth') === '1');

  const handleLogin = () => { localStorage.setItem('ab_admin_auth', '1'); setIsLoggedIn(true); };
  const handleLogout = () => { localStorage.removeItem('ab_admin_auth'); setIsLoggedIn(false); };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <AdminLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ads" element={<AdsManagement />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/essentials" element={<Essentials />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/shops" element={<ShopsManagement />} />
          <Route path="/delivery" element={<DeliveryManagement />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/commission" element={<CommissionManagement />} />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/disputes" element={<DisputeResolution />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
}
