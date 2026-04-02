// ═══════════════════════════════════════════════
// APNA BETUL — SHARED DATA STORE
// Syncs Mobile App ↔ Admin Panel via localStorage
// ═══════════════════════════════════════════════

const PREFIX = 'ab_';

// ── HELPERS ──────────────────────────────────
const store = {
  get: (key) => {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  set: (key, val) => {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch {}
  },
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const now = () => new Date().toISOString();
const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

// ── SEED DATA ─────────────────────────────────
const SEED = {
  users: [
    { id: 'u1', name: 'Ramesh Kumar', phone: '9876543210', email: 'ramesh@gmail.com', city: 'Betul', role: 'user', status: 'active', createdAt: '2026-03-05T08:00:00.000Z', orders: 12, avatar: 'R' },
    { id: 'u2', name: 'Priya Singh', phone: '8765432109', email: 'priya@gmail.com', city: 'Betul', role: 'user', status: 'active', createdAt: '2026-03-05T10:00:00.000Z', orders: 5, avatar: 'P' },
    { id: 'u3', name: 'Aman Verma', phone: '7654321098', email: '', city: 'Multai', role: 'user', status: 'pending', createdAt: '2026-03-04T09:00:00.000Z', orders: 0, avatar: 'A' },
    { id: 'u4', name: 'Sunil Patel', phone: '6543210987', email: 'sunil@gmail.com', city: 'Amla', role: 'user', status: 'blocked', createdAt: '2026-03-02T11:00:00.000Z', orders: 2, avatar: 'S' },
    { id: 'u5', name: 'Meera Joshi', phone: '5432109876', email: 'meera@gmail.com', city: 'Betul', role: 'user', status: 'active', createdAt: '2026-03-01T07:00:00.000Z', orders: 8, avatar: 'M' },
    { id: 'u6', name: 'Vikas Sharma', phone: '4321098765', email: '', city: 'Sarni', role: 'user', status: 'active', createdAt: '2026-02-28T12:00:00.000Z', orders: 3, avatar: 'V' },
  ],
  ads: [
    { id: 'a1', shopName: 'श्री गणेश किराना स्टोर', shopNameEn: 'Shree Ganesh Kirana', category: 'grocery', tagline: 'घर की जरूरत, सबसे सस्ती कीमत', offer: '20% OFF on First Order', phone: '9876543210', address: 'मेन मार्केट, बैतूल', plan: 'premium', badge: '⭐ प्रीमियम', color: '#FF6B35', rating: 4.5, status: 'approved', views: 980, calls: 45, emoji: '🛒', createdAt: '2026-03-01T08:00:00.000Z', submittedBy: 'Ramesh Kumar' },
    { id: 'a2', shopName: 'Fashion Hub Betul', shopNameEn: 'Fashion Hub Betul', category: 'clothing', tagline: 'Latest Fashion at Best Price', offer: 'Buy 2 Get 1 Free', phone: '9876543211', address: 'स्टेशन रोड, बैतूल', plan: 'standard', badge: '🔥 ट्रेंडिंग', color: '#E91E63', rating: 4.2, status: 'approved', views: 750, calls: 32, emoji: '👗', createdAt: '2026-03-02T09:00:00.000Z', submittedBy: 'Priya Singh' },
    { id: 'a3', shopName: 'Tech World Betul', shopNameEn: 'Tech World Betul', category: 'electronics', tagline: 'सभी Electronics सबसे कम दाम पर', offer: 'EMI @0%', phone: '9876543212', address: 'कॉलेज रोड, बैतूल', plan: 'homepage', badge: '💎 Featured', color: '#1976D2', rating: 4.7, status: 'approved', views: 1240, calls: 67, emoji: '💻', createdAt: '2026-03-03T10:00:00.000Z', submittedBy: 'Aman Verma' },
    { id: 'a4', shopName: 'साईं मेडिकल स्टोर', shopNameEn: 'Sai Medical', category: 'medical', tagline: '24x7 दवाइयाँ और स्वास्थ्य उत्पाद', offer: '10% OFF on all Medicines', phone: '9876543213', address: 'हॉस्पिटल रोड, बैतूल', plan: 'standard', badge: '💊 24/7 Open', color: '#43A047', rating: 4.6, status: 'approved', views: 760, calls: 28, emoji: '💊', createdAt: '2026-03-04T11:00:00.000Z', submittedBy: 'Sunil Patel' },
    { id: 'a5', shopName: 'Sharma Garments', shopNameEn: 'Sharma Garments', category: 'clothing', tagline: '👔 Summer Collection 2025', offer: '40% OFF', phone: '9876543214', address: 'Civil Lines, Betul', plan: 'premium', badge: '✨ New', color: '#7B1FA2', rating: 4.3, status: 'pending', views: 0, calls: 0, emoji: '👔', createdAt: '2026-03-05T12:00:00.000Z', submittedBy: 'Meera Joshi' },
    { id: 'a6', shopName: 'Betul Jewellers', shopNameEn: 'Betul Jewellers', category: 'jewellery', tagline: '💍 Gold & Silver — 40 Yr Trust', offer: 'No Making Charges', phone: '9876543215', address: 'Sarafa Bazar, Betul', plan: 'homepage', badge: '💍 Premium', color: '#D97706', rating: 4.8, status: 'pending', views: 0, calls: 0, emoji: '💍', createdAt: '2026-03-05T13:00:00.000Z', submittedBy: 'Vikas Sharma' },
  ],
  listings: [
    { id: 'l1', title: 'Honda Activa 5G - 2021', price: 65000, category: 'bikes', emoji: '🏍️', description: 'बहुत अच्छी condition में, single owner, all papers clear.', location: 'बैतूल शहर', postedBy: 'Rahul Sharma', phone: '9876543210', timeAgo: '2 घंटे पहले', isVerified: true, status: 'approved', views: 234, createdAt: '2026-03-05T06:00:00.000Z' },
    { id: 'l2', title: 'Samsung Galaxy S21 - 128GB', price: 28000, category: 'electronics', emoji: '📱', description: 'Box pack condition, 6 months warranty remaining, charger included.', location: 'मुलताई', postedBy: 'Priya Patel', phone: '9876543211', timeAgo: '5 घंटे पहले', isVerified: false, status: 'approved', views: 189, createdAt: '2026-03-05T03:00:00.000Z' },
    { id: 'l3', title: '3BHK Flat for Rent', price: 8000, category: 'realestate', emoji: '🏠', description: 'नया flat, सभी सुविधाएं, road से 100 meter. Monthly rent.', location: 'कॉलेज रोड, बैतूल', postedBy: 'Suresh Kumar', phone: '9876543212', timeAgo: '1 दिन पहले', isVerified: true, status: 'approved', views: 312, createdAt: '2026-03-04T08:00:00.000Z' },
    { id: 'l4', title: 'Office Furniture Set', price: 15000, category: 'furniture', emoji: '🪑', description: '5 chairs + 1 table, good condition, price negotiable.', location: 'बैतूल', postedBy: 'Anita Singh', phone: '9876543213', timeAgo: '2 दिन पहले', isVerified: false, status: 'pending', views: 0, createdAt: '2026-03-03T10:00:00.000Z' },
    { id: 'l5', title: 'Maruti Suzuki Alto 800 - 2019', price: 280000, category: 'cars', emoji: '🚗', description: 'Single owner, AC, power steering, 45000 km run only. All documentation clear.', location: 'बैतूल', postedBy: 'Vikram Singh', phone: '9876543214', timeAgo: '3 दिन पहले', isVerified: true, status: 'approved', views: 445, createdAt: '2026-03-02T09:00:00.000Z' },
  ],
  orders: [
    { id: 'o1', userId: 'u1', userName: 'Ramesh Kumar', phone: '9876543210', items: [{ id: 'p1', name: 'अंडे (Egg)', emoji: '🥚', price: 8, quantity: 6, unit: 'per piece' }, { id: 'p5', name: 'दूध', emoji: '🥛', price: 55, quantity: 1, unit: 'per litre' }], total: 103, deliveryFee: 0, promoDiscount: 0, address: 'MIG Colony, Sector 4, Betul', slot: 'सुबह 7-9 बजे', payment: 'cod', status: 'delivered', category: 'essentials', createdAt: '2026-03-05T05:30:00.000Z' },
    { id: 'o2', userId: 'u2', userName: 'Priya Singh', phone: '8765432109', items: [{ id: 'p2', name: 'डबल रोटी', emoji: '🍞', price: 35, quantity: 2, unit: 'per loaf' }, { id: 'p3', name: 'समोसे', emoji: '🥟', price: 15, quantity: 4, unit: 'per piece' }], total: 130, deliveryFee: 0, promoDiscount: 13, address: 'Station Road, Betul', slot: 'सुबह 10-12 बजे', payment: 'upi', status: 'dispatched', category: 'essentials', createdAt: '2026-03-05T06:00:00.000Z' },
    { id: 'o3', userId: 'u5', userName: 'Meera Joshi', phone: '5432109876', items: [{ id: 'f1', name: 'Men Premium T-Shirt', emoji: '👕', price: 599, quantity: 2, unit: 'pcs' }], total: 1198, deliveryFee: 0, promoDiscount: 0, address: 'Nehru Nagar, Betul', slot: 'शाम 5-7 बजे', payment: 'card', status: 'pending', category: 'fashion', createdAt: '2026-03-05T08:30:00.000Z' },
    { id: 'o4', userId: 'u6', userName: 'Vikas Sharma', phone: '4321098765', items: [{ id: 'p6', name: 'आलू-प्याज', emoji: '🧅', price: 40, quantity: 2, unit: 'per kg' }, { id: 'p7', name: 'टमाटर', emoji: '🍅', price: 35, quantity: 1, unit: 'per kg' }], total: 115, deliveryFee: 20, promoDiscount: 0, address: 'Sarni Road, Betul', slot: 'सुबह 7-9 बजे', payment: 'cod', status: 'pending', category: 'essentials', createdAt: '2026-03-05T09:00:00.000Z' },
  ],
  notifications: [
    { id: 'n1', type: 'order', icon: '🆕', title: 'New ad submission from Tech World Betul', body: 'Review and approve the new ad', time: '2026-03-05T08:30:00.000Z', read: false, forAdmin: true },
    { id: 'n2', type: 'listing', icon: '🛍️', title: 'New marketplace listing: Honda Activa 5G', body: 'Pending approval', time: '2026-03-05T06:00:00.000Z', read: false, forAdmin: true },
    { id: 'n3', type: 'user', icon: '👤', title: '6 new users registered today', body: 'View in Users section', time: '2026-03-05T05:00:00.000Z', read: false, forAdmin: true },
    { id: 'n4', type: 'order', icon: '📦', title: 'Order #o4 is pending assignment', body: 'Vikas Sharma — ₹115', time: '2026-03-05T09:00:00.000Z', read: false, forAdmin: true },
    { id: 'n5', type: 'info', icon: '✅', title: 'Order #o1 delivered successfully', body: 'Ramesh Kumar — ₹103', time: '2026-03-05T07:30:00.000Z', read: true, forAdmin: true },
    // User-facing notifications
    { id: 'n6', type: 'order', icon: '🎉', title: 'Order Confirmed!', body: 'Your order of ₹103 has been placed.', time: '2026-03-05T05:30:00.000Z', read: true, forAdmin: false, userId: 'u1' },
    { id: 'n7', type: 'delivery', icon: '🚴', title: 'Order On The Way!', body: 'Your morning essentials are on the way.', time: '2026-03-05T06:45:00.000Z', read: false, forAdmin: false, userId: 'u1' },
  ],
  promoCodes: [
    { code: 'BETUL10', discount: 10, type: 'percent', label: '10% OFF', active: true, usageCount: 45 },
    { code: 'APNA20', discount: 20, type: 'percent', label: '20% OFF', active: true, usageCount: 23 },
    { code: 'FREE50', discount: 50, type: 'flat', label: '₹50 OFF', active: true, usageCount: 67 },
    { code: 'WELCOME', discount: 30, type: 'percent', label: '30% OFF (New User)', active: false, usageCount: 12 },
  ],
  settings: {
    appName: 'Apna Betul',
    deliveryFeeDefault: 20,
    freeDeliveryThreshold: 200,
    orderNotifications: true,
    maintenanceMode: false,
    flashSaleActive: true,
    morningDeliveryEnabled: true,
    supportPhone: '9876543000',
    supportEmail: 'support@apnabetul.com',
  },
};

// ── INITIALISE ────────────────────────────────
const init = () => {
  if (!store.get('initialised')) {
    Object.entries(SEED).forEach(([k, v]) => store.set(k, v));
    store.set('initialised', true);
  }
};

// ══════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════

// ── USERS ──
export const getUsers = () => { init(); return store.get('users') || []; };
export const getUserById = (id) => getUsers().find(u => u.id === id);
export const getUserByPhone = (phone) => getUsers().find(u => u.phone === phone);

export const saveUser = (userData) => {
  init();
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userData.id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...userData };
  } else {
    users.push({ ...userData, id: userData.id || uid(), createdAt: now(), orders: 0, avatar: (userData.name || 'U')[0].toUpperCase() });
  }
  store.set('users', users);
  return users.find(u => u.id === userData.id || u.phone === userData.phone);
};

