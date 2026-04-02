// ═══════════════════════════════════════════════
// APNA BETUL — SHARED DATA STORE (v2)
// Delivery Partner App — works on React Native + Web
// ═══════════════════════════════════════════════

const PREFIX = 'ab_';

// In-memory store — primary storage for React Native
let memStore = {};

const store = {
  get: (key) => {
    // Try localStorage first (web/Expo web)
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        const r = localStorage.getItem(PREFIX + key);
        if (r) { const parsed = JSON.parse(r); memStore[key] = parsed; return parsed; }
      }
    } catch {}
    // Fall back to in-memory store (React Native)
    return memStore[key] !== undefined ? memStore[key] : null;
  },
  set: (key, val) => {
    memStore[key] = val; // always write to memory
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        localStorage.setItem(PREFIX + key, JSON.stringify(val));
      }
    } catch {}
  },
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const now = () => new Date().toISOString();

export const timeAgo = (iso) => {
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};

const SEED = {
  users: [
    { id: 'u1', name: 'Ramesh Kumar', phone: '9876543210', city: 'Betul', role: 'user', status: 'active', createdAt: '2026-03-05T08:00:00.000Z', orders: 12, avatar: 'R' },
    { id: 'u2', name: 'Priya Singh', phone: '8765432109', city: 'Betul', role: 'user', status: 'active', createdAt: '2026-03-05T10:00:00.000Z', orders: 5, avatar: 'P' },
    { id: 'u5', name: 'Meera Joshi', phone: '5432109876', city: 'Betul', role: 'user', status: 'active', createdAt: '2026-03-01T07:00:00.000Z', orders: 8, avatar: 'M' },
    { id: 'u6', name: 'Vikas Sharma', phone: '4321098765', city: 'Sarni', role: 'user', status: 'active', createdAt: '2026-02-28T12:00:00.000Z', orders: 3, avatar: 'V' },
  ],
  shopkeepers: [
    { id: 'sk1', name: 'Rajesh Agrawal', phone: '9111111111', shopId: 'sh1', status: 'active', avatar: 'R', createdAt: '2026-03-01T08:00:00.000Z' },
    { id: 'sk2', name: 'Sunita Gupta', phone: '9222222222', shopId: 'sh2', status: 'active', avatar: 'S', createdAt: '2026-03-02T09:00:00.000Z' },
    { id: 'sk4', name: 'Dr. Mohan Lal', phone: '9444444444', shopId: 'sh4', status: 'active', avatar: 'D', createdAt: '2026-03-03T10:00:00.000Z' },
  ],
  shops: [
    { id: 'sh1', ownerId: 'sk1', ownerPhone: '9111111111', name: 'श्री गणेश किराना', nameEn: 'Shree Ganesh Kirana', category: 'grocery', emoji: '🛒', tagline: 'घर की जरूरत, सबसे सस्ती कीमत', address: 'मेन मार्केट, बैतूल', city: 'Betul', status: 'approved', commissionRate: 10, rating: 4.5, totalOrders: 45, totalEarnings: 18700, createdAt: '2026-03-01T08:00:00.000Z' },
    { id: 'sh2', ownerId: 'sk2', ownerPhone: '9222222222', name: 'Fashion Hub', nameEn: 'Fashion Hub Betul', category: 'fashion', emoji: '👗', tagline: 'Latest Fashion at Best Price', address: 'स्टेशन रोड, बैतूल', city: 'Betul', status: 'approved', commissionRate: 10, rating: 4.2, totalOrders: 22, totalEarnings: 9800, createdAt: '2026-03-02T09:00:00.000Z' },
    { id: 'sh4', ownerId: 'sk4', ownerPhone: '9444444444', name: 'साईं मेडिकल', nameEn: 'Sai Medical Store', category: 'medical', emoji: '💊', tagline: '24x7 दवाइयाँ', address: 'हॉस्पिटल रोड, बैतूल', city: 'Betul', status: 'approved', commissionRate: 8, rating: 4.6, totalOrders: 38, totalEarnings: 22400, createdAt: '2026-03-03T10:00:00.000Z' },
  ],
  products: [
    { id: 'pr1', shopId: 'sh1', name: 'अंडे (Eggs)', emoji: '🥚', price: 8, unit: 'per piece', stock: 200, category: 'grocery', isActive: true, createdAt: '2026-03-01T09:00:00.000Z' },
    { id: 'pr2', shopId: 'sh1', name: 'दूध (Milk)', emoji: '🥛', price: 55, unit: 'per litre', stock: 50, category: 'grocery', isActive: true, createdAt: '2026-03-01T09:00:00.000Z' },
    { id: 'pr3', shopId: 'sh1', name: 'डबल रोटी (Bread)', emoji: '🍞', price: 35, unit: 'per loaf', stock: 30, category: 'grocery', isActive: true, createdAt: '2026-03-01T09:00:00.000Z' },
    { id: 'pr4', shopId: 'sh1', name: 'आलू (Potato)', emoji: '🥔', price: 40, unit: 'per kg', stock: 100, category: 'grocery', isActive: true, createdAt: '2026-03-01T09:00:00.000Z' },
    { id: 'pr5', shopId: 'sh1', name: 'टमाटर (Tomato)', emoji: '🍅', price: 35, unit: 'per kg', stock: 80, category: 'grocery', isActive: true, createdAt: '2026-03-01T09:00:00.000Z' },
    { id: 'pr6', shopId: 'sh2', name: 'Men T-Shirt', emoji: '👕', price: 599, unit: 'pcs', stock: 40, category: 'fashion', isActive: true, createdAt: '2026-03-02T10:00:00.000Z' },
    { id: 'pr9', shopId: 'sh4', name: 'Paracetamol 500mg', emoji: '💊', price: 25, unit: 'strip', stock: 200, category: 'medical', isActive: true, createdAt: '2026-03-03T11:00:00.000Z' },
  ],
  deliveryPartners: [
    { id: 'dp1', name: 'Raju Yadav', phone: '9500000001', avatar: 'R', isOnline: true, isAvailable: true, activeOrders: 0, totalDeliveries: 234, todayDeliveries: 3, todayEarnings: 180, totalEarnings: 14200, rating: 4.7, city: 'Betul', status: 'active', createdAt: '2026-02-01T00:00:00.000Z' },
    { id: 'dp2', name: 'Sonu Patel', phone: '9500000002', avatar: 'S', isOnline: true, isAvailable: false, activeOrders: 1, totalDeliveries: 189, todayDeliveries: 5, todayEarnings: 300, totalEarnings: 11300, rating: 4.5, city: 'Betul', status: 'active', createdAt: '2026-02-05T00:00:00.000Z' },
    { id: 'dp3', name: 'Dinesh Kumar', phone: '9500000003', avatar: 'D', isOnline: false, isAvailable: false, activeOrders: 0, totalDeliveries: 97, todayDeliveries: 0, todayEarnings: 0, totalEarnings: 5820, rating: 4.3, city: 'Betul', status: 'active', createdAt: '2026-02-15T00:00:00.000Z' },
    { id: 'dp4', name: 'Amit Singh', phone: '9500000004', avatar: 'A', isOnline: true, isAvailable: true, activeOrders: 0, totalDeliveries: 312, todayDeliveries: 6, todayEarnings: 360, totalEarnings: 18700, rating: 4.8, city: 'Betul', status: 'active', createdAt: '2026-01-20T00:00:00.000Z' },
  ],
  orders: [
    { id: 'o1', userId: 'u1', userName: 'Ramesh Kumar', phone: '9876543210', shopId: 'sh1', items: [{ id: 'pr1', name: 'अंडे', emoji: '🥚', price: 8, quantity: 6, unit: 'pcs' }, { id: 'pr2', name: 'दूध', emoji: '🥛', price: 55, quantity: 1, unit: 'litre' }], total: 103, commission: 10, shopEarning: 93, deliveryFee: 30, deliveryBoyId: 'dp1', deliveryBoyName: 'Raju Yadav', promoDiscount: 0, address: 'MIG Colony, Sector 4, Betul', slot: 'सुबह 7-9 बजे', payment: 'cod', status: 'delivered', category: 'essentials', createdAt: '2026-03-05T05:30:00.000Z' },
    { id: 'o2', userId: 'u2', userName: 'Priya Singh', phone: '8765432109', shopId: 'sh1', items: [{ id: 'pr3', name: 'डबल रोटी', emoji: '🍞', price: 35, quantity: 2, unit: 'loaf' }], total: 130, commission: 13, shopEarning: 117, deliveryFee: 30, deliveryBoyId: 'dp2', deliveryBoyName: 'Sonu Patel', promoDiscount: 13, address: 'Station Road, Betul', slot: 'सुबह 10-12 बजे', payment: 'upi', status: 'dispatched', category: 'essentials', createdAt: '2026-03-05T06:00:00.000Z' },
    { id: 'o4', userId: 'u6', userName: 'Vikas Sharma', phone: '4321098765', shopId: 'sh1', items: [{ id: 'pr4', name: 'आलू', emoji: '🥔', price: 40, quantity: 2, unit: 'kg' }], total: 115, commission: 12, shopEarning: 103, deliveryFee: 30, deliveryBoyId: null, deliveryBoyName: null, promoDiscount: 0, address: 'Sarni Road, Betul', slot: 'सुबह 7-9 बजे', payment: 'cod', status: 'accepted', category: 'essentials', createdAt: '2026-03-05T09:00:00.000Z' },
  ],
  notifications: [
    { id: 'n7', type: 'delivery', icon: '🚴', title: 'New order assigned!', body: 'Order from Priya Singh — ₹130', time: '2026-03-05T06:00:00.000Z', read: false, forAdmin: false, userId: 'u2' },
  ],
  promoCodes: [
    { code: 'BETUL10', discount: 10, type: 'percent', label: '10% OFF', active: true, usageCount: 45 },
  ],
  settings: { appName: 'Apna Betul', deliveryFeeDefault: 30, freeDeliveryThreshold: 200, commissionRate: 10, maintenanceMode: false },
};

