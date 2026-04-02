import React, { useState, useCallback } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import { getSettings, saveSettings, getPromoCodes, savePromoCode, deletePromoCode } from '../dataStore';

export default function Settings() {
  const [settings, setSettings] = useState(getSettings());
  const [promoCodes, setPromoCodes] = useState(getPromoCodes());
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [newPromo, setNewPromo] = useState({ code: '', discount: '', type: 'percent', label: '' });

  const setSetting = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const handleSaveSettings = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAddPromo = () => {
    if (!newPromo.code.trim() || !newPromo.discount) return alert('Code and discount are required');
    const promo = { ...newPromo, code: newPromo.code.toUpperCase(), discount: Number(newPromo.discount), active: true, usageCount: 0, label: newPromo.label || `${newPromo.discount}${newPromo.type === 'percent' ? '%' : '₹'} OFF` };
    savePromoCode(promo);
    setPromoCodes(getPromoCodes());
    setNewPromo({ code: '', discount: '', type: 'percent', label: '' });
  };

  const handleTogglePromo = (code) => {
    const p = promoCodes.find(p => p.code === code);
    if (!p) return;
    savePromoCode({ ...p, active: !p.active });
    setPromoCodes(getPromoCodes());
  };

  const handleDeletePromo = (code) => {
    if (!confirm('Delete promo code?')) return;
    deletePromoCode(code);
    setPromoCodes(getPromoCodes());
  };

  const TABS = [
    { id: 'general', label: '⚙️ General' },
    { id: 'delivery', label: '🚴 Delivery' },
    { id: 'promo', label: '🎁 Promo Codes' },
    { id: 'features', label: '🔧 Features' },
  ];

  return (
    <div style={{ maxWidth: 820 }}>
      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            color: activeTab === t.id ? 'var(--primary)' : 'var(--text-muted)',
            padding: '0 0 14px', borderBottom: activeTab === t.id ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            marginBottom: '-2px',
          }}>{t.label}</button>
        ))}
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: 20 }}>⚙️ App Configuration</h2>
          {[
            { key: 'appName', label: 'App Name', type: 'text' },
            { key: 'supportPhone', label: 'Support Phone', type: 'text' },
            { key: 'supportEmail', label: 'Support Email', type: 'email' },
          ].map(f => (
            <div className="form-group" key={f.key}>
              <label className="form-label">{f.label}</label>
              <input className="form-control" type={f.type} value={settings[f.key] || ''} onChange={e => setSetting(f.key, e.target.value)} />
            </div>
          ))}
          <button className="btn btn-primary" onClick={handleSaveSettings}>
            <Save size={16} /> {saved ? '✅ Saved!' : 'Save Settings'}
          </button>
        </div>
      )}

      {/* Delivery */}
      {activeTab === 'delivery' && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: 20 }}>🚴 Delivery Settings</h2>
          <div className="form-group">
            <label className="form-label">Default Delivery Fee (₹)</label>
            <input className="form-control" type="number" value={settings.deliveryFeeDefault} onChange={e => setSetting('deliveryFeeDefault', Number(e.target.value))} style={{ maxWidth: 200 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Free Delivery Threshold (₹)</label>
            <input className="form-control" type="number" value={settings.freeDeliveryThreshold} onChange={e => setSetting('freeDeliveryThreshold', Number(e.target.value))} style={{ maxWidth: 200 }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Orders above this amount get free delivery</p>
          </div>
          <button className="btn btn-primary" onClick={handleSaveSettings}>
            <Save size={16} /> {saved ? '✅ Saved!' : 'Save Settings'}
          </button>
        </div>
      )}

      {/* Promo Codes */}
      {activeTab === 'promo' && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 className="card-title" style={{ marginBottom: 16 }}>➕ Add New Promo Code</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Code</label>
                <input className="form-control" placeholder="e.g. SAVE30" value={newPromo.code} onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Discount</label>
                <input className="form-control" type="number" placeholder="e.g. 30" value={newPromo.discount} onChange={e => setNewPromo(p => ({ ...p, discount: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Type</label>
                <select className="form-control" value={newPromo.type} onChange={e => setNewPromo(p => ({ ...p, type: e.target.value }))}>
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Label (optional)</label>
              <input className="form-control" placeholder="e.g. 30% OFF for new users" value={newPromo.label} onChange={e => setNewPromo(p => ({ ...p, label: e.target.value }))} />
            </div>
            <button className="btn btn-primary" onClick={handleAddPromo}><Plus size={16} /> Add Promo Code</button>
          </div>

          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 16 }}>🎁 Active Promo Codes</h2>
            {promoCodes.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No promo codes yet</p>}
            {promoCodes.map(p => (
              <div key={p.code} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 16, background: 'var(--bg-color)', padding: '3px 10px', borderRadius: 8, color: 'var(--primary)' }}>{p.code}</span>
                    <span className="badge" style={{ background: p.active ? '#DCFCE7' : '#FEE2E2', color: p.active ? '#16A34A' : '#EF4444', border: 'none' }}>{p.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {p.label} · Used {p.usageCount || 0} times
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => handleTogglePromo(p.code)} title={p.active ? 'Deactivate' : 'Activate'}>
                    {p.active ? <ToggleRight size={16} color="#16A34A" /> : <ToggleLeft size={16} color="#94A3B8" />}
                  </button>
                  <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#EF4444', border: 'none' }} onClick={() => handleDeletePromo(p.code)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Flags */}
      {activeTab === 'features' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="card-title" style={{ margin: 0 }}>🔧 Feature Flags</h2>
            {saved && <span style={{ color: '#16A34A', fontWeight: 700, fontSize: 13 }}>✅ Auto-saved!</span>}
          </div>
          {[
            { key: 'flashSaleActive', label: '⚡ Flash Sale', desc: 'Show flash sale banner on home screen' },
            { key: 'morningDeliveryEnabled', label: '🌅 Morning Delivery', desc: 'Enable early morning delivery slots' },
            { key: 'orderNotifications', label: '🔔 Order Notifications', desc: 'Send notifications for order updates' },
            { key: 'maintenanceMode', label: '🔧 Maintenance Mode', desc: 'Disable app for maintenance (shows message to users)', danger: true },
          ].map(f => (
            <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: f.danger && settings[f.key] ? 'var(--danger)' : 'var(--text-main)' }}>{f.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{f.desc}</div>
              </div>
              <button
                onClick={() => {
                  const newVal = !settings[f.key];
                  const updated = { ...settings, [f.key]: newVal };
                  setSettings(updated);
                  saveSettings(updated);
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {settings[f.key]
                  ? <ToggleRight size={32} color={f.danger ? '#EF4444' : '#FF6B35'} />
                  : <ToggleLeft size={32} color="#94A3B8" />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
