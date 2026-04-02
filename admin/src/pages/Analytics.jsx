import React, { useState, useEffect, useCallback } from 'react';
import { getStats, getOrders, getUsers, timeAgo } from '../dataStore';

const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const HEIGHTS = [55, 67, 59, 83, 75, 88, 81, 100];

export default function Analytics() {
  const [stats, setStats] = useState(getStats());
  const [orders, setOrders] = useState(getOrders());
  const [users, setUsers] = useState(getUsers());
  const [animated, setAnimated] = useState(false);

  const reload = useCallback(() => {
    setStats(getStats());
    setOrders(getOrders());
    setUsers(getUsers());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    const i = setInterval(reload, 5000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, [reload]);

  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const conversionRate = orders.length > 0 ? ((deliveredOrders / orders.length) * 100).toFixed(1) : 0;

  // Category breakdown
  const catBreakdown = orders.reduce((acc, o) => {
    acc[o.category] = (acc[o.category] || 0) + 1;
    return acc;
  }, {});

  // Payment breakdown
  const payBreakdown = orders.reduce((acc, o) => {
    const p = o.payment || 'cod';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  const TOP_METRICS = [
    { label: 'Total Revenue', value: `₹${revenue.toLocaleString()}`, icon: '💰', color: '#16A34A', trend: '+8%' },
    { label: 'Total Orders', value: orders.length, icon: '📦', color: '#3B82F6', trend: '+15%' },
    { label: 'Delivered', value: deliveredOrders, icon: '✅', color: '#10B981', trend: '+12%' },
    { label: 'Conversion', value: `${conversionRate}%`, icon: '🎯', color: '#8B5CF6', trend: '+3%' },
    { label: 'Total Users', value: users.length, icon: '👥', color: '#F59E0B', trend: '+22%' },
    { label: 'Active Ads', value: stats.totalAds, icon: '📢', color: '#EF4444', trend: '+5%' },
  ];

  return (
    <div>
      {/* Top Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {TOP_METRICS.map((m, i) => (
          <div key={i} className="card" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: m.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{m.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 700, marginTop: 2 }}>↑ {m.trend} this month</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Revenue Chart */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <h2 className="card-title">📈 Revenue Trend (8 months)</h2>
          </div>
          <div className="bar-chart">
            {MONTHS.map((m, i) => (
              <div key={i} className="chart-bar-wrap">
                <div className="chart-bar" style={{
                  height: animated ? `${HEIGHTS[i]}%` : '0%',
                  background: i === 7 ? 'linear-gradient(180deg,#FF6B35,#E85D2E)' : 'linear-gradient(180deg,#E5E7EB,#D1D5DB)',
                  transition: `height 0.9s cubic-bezier(0.4,0,0.2,1) ${i * 0.09}s`,
                }}>
                  {i === 7 && <span className="chart-bar-val" style={{ color: 'var(--primary)', fontWeight: 800 }}>₹{revenue > 0 ? (revenue / 1000).toFixed(1) + 'K' : '45.2K'}</span>}
                </div>
                <span className="chart-label">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Pie */}
        <div className="card" style={{ margin: 0 }}>
          <h2 className="card-title" style={{ marginBottom: 20 }}>📊 Order Status Breakdown</h2>
          {[
            { label: 'Delivered', val: deliveredOrders, color: '#16A34A', pct: orders.length ? ((deliveredOrders / orders.length) * 100).toFixed(0) : 0 },
            { label: 'Pending', val: orders.filter(o => o.status === 'pending').length, color: '#F59E0B', pct: orders.length ? ((orders.filter(o => o.status === 'pending').length / orders.length) * 100).toFixed(0) : 0 },
            { label: 'Dispatched', val: orders.filter(o => o.status === 'dispatched').length, color: '#3B82F6', pct: orders.length ? ((orders.filter(o => o.status === 'dispatched').length / orders.length) * 100).toFixed(0) : 0 },
            { label: 'Cancelled', val: cancelledOrders, color: '#EF4444', pct: orders.length ? ((cancelledOrders / orders.length) * 100).toFixed(0) : 0 },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.val} ({s.pct}%)</span>
              </div>
              <div style={{ height: 8, background: 'var(--border-light)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: animated ? `${s.pct}%` : '0%', background: s.color, borderRadius: 4, transition: `width 1s ease ${i * 0.15}s` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        {/* Category Breakdown */}
        <div className="card" style={{ margin: 0 }}>
          <h2 className="card-title" style={{ marginBottom: 16 }}>🏷️ Orders by Category</h2>
          {Object.entries(catBreakdown).map(([cat, count], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{cat}</span>
              <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{count}</span>
            </div>
          ))}
          {Object.keys(catBreakdown).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</p>}
        </div>

        {/* Payment Methods */}
        <div className="card" style={{ margin: 0 }}>
          <h2 className="card-title" style={{ marginBottom: 16 }}>💳 Payment Methods</h2>
          {[
            { key: 'Cash on Delivery', icon: '💵', color: '#16A34A' },
            { key: 'UPI Payment', icon: '📱', color: '#3B82F6' },
            { key: 'Debit/Credit Card', icon: '💳', color: '#8B5CF6' },
          ].map((p, i) => {
            const count = Object.entries(payBreakdown).find(([k]) => k.includes(p.key.split(' ')[0]))?.[1] || 0;
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: 13 }}>{p.icon} {p.key}</span>
                <span style={{ fontWeight: 800, color: p.color }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* User Stats */}
        <div className="card" style={{ margin: 0 }}>
          <h2 className="card-title" style={{ marginBottom: 16 }}>👥 User Stats</h2>
          {[
            { l: 'Total Registered', v: users.length, c: '#3B82F6' },
            { l: 'Active Users', v: users.filter(u => u.status === 'active').length, c: '#16A34A' },
            { l: 'Pending Verification', v: users.filter(u => u.status === 'pending').length, c: '#F59E0B' },
            { l: 'Blocked Users', v: users.filter(u => u.status === 'blocked').length, c: '#EF4444' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: 13 }}>{s.l}</span>
              <span style={{ fontWeight: 800, color: s.c }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