export const blockUser = (id) => {
  const users = getUsers().map(u => u.id === id ? { ...u, status: 'blocked' } : u);
  store.set('users', users);
};

export const unblockUser = (id) => {
  const users = getUsers().map(u => u.id === id ? { ...u, status: 'active' } : u);
  store.set('users', users);
};

export const deleteUser = (id) => {
  store.set('users', getUsers().filter(u => u.id !== id));
};

// ── ADS ──
export const getAds = (statusFilter = null) => {
  init();
  const ads = store.get('ads') || [];
  return statusFilter ? ads.filter(a => a.status === statusFilter) : ads;
};

export const saveAd = (adData) => {
  init();
  const ads = getAds();
  const idx = ads.findIndex(a => a.id === adData.id);
  if (idx >= 0) {
    ads[idx] = { ...ads[idx], ...adData };
  } else {
    const newAd = { ...adData, id: uid(), status: 'pending', views: 0, calls: 0, createdAt: now() };
    ads.push(newAd);
    addNotification({ type: 'ad', icon: '🆕', title: `New ad: ${adData.shopName}`, body: 'Pending approval', forAdmin: true });
  }
  store.set('ads', ads);
};

export const approveAd = (id) => {
  const ads = getAds().map(a => a.id === id ? { ...a, status: 'approved' } : a);
  store.set('ads', ads);
};

