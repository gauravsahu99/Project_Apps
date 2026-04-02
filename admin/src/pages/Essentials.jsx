import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, Truck, Check, X, Plus, Trash2,
  Package, TrendingUp, Clock, ChevronDown, ChevronUp,
  Tag, AlertCircle, ToggleLeft, ToggleRight, Edit2
} from 'lucide-react';
import {
  getOrders, updateOrderStatus, deleteOrder, timeAgo,
  getPromoCodes, savePromoCode, deletePromoCode, getSettings, saveSettings
} from '../dataStore';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:    { color: '#F59E0B', bg: '#FEF3C7', label: 'Pending',    icon: '⏳' },
  dispatched: { color: '#3B82F6', bg: '#DBEAFE', label: 'Dispatched', icon: '🚴' },
  delivered:  { color: '#16A34A', bg: '#DCFCE7', label: 'Delivered',  icon: '✅' },
  cancelled:  { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled',  icon: '❌' },
};

const DELIVERY_SLOTS = [
  { id: 's1', label: 'सुबह 7–9 बजे',   emoji: '🌅', capacity: 20 },
  { id: 's2', label: 'सुबह 10–12 बजे', emoji: '☀️',  capacity: 25 },
  { id: 's3', label: 'दोपहर 2–4 बजे',  emoji: '🌤️', capacity: 15 },
  { id: 's4', label: 'शाम 5–7 बजे',    emoji: '🌇', capacity: 20 },
];

const PRODUCT_CATALOG = [
  { id: 'p1', name: 'अंडे (Egg)', emoji: '🥚', price: 8, unit: 'per piece', category: 'morning', stock: 200, active: true },
  { id: 'p2', name: 'डबल रोटी', emoji: '🍞', price: 35, unit: 'per loaf', category: 'morning', stock: 80, active: true },
  { id: 'p3', name: 'समोसे', emoji: '🥟', price: 15, unit: 'per piece', category: 'morning', stock: 150, active: true },
  { id: 'p4', name: 'जलेबी', emoji: '🍬', price: 80, unit: 'per 250g', category: 'morning', stock: 60, active: true },
  { id: 'p5', name: 'दूध', emoji: '🥛', price: 55, unit: 'per litre', category: 'dairy', stock: 120, active: true },
  { id: 'p6', name: 'दही', emoji: '🏺', price: 40, unit: 'per 500g', category: 'dairy', stock: 90, active: true },
  { id: 'p7', name: 'पनीर', emoji: '🧀', price: 90, unit: 'per 200g', category: 'dairy', stock: 50, active: true },
  { id: 'p8', name: 'आलू', emoji: '🥔', price: 30, unit: 'per kg', category: 'vegetables', stock: 200, active: true },
  { id: 'p9', name: 'टमाटर', emoji: '🍅', price: 35, unit: 'per kg', category: 'vegetables', stock: 150, active: true },
  { id: 'p10', name: 'प्याज', emoji: '🧅', price: 25, unit: 'per kg', category: 'vegetables', stock: 180, active: true },
  { id: 'p11', name: 'केला', emoji: '🍌', price: 60, unit: 'per dozen', category: 'fruits', stock: 80, active: true },
  { id: 'p12', name: 'सेब', emoji: '🍎', price: 120, unit: 'per kg', category: 'fruits', stock: 60, active: false },
];

