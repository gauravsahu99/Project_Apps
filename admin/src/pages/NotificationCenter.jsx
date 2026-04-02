import React, { useState } from 'react';

const USER_SEGMENTS = [
  { id: 'all', label: '👥 All Users', count: 12480 },
  { id: 'customers', label: '🛒 Customers', count: 9840 },
  { id: 'shopkeepers', label: '🏪 Shopkeepers', count: 1240 },
  { id: 'delivery', label: '🚴 Delivery Partners', count: 1400 },
  { id: 'inactive', label: '😴 Inactive 30 days', count: 2100 },
  { id: 'new', label: '✨ New This Week', count: 340 },
];

const TEMPLATES = [
  { id: 1, title: '🎁 Special Offer', body: 'आज का special offer! 20% off on all orders. Use code: SPECIAL20', category: 'promo' },
  { id: 2, title: '🚀 New Feature!', body: 'New feature live! Track your order in real-time. Update your app now.', category: 'feature' },
  { id: 3, title: '⚡ Flash Sale Alert', body: 'Flash sale starts in 1 hour! Essentials up to 40% OFF. Hurry!', category: 'sale' },
  { id: 4, title: '🎉 Weekend Special', body: 'Weekend is here! Free delivery on all orders above ₹200.', category: 'promo' },
];

const SENT_HISTORY = [
  { id: 1, title: 'Holi Special Offer', segment: 'All Users', sent: '2,840', opened: '1,240', ctr: 43, date: '2 days ago' },
  { id: 2, title: 'New Shopkeeper Added', segment: 'Customers', sent: '9,840', opened: '4,200', ctr: 42, date: '4 days ago' },
  { id: 3, title: 'Partner Onboarding', segment: 'Delivery', sent: '1,400', opened: '1,180', ctr: 84, date: '1 week ago' },
];