export const rejectAd = (id) => {
  const ads = getAds().map(a => a.id === id ? { ...a, status: 'rejected' } : a);
  store.set('ads', ads);
};

export const deleteAd = (id) => {
  store.set('ads', getAds().filter(a => a.id !== id));
};

export const incrementAdView = (id) => {
  const ads = getAds().map(a => a.id === id ? { ...a, views: (a.views || 0) + 1 } : a);
  store.set('ads', ads);
};

export const incrementAdCall = (id) => {
  const ads = getAds().map(a => a.id === id ? { ...a, calls: (a.calls || 0) + 1 } : a);
  store.set('ads', ads);
};

// ── LISTINGS ──
export const getListings = (statusFilter = null) => {
  init();
  const listings = store.get('listings') || [];
  return statusFilter ? listings.filter(l => l.status === statusFilter) : listings;
};

export const saveListing = (listingData) => {
  init();
  const listings = getListings();
  const idx = listings.findIndex(l => l.id === listingData.id);
  if (idx >= 0) {
    listings[idx] = { ...listings[idx], ...listingData };
  } else {
    const newListing = { ...listingData, id: uid(), status: 'pending', views: 0, createdAt: now(), timeAgo: 'just now' };
    listings.unshift(newListing);
    addNotification({ type: 'listing', icon: '🛍️', title: `New listing: ${listingData.title}`, body: 'Pending approval', forAdmin: true });
  }
  store.set('listings', listings);
};

