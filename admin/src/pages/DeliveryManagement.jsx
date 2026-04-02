import React, { useState } from 'react';
import { getDeliveryPartners, approveDeliveryPartner, suspendDeliveryPartner, setDeliveryPartnerOnline, saveDeliveryPartner } from '../dataStore';

const STATUS_COLORS = {
  active: { bg: '#DCFCE7', text: '#166534', label: '✅ Active' },
  pending: { bg: '#FEF3C7', text: '#92400E', label: '⏳ Pending' },
  suspended: { bg: '#FEE2E2', text: '#991B1B', label: '🚫 Suspended' },
};

export default function DeliveryManagement() {
  const [partners, setPartners] = useState(getDeliveryPartners());
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', city: 'Betul', vehicleType: 'Motorbike', licenseNo: '' });

  const reload = () => setPartners(getDeliveryPartners());

  const filtered = partners.filter(dp => {
    if (filter === 'online' && !dp.isOnline) return false;
    if (filter !== 'all' && filter !== 'online' && dp.status !== filter) return false;
    if (search && !dp.name.toLowerCase().includes(search.toLowerCase()) && !dp.phone.includes(search)) return false;
    return true;
  });

  const handleApprove = (id) => { if (window.confirm('Approve this delivery partner?')) { approveDeliveryPartner(id); reload(); } };
  const handleSuspend = (id) => { if (window.confirm('Suspend this partner?')) { suspendDeliveryPartner(id); reload(); } };
  const handleForceOffline = (id) => { setDeliveryPartnerOnline(id, false); reload(); };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return alert('Please fill in required fields');
    
    saveDeliveryPartner({
      name: formData.name,
      phone: formData.phone,
      city: formData.city,
      vehicleType: formData.vehicleType,
      licenseNo: formData.licenseNo,
      status: 'active' // auto approve when created by admin
    });
    
    setShowAddModal(false);
    setFormData({ name: '', phone: '', city: 'Betul', vehicleType: 'Motorbike', licenseNo: '' });
    reload();
  };

  const totalOnline = partners.filter(dp => dp.isOnline).length;
  const totalActive = partners.filter(dp => dp.status === 'active').length;
  const totalDeliveries = partners.reduce((s, dp) => s + (dp.totalDeliveries || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🚴 Delivery Partners</h1>
          <p className="page-subtitle">Manage your delivery team across Betul</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <span style={{ fontSize: 18, marginRight: 8 }}>+</span> Add Partner
        </button>
      </div>

      {/* Premium Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F4FD', color: '#1565C0' }}>👥</div>
          <div className="stat-info">
            <div className="stat-value">{totalActive}</div>
            <div className="stat-label">Total Active Partners</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#DCFCE7', color: '#166534' }}>🟢</div>
          <div className="stat-info">
            <div className="stat-value">{totalOnline}</div>
            <div className="stat-label">Currently Online</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F3E5F5', color: '#6A1B9A' }}>📦</div>
          <div className="stat-info">
            <div className="stat-value">{totalDeliveries}</div>
            <div className="stat-label">Lifetime Deliveries</div>
          </div>
        </div>
      </div>

      <div className="content-card">
        {/* Filters */}
        <div className="filters-row">
          <div className="filter-tabs">
            {['all', 'online', 'active', 'pending', 'suspended'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'online' ? '🟢 Online' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Status</th>
                <th>Active Orders</th>
                <th>Today's Stats</th>
                <th>Total Earnings</th>
                <th>Account</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(dp => {
                const sc = STATUS_COLORS[dp.status] || STATUS_COLORS.pending;
                const isSelected = selected?.id === dp.id;
                return (
                  <tr key={dp.id} onClick={() => setSelected(isSelected ? null : dp)} className={isSelected ? 'selected-row' : ''}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="avatar-circle" style={{ background: dp.isOnline ? '#DCFCE7' : '#F3F4F6', color: dp.isOnline ? '#166534' : '#888' }}>
                          {dp.avatar || '🚴'}
                        </div>
                        <div>
                          <div className="bold-text">{dp.name}</div>
                          <div className="sub-text">{dp.phone} • ⭐ {dp.rating || 5.0}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${dp.isOnline ? 'online' : 'offline'}`}>
                        <span className="dot"></span> {dp.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td>
                      <div className="bold-text" style={{ color: dp.activeOrders > 0 ? '#FF6B35' : '#888' }}>
                        {dp.activeOrders || 0}
                      </div>
                    </td>
                    <td>
                      <div className="bold-text">{dp.todayDeliveries || 0} drop-offs</div>
                      <div className="sub-text" style={{ color: '#059669', fontWeight: 600 }}>₹{dp.todayEarnings || 0}</div>
                    </td>
                    <td>
                      <div className="bold-text" style={{ color: '#059669' }}>₹{(dp.totalEarnings || 0).toLocaleString()}</div>
                      <div className="sub-text">{dp.totalDeliveries || 0} total</div>
                    </td>
                    <td>
                      <span className="account-badge" style={{ background: sc.bg, color: sc.text }}>
                        {sc.label}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="action-buttons">
                        {dp.status === 'pending' && <button className="btn-icon btn-approve" title="Approve" onClick={() => handleApprove(dp.id)}>✓</button>}
                        {dp.status === 'active' && <button className="btn-icon btn-suspend" title="Suspend" onClick={() => handleSuspend(dp.id)}>⏸</button>}
                        {dp.status === 'suspended' && <button className="btn-icon btn-approve" title="Restore" onClick={() => handleApprove(dp.id)}>↩</button>}
                        {dp.isOnline && <button className="btn-text btn-danger-text" onClick={() => handleForceOffline(dp.id)}>Force Offline</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🚴</div>
              <h3>No delivery partners found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Side Drawer for Details */}
      {selected && <div className="drawer-overlay" onClick={() => setSelected(null)} />}
      <div className={`side-drawer ${selected ? 'open' : ''}`}>
        {selected && (
          <div className="drawer-content">
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="avatar-large" style={{ background: selected.isOnline ? '#DCFCE7' : '#F3F4F6' }}>
                  {selected.avatar || '🚴'}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, color: '#1A1A2E' }}>{selected.name}</h2>
                  <span className={`status-pill ${selected.isOnline ? 'online' : 'offline'}`} style={{ marginTop: 6, display: 'inline-flex' }}>
                    <span className="dot"></span> {selected.isOnline ? 'Online Now' : 'Offline'}
                  </span>
                </div>
              </div>
              <button className="btn-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="drawer-body">
              <div className="detail-section">
                <h3 className="section-title">Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Phone Number</span>
                    <span className="detail-value">{selected.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">City</span>
                    <span className="detail-value">{selected.city || 'Betul'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Vehicle</span>
                    <span className="detail-value">{selected.vehicleType ? `🚴 ${selected.vehicleType}` : '🚴 Bicycle'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">License No.</span>
                    <span className="detail-value">{selected.licenseNo || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Joined Date</span>
                    <span className="detail-value">{new Date(selected.createdAt).toLocaleDateString('hi-IN')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Status</span>
                    <span className="account-badge" style={{ background: (STATUS_COLORS[selected.status] || STATUS_COLORS.pending).bg, color: (STATUS_COLORS[selected.status] || STATUS_COLORS.pending).text, display: 'inline-block' }}>
                      {(STATUS_COLORS[selected.status] || STATUS_COLORS.pending).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3 className="section-title">Performance & Earnings</h3>
                <div className="stats-box">
                  <div className="stat-row">
                    <span>Performance Rating</span>
                    <span style={{ fontWeight: 700, color: '#F59E0B' }}>⭐ {selected.rating || 5.0} / 5.0</span>
                  </div>
                  <div className="stat-row">
                    <span>Active Orders Right Now</span>
                    <span style={{ fontWeight: 700, color: '#FF6B35' }}>{selected.activeOrders || 0}</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '12px 0' }} />
                  <div className="stat-row">
                    <span>Today's Deliveries</span>
                    <span style={{ fontWeight: 700 }}>{selected.todayDeliveries || 0}</span>
                  </div>
                  <div className="stat-row">
                    <span>Today's Earnings</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>₹{selected.todayEarnings || 0}</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '12px 0' }} />
                  <div className="stat-row">
                    <span>Lifetime Deliveries</span>
                    <span style={{ fontWeight: 700 }}>{selected.totalDeliveries || 0}</span>
                  </div>
                  <div className="stat-row">
                    <span style={{ fontWeight: 600 }}>Lifetime Earnings</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>₹{(selected.totalEarnings || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Delivery Partner</h2>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert-box info">
                <div className="alert-title">🔑 Login Credentials Reminder</div>
                <div className="alert-desc">The partner logs in using their <strong>Phone Number</strong> as the User ID, and can enter <strong>any 4-digit OTP</strong> as the password.</div>
              </div>
              
              <form onSubmit={handleAddSubmit}>
                <div className="form-group">
                  <label>Full Name <span className="req">*</span></label>
                  <input className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Raju Yadav" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number (Login ID) <span className="req">*</span></label>
                    <input className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required placeholder="10-digit number" />
                  </div>
                  <div className="form-group">
                    <label>City <span className="req">*</span></label>
                    <input className="input-field" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Vehicle Type <span className="req">*</span></label>
                    <select className="input-field" value={formData.vehicleType} onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}>
                      <option value="Bicycle">Bicycle 🚴</option>
                      <option value="Motorbike">Motorbike 🏍️</option>
                      <option value="EV Scooty">EV Scooty 🛵</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>License / ID No. <span className="req">*</span></label>
                    <input className="input-field" value={formData.licenseNo} onChange={e => setFormData({ ...formData, licenseNo: e.target.value })} required placeholder="DL or Aadhar No." />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Partner</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Container & Typography */
        .page-container { padding: 32px; max-width: 1400px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; color: #1E293B; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        h1 { margin: 0; font-size: 28px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; }
        .page-subtitle { color: #64748B; margin: 8px 0 0; font-size: 15px; }
        
        /* Buttons */
        .btn-primary { background: #1A1A2E; color: #FFF; border: none; border-radius: 8px; padding: 12px 24px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; transition: all 0.2s; box-shadow: 0 4px 12px rgba(26,26,46,0.2); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(26,26,46,0.3); }
        .btn-secondary { background: #F1F5F9; color: #475569; border: none; border-radius: 8px; padding: 12px 24px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { background: #E2E8F0; color: #1E293B; }
        .btn-close { background: none; border: none; font-size: 20px; color: #94A3B8; cursor: pointer; padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .btn-close:hover { background: #F1F5F9; color: #0F172A; }
        
        /* Action Buttons */
        .action-buttons { display: flex; gap: 8px; align-items: center; }
        .btn-icon { width: 32px; height: 32px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; transition: 0.2s; }
        .btn-approve { background: #ECFDF5; color: #059669; }
        .btn-approve:hover { background: #059669; color: #FFF; }
        .btn-suspend { background: #FFFBEB; color: #D97706; }
        .btn-suspend:hover { background: #D97706; color: #FFF; }
        .btn-text { background: none; border: none; font-size: 13px; font-weight: 600; cursor: pointer; padding: 6px 12px; border-radius: 6px; transition: 0.2s; }
        .btn-danger-text { color: #DC2626; }
        .btn-danger-text:hover { background: #FEF2F2; color: #B91C1C; }

        /* Stat Cards */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 32px; }
        .stat-card { background: #FFF; padding: 24px; border-radius: 16px; display: flex; align-items: center; gap: 20px; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03); transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .stat-value { font-size: 28px; font-weight: 800; color: #0F172A; line-height: 1.2; }
        .stat-label { font-size: 14px; color: #64748B; font-weight: 500; margin-top: 4px; }

        /* Content Card & Filters */
        .content-card { background: #FFF; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03); overflow: hidden; }
        .filters-row { padding: 20px 24px; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; background: #FAFAF9; }
        .filter-tabs { display: flex; gap: 8px; }
        .filter-tab { padding: 8px 16px; border: 1px solid transparent; border-radius: 8px; background: transparent; color: #64748B; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; }
        .filter-tab:hover { background: #F1F5F9; color: #0F172A; }
        .filter-tab.active { background: #FFF; color: #1A1A2E; border-color: #E2E8F0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .search-box { position: relative; width: 320px; }
        .search-icon { position: absolute; left: 14px; top: 10px; font-size: 14px; opacity: 0.5; }
        .search-input { width: 100%; padding: 10px 16px 10px 40px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .search-input:focus { border-color: #1A1A2E; box-shadow: 0 0 0 3px rgba(26,26,46,0.1); }

        /* Table */
        .table-container { width: 100%; overflow-x: auto; }
        .data-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .data-table th { background: #FFF; padding: 16px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E2E8F0; }
        .data-table td { padding: 16px 24px; border-bottom: 1px solid #F1F5F9; font-size: 14px; vertical-align: middle; }
        .data-table tr { transition: all 0.2s; cursor: pointer; }
        .data-table tr:hover { background: #F8FAFC; }
        .data-table tr.selected-row { background: #F0F9FF; }
        .data-table tr:last-child td { border-bottom: none; }
        
        .avatar-circle { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; }
        .bold-text { font-weight: 700; color: #0F172A; }
        .sub-text { font-size: 13px; color: #64748B; margin-top: 4px; }
        
        /* Badges & Pills */
        .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status-pill.online { background: #ECFDF5; color: #059669; }
        .status-pill.offline { background: #F1F5F9; color: #64748B; }
        .status-pill .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
        .account-badge { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; display: inline-block; }

        /* Empty State */
        .empty-state { text-align: center; padding: 64px 24px; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
        .empty-state h3 { margin: 0 0 8px; font-size: 18px; color: #0F172A; }
        .empty-state p { margin: 0; color: #64748B; font-size: 14px; }

        /* Side Drawer */
        .drawer-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.4); backdrop-filter: blur(2px); z-index: 1000; animation: fadeIn 0.3s ease; }
        .side-drawer { position: fixed; top: 0; right: -480px; width: 450px; max-width: 100%; height: 100vh; background: #FFF; box-shadow: -8px 0 32px rgba(0,0,0,0.1); z-index: 1001; transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1); overflow-y: auto; }
        .side-drawer.open { right: 0; }
        .drawer-content { display: flex; flex-direction: column; height: 100%; }
        .drawer-header { padding: 32px 32px 24px; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: flex-start; background: #F8FAFC; }
        .avatar-large { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
        .drawer-body { padding: 32px; flex: 1; overflow-y: auto; }
        
        .section-title { font-size: 14px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 20px; }
        .detail-section { margin-bottom: 40px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .detail-item { display: flex; flex-direction: column; gap: 6px; }
        .detail-label { font-size: 13px; color: #64748B; font-weight: 500; }
        .detail-value { font-size: 15px; font-weight: 600; color: #1E293B; }
        
        .stats-box { background: #F8FAFC; border-radius: 16px; padding: 24px; border: 1px solid #E2E8F0; }
        .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; font-size: 15px; color: #334155; }
        .stat-row:first-child { padding-top: 0; }
        .stat-row:last-child { padding-bottom: 0; }

        /* Modals */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; padding: 24px; }
        .modal-content { background: #FFF; width: 100%; max-width: 600px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .modal-header { padding: 24px 32px; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { margin: 0; font-size: 20px; font-weight: 700; color: #0F172A; }
        .modal-body { padding: 32px; }
        
        .alert-box { padding: 16px; border-radius: 12px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 6px; }
        .alert-box.info { background: #F0F9FF; border: 1px solid #BAE6FD; }
        .alert-title { font-weight: 700; color: #0284C7; font-size: 14px; }
        .alert-desc { font-size: 13px; color: #0369A1; line-height: 1.5; }
        
        .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group label { font-size: 14px; font-weight: 600; color: #334155; }
        .form-group .req { color: #DC2626; }
        .input-field { padding: 12px 16px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 15px; outline: none; transition: 0.2s; font-family: inherit; }
        .input-field:focus { border-color: #1A1A2E; box-shadow: 0 0 0 3px rgba(26,26,46,0.1); }
        
        .modal-actions { margin-top: 32px; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #E2E8F0; padding-top: 24px; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
