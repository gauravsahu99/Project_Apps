import React, { useState } from 'react';

const COMMISSION_RATES = {
  Grocery: { shop: 8, delivery: 30, platform: 62 },
  Bakery: { shop: 10, delivery: 28, platform: 62 },
  Dairy: { shop: 7, delivery: 32, platform: 61 },
  Fashion: { shop: 15, delivery: 25, platform: 60 },
  Electronics: { shop: 5, delivery: 25, platform: 70 },
  Essentials: { shop: 6, delivery: 32, platform: 62 },
  Pharmacy: { shop: 5, delivery: 30, platform: 65 },
};

const PAYOUTS = [
  { id: 'P-001', name: 'Sharma Kirana', type: 'Shopkeeper', amount: 2840, status: 'pending', period: 'Mar 1-15', orders: 34 },
  { id: 'P-002', name: 'Rohit Kumar', type: 'Delivery', amount: 1240, status: 'pending', period: 'Mar 1-15', orders: 31 },
  { id: 'P-003', name: 'Fresh Bakery', type: 'Shopkeeper', amount: 1620, status: 'paid', period: 'Mar 1-15', orders: 18 },
  { id: 'P-004', name: 'Ajay Singh', type: 'Delivery', amount: 960, status: 'paid', period: 'Mar 1-15', orders: 24 },
  { id: 'P-005', name: 'Royal Grocery', type: 'Shopkeeper', amount: 3200, status: 'processing', period: 'Mar 1-15', orders: 42 },
];

