// ============================================================
//  AE Tracker · Supabase Database
// ============================================================
//  1. Replace SUPABASE_URL and SUPABASE_ANON_KEY below.
//  2. Run supabase/migrations/001_schema.sql in your Supabase
//     SQL Editor, then supabase/seed.sql.
//  3. That's it — no build step, no CDN scripts needed.
// ============================================================

const SUPABASE_URL = 'https://nznokjwlekpvuqwsmfgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_w4oabGxjBUS2z10Q5y2Oag_WYtXcayk';

const FIELD_MAP = {
  courierId: 'courier_id',
  nextOrderId: 'next_order_id',
  adminName: 'admin_name',
  adminPasscode: 'admin_passcode',
  courier_id: 'courierId',
  next_order_id: 'nextOrderId',
  admin_name: 'adminName',
  admin_passcode: 'adminPasscode',
};

function toSnake(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[FIELD_MAP[k] || k] = v;
  }
  return out;
}

function toCamel(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && typeof v === 'object' && !(v instanceof Date)) {
      out[FIELD_MAP[k] || k] = toCamel(v);
    } else {
      out[FIELD_MAP[k] || k] = v;
    }
  }
  return out;
}

const DB = {
  ready: null,

  KEYS: {
    orders: 'ae_orders',
    customers: 'ae_customers',
    couriers: 'ae_couriers',
    payments: 'ae_payment_methods',
    settings: 'ae_settings',
    session: 'ae_session',
  },

  _headers() {
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
  },

  async _get(table, params = {}) {
    const q = new URLSearchParams({ select: '*', ...params });
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${q}`, { headers: this._headers() });
    if (!res.ok) throw new Error(`GET ${table} [${res.status}] ${await res.text()}`);
    return res.json();
  },

  async _post(table, rows) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST', headers: this._headers(), body: JSON.stringify(rows),
    });
    if (!res.ok) throw new Error(`POST ${table} [${res.status}] ${await res.text()}`);
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : null;
  },

  async _patch(table, id, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH', headers: this._headers(), body: JSON.stringify(body),
    });
    if (!res.ok && res.status !== 204) throw new Error(`PATCH ${table} [${res.status}] ${await res.text()}`);
  },

  async _delete(table, id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE', headers: this._headers(),
    });
    if (!res.ok && res.status !== 204) throw new Error(`DELETE ${table} [${res.status}] ${await res.text()}`);
  },

  async _replace(table, list, transform) {
    const existing = await this._get(table, { select: 'id' });
    for (const item of existing) await this._delete(table, item.id);
    if (list.length) await this._post(table, list.map(transform || (x => x)));
  },

  // ── Session (localStorage) ─────────────────────────────────
  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.session)) || null; } catch { return null; }
  },
  login(u) { localStorage.setItem(this.KEYS.session, JSON.stringify(u)); },
  logout() { localStorage.removeItem(this.KEYS.session); },

  // ── Seed ───────────────────────────────────────────────────
  async seed() {
    try {
      const check = await this._get('orders', { select: 'id', limit: '1' });
      if (check.length > 0) return;
    } catch {
      // table may not exist yet
    }

    const couriers = [
      { id: 1, name: "S'busiso", phone: '265 888 000 001', active: true, passcode: '0000' },
      { id: 2, name: 'Praise', phone: '265 888 000 002', active: true, passcode: '0000' },
      { id: 3, name: 'Peter Kalua', phone: '265 888 000 003', active: true, passcode: '0000' },
    ];
    await this._post('couriers', couriers).catch(() => {});

    await this._post('payment_methods', [
      { name: 'Mobile Money' }, { name: 'Cash' }, { name: 'Bank Transfer' },
    ]).catch(() => {});

    const orders = [
      { id: 1, date: '2026-04-07', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Mobile Money', courierId: 1, amount: 2100, status: 'delivered', notes: '' },
      { id: 2, date: '2026-04-08', customer: 'Unknown', phone: '265 885 390 222', location: 'Campus', payment: 'Mobile Money', courierId: 1, amount: 800, status: 'delivered', notes: '' },
      { id: 3, date: '2026-04-08', customer: 'Catherine Mkamanga', phone: '265 885 390 222', location: 'Campus', payment: 'Mobile Money', courierId: 1, amount: 800, status: 'delivered', notes: '' },
      { id: 4, date: '2026-04-08', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Mobile Money', courierId: 1, amount: 850, status: 'delivered', notes: '' },
      { id: 5, date: '2026-04-09', customer: 'Catherine Mkamanga', phone: '265 885 390 222', location: 'Campus', payment: 'Mobile Money', courierId: 2, amount: 900, status: 'delivered', notes: '' },
      { id: 6, date: '2026-04-10', customer: 'Catherine Mkamanga', phone: '265 885 390 222', location: 'Campus', payment: 'Mobile Money', courierId: 2, amount: 900, status: 'delivered', notes: '' },
      { id: 7, date: '2026-04-12', customer: 'Catherine Mkamanga', phone: '265 885 390 222', location: 'Campus', payment: 'Mobile Money', courierId: null, amount: 900, status: 'transit', notes: '' },
      { id: 8, date: '2026-04-13', customer: 'Catherine Mkamanga', phone: '265 885 390 222', location: 'Campus', payment: 'Mobile Money', courierId: null, amount: 900, status: 'transit', notes: '' },
      { id: 9, date: '2026-04-13', customer: 'Unknown', phone: '265 885 390 222', location: 'Campus', payment: 'Mobile Money', courierId: null, amount: 800, status: 'transit', notes: '' },
      { id: 10, date: '2026-04-14', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Cash', courierId: null, amount: 1600, status: 'pending', notes: '' },
      { id: 11, date: '2026-04-14', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Cash', courierId: null, amount: 850, status: 'pending', notes: '' },
      { id: 12, date: '2026-04-14', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Cash', courierId: null, amount: 2500, status: 'pending', notes: '' },
      { id: 13, date: '2026-04-15', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Cash', courierId: null, amount: 1700, status: 'pending', notes: '' },
      { id: 14, date: '2026-04-15', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Mobile Money', courierId: null, amount: 800, status: 'pending', notes: '' },
      { id: 15, date: '2026-04-15', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Mobile Money', courierId: null, amount: 800, status: 'pending', notes: '' },
      { id: 16, date: '2026-04-16', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Mobile Money', courierId: null, amount: 800, status: 'pending', notes: '' },
      { id: 17, date: '2026-04-17', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Mobile Money', courierId: null, amount: 800, status: 'pending', notes: '' },
      { id: 18, date: '2026-04-17', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Cash', courierId: null, amount: 800, status: 'pending', notes: '' },
      { id: 19, date: '2026-04-17', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Mobile Money', courierId: null, amount: 800, status: 'pending', notes: '' },
      { id: 20, date: '2026-04-18', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Mobile Money', courierId: null, amount: 800, status: 'pending', notes: '' },
      { id: 21, date: '2026-04-18', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Bank Transfer', courierId: null, amount: 800, status: 'pending', notes: '' },
      { id: 22, date: '2026-04-19', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Mobile Money', courierId: null, amount: 850, status: 'pending', notes: '' },
      { id: 23, date: '2026-04-20', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Mobile Money', courierId: null, amount: 800, status: 'pending', notes: '' },
      { id: 24, date: '2026-04-21', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Mobile Money', courierId: null, amount: 800, status: 'pending', notes: '' },
      { id: 25, date: '2026-04-22', customer: 'Unknown', phone: '—', location: 'Campus', payment: 'Cash', courierId: null, amount: 2400, status: 'pending', notes: '' },
    ];
    await this._post('orders', orders.map(toSnake)).catch(() => {});

    const seen = {};
    const customers = [];
    orders.forEach(o => {
      const key = o.customer !== 'Unknown' ? o.customer : (o.phone !== '—' ? o.phone : null);
      if (key && !seen[key]) {
        seen[key] = true;
        customers.push({ id: customers.length + 1, name: o.customer, phone: o.phone, location: o.location, notes: '' });
      }
    });
    if (customers.length) await this._post('customers', customers).catch(() => {});

    await this.saveSettings({ currency: 'MK', branch: 'Campus Branch', adminName: 'Admin', nextOrderId: 26, adminPasscode: '0000' }).catch(() => {});
  },

  // ── Orders ─────────────────────────────────────────────────
  async getOrders() {
    const data = await this._get('orders', { order: 'id.desc' });
    return toCamel(data || []);
  },
  async saveOrders(list) {
    await this._replace('orders', list, toSnake);
  },
  async addOrder(order) {
    const s = await this.getSettings();
    order.id = s.nextOrderId++;
    await this.saveSettings(s);
    const result = await this._post('orders', [toSnake(order)]);
    return toCamel(result?.[0]) || order;
  },
  async updateOrder(id, patch) {
    await this._patch('orders', id, toSnake(patch));
  },
  async deleteOrder(id) {
    await this._delete('orders', id);
  },

  // ── Customers ──────────────────────────────────────────────
  async getCustomers() {
    return (await this._get('customers', { order: 'name.asc' })) || [];
  },
  async saveCustomers(list) {
    await this._replace('customers', list);
  },
  async addCustomer(c) {
    const list = await this.getCustomers();
    c.id = (list.reduce((m, x) => Math.max(m, x.id), 0)) + 1;
    const result = await this._post('customers', [c]);
    return result?.[0] || c;
  },
  async updateCustomer(id, patch) {
    await this._patch('customers', id, patch);
  },
  async deleteCustomer(id) {
    await this._delete('customers', id);
  },

  // ── Couriers ───────────────────────────────────────────────
  async getCouriers() {
    return (await this._get('couriers', { order: 'name.asc' })) || [];
  },
  async saveCouriers(list) {
    await this._replace('couriers', list);
  },
  async addCourier(c) {
    const list = await this.getCouriers();
    c.id = (list.reduce((m, x) => Math.max(m, x.id), 0)) + 1;
    c.passcode = c.passcode || '0000';
    const result = await this._post('couriers', [c]);
    return result?.[0] || c;
  },
  async updateCourier(id, patch) {
    await this._patch('couriers', id, patch);
  },
  async deleteCourier(id) {
    await this._delete('couriers', id);
  },

  // ── Payment Methods ────────────────────────────────────────
  async getPayments() {
    const data = await this._get('payment_methods', { order: 'id.asc' });
    return (data || []).map(p => p.name);
  },
  async savePayments(names) {
    const existing = await this._get('payment_methods', { select: 'id' });
    for (const p of existing) await this._delete('payment_methods', p.id);
    if (names.length) await this._post('payment_methods', names.map(n => ({ name: n })));
  },

  // ── Settings ───────────────────────────────────────────────
  async getSettings() {
    const data = await this._get('settings');
    return toCamel(data?.[0]) || { currency: 'MK', branch: 'Campus Branch', adminName: 'Admin', nextOrderId: 1, adminPasscode: '0000' };
  },
  async saveSettings(s) {
    await this._patch('settings', 1, toSnake(s));
  },
};

DB.ready = DB.seed();

window.toggleSidebar = function() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show');
};

window.getInitials = function(name) {
  if (!name || name === 'Unknown') return 'UN';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
};