const init = () => {
  if (!store.get('initialised')) {
    Object.entries(SEED).forEach(([k, v]) => store.set(k, v));
    store.set('initialised', true);
  }
};

// ── USERS ──
export const getUsers = () => { init(); return store.get('users') || []; };
export const getUserById = (id) => getUsers().find(u => u.id === id);
export const getUserByPhone = (phone) => getUsers().find(u => u.phone === phone);

// ── SHOPS ──
export const getShops = () => { init(); return store.get('shops') || []; };
export const getShopById = (id) => getShops().find(s => s.id === id);

// ── SHOPKEEPERS ──
export const getShopkeepers = () => { init(); return store.get('shopkeepers') || []; };
export const getShopkeeperByPhone = (phone) => getShopkeepers().find(sk => sk.phone === phone);
export const getShopkeeperById = (id) => getShopkeepers().find(sk => sk.id === id);
export const saveShopkeeper = (skData) => {
  init();
  const keepers = getShopkeepers();
  const idx = keepers.findIndex(sk => sk.id === skData.id);
  if (idx >= 0) keepers[idx] = { ...keepers[idx], ...skData };
  else keepers.push({ ...skData, id: 'sk' + uid(), status: 'pending', createdAt: now(), avatar: (skData.name || 'S')[0].toUpperCase() });
  store.set('shopkeepers', keepers);
  return store.get('shopkeepers').find(sk => sk.id === skData.id || sk.phone === skData.phone);
};

