import React, { useState } from 'react';

const DISPUTES = [
  { id: 'DSP-001', customer: 'Ramesh Gupta', shop: 'Sharma Kirana', orderId: 'ORD-2801', type: 'Wrong Item', amount: 189, status: 'open', priority: 'high', date: '2 hrs ago', desc: 'Customer received expired milk (2 days past expiry). Requesting full refund.' },
  { id: 'DSP-002', customer: 'Priya Sharma', shop: 'Fresh Bakery', orderId: 'ORD-2790', type: 'Not Delivered', amount: 95, status: 'open', priority: 'high', date: '5 hrs ago', desc: 'Order marked delivered but customer says they never received it. Delivery partner unavailable.' },
  { id: 'DSP-003', customer: 'Sanjay Patel', shop: 'City Mart', orderId: 'ORD-2785', type: 'Quality Issue', amount: 340, status: 'investigating', priority: 'medium', date: '1 day ago', desc: 'Rice quality was much lower than advertised. Requesting partial refund (50%).' },
  { id: 'DSP-004', customer: 'Meera Joshi', shop: 'Royal Grocery', orderId: 'ORD-2780', type: 'Overcharged', amount: 50, status: 'resolved', priority: 'low', date: '2 days ago', desc: 'Customer charged extra ₹50. Refund of ₹50 processed.' },
  { id: 'DSP-005', customer: 'Arun Singh', shop: 'Sharma Kirana', orderId: 'ORD-2775', type: 'Missing Items', amount: 120, status: 'investigating', priority: 'medium', date: '2 days ago', desc: 'Paneer 200g was missing from the order. Customer wants replacement or refund.' },
];

const STATUS_CONFIG = {
  open: { color: '#EF4444', bg: '#FEF2F2', label: '🔴 Open' },
  investigating: { color: '#F59E0B', bg: '#FFFBEB', label: '🔍 Investigating' },
  resolved: { color: '#22C55E', bg: '#F0FDF4', label: '✅ Resolved' },
};

const PRIORITY_CONFIG = {
  high: { color: '#EF4444', label: '🔥 High' },
  medium: { color: '#F59E0B', label: '⚠️ Medium' },
  low: { color: '#22C55E', label: '✅ Low' },
};