export default function CommissionManagement() {
  const [rates, setRates] = useState(COMMISSION_RATES);
  const [payouts, setPayouts] = useState(PAYOUTS);
  const [activeTab, setActiveTab] = useState('rates');
  const [editCategory, setEditCategory] = useState(null);

  const updateRate = (cat, key, val) => {
    const numVal = Math.max(0, Math.min(100, parseFloat(val) || 0));
    setRates(prev => {
      const updated = { ...prev, [cat]: { ...prev[cat], [key]: numVal } };
      // Auto-adjust platform to keep total = 100
      const shopDelivery = updated[cat].shop + updated[cat].delivery;
      updated[cat].platform = Math.max(0, 100 - shopDelivery);
      return updated;
    });
  };

  const markPaid = (id) => {
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p));
  };

  const pendingTotal = payouts.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);
  const processingTotal = payouts.filter(p => p.status === 'processing').reduce((acc, p) => acc + p.amount, 0);

  return (
    <div style={styles.page}>
      <div style={styles.headerBar}>
        <div>
          <h1 style={styles.pageTitle}>💸 Commission Management</h1>
          <p style={styles.pageSub}>Set rates per category • Manage payouts</p>
        </div>
        <div style={styles.headerStats}>
          <div style={{ ...styles.hStat, background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444' }}>
            <span style={{ fontSize: 22 }}>⏳</span>
            <div>
              <div style={{ color: '#EF4444', fontWeight: 900, fontSize: 18 }}>₹{pendingTotal.toLocaleString()}</div>
              <div style={{ color: '#94A3B8', fontSize: 11 }}>Pending Payouts</div>
            </div>
          </div>
          <div style={{ ...styles.hStat, background: 'rgba(245,158,11,0.1)', border: '1px solid #F59E0B' }}>
            <span style={{ fontSize: 22 }}>⚙️</span>
            <div>
              <div style={{ color: '#F59E0B', fontWeight: 900, fontSize: 18 }}>₹{processingTotal.toLocaleString()}</div>
              <div style={{ color: '#94A3B8', fontSize: 11 }}>Processing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['rates', 'payouts'].map(t => (
          <button key={t} style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }} onClick={() => setActiveTab(t)}>
            {t === 'rates' ? '📊 Commission Rates' : '💰 Payouts'}
          </button>
        ))}
      </div>

      {/* Commission Rates Tab */}
      {activeTab === 'rates' && (
        <div style={styles.section}>
          <p style={styles.sectionDesc}>Set how revenue is split between shopkeepers, delivery partners, and the platform per category.</p>
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Shop %</th>
                  <th style={styles.th}>Delivery %</th>
                  <th style={styles.th}>Platform %</th>
                  <th style={styles.th}>Split Visualization</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(rates).map(([cat, r]) => (
                  <tr key={cat} style={styles.tableRow}>
                    <td style={styles.td}>
                      <span style={styles.catLabel}>{cat}</span>
                    </td>
                    <td style={styles.td}>
                      <input
                        type="number" min="0" max="100" value={r.shop}
                        onChange={e => updateRate(cat, 'shop', e.target.value)}
                        style={styles.rateInput}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="number" min="0" max="100" value={r.delivery}
                        onChange={e => updateRate(cat, 'delivery', e.target.value)}
                        style={styles.rateInput}
                      />
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.platformPct, color: r.platform < 50 ? '#EF4444' : '#22C55E' }}>{r.platform}%</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.splitBar}>
                        <div style={{ width: `${r.shop}%`, background: '#3B82F6', height: '100%', borderRadius: '4px 0 0 4px' }} title={`Shop: ${r.shop}%`} />
                        <div style={{ width: `${r.delivery}%`, background: '#22C55E', height: '100%' }} title={`Delivery: ${r.delivery}%`} />
                        <div style={{ width: `${r.platform}%`, background: '#FF6B35', height: '100%', borderRadius: '0 4px 4px 0' }} title={`Platform: ${r.platform}%`} />
                      </div>
                      <div style={styles.splitLegend}>
                        <span style={{ color: '#3B82F6' }}>■ Shop {r.shop}%</span>
                        <span style={{ color: '#22C55E' }}>■ Del {r.delivery}%</span>
                        <span style={{ color: '#FF6B35' }}>■ Plt {r.platform}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button style={styles.saveBtn}>✅ Save Commission Rates</button>
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === 'payouts' && (
        <div style={styles.section}>
          <div style={styles.payoutsGrid}>
            {payouts.map(p => (
              <div key={p.id} style={styles.payoutCard}>
                <div style={styles.payoutTop}>
                  <div style={styles.payoutAvatar}>
                    {p.type === 'Shopkeeper' ? '🏪' : '🚴'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.payoutName}>{p.name}</div>
                    <div style={styles.payoutMeta}>{p.type} · {p.orders} orders</div>
                    <div style={styles.payoutPeriod}>📅 {p.period}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={styles.payoutAmount}>₹{p.amount.toLocaleString()}</div>
                    <span style={{
                      ...styles.statusBadge,
                      background: p.status === 'paid' ? '#F0FDF4' : p.status === 'processing' ? '#FFFBEB' : '#FEF2F2',
                      color: p.status === 'paid' ? '#22C55E' : p.status === 'processing' ? '#F59E0B' : '#EF4444',
                    }}>
                      {p.status === 'paid' ? '✅ Paid' : p.status === 'processing' ? '⚙️ Processing' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
                {p.status === 'pending' && (
                  <button style={styles.payNowBtn} onClick={() => markPaid(p.id)}>
                    💸 Mark as Paid
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 24, fontFamily: "'Inter', sans-serif", background: '#F8FAFC', minHeight: '100vh', color: '#0F172A' },
  headerBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  pageTitle: { fontSize: 24, fontWeight: 900, margin: 0, color: '#0F172A' },
  pageSub: { fontSize: 14, color: '#94A3B8', margin: '4px 0 0' },
  headerStats: { display: 'flex', gap: 12 },
  hStat: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 16 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20, background: '#fff', padding: 6, borderRadius: 16, width: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  tab: { padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: 'transparent', color: '#64748B' },
  tabActive: { background: '#0F172A', color: '#fff' },
  section: {},
  sectionDesc: { color: '#64748B', fontSize: 13, marginBottom: 16 },
  tableCard: { background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { background: '#F8FAFC' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F1F5F9' },
  tableRow: { borderBottom: '1px solid #F9FAFB', transition: 'background 0.15s' },
  td: { padding: '14px 16px', fontSize: 14 },
  catLabel: { fontSize: 13, fontWeight: 700, color: '#0F172A', background: '#F1F5F9', padding: '4px 12px', borderRadius: 8 },
  rateInput: { width: 70, padding: '8px 10px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#0F172A', textAlign: 'center', outline: 'none' },
  platformPct: { fontWeight: 900, fontSize: 16 },
  splitBar: { height: 14, borderRadius: 7, display: 'flex', overflow: 'hidden', marginBottom: 5, background: '#F1F5F9' },
  splitLegend: { display: 'flex', gap: 10, fontSize: 10, fontWeight: 700 },
  saveBtn: { marginTop: 20, background: 'linear-gradient(135deg, #FF6B35, #E85D2E)', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 28px', fontSize: 14, fontWeight: 800, cursor: 'pointer' },
  payoutsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 },
  payoutCard: { background: '#fff', borderRadius: 20, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  payoutTop: { display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  payoutAvatar: { width: 46, height: 46, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  payoutName: { fontSize: 15, fontWeight: 800, color: '#0F172A' },
  payoutMeta: { fontSize: 12, color: '#64748B', margin: '3px 0' },
  payoutPeriod: { fontSize: 12, color: '#94A3B8' },
  payoutAmount: { fontSize: 22, fontWeight: 900, color: '#0F172A' },
  statusBadge: { fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 10, display: 'inline-block', marginTop: 4 },
  payNowBtn: { width: '100%', padding: '10px', background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer' },
};