// ── PRODUCTS ──
export const getProducts = (shopId = null) => {
  init();
  const products = store.get('products') || [];
  return shopId ? products.filter(p => p.shopId === shopId) : products;
};

// ── DELIVERY PARTNERS ──
export const getDeliveryPartners = (onlineOnly = false) => {
  init();
  const dps = store.get('deliveryPartners') || [];
  return onlineOnly ? dps.filter(dp => dp.isOnline && dp.status === 'active') : dps;
};
export const getDeliveryPartnerByPhone = (phone) => getDeliveryPartners().find(dp => dp.phone === phone);
export const getDeliveryPartnerById = (id) => getDeliveryPartners().find(dp => dp.id === id);
export const saveDeliveryPartner = (dpData) => {
  init();
  const dps = getDeliveryPartners();
  const idx = dps.findIndex(dp => dp.id === dpData.id);
  if (idx >= 0) dps[idx] = { ...dps[idx], ...dpData };
  else {
    dps.push({
      ...dpData,
      id: 'dp' + uid(), isOnline: false, isAvailable: true, activeOrders: 0,
      totalDeliveries: 0, todayDeliveries: 0, todayEarnings: 0, totalEarnings: 0,
      rating: 5.0, status: 'pending', createdAt: now(), avatar: (dpData.name || 'D')[0].toUpperCase(),
    });
  }
  store.set('deliveryPartners', dps);
  return store.get('deliveryPartners').find(dp => dp.id === dpData.id || dp.phone === dpData.phone);
};
export const setDeliveryPartnerOnline = (id, isOnline) => {
  store.set('deliveryPartners', getDeliveryPartners().map(dp =>
    dp.id === id ? { ...dp, isOnline, isAvailable: isOnline } : dp));
};