export default function DisputeResolution() {
  const [disputes, setDisputes] = useState(DISPUTES);
  const [selectedId, setSelectedId] = useState('DSP-001');
  const [filterStatus, setFilterStatus] = useState('all');

  const selectedDispute = disputes.find(d => d.id === selectedId);

  const updateStatus = (id, newStatus) => {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const filtered = filterStatus === 'all' ? disputes : disputes.filter(d => d.status === filterStatus);

  const counts = {
    open: disputes.filter(d => d.status === 'open').length,
    investigating: disputes.filter(d => d.status === 'investigating').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerBar}>
        <div>
          <h1 style={styles.pageTitle}>⚖️ Dispute Resolution</h1>
          <p style={styles.pageSub}>Customer complaints & refund management</p>
        </div>
        <div style={styles.headerStats}>
          {[
            { label: 'Open', value: counts.open, color: '#EF4444', icon: '🔴' },
            { label: 'Investigating', value: counts.investigating, color: '#F59E0B', icon: '🔍' },
            { label: 'Resolved', value: counts.resolved, color: '#22C55E', icon: '✅' },
          ].map((s, i) => (
            <div key={i} style={{ ...styles.hStat, background: s.color + '15', border: `1px solid ${s.color}40` }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div>
                <div style={{ color: s.color, fontWeight: 900, fontSize: 22 }}>{s.value}</div>
                <div style={{ color: '#94A3B8', fontSize: 11 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        {['all', 'open', 'investigating', 'resolved'].map(f => (
          <button
            key={f}
            style={{ ...styles.filterTab, ...(filterStatus === f ? styles.filterTabActive : {}) }}
            onClick={() => setFilterStatus(f)}>
            {f === 'all' ? '📋 All' : STATUS_CONFIG[f]?.label || f}
            {f !== 'all' && counts[f] > 0 && <span style={styles.filterBadge}>{counts[f]}</span>}
          </button>
        ))}
      </div>

      <div style={styles.splitLayout}>
        {/* List */}
        <div style={styles.listPanel}>
          {filtered.map(d => {
            const sc = STATUS_CONFIG[d.status];
            const pc = PRIORITY_CONFIG[d.priority];
            return (
              <div
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                style={{ ...styles.disputeItem, ...(selectedId === d.id ? styles.disputeItemActive : {}) }}>
                <div style={styles.disputeItemTop}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: pc.color }}>{pc.label}</span>
                  <span style={{ ...styles.statusPill, background: sc.bg, color: sc.color }}>{sc.label}</span>
                </div>
                <div style={styles.disputeIds}>{d.id} · {d.orderId}</div>
                <div style={styles.disputeType}>{d.type}</div>
                <div style={styles.disputeCustomer}>👤 {d.customer} → 🏪 {d.shop}</div>
                <div style={styles.disputeMeta}>₹{d.amount} · {d.date}</div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedDispute && (
          <div style={styles.detailPanel}>
            <div style={styles.detailHeader}>
              <div>
                <div style={styles.detailId}>{selectedDispute.id}</div>
                <div style={styles.detailOrderId}>Order: {selectedDispute.orderId}</div>
              </div>
              <span style={{
                ...styles.statusPill,
                background: STATUS_CONFIG[selectedDispute.status].bg,
                color: STATUS_CONFIG[selectedDispute.status].color,
                fontSize: 14, padding: '6px 14px',
              }}>{STATUS_CONFIG[selectedDispute.status].label}</span>
            </div>

            {/* Info Boxes */}
            <div style={styles.infoGrid}>
              {[
                { label: 'Customer', value: selectedDispute.customer, icon: '👤' },
                { label: 'Shop', value: selectedDispute.shop, icon: '🏪' },
                { label: 'Issue Type', value: selectedDispute.type, icon: '⚠️' },
                { label: 'Amount', value: `₹${selectedDispute.amount}`, icon: '💰' },
              ].map((info, i) => (
                <div key={i} style={styles.infoBox}>
                  <div style={styles.infoIcon}>{info.icon}</div>
                  <div style={styles.infoLabel}>{info.label}</div>
                  <div style={styles.infoValue}>{info.value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={styles.descSection}>
              <div style={styles.descLabel}>📋 Issue Description</div>
              <p style={styles.desc}>{selectedDispute.desc}</p>
            </div>

            {/* Actions */}
            <div style={styles.actionsSection}>
              <div style={styles.descLabel}>⚡ Take Action</div>
              <div style={styles.actionBtns}>
                {selectedDispute.status === 'open' && (
                  <button style={styles.actionBtnYellow} onClick={() => updateStatus(selectedDispute.id, 'investigating')}>
                    🔍 Start Investigation
                  </button>
                )}
                {selectedDispute.status === 'investigating' && (
                  <>
                    <button style={styles.actionBtnGreen} onClick={() => updateStatus(selectedDispute.id, 'resolved')}>
                      ✅ Approve Refund (₹{selectedDispute.amount})
                    </button>
                    <button style={styles.actionBtnRed} onClick={() => updateStatus(selectedDispute.id, 'resolved')}>
                      ❌ Reject Claim
                    </button>
                    <button style={styles.actionBtnBlue} onClick={() => updateStatus(selectedDispute.id, 'resolved')}>
                      🔄 Partial Refund
                    </button>
                  </>
                )}
                {selectedDispute.status === 'resolved' && (
                  <div style={styles.resolvedMsg}>✅ This dispute has been resolved.</div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div style={styles.descSection}>
              <div style={styles.descLabel}>📅 Timeline</div>
              {[
                { time: selectedDispute.date, event: 'Dispute raised by customer', icon: '🔴' },
                ...(selectedDispute.status !== 'open' ? [{ time: '1 hr ago', event: 'Admin started investigation', icon: '🔍' }] : []),
                ...(selectedDispute.status === 'resolved' ? [{ time: '30 min ago', event: 'Resolution applied', icon: '✅' }] : []),
              ].map((ev, i) => (
                <div key={i} style={styles.timelineRow}>
                  <span style={{ fontSize: 16 }}>{ev.icon}</span>
                  <div style={{ flex: 1, marginLeft: 10 }}>
                    <div style={styles.timelineEvent}>{ev.event}</div>
                    <div style={styles.timelineTime}>{ev.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 24, fontFamily: "'Inter', sans-serif", background: '#F8FAFC', minHeight: '100vh', color: '#0F172A' },
  headerBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  pageTitle: { fontSize: 24, fontWeight: 900, margin: 0 },
  pageSub: { fontSize: 14, color: '#94A3B8', margin: '4px 0 0' },
  headerStats: { display: 'flex', gap: 12 },
  hStat: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 16 },
  filterTabs: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filterTab: { padding: '10px 18px', borderRadius: 12, border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 8 },
  filterTabActive: { background: '#0F172A', color: '#fff', borderColor: '#0F172A' },
  filterBadge: { background: '#EF4444', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 },
  splitLayout: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' },
  listPanel: { display: 'flex', flexDirection: 'column', gap: 8 },
  disputeItem: { background: '#fff', borderRadius: 16, padding: 14, cursor: 'pointer', border: '2px solid transparent', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', transition: 'all 0.15s' },
  disputeItemActive: { border: '2px solid #FF6B35', background: '#FFF7ED' },
  disputeItemTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  statusPill: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8 },
  disputeIds: { fontSize: 11, color: '#94A3B8', marginBottom: 4, fontFamily: 'monospace' },
  disputeType: { fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 4 },
  disputeCustomer: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  disputeMeta: { fontSize: 12, color: '#94A3B8' },
  detailPanel: { background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' },
  detailId: { fontSize: 20, fontWeight: 900, color: '#0F172A', fontFamily: 'monospace' },
  detailOrderId: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 },
  infoBox: { background: '#F8FAFC', borderRadius: 14, padding: 14, textAlign: 'center' },
  infoIcon: { fontSize: 22, marginBottom: 6 },
  infoLabel: { fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: 800, color: '#0F172A' },
  descSection: { marginBottom: 20 },
  descLabel: { fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 10 },
  desc: { fontSize: 14, color: '#64748B', lineHeight: '1.6', background: '#F8FAFC', borderRadius: 12, padding: 14, margin: 0 },
  actionsSection: { marginBottom: 20 },
  actionBtns: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  actionBtnGreen: { padding: '11px 20px', background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontSize: 13 },
  actionBtnRed: { padding: '11px 20px', background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontSize: 13 },
  actionBtnBlue: { padding: '11px 20px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontSize: 13 },
  actionBtnYellow: { padding: '11px 20px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontSize: 13 },
  resolvedMsg: { background: '#F0FDF4', color: '#22C55E', fontWeight: 700, padding: '12px 18px', borderRadius: 12, fontSize: 14 },
  timelineRow: { display: 'flex', alignItems: 'flex-start', marginBottom: 12 },
  timelineEvent: { fontSize: 13, fontWeight: 700, color: '#0F172A' },
  timelineTime: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
};
