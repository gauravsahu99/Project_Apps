import React, { useState } from 'react';
import { getShops, approveShop, suspendShop, deleteShop, getShopkeeperById, saveShop, saveShopkeeper } from '../dataStore';

const STATUS_COLORS = {
  approved: { bg: '#DCFCE7', text: '#166534', label: 'Active' },
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
  suspended: { bg: '#FEE2E2', text: '#991B1B', label: 'Suspended' },
};

export default function ShopsManagement() {
  const [shops, setShops] = useState(getShops());
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ shopName: '', shopNameEn: '', category: 'grocery', tagline: '', address: '', city: 'Betul', ownerName: '', ownerPhone: '', commissionRate: 10, operatingHours: '9:00 AM – 9:00 PM' });

  const reload = () => setShops(getShops());

  const filtered = shops.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleApprove = (id) => { if (window.confirm('Approve this shop?')) { approveShop(id); reload(); } };
  const handleSuspend = (id) => { if (window.confirm('Suspend this shop?')) { suspendShop(id); reload(); } };
  const handleDelete = (id) => { if (window.confirm('Delete this shop permanently?')) { deleteShop(id); setSelected(null); reload(); } };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.ownerPhone || !formData.shopName || !formData.ownerName) return alert('Please fill in required fields');
    
    // Save Shopkeeper first
    const sk = saveShopkeeper({ name: formData.ownerName, phone: formData.ownerPhone, status: 'active' });
    
    // Auto-assign emoji based on category
    const EMOJI_MAP = { grocery: '🛒', fashion: '👗', medical: '💊', electronics: '💻', food: '🍱', general: '🏪' };
    
    // Save Shop
    saveShop({
      ownerId: sk.id, ownerPhone: sk.phone,
      name: formData.shopName, nameEn: formData.shopNameEn, category: formData.category, emoji: EMOJI_MAP[formData.category] || '🏪',
      tagline: formData.tagline, address: formData.address, city: formData.city,
      commissionRate: Number(formData.commissionRate),
      operatingHours: formData.operatingHours,
      status: 'approved' // Auto approve when created by admin
    });
    
    setShowAddModal(false);
    setFormData({ shopName: '', shopNameEn: '', category: 'grocery', tagline: '', address: '', city: 'Betul', ownerName: '', ownerPhone: '', commissionRate: 10, operatingHours: '9:00 AM – 9:00 PM' });
    reload();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🏪 Shops Management</h1>
          <p className="page-subtitle">Manage registered shopkeepers and their shops</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <span style={{ fontSize: 18, marginRight: 8 }}>+</span> Add New Shop
        </button>
      </div>

      {/* Premium Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F4FD', color: '#1565C0' }}>🏪</div>
          <div className="stat-info">
            <div className="stat-value">{shops.length}</div>
            <div className="stat-label">Total Registered Shops</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#DCFCE7', color: '#166534' }}>✅</div>
          <div className="stat-info">
            <div className="stat-value">{shops.filter(s => s.status === 'approved').length}</div>
            <div className="stat-label">Active & Approved</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7', color: '#92400E' }}>⏳</div>
          <div className="stat-info">
            <div className="stat-value">{shops.filter(s => s.status === 'pending').length}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
        </div>
      </div>

      <div className="content-card">
        {/* Filters */}
        <div className="filters-row">
          <div className="filter-tabs">
            {['all', 'approved', 'pending', 'suspended'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search shops by name or city..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shop Details</th>
                <th>Owner Info</th>
                <th>Category</th>
                <th>Location</th>
                <th>Performance</th>
                <th>Commission</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(shop => {
                const sk = getShopkeeperById(shop.ownerId);
                const sc = STATUS_COLORS[shop.status] || STATUS_COLORS.pending;
                const isSelected = selected?.id === shop.id;
                
                return (
                  <tr key={shop.id} onClick={() => setSelected(isSelected ? null : shop)} className={isSelected ? 'selected-row' : ''}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="avatar-circle" style={{ background: '#F8FAFC', color: '#1E293B', fontSize: 24, paddingBottom: 2 }}>
                          {shop.emoji}
                        </div>
                        <div>
                          <div className="bold-text" style={{ fontSize: 15 }}>{shop.name}</div>
                          <div className="sub-text">{shop.nameEn || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="bold-text">{sk?.name || 'Unknown'}</div>
                      <div className="sub-text">{shop.ownerPhone}</div>
                    </td>
                    <td>
                      <span className="category-tag">{shop.category}</span>
                    </td>
                    <td>
                      <div className="bold-text">{shop.city}</div>
                      <div className="sub-text line-clamp-1" style={{ maxWidth: 150 }} title={shop.address}>{shop.address}</div>
                    </td>
                    <td>
                      <div className="bold-text">{shop.totalOrders || 0} orders</div>
                      <div className="sub-text" style={{ color: '#059669', fontWeight: 600 }}>₹{(shop.totalEarnings || 0).toLocaleString()}</div>
                    </td>
                    <td>
                      <span className="bold-text" style={{ color: '#DC2626' }}>{shop.commissionRate}%</span>
                    </td>
                    <td>
                      <span className="account-badge" style={{ background: sc.bg, color: sc.text }}>
                        {sc.label}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="action-buttons">
                        {shop.status === 'pending' && <button className="btn-icon btn-approve" title="Approve" onClick={() => handleApprove(shop.id)}>✓</button>}
                        {shop.status === 'approved' && <button className="btn-icon btn-suspend" title="Suspend" onClick={() => handleSuspend(shop.id)}>⏸</button>}
                        {shop.status === 'suspended' && <button className="btn-icon btn-approve" title="Restore" onClick={() => handleApprove(shop.id)}>↩</button>}
                        <button className="btn-icon btn-delete" title="Delete" onClick={() => handleDelete(shop.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🏪</div>
              <h3>No shops found</h3>
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
                <div className="avatar-large" style={{ background: '#F8FAFC', fontSize: 36, paddingBottom: 4 }}>
                  {selected.emoji}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, color: '#1A1A2E' }}>{selected.name}</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 13 }}>{selected.tagline || 'No tagline provided'}</p>
                </div>
              </div>
              <button className="btn-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="drawer-body">
              <div className="detail-section">
                <h3 className="section-title">Shop Information</h3>
                <div className="detail-grid">
                  <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="detail-label">Full Address</span>
                    <span className="detail-value">{selected.address}, {selected.city}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category</span>
                    <span className="category-tag" style={{ display: 'inline-block', width: 'fit-content', marginTop: 4 }}>{selected.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Operating Hours</span>
                    <span className="detail-value">{selected.operatingHours || '9:00 AM – 9:00 PM'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Status</span>
                    <span className="account-badge" style={{ background: (STATUS_COLORS[selected.status] || STATUS_COLORS.pending).bg, color: (STATUS_COLORS[selected.status] || STATUS_COLORS.pending).text, display: 'inline-block', marginTop: 4 }}>
                      {(STATUS_COLORS[selected.status] || STATUS_COLORS.pending).label}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Registration Date</span>
                    <span className="detail-value">{new Date(selected.createdAt).toLocaleDateString('hi-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3 className="section-title">Owner Details</h3>
                <div className="stats-box" style={{ padding: 16 }}>
                  <div className="stat-row">
                    <span className="detail-label" style={{ margin: 0 }}>Owner Name</span>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{getShopkeeperById(selected.ownerId)?.name || '—'}</span>
                  </div>
                  <div className="stat-row" style={{ marginTop: 12 }}>
                    <span className="detail-label" style={{ margin: 0 }}>Contact Phone</span>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{selected.ownerPhone}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3 className="section-title">Business & Revenue</h3>
                <div className="stats-box">
                  <div className="stat-row">
                    <span>Performance Rating</span>
                    <span style={{ fontWeight: 700, color: '#F59E0B' }}>⭐ {selected.rating || 'No ratings'}</span>
                  </div>
                  <div className="stat-row">
                    <span>Platform Commission</span>
                    <span style={{ fontWeight: 700, color: '#DC2626' }}>{selected.commissionRate}% per order</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '16px 0' }} />
                  <div className="stat-row">
                    <span>Total Orders Fulfilled</span>
                    <span style={{ fontWeight: 700 }}>{selected.totalOrders || 0}</span>
                  </div>
                  <div className="stat-row" style={{ marginTop: 8 }}>
                    <span style={{ fontWeight: 600 }}>Total Revenue</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#059669' }}>₹{(selected.totalEarnings || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Shop Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2>Add New Shop</h2>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert-box info">
                <div className="alert-title">🔑 Shopkeeper Access</div>
                <div className="alert-desc">The shop owner will log in using their <strong>Phone Number</strong> as the User ID, and can authenticate using <strong>any 4-digit OTP</strong>.</div>
              </div>
              
              <form onSubmit={handleAddSubmit}>
                <h4 className="form-section-title">Owner Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Owner Full Name <span className="req">*</span></label>
                    <input className="input-field" value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} required placeholder="e.g. Ramesh Kumar" />
                  </div>
                  <div className="form-group">
                    <label>Owner Phone (Login ID) <span className="req">*</span></label>
                    <input className="input-field" value={formData.ownerPhone} onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })} required placeholder="10-digit number" />
                  </div>
                </div>

                <hr style={{ margin: '24px 0', borderColor: '#E2E8F0' }} />
                <h4 className="form-section-title">Shop Details</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label>Shop Name (Hindi/Local) <span className="req">*</span></label>
                    <input className="input-field" value={formData.shopName} onChange={e => setFormData({ ...formData, shopName: e.target.value })} required placeholder="e.g. श्री गणेश किराना" />
                  </div>
                  <div className="form-group">
                    <label>Shop Name (English)</label>
                    <input className="input-field" value={formData.shopNameEn} onChange={e => setFormData({ ...formData, shopNameEn: e.target.value })} placeholder="e.g. Shree Ganesh Kirana" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category <span className="req">*</span></label>
                    <select className="input-field" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      <option value="grocery">Grocery 🛒</option>
                      <option value="fashion">Fashion 👗</option>
                      <option value="medical">Medical 💊</option>
                      <option value="electronics">Electronics 💻</option>
                      <option value="food">Food 🍱</option>
                      <option value="general">General 🏪</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Commission Rate (%) <span className="req">*</span></label>
                    <input type="number" className="input-field" value={formData.commissionRate} onChange={e => setFormData({ ...formData, commissionRate: e.target.value })} required min="0" max="100" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tagline (Optional)</label>
                  <input className="input-field" value={formData.tagline} onChange={e => setFormData({ ...formData, tagline: e.target.value })} placeholder="e.g. घर की जरूरत, सबसे सस्ती कीमत" />
                </div>

                <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr' }}>
                  <div className="form-group">
                    <label>Full Address <span className="req">*</span></label>
                    <input className="input-field" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required placeholder="e.g. मेन मार्केट" />
                  </div>
                  <div className="form-group">
                    <label>City <span className="req">*</span></label>
                    <input className="input-field" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Operating Hours</label>
                  <input className="input-field" value={formData.operatingHours} onChange={e => setFormData({ ...formData, operatingHours: e.target.value })} placeholder="e.g. 9:00 AM - 9:00 PM" />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Shop</button>
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
        .btn-delete { background: #FEF2F2; color: #DC2626; }
        .btn-delete:hover { background: #DC2626; color: #FFF; }

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
        .filter-tab { padding: 8px 16px; border: 1px solid transparent; border-radius: 8px; background: transparent; color: #64748B; cursor: pointer; font-weight: 600; font-size: 14px; text-transform: capitalize; transition: all 0.2s; }
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
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        
        /* Badges & Pills */
        .category-tag { background: #F1F5F9; color: #475569; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; text-transform: capitalize; }
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
        .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 15px; color: #334155; }
        .stat-row:first-child { padding-top: 0; }
        .stat-row:last-child { padding-bottom: 0; }

        /* Modals */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; padding: 24px; overflow-y: auto; }
        .modal-content { background: #FFF; width: 100%; max-width: 600px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); margin: auto; }
        .modal-header { padding: 24px 32px; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { margin: 0; font-size: 20px; font-weight: 700; color: #0F172A; }
        .modal-body { padding: 32px; }
        
        .alert-box { padding: 16px; border-radius: 12px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 6px; }
        .alert-box.info { background: #F0F9FF; border: 1px solid #BAE6FD; }
        .alert-title { font-weight: 700; color: #0284C7; font-size: 14px; }
        .alert-desc { font-size: 13px; color: #0369A1; line-height: 1.5; }
        
        .form-section-title { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 16px; }
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
