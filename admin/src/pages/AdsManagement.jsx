import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Check, X, Edit2, Trash2, Eye, Phone, RefreshCw } from 'lucide-react';
import { getAds, approveAd, rejectAd, deleteAd, saveAd, incrementAdView, incrementAdCall } from '../dataStore';

const CATEGORIES = ['all', 'grocery', 'clothing', 'electronics', 'medical', 'jewellery', 'food', 'other'];
const STATUS_OPTS = ['all', 'pending', 'approved', 'rejected'];
const PLANS = ['standard', 'premium', 'homepage'];

function AdFormModal({ ad, onClose, onSave }) {
  const [form, setForm] = useState(ad || {
    shopName: '', category: 'grocery', tagline: '', offer: '', phone: '', whatsapp: '',
    address: '', plan: 'standard', emoji: '🏪', color: '#FF6B35', badge: '⭐ Premium',
    rating: 4.5, openTime: 'Mon–Sat: 9 AM – 9 PM', isOpen: true,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.shopName.trim()) return alert('Shop name is required');
    if (!form.phone.trim()) return alert('Phone number is required');
    saveAd({ ...form, whatsapp: form.whatsapp || form.phone });
    onSave();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{ad ? '✏️ Edit Ad' : '➕ New Ad'}</h2>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Shop Name *</label><input className="form-control" value={form.shopName} onChange={e => set('shopName', e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Tagline</label><input className="form-control" value={form.tagline} onChange={e => set('tagline', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Offer / Deal</label><input className="form-control" placeholder="e.g. 20% OFF on First Order" value={form.offer} onChange={e => set('offer', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Phone *</label><input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">WhatsApp (optional)</label><input className="form-control" placeholder="Same as phone if blank" value={form.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={form.address} onChange={e => set('address', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Category</label><select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.filter(c => c !== 'all').map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Plan</label><select className="form-control" value={form.plan} onChange={e => set('plan', e.target.value)}>{PLANS.map(p => <option key={p}>{p}</option>)}</select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Emoji</label><input className="form-control" value={form.emoji} onChange={e => set('emoji', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Badge Text</label><input className="form-control" placeholder="e.g. ⭐ Premium" value={form.badge || ''} onChange={e => set('badge', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Rating (0–5)</label><input className="form-control" type="number" min="0" max="5" step="0.1" value={form.rating || 4.5} onChange={e => set('rating', parseFloat(e.target.value))} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Opening Hours</label><input className="form-control" placeholder="e.g. Mon–Sat: 9AM–9PM" value={form.openTime || ''} onChange={e => set('openTime', e.target.value)} /></div>
            <div className="form-group">
              <label className="form-label">Accent Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.color || '#FF6B35'} onChange={e => set('color', e.target.value)} style={{ width: 44, height: 38, border: '1.5px solid var(--border)', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                <input className="form-control" value={form.color || '#FF6B35'} onChange={e => set('color', e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Currently Open?</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[true, false].map(v => (
                <button key={String(v)} type="button"
                  onClick={() => set('isOpen', v)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${form.isOpen === v ? (v ? '#16A34A' : '#EF4444') : 'var(--border)'}`, background: form.isOpen === v ? (v ? '#DCFCE7' : '#FEE2E2') : '#fff', color: form.isOpen === v ? (v ? '#16A34A' : '#EF4444') : 'var(--text-muted)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {v ? '✅ Open' : '❌ Closed'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{ad ? 'Save Changes' : 'Submit Ad'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdsManagement() {
  const [ads, setAds] = useState(getAds());
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editAd, setEditAd] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const reload = useCallback(() => setAds(getAds()), []);
  useEffect(() => { const i = setInterval(reload, 5000); return () => clearInterval(i); }, [reload]);

  const filtered = ads.filter(a => {
    const matchSearch = a.shopName?.toLowerCase().includes(search.toLowerCase()) || a.tagline?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || a.category === catFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const handleApprove = (id) => { approveAd(id); reload(); };
  const handleReject = (id) => { rejectAd(id); reload(); };
  const handleDelete = (id) => { if (confirm('Delete this ad?')) { deleteAd(id); reload(); } };

  const STATUS_STYLE = {
    approved: { c: '#16A34A', bg: '#DCFCE7' },
    pending: { c: '#F59E0B', bg: '#FEF3C7' },
    rejected: { c: '#EF4444', bg: '#FEE2E2' },
  };

  const PLAN_STYLE = { standard: '#64748B', premium: '#F59E0B', homepage: '#8B5CF6' };
  const pendingCount = ads.filter(a => a.status === 'pending').length;
  const filteredPending = filtered.filter(a => a.status === 'pending');

  return (
    <div>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Ads Management
            {pendingCount > 0 && <span className="badge badge-warning" style={{ marginLeft: 10 }}>{pendingCount} pending</span>}
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 13 }}>{ads.length} total ads</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditAd(null); setShowForm(true); }}>
          <Plus size={16} /> New Ad
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
            <Search size={14} />
            <input className="form-control" placeholder="Search ads..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 140 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
          <select className="form-control" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
          </select>
          <button className="btn btn-outline btn-sm" onClick={reload}><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Pending Section */}
      {filteredPending.length > 0 && statusFilter === 'all' && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#F59E0B', marginBottom: 12 }}>⏳ PENDING APPROVAL ({filteredPending.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
            {filteredPending.map(ad => <AdCard key={ad.id} ad={ad} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} onEdit={a => { setEditAd(a); setShowForm(true); }} reload={reload} STATUS_STYLE={STATUS_STYLE} PLAN_STYLE={PLAN_STYLE} />)}
          </div>
        </div>
      )}


      {/* All Ads */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
        {filtered.filter(a => a.status !== 'pending' || statusFilter !== 'all').map(ad => (
          <AdCard key={ad.id} ad={ad} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} onEdit={a => { setEditAd(a); setShowForm(true); }} reload={reload} STATUS_STYLE={STATUS_STYLE} PLAN_STYLE={PLAN_STYLE} />
        ))}
      </div>
      {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>😶 No ads found</div>}

      {showForm && <AdFormModal ad={editAd} onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); reload(); }} />}
    </div>
  );
}


function AdCard({ ad, onApprove, onReject, onDelete, onEdit, STATUS_STYLE, PLAN_STYLE }) {
  const sc = STATUS_STYLE[ad.status] || STATUS_STYLE.pending;
  return (
    <div className="card" style={{ margin: 0, borderLeft: `4px solid ${sc.c}30` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ fontSize: 32 }}>{ad.emoji || '🏪'}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-main)' }}>{ad.shopName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{ad.category} · {ad.address}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
          <span className="badge" style={{ background: sc.bg, color: sc.c, border: 'none', fontSize: 11 }}>{ad.status}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: PLAN_STYLE[ad.plan] || '#64748B' }}>★ {ad.plan}</span>
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600, marginBottom: 6 }}>{ad.tagline}</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>🎁 {ad.offer}</p>

      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
        <span>👁️ {ad.views || 0} views</span>
        <span>📞 {ad.calls || 0} calls</span>
        <span>📱 {ad.phone}</span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {ad.status === 'pending' && <>
          <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#16A34A', border: 'none', flex: 1 }} onClick={() => onApprove(ad.id)}><Check size={14} /> Approve</button>
          <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', flex: 1 }} onClick={() => onReject(ad.id)}><X size={14} /> Reject</button>
        </>}
        {ad.status === 'approved' && <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => onReject(ad.id)}>Deactivate</button>}
        {ad.status === 'rejected' && <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#16A34A', border: 'none', flex: 1 }} onClick={() => onApprove(ad.id)}>Re-approve</button>}
        <button className="btn btn-outline btn-sm" onClick={() => onEdit(ad)}><Edit2 size={14} /></button>
        <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#EF4444', border: 'none' }} onClick={() => onDelete(ad.id)}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}