// ── ORDERS ──
export const getOrders = (filters = {}) => {
  init();
  let orders = store.get('orders') || [];
  if (filters.userId) orders = orders.filter(o => o.userId === filters.userId);
  if (filters.shopId) orders = orders.filter(o => o.shopId === filters.shopId);
  if (filters.deliveryBoyId) orders = orders.filter(o => o.deliveryBoyId === filters.deliveryBoyId);
  if (filters.status) orders = orders.filter(o => o.status === filters.status);
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const updateOrderStatus = (id, status) => {
  const allOrders = store.get('orders') || [];
  const updated = allOrders.map(o => o.id === id ? { ...o, status, updatedAt: now() } : o);
  store.set('orders', updated);
  const order = updated.find(o => o.id === id);
  if (order && status === 'delivered') {
    store.set('shops', getShops().map(s => s.id === order.shopId
      ? { ...s, totalOrders: (s.totalOrders || 0) + 1, totalEarnings: (s.totalEarnings || 0) + (order.shopEarning || 0) }
      : s));
    if (order.deliveryBoyId) {
      store.set('deliveryPartners', getDeliveryPartners().map(dp => dp.id === order.deliveryBoyId
        ? {
          ...dp,
          activeOrders: Math.max(0, dp.activeOrders - 1),
          isAvailable: true,
          totalDeliveries: dp.totalDeliveries + 1,
          todayDeliveries: dp.todayDeliveries + 1,
          todayEarnings: dp.todayEarnings + (order.deliveryFee || 30),
          totalEarnings: dp.totalEarnings + (order.deliveryFee || 30),
        } : dp));
    }
  }
};

// ── NOTIFICATIONS ──
export const getNotifications = (forAdmin = false, userId = null, shopId = null) => {
  init();
  const notifs = store.get('notifications') || [];
  if (forAdmin) return notifs.filter(n => n.forAdmin);
  if (shopId) return notifs.filter(n => n.forShop && n.shopId === shopId);
  if (userId) return notifs.filter(n => !n.forAdmin && !n.forShop && n.userId === userId);
  return notifs;
};
export const addNotification = (notifData) => {
  init();
  const notifs = store.get('notifications') || [];
  notifs.unshift({ ...notifData, id: 'n' + uid(), time: now(), read: false });
  store.set('notifications', notifs.slice(0, 100));
};

// ── PROMO / SETTINGS ──
export const getPromoCodes = () => { init(); return store.get('promoCodes') || []; };
export const getSettings = () => { init(); return store.get('settings') || SEED.settings; };
export const saveSettings = (data) => { store.set('settings', { ...getSettings(), ...data }); };