export const approveListing = (id) => {
  const listings = getListings().map(l => l.id === id ? { ...l, status: 'approved' } : l);
  store.set('listings', listings);
};

export const rejectListing = (id) => {
  const listings = getListings().map(l => l.id === id ? { ...l, status: 'rejected' } : l);
  store.set('listings', listings);
};

export const featureListing = (id) => {
  const listings = getListings().map(l => l.id === id ? { ...l, featured: !l.featured } : l);
  store.set('listings', listings);
};

export const deleteListing = (id) => {
  store.set('listings', getListings().filter(l => l.id !== id));
};

// ── ORDERS ──
export const getOrders = (filters = {}) => {
  init();
  let orders = store.get('orders') || [];
  if (filters.userId) orders = orders.filter(o => o.userId === filters.userId);
  if (filters.status) orders = orders.filter(o => o.status === filters.status);
  if (filters.category) orders = orders.filter(o => o.category === filters.category);
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const saveOrder = (orderData) => {
  init();
  const orders = store.get('orders') || [];
  const newOrder = {
    ...orderData,
    id: 'o' + uid(),
    status: 'pending',
    createdAt: now(),
  };
  orders.unshift(newOrder);
  store.set('orders', orders);
  // update user order count
  const users = getUsers().map(u => u.id === orderData.userId ? { ...u, orders: (u.orders || 0) + 1 } : u);
  store.set('users', users);
  // Admin notification
  addNotification({ type: 'order', icon: '🛒', title: `New order from ${orderData.userName}`, body: `₹${orderData.total} — ${orderData.category}`, forAdmin: true });
  // User notification
  addNotification({ type: 'order', icon: '🎉', title: 'Order Confirmed!', body: `Your order of ₹${orderData.total} has been placed.`, forAdmin: false, userId: orderData.userId });
  return newOrder;
};

export const updateOrderStatus = (id, status) => {
  const orders = getOrders().map(o => o.id === id ? { ...o, status, updatedAt: now() } : o);
  store.set('orders', orders);
  // Notify user
  const order = orders.find(o => o.id === id);
  if (order) {
    const msgs = { dispatched: '🚴 Your order is on the way!', delivered: '✅ Order delivered!', cancelled: '❌ Order was cancelled.' };
    if (msgs[status]) {
      addNotification({ type: 'delivery', icon: msgs[status][0], title: msgs[status].slice(2), body: `Order #${id} — ₹${order.total}`, forAdmin: false, userId: order.userId });
    }
  }
};

export const deleteOrder = (id) => {
  store.set('orders', getOrders().filter(o => o.id !== id));
};

// ── NOTIFICATIONS ──
export const getNotifications = (forAdmin = false, userId = null) => {
  init();
  const notifs = store.get('notifications') || [];
  if (forAdmin) return notifs.filter(n => n.forAdmin);
  if (userId) return notifs.filter(n => !n.forAdmin && n.userId === userId);
  return notifs;
};

export const addNotification = (notifData) => {
  init();
  const notifs = store.get('notifications') || [];
  notifs.unshift({ ...notifData, id: 'n' + uid(), time: now(), read: false });
  store.set('notifications', notifs.slice(0, 100)); // Keep last 100
};

export const markNotifRead = (id) => {
  const notifs = (store.get('notifications') || []).map(n => n.id === id ? { ...n, read: true } : n);
  store.set('notifications', notifs);
};

export const markAllNotifsRead = (forAdmin = false, userId = null) => {
  const notifs = (store.get('notifications') || []).map(n => {
    if (forAdmin && n.forAdmin) return { ...n, read: true };
    if (userId && n.userId === userId) return { ...n, read: true };
    return n;
  });
  store.set('notifications', notifs);
};

// ── PROMO CODES ──
export const getPromoCodes = () => { init(); return store.get('promoCodes') || []; };
export const validatePromo = (code) => {
  const promos = getPromoCodes();
  const promo = promos.find(p => p.code === code.toUpperCase() && p.active);
  if (!promo) return null;
  // increment usage
  store.set('promoCodes', promos.map(p => p.code === code.toUpperCase() ? { ...p, usageCount: (p.usageCount || 0) + 1 } : p));
  return promo;
};
export const savePromoCode = (promoData) => {
  init();
  const promos = getPromoCodes();
  const idx = promos.findIndex(p => p.code === promoData.code);
  if (idx >= 0) promos[idx] = { ...promos[idx], ...promoData };
  else promos.push(promoData);
  store.set('promoCodes', promos);
};
export const deletePromoCode = (code) => {
  store.set('promoCodes', getPromoCodes().filter(p => p.code !== code));
};

// ── SETTINGS ──
export const getSettings = () => { init(); return store.get('settings') || SEED.settings; };
export const saveSettings = (data) => { store.set('settings', { ...getSettings(), ...data }); };

// ── STATS ────────────────────────────────────
export const getStats = () => {
  const users = getUsers();
  const ads = getAds();
  const listings = getListings();
  const orders = getOrders();
  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const pendingAds = ads.filter(a => a.status === 'pending').length;
  const pendingListings = listings.filter(l => l.status === 'pending').length;
  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalAds: ads.filter(a => a.status === 'approved').length,
    pendingAds,
    totalListings: listings.filter(l => l.status === 'approved').length,
    pendingListings,
    totalOrders: orders.length,
    pendingOrders,
    revenue,
    revenueFormatted: revenue >= 1000 ? `₹${(revenue / 1000).toFixed(1)}K` : `₹${revenue}`,
  };
};

// ── TIME HELPER ──
export { timeAgo };

// ── RESET (dev only) ──
export const resetStore = () => {
  Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k));
};
