import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Truck, Check, X, Printer, Trash2 } from 'lucide-react';
import { getOrders, updateOrderStatus, deleteOrder, timeAgo } from '../dataStore';

const STATUS_CONFIG = {
  pending: { c: '#F59E0B', bg: '#FEF3C7', label: 'Pending', icon: '⏳' },
  dispatched: { c: '#3B82F6', bg: '#DBEAFE', label: 'Dispatched', icon: '🚴' },
  delivered: { c: '#16A34A', bg: '#DCFCE7', label: 'Delivered', icon: '✅' },
  cancelled: { c: '#EF4444', bg: '#FEE2E2', label: 'Cancelled', icon: '❌' },
};

export default function Orders() {
  const [orders, setOrders] = useState(getOrders());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const reload = useCallback(() => {
    const fresh = getOrders();
    setOrders(fresh);
    if (selected) setSelected(fresh.find(o => o.id === selected.id) || null);
  }, [selected]);

  useEffect(() => { const i = setInterval(reload, 5000); return () => clearInterval(i); }, [reload]);

  const filtered = orders.filter(o => {
    const ms = o.userName?.toLowerCase().includes(search.toLowerCase()) || o.id?.includes(search) || o.phone?.includes(search);
    const mst = statusFilter === 'all' || o.status === statusFilter;
    const mc = catFilter === 'all' || o.category === catFilter;
    return ms && mst && mc;
  });

  const handleStatus = (id, status) => { updateOrderStatus(id, status); reload(); };
  const handleDelete = (id) => { if (confirm('Delete order?')) { deleteOrder(id); reload(); setSelected(null); } };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const dispatchedCount = orders.filter(o => o.status === 'dispatched').length;
  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
      <div>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { l: 'Total Orders', v: orders.length, c: '#3B82F6', i: '📦' },
            { l: 'Pending', v: pendingCount, c: '#F59E0B', i: '⏳' },
            { l: 'Dispatched', v: dispatchedCount, c: '#3B82F6', i: '🚴' },
            { l: 'Revenue', v: `₹${revenue.toLocaleString()}`, c: '#16A34A', i: '💰' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ margin: 0, textAlign: 'center', padding: '14px' }}>
              <div style={{ fontSize: 24 }}>{s.i}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.c, marginTop: 4 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
              <Search size={14} />
              <input className="form-control" placeholder="Search by customer, phone, order ID..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>
            <select className="form-control" style={{ width: 140 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="essentials">Essentials</option>
              <option value="fashion">Fashion</option>
            </select>
            <button className="btn btn-outline btn-sm" onClick={reload}><RefreshCw size={14} /></button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card" style={{ margin: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Slot</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const sc = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={o.id} style={{ cursor: 'pointer', background: selected?.id === o.id ? 'var(--bg-color)' : 'transparent' }}>
                      <td onClick={() => setSelected(o)}>
                        <div style={{ fontWeight: 800, fontSize: 13 }}>#{o.id.slice(-6).toUpperCase()}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(o.createdAt)}</div>
                      </td>
                      <td onClick={() => setSelected(o)}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{o.userName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.phone}</div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {o.items?.map(i => `${i.emoji} ${i.name}`).join(', ')}
                      </td>
                      <td style={{ fontWeight: 900, color: 'var(--primary)' }}>₹{o.total}</td>
                      <td style={{ fontSize: 12 }}>{o.slot}</td>
                      <td><span className="badge" style={{ background: sc.bg, color: sc.c, border: 'none' }}>{sc.icon} {sc.label}</span></td>
                      <td>
                         <div style={{ display: 'flex', gap: 6 }}>
                          {o.status === 'pending' && (
                            <button className="btn btn-sm" style={{ background: '#DBEAFE', color: '#3B82F6', border: 'none', fontSize: 11 }} onClick={() => handleStatus(o.id, 'dispatched')}>
                              <Truck size={12} /> Dispatch
                            </button>
                          )}
                          {o.status === 'dispatched' && (
                            <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#16A34A', border: 'none', fontSize: 11 }} onClick={() => handleStatus(o.id, 'delivered')}>
                              <Check size={12} /> Delivered
                            </button>
                          )}
                          {o.status === 'pending' && (
                            <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', fontSize: 11 }} onClick={() => handleStatus(o.id, 'cancelled')}>
                              <X size={12} />
                            </button>
                          )}
                          <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', fontSize: 11 }} onClick={() => handleDelete(o.id)} title="Delete order">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No orders found</div>}
          </div>
        </div>
      </div>

      {/* Order Detail */}
      {selected && (
        <div className="card" style={{ margin: 0, position: 'sticky', top: 80, height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-main)', margin: 0 }}>Order #{selected.id.slice(-6).toUpperCase()}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(() => { const sc = STATUS_CONFIG[selected.status]; return <span className="badge" style={{ background: sc?.bg, color: sc?.c, border: 'none', padding: '6px 12px' }}>{sc?.icon} {sc?.label}</span>; })()}
            <span className="badge badge-primary">{selected.category}</span>
          </div>
          {[
            { l: 'Customer', v: selected.userName },
            { l: 'Phone', v: selected.phone },
            { l: 'Address', v: selected.address },
            { l: 'Slot', v: selected.slot },
            { l: 'Payment', v: selected.payment },
            { l: 'Placed', v: timeAgo(selected.createdAt) },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>{r.l}</span>
              <span style={{ fontWeight: 700, maxWidth: 200, textAlign: 'right' }}>{r.v}</span>
            </div>
          ))}
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <h4 style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>Items</h4>
            {selected.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-color)', borderRadius: 8, padding: '8px 12px', marginBottom: 6 }}>
                <span>{item.emoji} {item.name} ×{item.quantity}</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid var(--border)', marginTop: 8, fontWeight: 900 }}>
              <span>Total</span><span style={{ color: 'var(--primary)', fontSize: 18 }}>₹{selected.total}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {selected.status === 'pending' && <button className="btn btn-sm" style={{ background: '#DBEAFE', color: '#3B82F6', border: 'none', flex: 1 }} onClick={() => handleStatus(selected.id, 'dispatched')}><Truck size={14} /> Dispatch</button>}
            {selected.status === 'dispatched' && <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#16A34A', border: 'none', flex: 1 }} onClick={() => handleStatus(selected.id, 'delivered')}><Check size={14} /> Mark Delivered</button>}
            {selected.status === 'pending' && <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', flex: 1 }} onClick={() => handleStatus(selected.id, 'cancelled')}><X size={14} /> Cancel</button>}
          </div>
        </div>
      )}
    </div>
  );
}