const CATEGORY_COLORS = {
  morning: { bg: '#FEF3C7', color: '#D97706', label: '🌅 Morning' },
  dairy:   { bg: '#DBEAFE', color: '#1D4ED8', label: '🥛 Dairy'   },
  vegetables: { bg: '#DCFCE7', color: '#15803D', label: '🥬 Vegetables' },
  fruits:  { bg: '#FDE8D8', color: '#C2410C', label: '🍎 Fruits'  },
  snacks:  { bg: '#F3E8FF', color: '#7C3AED', label: '🍿 Snacks'  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

// ═════════════════════════════════════════════════════════════════════════════
export default function Essentials() {
  // ── State ──
  const [tab, setTab] = useState('orders'); // orders | products | slots | promos | settings
  const [orders, setOrders] = useState([]);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy]     = useState('newest');
  const [expandedId, setExpandedId] = useState(null);
  const [products, setProducts] = useState(PRODUCT_CATALOG);
  const [editingProduct, setEditingProduct] = useState(null); // null=closed, {}=new, {..}=editing
  const [promoCodes, setPromoCodes] = useState(getPromoCodes());
  const [settings, setSettings] = useState(getSettings());
  const [showNewPromo, setShowNewPromo] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: '', discount: 10, type: 'percent', label: '' });
  const [promoError, setPromoError] = useState('');

  const reload = useCallback(() => {
    setOrders(getOrders({ category: 'essentials' }));
    setPromoCodes(getPromoCodes());
    setSettings(getSettings());
  }, []);

  useEffect(() => { reload(); const i = setInterval(reload, 5000); return () => clearInterval(i); }, [reload]);

  // ── Derived values ──
  const essOrders     = orders;
  const pending       = essOrders.filter(o => o.status === 'pending');
  const dispatched    = essOrders.filter(o => o.status === 'dispatched');
  const delivered     = essOrders.filter(o => o.status === 'delivered');
  const cancelled     = essOrders.filter(o => o.status === 'cancelled');
  const revenue       = delivered.reduce((s, o) => s + (o.total || 0), 0);
  const avgOrderValue = delivered.length ? Math.round(revenue / delivered.length) : 0;

  // Slot load
  const slotLoad = DELIVERY_SLOTS.map(slot => ({
    ...slot,
    count: essOrders.filter(o => o.slot === slot.label && o.status !== 'cancelled').length,
  }));

  // Filtered & sorted orders
  let displayOrders = essOrders.filter(o => {
    const q = search.toLowerCase();
    const ms = !q || o.userName?.toLowerCase().includes(q) || o.phone?.includes(q) || o.address?.toLowerCase().includes(q);
    const mst = statusFilter === 'all' || o.status === statusFilter;
    return ms && mst;
  });
  if (sortBy === 'newest') displayOrders = [...displayOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sortBy === 'oldest') displayOrders = [...displayOrders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sortBy === 'highest') displayOrders = [...displayOrders].sort((a, b) => b.total - a.total);
  if (sortBy === 'lowest') displayOrders = [...displayOrders].sort((a, b) => a.total - b.total);

  const handleStatus = (id, status) => { updateOrderStatus(id, status); reload(); };

  // Promo helpers
  const handleSavePromo = () => {
    if (!newPromo.code.trim()) { setPromoError('Code is required'); return; }
    if (!newPromo.discount) { setPromoError('Discount is required'); return; }
    savePromoCode({ ...newPromo, code: newPromo.code.toUpperCase(), active: true, usageCount: 0, label: newPromo.label || `${newPromo.discount}${newPromo.type === 'percent' ? '%' : '₹'} OFF` });
    setShowNewPromo(false);
    setNewPromo({ code: '', discount: 10, type: 'percent', label: '' });
    setPromoError('');
    reload();
  };

  const handleTogglePromo = (code, currentActive) => {
    savePromoCode({ code, active: !currentActive });
    reload();
  };

  // Settings save
  const handleSaveSetting = (key, val) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    saveSettings(updated);
  };

  // ── Active products count ──
  const activeProducts = products.filter(p => p.active).length;

  // ─────────────────────────── RENDER ─────────────────────────────────────────
  return (
    <div>
      {/* ══ HERO KPI STRIP ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { l: 'Total Orders', v: essOrders.length, c: '#3B82F6', bg: '#EFF6FF', i: '📦' },
          { l: 'Pending',      v: pending.length,   c: '#F59E0B', bg: '#FFFBEB', i: '⏳' },
          { l: 'Dispatched',   v: dispatched.length,c: '#6366F1', bg: '#EEF2FF', i: '🚴' },
          { l: 'Delivered',    v: delivered.length, c: '#16A34A', bg: '#F0FDF4', i: '✅' },
          { l: 'Revenue',      v: fmt(revenue),     c: '#10B981', bg: '#ECFDF5', i: '💰' },
          { l: 'Avg Order',    v: fmt(avgOrderValue),c:'#8B5CF6', bg: '#F5F3FF', i: '📊' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 14, padding: '14px 12px', textAlign: 'center', border: `1px solid ${s.c}22` }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.i}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ══ MINI CHART: Status breakdown bar ══ */}
      {essOrders.length > 0 && (
        <div className="card" style={{ marginBottom: 16, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 13 }}>📈 Order Status Breakdown</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{essOrders.length} total</span>
          </div>
          <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', gap: 1 }}>
            {Object.entries(STATUS_CFG).map(([key, cfg]) => {
              const pct = (essOrders.filter(o => o.status === key).length / essOrders.length) * 100;
              return pct > 0 ? (
                <div key={key} title={`${cfg.label}: ${pct.toFixed(0)}%`} style={{ width: `${pct}%`, background: cfg.color, minWidth: pct > 0 ? 4 : 0 }} />
              ) : null;
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {Object.entries(STATUS_CFG).map(([key, cfg]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: cfg.color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cfg.label} ({essOrders.filter(o => o.status === key).length})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ TAB NAV ══ */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '2px solid var(--border-light)', paddingBottom: 0 }}>
        {[
          { id: 'orders',   label: '📦 Orders',     badge: pending.length },
          { id: 'products', label: '🛒 Products',    badge: null           },
          { id: 'slots',    label: '🕐 Delivery Slots', badge: null        },
          { id: 'promos',   label: '🎟️ Promo Codes', badge: promoCodes.filter(p => p.active).length },
          { id: 'settings', label: '⚙️ Settings',   badge: null           },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 16px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
              background: tab === t.id ? 'var(--primary)' : 'transparent',
              color: tab === t.id ? '#FFF' : 'var(--text-muted)',
              borderRadius: '10px 10px 0 0',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -2,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {t.label}
            {t.badge > 0 && (
              <span style={{ background: '#EF4444', color: '#FFF', borderRadius: 10, fontSize: 10, padding: '1px 6px', fontWeight: 800 }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB: ORDERS
      ══════════════════════════════════════════════ */}
      {tab === 'orders' && (
        <div>
          {/* Filter bar */}
          <div className="card" style={{ marginBottom: 16, padding: 14 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
                <Search size={14} />
                <input
                  className="form-control"
                  placeholder="Customer name, phone, address..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className="form-control" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select className="form-control" style={{ width: 150 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
              <button className="btn btn-outline btn-sm" onClick={reload} title="Refresh">
                <RefreshCw size={14} />
              </button>
            </div>
            {/* Quick status filter pills */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {['all', ...Object.keys(STATUS_CFG)].map(s => {
                const cfg = STATUS_CFG[s];
                const count = s === 'all' ? essOrders.length : essOrders.filter(o => o.status === s).length;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    style={{
                      padding: '4px 12px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer',
                      fontWeight: 700, fontSize: 12,
                      background: statusFilter === s ? (cfg?.bg || 'var(--primary-light)') : 'transparent',
                      color: statusFilter === s ? (cfg?.color || 'var(--primary)') : 'var(--text-muted)',
                      borderColor: statusFilter === s ? (cfg?.color || 'var(--primary)') : 'var(--border-light)',
                    }}
                  >
                    {cfg?.icon || '📦'} {cfg?.label || 'All'} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 14 }}>
            {displayOrders.map(order => {
              const sc = STATUS_CFG[order.status] || STATUS_CFG.pending;
              const isExpanded = expandedId === order.id;

              return (
                <div key={order.id} className="card" style={{ margin: 0, borderTop: `4px solid ${sc.color}`, transition: 'all 0.2s' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>
                        #{order.id.slice(-6).toUpperCase()}
                        {order.promoDiscount > 0 && (
                          <span style={{ marginLeft: 8, fontSize: 10, background: '#FDE68A', color: '#92400E', borderRadius: 6, padding: '2px 6px', fontWeight: 700 }}>
                            🎟️ PROMO
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{timeAgo(order.createdAt)}</div>
                    </div>
                    <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>

                  {/* Customer */}
                  <div style={{ background: 'var(--bg-color)', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>👤 {order.userName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>📞 {order.phone}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>📍 {order.address}</div>
                  </div>

                  {/* Slot + Payment */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, background: '#EFF6FF', color: '#1D4ED8', borderRadius: 8, padding: '4px 10px', fontWeight: 600 }}>
                      🕐 {order.slot}
                    </span>
                    <span style={{ fontSize: 12, background: '#F0FDF4', color: '#15803D', borderRadius: 8, padding: '4px 10px', fontWeight: 600 }}>
                      💳 {order.payment?.toUpperCase()}
                    </span>
                  </div>

                  {/* Items — collapsible */}
                  <div style={{ borderRadius: 10, border: '1px solid var(--border-light)', marginBottom: 12, overflow: 'hidden' }}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      style={{ width: '100%', background: 'var(--bg-color)', border: 'none', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}
                    >
                      <span>🛒 {order.items?.length || 0} items</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isExpanded && (
                      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-light)' }}>
                        {order.items?.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingTop: 5, paddingBottom: 5, borderBottom: i < order.items.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                            <span>{item.emoji} {item.name} <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span></span>
                            <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        {order.promoDiscount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#16A34A', fontWeight: 700, paddingTop: 6 }}>
                            <span>🎟️ Promo Discount</span>
                            <span>-₹{order.promoDiscount}</span>
                          </div>
                        )}
                        {order.deliveryFee > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', paddingTop: 4 }}>
                            <span>🚴 Delivery Fee</span>
                            <span>₹{order.deliveryFee}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 16, marginBottom: 14, padding: '10px 14px', background: `${sc.color}12`, borderRadius: 10 }}>
                    <span>Grand Total</span>
                    <span style={{ color: sc.color }}>₹{order.total}</span>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {order.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#DBEAFE', color: '#1D4ED8', border: 'none', flex: 1, fontWeight: 700 }}
                          onClick={() => handleStatus(order.id, 'dispatched')}
                        >
                          <Truck size={14} /> Dispatch
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', fontWeight: 700 }}
                          onClick={() => { if (window.confirm('Cancel this order?')) handleStatus(order.id, 'cancelled'); }}
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                    {order.status === 'dispatched' && (
                      <button
                        className="btn btn-sm"
                        style={{ background: '#DCFCE7', color: '#15803D', border: 'none', flex: 1, fontWeight: 700 }}
                        onClick={() => handleStatus(order.id, 'delivered')}
                      >
                        <Check size={14} /> Mark Delivered
                      </button>
                    )}
                    {(order.status === 'delivered' || order.status === 'cancelled') && (
                      <div style={{ flex: 1, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {order.status === 'delivered' ? '✅ Completed' : '❌ Cancelled'}
                      </div>
                    )}
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}
                      onClick={() => { if (window.confirm('Delete this order?')) { deleteOrder(order.id); reload(); } }}
                      title="Delete Order"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {displayOrders.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>📦</div>
              <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>No orders found</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Try changing the filter or search term</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: PRODUCTS
      ══════════════════════════════════════════════ */}
      {tab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <span style={{ fontWeight: 800, fontSize: 15 }}>🛒 Product Catalog</span>
              <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>{activeProducts} active / {products.length} total</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setEditingProduct({ id: 'p' + Date.now(), name: '', emoji: '🥗', price: 0, unit: 'per piece', category: 'morning', stock: 50, active: true })}>
              <Plus size={14} /> Add Product
            </button>
          </div>

          {/* Category groups */}
          {Object.entries(CATEGORY_COLORS).map(([cat, cfg]) => {
            const catProducts = products.filter(p => p.category === cat);
            if (!catProducts.length) return null;
            return (
              <div key={cat} className="card" style={{ marginBottom: 14, padding: 0, overflow: 'hidden' }}>
                <div style={{ background: cfg.bg, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: cfg.color, fontSize: 14 }}>{cfg.label}</span>
                  <span style={{ fontSize: 12, color: cfg.color, fontWeight: 700 }}>{catProducts.filter(p => p.active).length}/{catProducts.length} active</span>
                </div>
                <div>
                  {catProducts.map((product, idx) => (
                    <div
                      key={product.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                        borderBottom: idx < catProducts.length - 1 ? '1px solid var(--border-light)' : 'none',
                        opacity: product.active ? 1 : 0.55,
                      }}
                    >
                      <span style={{ fontSize: 26 }}>{product.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{product.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>₹{product.price} {product.unit}</div>
                      </div>
                      <div style={{ textAlign: 'center', minWidth: 70 }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: product.stock < 30 ? '#EF4444' : '#16A34A' }}>{product.stock}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>in stock</div>
                        {product.stock < 30 && <div style={{ fontSize: 9, color: '#EF4444', fontWeight: 700 }}>⚠️ Low</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-sm"
                          style={{ background: product.active ? '#DCFCE7' : '#FEE2E2', color: product.active ? '#15803D' : '#DC2626', border: 'none', fontWeight: 700 }}
                          onClick={() => setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: !p.active } : p))}
                        >
                          {product.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {product.active ? 'Active' : 'Off'}
                        </button>
                        <button className="btn btn-sm" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }} onClick={() => setEditingProduct({ ...product })}>
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: DELIVERY SLOTS
      ══════════════════════════════════════════════ */}
      {tab === 'slots' && (
        <div>
          <div style={{ marginBottom: 16, fontWeight: 800, fontSize: 15 }}>🕐 Delivery Slot Management</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14, marginBottom: 20 }}>
            {slotLoad.map(slot => {
              const pct = Math.min(100, Math.round((slot.count / slot.capacity) * 100));
              const color = pct >= 90 ? '#EF4444' : pct >= 60 ? '#F59E0B' : '#16A34A';
              return (
                <div key={slot.id} className="card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 22 }}>{slot.emoji}</div>
                      <div style={{ fontWeight: 800, fontSize: 14, marginTop: 4 }}>{slot.label}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, fontSize: 24, color }}>{slot.count}/{slot.capacity}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>orders</div>
                    </div>
                  </div>
                  <div style={{ background: '#F3F4F6', borderRadius: 6, height: 10, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.3s', borderRadius: 6 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color, fontWeight: 700 }}>{pct}% full</span>
                    <span style={{ color: 'var(--text-muted)' }}>{slot.capacity - slot.count} slots free</span>
                  </div>
                  {pct >= 90 && (
                    <div style={{ marginTop: 10, background: '#FEE2E2', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#DC2626', fontWeight: 700 }}>
                      <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Almost full! Consider expanding capacity.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Orders per slot breakdown */}
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>📋 Orders by Slot (Today)</div>
            {DELIVERY_SLOTS.map(slot => {
              const slotOrders = essOrders.filter(o => o.slot === slot.label);
              return (
                <div key={slot.id} style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{slot.emoji} {slot.label}</div>
                  {slotOrders.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No orders in this slot</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {slotOrders.map(o => {
                        const sc = STATUS_CFG[o.status];
                        return (
                          <span key={o.id} style={{ fontSize: 11, background: sc.bg, color: sc.color, borderRadius: 8, padding: '4px 10px', fontWeight: 700 }}>
                            {sc.icon} {o.userName} (₹{o.total})
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: PROMO CODES
      ══════════════════════════════════════════════ */}
      {tab === 'promos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>🎟️ Promo Code Manager</span>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowNewPromo(true); setPromoError(''); }}>
              <Plus size={14} /> New Code
            </button>
          </div>

          {/* New promo form */}
          {showNewPromo && (
            <div className="card" style={{ marginBottom: 16, border: '2px solid var(--primary)', padding: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>✨ Create New Promo Code</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Code</label>
                  <input className="form-control" placeholder="e.g. SAVE30" value={newPromo.code} onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Type</label>
                  <select className="form-control" value={newPromo.type} onChange={e => setNewPromo(p => ({ ...p, type: e.target.value }))}>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Discount Value</label>
                  <input className="form-control" type="number" min="1" value={newPromo.discount} onChange={e => setNewPromo(p => ({ ...p, discount: Number(e.target.value) }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Label (optional)</label>
                  <input className="form-control" placeholder="e.g. Save 30%" value={newPromo.label} onChange={e => setNewPromo(p => ({ ...p, label: e.target.value }))} />
                </div>
              </div>
              {promoError && <div style={{ color: '#EF4444', fontSize: 12, fontWeight: 600, marginTop: 10 }}>⚠️ {promoError}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button className="btn btn-primary btn-sm" onClick={handleSavePromo}>💾 Save Code</button>
                <button className="btn btn-outline btn-sm" onClick={() => { setShowNewPromo(false); setPromoError(''); }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Promo list */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {promoCodes.map(promo => (
              <div key={promo.code} className="card" style={{ margin: 0, borderTop: `3px solid ${promo.active ? '#10B981' : '#9CA3AF'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 1, color: promo.active ? '#10B981' : '#9CA3AF', fontFamily: 'monospace' }}>{promo.code}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Used {promo.usageCount || 0} times</div>
                  </div>
                  <span style={{ background: promo.active ? '#D1FAE5' : '#F3F4F6', color: promo.active ? '#065F46' : '#6B7280', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {promo.active ? '✅ Active' : '⏸ Inactive'}
                  </span>
                </div>
                <div style={{ background: 'var(--bg-color)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, textAlign: 'center' }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)' }}>
                    {promo.type === 'percent' ? `${promo.discount}% OFF` : `₹${promo.discount} OFF`}
                  </span>
                  {promo.label && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{promo.label}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-sm"
                    style={{ flex: 1, background: promo.active ? '#FEE2E2' : '#DCFCE7', color: promo.active ? '#DC2626' : '#15803D', border: 'none', fontWeight: 700 }}
                    onClick={() => handleTogglePromo(promo.code, promo.active)}
                  >
                    {promo.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {promo.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ background: '#FEE2E2', color: '#DC2626', border: 'none' }}
                    onClick={() => { if (window.confirm(`Delete promo code "${promo.code}"?`)) { deletePromoCode(promo.code); reload(); } }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: SETTINGS
      ══════════════════════════════════════════════ */}
      {tab === 'settings' && (
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>⚙️ Delivery & Essentials Settings</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 14 }}>

            {/* Delivery settings */}
            <div className="card" style={{ margin: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>🚴 Delivery Configuration</div>
              <div className="form-group">
                <label className="form-label">Default Delivery Fee (₹)</label>
                <input
                  className="form-control"
                  type="number"
                  value={settings.deliveryFeeDefault}
                  onChange={e => handleSaveSetting('deliveryFeeDefault', Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Free Delivery Above (₹)</label>
                <input
                  className="form-control"
                  type="number"
                  value={settings.freeDeliveryThreshold}
                  onChange={e => handleSaveSetting('freeDeliveryThreshold', Number(e.target.value))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ margin: 0 }}>Morning Delivery Active</label>
                  <button
                    style={{ background: settings.morningDeliveryEnabled ? '#10B981' : '#9CA3AF', border: 'none', borderRadius: 20, width: 44, height: 24, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
                    onClick={() => handleSaveSetting('morningDeliveryEnabled', !settings.morningDeliveryEnabled)}
                  >
                    <div style={{ width: 18, height: 18, background: '#FFF', borderRadius: 9, position: 'absolute', top: 3, left: settings.morningDeliveryEnabled ? 23 : 3, transition: 'left 0.2s' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Flash sale + Maintenance */}
            <div className="card" style={{ margin: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>🔥 Promotions & System</div>
              {[
                { label: '⚡ Flash Sale Active', key: 'flashSaleActive', desc: 'Show flash sale banner in app' },
                { label: '🔔 Order Notifications', key: 'orderNotifications', desc: 'Push notifications for new orders' },
                { label: '🛑 Maintenance Mode', key: 'maintenanceMode', desc: 'Disable ordering temporarily', danger: true },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: item.danger && settings[item.key] ? '#DC2626' : 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                  <button
                    style={{ background: settings[item.key] ? (item.danger ? '#EF4444' : '#10B981') : '#9CA3AF', border: 'none', borderRadius: 20, width: 44, height: 24, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
                    onClick={() => handleSaveSetting(item.key, !settings[item.key])}
                  >
                    <div style={{ width: 18, height: 18, background: '#FFF', borderRadius: 9, position: 'absolute', top: 3, left: settings[item.key] ? 23 : 3, transition: 'left 0.2s' }} />
                  </button>
                </div>
              ))}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Support Phone</label>
                <input className="form-control" value={settings.supportPhone || ''} onChange={e => handleSaveSetting('supportPhone', e.target.value)} placeholder="9876543000" />
              </div>
            </div>

            {/* Stats card */}
            <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)', border: 'none' }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16, color: '#FFF' }}>📊 Quick Stats</div>
              {[
                { l: 'Total Revenue', v: fmt(revenue), c: '#10B981' },
                { l: 'Avg Order Value', v: fmt(avgOrderValue), c: '#6366F1' },
                { l: 'Delivered Orders', v: delivered.length, c: '#3B82F6' },
                { l: 'Pending Now', v: pending.length, c: '#F59E0B' },
                { l: 'Active Products', v: activeProducts, c: '#EC4899' },
                { l: 'Active Promos', v: promoCodes.filter(p => p.active).length, c: '#14B8A6' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{s.l}</span>
                  <span style={{ fontWeight: 900, fontSize: 15, color: s.c }}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ PRODUCT EDITOR MODAL ══ */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2 className="modal-title">{editingProduct.name ? `✏️ Edit: ${editingProduct.name}` : '➕ Add New Product'}</h2>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-control" placeholder="e.g. दूध (Milk)" value={editingProduct.name} onChange={e => setEditingProduct(p => ({ ...p, name: e.target.value }))} autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Emoji</label>
                <input className="form-control" value={editingProduct.emoji} onChange={e => setEditingProduct(p => ({ ...p, emoji: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={editingProduct.category} onChange={e => setEditingProduct(p => ({ ...p, category: e.target.value }))}>
                  {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{CATEGORY_COLORS[c].label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input className="form-control" type="number" min="0" value={editingProduct.price} onChange={e => setEditingProduct(p => ({ ...p, price: Number(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input className="form-control" placeholder="per piece / per kg / per kg" value={editingProduct.unit} onChange={e => setEditingProduct(p => ({ ...p, unit: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input className="form-control" type="number" min="0" value={editingProduct.stock} onChange={e => setEditingProduct(p => ({ ...p, stock: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[true, false].map(v => (
                  <button key={String(v)} type="button"
                    onClick={() => setEditingProduct(p => ({ ...p, active: v }))}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${editingProduct.active === v ? (v ? '#16A34A' : '#EF4444') : 'var(--border)'}`, background: editingProduct.active === v ? (v ? '#DCFCE7' : '#FEE2E2') : '#fff', color: editingProduct.active === v ? (v ? '#16A34A' : '#EF4444') : 'var(--text-muted)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    {v ? '✅ Active' : '⏸ Inactive'}
                  </button>
                ))}
              </div>
            </div>
            {!editingProduct.name?.trim() && <div style={{ color: '#EF4444', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>⚠️ Product name is required</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditingProduct(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }}
                disabled={!editingProduct.name?.trim()}
                onClick={() => {
                  if (!editingProduct.name.trim()) return;
                  setProducts(prev => {
                    const idx = prev.findIndex(p => p.id === editingProduct.id);
                    if (idx >= 0) return prev.map((p, i) => i === idx ? editingProduct : p);
                    return [...prev, editingProduct];
                  });
                  setEditingProduct(null);
                }}
              >
                {products.find(p => p.id === editingProduct.id) ? '💾 Save Changes' : '➕ Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
