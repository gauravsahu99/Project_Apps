import React, { useState, useEffect, useCallback } from 'react';
import { Search, Check, X, Star, Trash2, RefreshCw } from 'lucide-react';
import { getListings, approveListing, rejectListing, featureListing, deleteListing } from '../dataStore';

const CATEGORIES = ['all', 'bikes', 'cars', 'electronics', 'furniture', 'realestate', 'clothing', 'jobs', 'other'];
const STATUS_OPTS = ['all', 'pending', 'approved', 'rejected'];

const STATUS_STYLE = {
  approved: { c: '#16A34A', bg: '#DCFCE7' },
  pending: { c: '#F59E0B', bg: '#FEF3C7' },
  rejected: { c: '#EF4444', bg: '#FEE2E2' },
};

export default function Marketplace() {
  const [listings, setListings] = useState(getListings());
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const reload = useCallback(() => setListings(getListings()), []);
  useEffect(() => { const i = setInterval(reload, 5000); return () => clearInterval(i); }, [reload]);

  const filtered = listings.filter(l => {
    const ms = l.title?.toLowerCase().includes(search.toLowerCase()) || l.postedBy?.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === 'all' || l.category === catFilter;
    const ms2 = statusFilter === 'all' || l.status === statusFilter;
    return ms && mc && ms2;
  });

  const handle = (fn, id) => { fn(id); reload(); };

  const pendingCount = listings.filter(l => l.status === 'pending').length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Marketplace Approvals
            {pendingCount > 0 && <span className="badge badge-warning" style={{ marginLeft: 10 }}>{pendingCount} pending</span>}
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 13 }}>{listings.length} total listings</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={reload}><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
            <Search size={14} />
            <input className="form-control" placeholder="Search listings..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 140 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
          <select className="form-control" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { l: 'Total', v: listings.length, c: '#3B82F6' },
          { l: 'Approved', v: listings.filter(l => l.status === 'approved').length, c: '#16A34A' },
          { l: 'Pending', v: pendingCount, c: '#F59E0B' },
          { l: 'Rejected', v: listings.filter(l => l.status === 'rejected').length, c: '#EF4444' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ margin: 0, textAlign: 'center', padding: '14px' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
        {filtered.map(l => {
          const sc = STATUS_STYLE[l.status] || STATUS_STYLE.pending;
          return (
            <div key={l.id} className="card" style={{ margin: 0, borderLeft: `4px solid ${sc.c}40` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ fontSize: 36 }}>{l.emoji}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{l.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {l.location}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge" style={{ background: sc.bg, color: sc.c, border: 'none' }}>{l.status}</span>
                  {l.featured && <div style={{ fontSize: 11, color: '#F59E0B', marginTop: 4 }}>⭐ Featured</div>}
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 8, lineHeight: 1.5 }} className="line-clamp-2">{l.description}</p>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                <span>👤 {l.postedBy}</span>
                <span>📞 {l.phone}</span>
                <span>👁️ {l.views || 0}</span>
                {l.isVerified && <span style={{ color: '#16A34A' }}>✅ Verified</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)' }}>₹{l.price?.toLocaleString()}</span>
                <span className="badge badge-primary" style={{ fontSize: 11 }}>{l.category}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {l.status === 'pending' && <>
                  <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#16A34A', border: 'none', flex: 1 }} onClick={() => handle(approveListing, l.id)}><Check size={14} /> Approve</button>
                  <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', flex: 1 }} onClick={() => handle(rejectListing, l.id)}><X size={14} /> Reject</button>
                </>}
                {l.status === 'approved' && <>
                  <button className="btn btn-sm" style={{ background: l.featured ? '#FEF3C7' : '#F1F5F9', color: l.featured ? '#D97706' : '#64748B', border: 'none', flex: 1 }} onClick={() => handle(featureListing, l.id)}><Star size={14} /> {l.featured ? 'Unfeature' : 'Feature'}</button>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => handle(rejectListing, l.id)}>Deactivate</button>
                </>}
                {l.status === 'rejected' && <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#16A34A', border: 'none', flex: 1 }} onClick={() => handle(approveListing, l.id)}><Check size={14} /> Re-approve</button>}
                <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#EF4444', border: 'none' }} onClick={() => { if (confirm('Delete?')) handle(deleteListing, l.id); }}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>📭 No listings found</div>}
    </div>
  );
}
