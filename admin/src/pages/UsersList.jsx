import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Shield, ShieldOff, Trash2, Eye, Plus, X, UserCheck } from 'lucide-react';
import { getUsers, blockUser, unblockUser, deleteUser, getOrders, saveUser } from '../dataStore';

const STATUS_STYLE = {
  active:  { c: '#16A34A', bg: '#DCFCE7', label: 'Active'  },
  pending: { c: '#F59E0B', bg: '#FEF3C7', label: 'Pending' },
  blocked: { c: '#EF4444', bg: '#FEE2E2', label: 'Blocked' },
};

function AddUserModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: 'Betul', status: 'active' });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.phone.trim() || form.phone.length < 10) { setError('Valid phone number is required'); return; }
    saveUser({ ...form, avatar: form.name[0].toUpperCase() });
    onSave();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <h2 className="modal-title">👤 Add New User</h2>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-control" placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input className="form-control" placeholder="10-digit mobile number" value={form.phone} onChange={e => set('phone', e.target.value)} maxLength={10} />
          </div>
          <div className="form-group">
            <label className="form-label">Email (optional)</label>
            <input className="form-control" type="email" placeholder="user@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <select className="form-control" value={form.city} onChange={e => set('city', e.target.value)}>
                {['Betul', 'Multai', 'Amla', 'Sarni', 'Chicholi'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          {error && <div style={{ color: '#EF4444', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>⚠️ {error}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>➕ Add User</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersList() {
  const [users, setUsers] = useState(getUsers());
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected]     = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const reload = useCallback(() => {
    const fresh = getUsers();
    setUsers(fresh);
    if (selected) setSelected(fresh.find(u => u.id === selected.id) || null);
  }, [selected]);

  useEffect(() => { const i = setInterval(reload, 5000); return () => clearInterval(i); }, [reload]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const ms = !q || u.name?.toLowerCase().includes(q) || u.phone?.includes(q) || u.email?.toLowerCase().includes(q);
    const mst = statusFilter === 'all' || u.status === statusFilter;
    return ms && mst;
  });

  const handleBlock   = (id) => { blockUser(id);   reload(); };
  const handleUnblock = (id) => { unblockUser(id); reload(); };
  const handleDelete  = (id) => { if (window.confirm('Delete user permanently?')) { deleteUser(id); setSelected(null); reload(); } };
  const handleActivate = (id) => {
    const users = getUsers().map(u => u.id === id ? { ...u, status: 'active' } : u);
    localStorage.setItem('ab_users', JSON.stringify(users));
    reload();
  };

  return (
    <div>
      {/* Header + Add User */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontWeight: 900, fontSize: 20, margin: 0 }}>App Users</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>{users.length} registered users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20 }}>
        <div>
          {/* Filters */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
                <Search size={14} />
                <input className="form-control" placeholder="Search by name, phone, email..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="blocked">Blocked</option>
              </select>
              <button className="btn btn-outline btn-sm" onClick={reload}><RefreshCw size={14} /></button>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Total Users', val: users.length, color: '#3B82F6', i: '👥' },
              { label: 'Active', val: users.filter(u => u.status === 'active').length, color: '#16A34A', i: '✅' },
              { label: 'Pending', val: users.filter(u => u.status === 'pending').length, color: '#F59E0B', i: '⏳' },
              { label: 'Blocked', val: users.filter(u => u.status === 'blocked').length, color: '#EF4444', i: '🚫' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ margin: 0, textAlign: 'center', padding: '14px', cursor: 'pointer' }} onClick={() => setStatusFilter(i === 0 ? 'all' : Object.keys(STATUS_STYLE)[i - 1])}>
                <div style={{ fontSize: 22 }}>{s.i}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color, marginTop: 4 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card" style={{ margin: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Orders</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => {
                    const sc = STATUS_STYLE[u.status] || STATUS_STYLE.pending;
                    return (
                      <tr key={u.id} style={{ cursor: 'pointer', background: selected?.id === u.id ? 'var(--bg-color)' : 'transparent' }}>
                        <td onClick={() => setSelected(u)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6B35,#E85D2E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15 }}>
                              {u.avatar || u.name?.[0] || 'U'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.city}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 13 }}>{u.phone}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email || '—'}</div>
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{u.orders || 0}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        <td><span className="badge" style={{ background: sc.bg, color: sc.c, border: 'none' }}>{sc.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-outline btn-sm" onClick={() => setSelected(u)} title="View Details"><Eye size={14} /></button>
                            {u.status === 'pending' && (
                              <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#16A34A', border: 'none' }} onClick={() => handleActivate(u.id)} title="Activate User"><UserCheck size={14} /></button>
                            )}
                            {u.status === 'blocked'
                              ? <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#16A34A', border: 'none' }} onClick={() => handleUnblock(u.id)} title="Unblock"><Shield size={14} /></button>
                              : u.status === 'active' && <button className="btn btn-sm" style={{ background: '#FEF3C7', color: '#D97706', border: 'none' }} onClick={() => handleBlock(u.id)} title="Block"><ShieldOff size={14} /></button>
                            }
                            <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#EF4444', border: 'none' }} onClick={() => handleDelete(u.id)} title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>👤</div>
                  <div>No users found</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Detail Panel */}
        {selected && (
          <div className="card" style={{ margin: 0, position: 'sticky', top: 80, height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, margin: 0 }}>User Details</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}><X size={14} /></button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6B35,#E85D2E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 28, margin: '0 auto 12px' }}>
                {selected.avatar || selected.name?.[0] || 'U'}
              </div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>{selected.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{selected.phone}</div>
              {selected.email && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{selected.email}</div>}
            </div>

            {[
              { label: 'Status', val: <span className="badge" style={{ background: STATUS_STYLE[selected.status]?.bg, color: STATUS_STYLE[selected.status]?.c, border: 'none' }}>{STATUS_STYLE[selected.status]?.label || selected.status}</span> },
              { label: 'City',   val: selected.city },
              { label: 'Orders', val: selected.orders || 0 },
              { label: 'Joined', val: new Date(selected.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                <span style={{ fontWeight: 700 }}>{r.val}</span>
              </div>
            ))}

            {/* Recent Orders */}
            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>Recent Orders</h4>
              {getOrders({ userId: selected.id }).slice(0, 3).map(o => (
                <div key={o.id} style={{ background: 'var(--bg-color)', borderRadius: 10, padding: '10px 12px', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>#{o.id.slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 13 }}>₹{o.total}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.status}</div>
                  </div>
                </div>
              ))}
              {getOrders({ userId: selected.id }).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No orders yet</p>}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {selected.status === 'pending' && (
                <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#16A34A', border: 'none', flex: 1 }}
                  onClick={() => { handleActivate(selected.id); setSelected(s => ({ ...s, status: 'active' })); }}>
                  <UserCheck size={14} /> Activate
                </button>
              )}
              {selected.status === 'blocked'
                ? <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#16A34A', border: 'none', flex: 1 }}
                    onClick={() => { handleUnblock(selected.id); setSelected(s => ({ ...s, status: 'active' })); }}>
                    <Shield size={14} /> Unblock
                  </button>
                : selected.status === 'active' && (
                    <button className="btn btn-sm" style={{ background: '#FEF3C7', color: '#D97706', border: 'none', flex: 1 }}
                      onClick={() => { handleBlock(selected.id); setSelected(s => ({ ...s, status: 'blocked' })); }}>
                      <ShieldOff size={14} /> Block
                    </button>
                  )
              }
              <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#EF4444', border: 'none' }} onClick={() => handleDelete(selected.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onSave={() => { setShowAddModal(false); reload(); }} />}
    </div>
  );
}
