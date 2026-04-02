import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Megaphone, Store, TrendingUp, ArrowUpRight, ArrowDownRight, Eye, ShoppingBag, Package, RefreshCw } from 'lucide-react';
import { getStats, getNotifications, getOrders, timeAgo } from '../dataStore';

export default function Dashboard() {
  const [stats, setStats] = useState(getStats());
  const [animated, setAnimated] = useState(false);
  const [orders, setOrders] = useState(getOrders());
  const [activity, setActivity] = useState(getNotifications(true).slice(0, 8));
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = useCallback(() => {
    setStats(getStats());
    setOrders(getOrders());
    setActivity(getNotifications(true).slice(0, 8));
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    const interval = setInterval(refresh, 5000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [refresh]);

  const STAT_CARDS = [
    { title: 'Total Users', value: stats.totalUsers, trend: '+12%', up: true, icon: <Users size={22} color="#FFF" />, bg: 'linear-gradient(135deg,#10B981,#059669)', sparkline: 72, sub: `${stats.activeUsers} active` },
    { title: 'Active Shop Ads', value: stats.totalAds, trend: '+5%', up: true, icon: <Megaphone size={22} color="#FFF" />, bg: 'linear-gradient(135deg,#F59E0B,#D97706)', sparkline: 60, sub: `${stats.pendingAds} pending` },
    { title: 'Marketplace Items', value: stats.totalListings, trend: '+18%', up: true, icon: <Store size={22} color="#FFF" />, bg: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', sparkline: 85, sub: `${stats.pendingListings} pending review` },
    { title: 'Total Revenue', value: stats.revenueFormatted, trend: '+8%', up: true, icon: <TrendingUp size={22} color="#FFF" />, bg: 'linear-gradient(135deg,#FF6B35,#E85D2E)', sparkline: 55, sub: `${stats.totalOrders} total orders` },
  ];

  const STATUS_CONFIG = { pending: { c: '#F59E0B', bg: '#FEF3C7' }, dispatched: { c: '#3B82F6', bg: '#DBEAFE' }, delivered: { c: '#16A34A', bg: '#DCFCE7' }, cancelled: { c: '#EF4444', bg: '#FEE2E2' } };

  const CHART_MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const CHART_H = [55, 67, 59, 83, 75, 88, 81, 100];

  return (
    <div>
      {/* Refresh bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
          Last updated {lastRefresh.toLocaleTimeString()} (auto-refresh every 5s)
        </span>
        <button className="btn btn-outline btn-sm" onClick={refresh}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {STAT_CARDS.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div className={`stat-trend ${s.up ? 'up' : 'down'}`}>
                {s.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{s.trend}
              </div>
            </div>
            <div className="stat-info"><h3>{s.title}</h3><p>{s.value}</p></div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{s.sub}</p>
            <div className="stat-sparkline">
              <div className="stat-sparkline-fill" style={{ width: animated ? `${s.sparkline}%` : '0%', background: s.bg, transition: `width 1s ease ${i * 0.15}s` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '⏳', label: 'Pending Orders', val: stats.pendingOrders, color: '#F59E0B' },
          { icon: '🆕', label: 'Pending Ads', val: stats.pendingAds, color: '#EF4444' },
          { icon: '📋', label: 'Pending Listings', val: stats.pendingListings, color: '#8B5CF6' },
          { icon: '👥', label: 'Total Users', val: stats.totalUsers, color: '#10B981' },
        ].map((q, i) => (
          <div key={i} className="card" style={{ margin: 0, textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: 28 }}>{q.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: q.color, margin: '4px 0' }}>{q.val}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{q.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '22px', marginBottom: '22px' }}>
        {/* Revenue Chart */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">📈 Revenue Chart</h2>
              <p className="card-subtitle">Last 8 months performance</p>
            </div>
            <span className="badge badge-success">↑ Growing</span>
          </div>
          <div className="bar-chart">
            {CHART_MONTHS.map((m, i) => (
              <div key={i} className="chart-bar-wrap">
                <div className="chart-bar" style={{
                  height: animated ? `${CHART_H[i]}%` : '0%',
                  background: i === 7 ? 'linear-gradient(180deg,#FF6B35,#E85D2E)' : 'linear-gradient(180deg,#E5E7EB,#D1D5DB)',
                  transition: `height 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.08}s`, position: 'relative',
                }}>
                  {i === 7 && <span className="chart-bar-val" style={{ color: 'var(--primary)', fontWeight: 800 }}>{stats.revenueFormatted}</span>}
                </div>
                <span className="chart-label">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header"><h2 className="card-title">⚡ Live Activity</h2></div>
          <div className="activity-feed">
            {activity.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No recent activity</p>
            ) : activity.map((a, i) => (
              <div key={a.id || i} className="activity-item">
                <div className="activity-icon" style={{ background: a.read ? '#F1F5F9' : '#FFF3E0' }}>{a.icon}</div>
                <div className="activity-content">
                  <p style={{ fontWeight: a.read ? 400 : 700 }}>{a.title}</p>
                  <span>{timeAgo(a.time)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card" style={{ margin: 0 }}>
        <div className="card-header">
          <h2 className="card-title">📦 Recent Orders</h2>
          <Link to="/orders" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>View All →</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {orders.slice(0, 6).map(o => {
                const sc = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                return (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700 }}>#{o.id.slice(-6).toUpperCase()}</td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{o.userName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.phone}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.items?.map(i => `${i.emoji} ${i.name}`).join(', ')}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{o.total}</td>
                    <td><span className="badge" style={{ background: sc.bg, color: sc.c, border: 'none' }}>{o.status}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(o.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