export default function NotificationCenter() {
  const [segment, setSegment] = useState('all');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState('compose');
  const [sent, setSent] = useState(false);

  const selectedSeg = USER_SEGMENTS.find(s => s.id === segment);

  const handleSend = () => {
    if (!title || !body) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setTitle('');
    setBody('');
  };

  const loadTemplate = (t) => { setTitle(t.title); setBody(t.body); };

  return (
    <div style={styles.page}>
      <div style={styles.headerBar}>
        <div>
          <h1 style={styles.pageTitle}>🔔 Notification Center</h1>
          <p style={styles.pageSub}>Push notifications to user segments</p>
        </div>
        <div style={styles.headerStats}>
          {[
            { label: 'Sent Today', value: '3', icon: '📤', color: '#3B82F6' },
            { label: 'Avg Open Rate', value: '43%', icon: '👁️', color: '#22C55E' },
            { label: 'Total Users', value: '12.5K', icon: '👥', color: '#7C3AED' },
          ].map((s, i) => (
            <div key={i} style={{ ...styles.hStat, background: s.color + '15', border: `1px solid ${s.color}40` }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div>
                <div style={{ color: s.color, fontWeight: 900, fontSize: 18 }}>{s.value}</div>
                <div style={{ color: '#94A3B8', fontSize: 11 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['compose', 'history'].map(t => (
          <button key={t} style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }} onClick={() => setActiveTab(t)}>
            {t === 'compose' ? '✍️ Compose' : '📋 Sent History'}
          </button>
        ))}
      </div>

      {activeTab === 'compose' && (
        <div style={styles.composeGrid}>
          {/* Left: Form */}
          <div style={styles.composeLeft}>
            {sent && (
              <div style={styles.successBanner}>
                <span style={{ fontSize: 24 }}>✅</span>
                <div>
                  <div style={{ fontWeight: 800 }}>Notification Sent!</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>Sent to {selectedSeg?.count?.toLocaleString()} users</div>
                </div>
              </div>
            )}

            {/* Segment Selection */}
            <div style={styles.formGroup}>
              <label style={styles.label}>👥 Target Segment</label>
              <div style={styles.segmentGrid}>
                {USER_SEGMENTS.map(s => (
                  <button key={s.id}
                    style={{ ...styles.segBtn, ...(segment === s.id ? styles.segBtnActive : {}) }}
                    onClick={() => setSegment(s.id)}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{s.label}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{s.count.toLocaleString()} users</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={styles.formGroup}>
              <label style={styles.label}>📌 Title</label>
              <input
                style={styles.input} value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Notification title..."
                maxLength={65}
              />
              <div style={styles.charCount}>{title.length}/65</div>
            </div>

            {/* Body */}
            <div style={styles.formGroup}>
              <label style={styles.label}>💬 Message Body</label>
              <textarea
                style={{ ...styles.input, height: 120, resize: 'none' }}
                value={body} onChange={e => setBody(e.target.value)}
                placeholder="Notification message..."
                maxLength={200}
              />
              <div style={styles.charCount}>{body.length}/200</div>
            </div>

            <button
              style={{ ...styles.sendBtn, opacity: (!title || !body) ? 0.5 : 1 }}
              disabled={!title || !body}
              onClick={handleSend}>
              🚀 Send to {selectedSeg?.count?.toLocaleString()} Users
            </button>
          </div>

          {/* Right: Templates & Preview */}
          <div style={styles.composeRight}>
            {/* Preview */}
            <div style={styles.previewCard}>
              <div style={styles.previewLabel}>📱 Preview</div>
              <div style={styles.phoneMock}>
                <div style={styles.notifMock}>
                  <div style={styles.notifHeader}>
                    <span style={{ fontSize: 16 }}>🛍️</span>
                    <span style={styles.notifApp}>Apna Betul</span>
                    <span style={styles.notifTime}>now</span>
                  </div>
                  <div style={styles.notifTitle}>{title || 'Notification Title'}</div>
                  <div style={styles.notifBody}>{body || 'Your message will appear here...'}</div>
                </div>
              </div>
            </div>

            {/* Templates */}
            <div style={{ marginTop: 16 }}>
              <div style={styles.label}>📝 Quick Templates</div>
              {TEMPLATES.map(t => (
                <div key={t.id} style={styles.templateCard} onClick={() => loadTemplate(t)}>
                  <div style={styles.templateTitle}>{t.title}</div>
                  <div style={styles.templateBody}>{t.body.slice(0, 60)}...</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div style={styles.section}>
          {SENT_HISTORY.map(n => (
            <div key={n.id} style={styles.historyCard}>
              <div style={styles.historyTop}>
                <div>
                  <div style={styles.historyTitle}>{n.title}</div>
                  <div style={styles.historyMeta}>👥 {n.segment} · 📅 {n.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={styles.ctrBadge}>{n.ctr}% CTR</div>
                </div>
              </div>
              <div style={styles.historyStats}>
                {[
                  { label: '📤 Sent', value: n.sent },
                  { label: '👁️ Opened', value: n.opened },
                  { label: '📊 Rate', value: `${n.ctr}%` },
                ].map((s, i) => (
                  <div key={i} style={styles.histStat}>
                    <div style={styles.histStatVal}>{s.value}</div>
                    <div style={styles.histStatLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 24, fontFamily: "'Inter', sans-serif", background: '#F8FAFC', minHeight: '100vh', color: '#0F172A' },
  headerBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  pageTitle: { fontSize: 24, fontWeight: 900, margin: 0 },
  pageSub: { fontSize: 14, color: '#94A3B8', margin: '4px 0 0' },
  headerStats: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  hStat: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 16 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20, background: '#fff', padding: 6, borderRadius: 16, width: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  tab: { padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: 'transparent', color: '#64748B' },
  tabActive: { background: '#0F172A', color: '#fff' },
  composeGrid: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' },
  composeLeft: { background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  composeRight: {},
  successBanner: { display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10, display: 'block' },
  segmentGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  segBtn: { padding: '10px 8px', borderRadius: 12, border: '2px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' },
  segBtnActive: { border: '2px solid #FF6B35', background: '#FFF7ED' },
  input: { width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 14, fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  charCount: { textAlign: 'right', fontSize: 11, color: '#94A3B8', marginTop: 4 },
  sendBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #FF6B35, #E85D2E)', color: '#fff', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 800, cursor: 'pointer' },
  previewCard: { background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  previewLabel: { fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 14 },
  phoneMock: { background: '#0F172A', borderRadius: 20, padding: 16 },
  notifMock: { background: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: 14 },
  notifHeader: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
  notifApp: { fontSize: 12, fontWeight: 700, flex: 1, color: '#0F172A' },
  notifTime: { fontSize: 11, color: '#94A3B8' },
  notifTitle: { fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 4 },
  notifBody: { fontSize: 12, color: '#64748B', lineHeight: 1.5 },
  templateCard: { background: '#F8FAFC', borderRadius: 14, padding: 12, marginTop: 8, cursor: 'pointer', border: '1.5px solid #E2E8F0' },
  templateTitle: { fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4 },
  templateBody: { fontSize: 12, color: '#94A3B8' },
  section: {},
  historyCard: { background: '#fff', borderRadius: 20, padding: 20, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  historyTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  historyTitle: { fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 5 },
  historyMeta: { fontSize: 13, color: '#94A3B8' },
  ctrBadge: { background: '#F0FDF4', color: '#22C55E', fontWeight: 800, fontSize: 14, padding: '5px 12px', borderRadius: 10 },
  historyStats: { display: 'flex', gap: 20 },
  histStat: { textAlign: 'center' },
  histStatVal: { fontSize: 20, fontWeight: 900, color: '#0F172A' },
  histStatLabel: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
};
