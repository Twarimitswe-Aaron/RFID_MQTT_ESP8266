/* ==========================================================
   RFID WALLET DASHBOARD — Client-Side JavaScript
   ========================================================== */
const API = `${location.protocol}//${location.hostname}:${location.port || 5000}`;
let currentUser = null;
let currentView = null;
let ws = null;
let scannedCard = null;
let products = [];
let cart = {}; // { productId: quantity }

/* ==========================================================
   AUTH
   ========================================================== */
function switchAuthTab(tab) {
  document.querySelectorAll(".auth-tab").forEach((t, i) => {
    t.classList.toggle("active", tab === "login" ? i === 0 : i === 1);
  });
  document
    .getElementById("login-form")
    .classList.toggle("hidden", tab !== "login");
  document
    .getElementById("signup-form")
    .classList.toggle("hidden", tab !== "signup");
  hideAlert();
}

function showAlert(msg, type = "error") {
  const el = document.getElementById("auth-alert");
  el.textContent = msg;
  el.className = `alert alert-${type}`;
  el.style.display = "block";
}
function hideAlert() {
  document.getElementById("auth-alert").style.display = "none";
}

async function handleLogin(e) {
  e.preventDefault();
  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("login-user").value.trim(),
        password: document.getElementById("login-pass").value,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAlert(data.error);
      return;
    }
    localStorage.setItem("user", JSON.stringify(data));
    enterApp(data);
  } catch {
    showAlert("Connection failed");
  }
  return false;
}

async function handleSignup(e) {
  e.preventDefault();
  try {
    const res = await fetch(`${API}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("signup-user").value.trim(),
        password: document.getElementById("signup-pass").value,
        role: document.getElementById("signup-role").value,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAlert(data.error);
      return;
    }
    localStorage.setItem("user", JSON.stringify(data));
    enterApp(data);
  } catch {
    showAlert("Connection failed");
  }
  return false;
}

function logout() {
  localStorage.removeItem("user");
  currentUser = null;
  if (ws) ws.close();
  document.getElementById("app-screen").classList.add("hidden");
  document.getElementById("auth-screen").classList.remove("hidden");
}

/* ==========================================================
   APP ENTRY
   ========================================================== */
function enterApp(user) {
  currentUser = user;
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("app-screen").classList.remove("hidden");
  document.getElementById("display-username").textContent = user.username;
  const rb = document.getElementById("display-role");
  rb.textContent = user.role;
  rb.style.background =
    user.role === "admin"
      ? "rgba(99,102,241,.2)"
      : user.role === "agent"
        ? "rgba(34,197,94,.2)"
        : "rgba(245,158,11,.2)";
  rb.style.color =
    user.role === "admin"
      ? "#818cf8"
      : user.role === "agent"
        ? "#4ade80"
        : "#fbbf24";
  buildSidebar(user.role);
  connectWebSocket();
  loadProducts();
  navigate(
    user.role === "agent"
      ? "topup"
      : user.role === "cashier"
        ? "payment"
        : "dashboard",
  );
}

/* ==========================================================
   SIDEBAR NAVIGATION
   ========================================================== */
const NAV = {
  dashboard: {
    label: "Dashboard",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    roles: ["admin"],
  },
  topup: {
    label: "Top-Up",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    roles: ["agent", "admin"],
  },
  payment: {
    label: "Payment",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16"/><path d="M1 10h22"/></svg>',
    roles: ["cashier", "admin"],
  },
  products: {
    label: "Products",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
    roles: ["admin"],
  },
  transactions: {
    label: "Transactions",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8"/></svg>',
    roles: ["admin"],
  },
  cards: {
    label: "Cards",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14"/><path d="M2 10h20"/></svg>',
    roles: ["admin", "agent"],
  },
};

function buildSidebar(role) {
  const nav = document.getElementById("sidebar-nav");
  nav.innerHTML = "";
  for (const [key, item] of Object.entries(NAV)) {
    if (!item.roles.includes(role)) continue;
    const d = document.createElement("div");
    d.className = "nav-item";
    d.dataset.view = key;
    d.innerHTML = `${item.icon}<span>${item.label}</span>`;
    d.onclick = () => navigate(key);
    nav.appendChild(d);
  }
}

function navigate(view) {
  currentView = view;
  scannedCard = null;
  cart = {};
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.toggle("active", n.dataset.view === view));
  renderView(view);
}

/* ==========================================================
   WEBSOCKET
   ========================================================== */
function connectWebSocket() {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(`${proto}//${location.hostname}:${location.port || 5000}`);
  ws.onopen = () => {
    const s = document.getElementById("conn-status");
    s.className = "conn-badge online";
    s.innerHTML = '<span class="dot"></span> Online';
  };
  ws.onclose = () => {
    const s = document.getElementById("conn-status");
    s.className = "conn-badge offline";
    s.innerHTML = '<span class="dot"></span> Offline';
    setTimeout(connectWebSocket, 3000);
  };
  ws.onmessage = (ev) => {
    try {
      handleWS(JSON.parse(ev.data));
    } catch {}
  };
}

function handleWS(data) {
  if (data.type === "card_scan") {
    scannedCard = data;
    if (currentView === "topup" || currentView === "payment")
      renderView(currentView);
  } else if (data.type === "topup_success" || data.type === "payment_success") {
    if (currentView === "dashboard") renderView("dashboard");
    if (currentView === "transactions") renderView("transactions");
    if (currentView === "cards") renderView("cards");
  } else if (data.type === "card_registered") {
    scannedCard = { uid: data.card.uid, registered: true, card: data.card };
    if (currentView === "topup") renderView("topup");
  }
}

/* ==========================================================
   DATA
   ========================================================== */
async function loadProducts() {
  try {
    products = await (await fetch(`${API}/api/products`)).json();
  } catch {
    products = [];
  }
}
async function fetchJSON(url) {
  return (await fetch(`${API}${url}`)).json();
}

/* ==========================================================
   VIEW ROUTER
   ========================================================== */
function renderView(v) {
  const mc = document.getElementById("main-content");
  mc.innerHTML =
    '<div class="pulse" style="text-align:center;padding:60px;color:var(--text-muted)">Loading...</div>';
  ({
    dashboard: renderDashboard,
    topup: renderTopup,
    payment: renderPayment,
    products: renderProducts,
    transactions: renderTransactions,
    cards: renderCards,
  })[v](mc);
}

/* ==========================================================
   SCAN AREA (shared by topup & payment)
   ========================================================== */
function scanAreaHTML(canRegister) {
  if (!scannedCard)
    return `<div class="scan-area">
    <div class="scan-icon">📡</div>
    <div class="scan-text">Waiting for RFID card scan...<br><small>Or enter UID manually below</small></div>
    <div style="margin-top:16px;display:flex;gap:8px;max-width:360px;margin-left:auto;margin-right:auto">
      <input type="text" id="manual-uid" placeholder="Enter UID" style="flex:1;padding:8px 12px;background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);font-family:monospace"/>
      <button class="btn btn-primary btn-sm" onclick="manualLookup()">Lookup</button>
    </div></div>`;

  if (!scannedCard.registered) {
    const reg = canRegister
      ? `<div style="margin-top:16px">
      <div class="alert alert-warning" style="display:block">⚠️ Card not registered in database</div>
      <div class="form-group"><label>Card Holder Name</label><input type="text" id="reg-holder" placeholder="Enter name"/></div>
      <button class="btn btn-success btn-sm" onclick="registerNewCard()">Register Card</button></div>`
      : '<div class="alert alert-warning" style="display:block;margin-top:16px">⚠️ Card not registered — ask an Agent to register it first.</div>';
    return `<div class="scan-area scanned">
      <div class="scan-icon">🔍</div>
      <div class="scanned-uid">${scannedCard.uid}</div>
      <div class="scan-text" style="color:var(--danger)">Unknown Card</div>${reg}</div>`;
  }

  const c = scannedCard.card;
  return `<div class="scan-area scanned">
    <div class="scan-icon">✅</div>
    <div class="scanned-uid">${c.uid}</div>
    <div class="scanned-holder">👤 ${c.card_holder}</div>
    <div class="scanned-balance">Balance: $${c.balance.toLocaleString()}</div></div>`;
}

async function manualLookup() {
  const uid = document.getElementById("manual-uid").value.trim();
  if (!uid) return;
  try {
    const res = await fetch(`${API}/api/cards/${uid}`);
    scannedCard = res.ok
      ? { uid, registered: true, card: await res.json() }
      : { uid, registered: false, card: null };
    renderView(currentView);
  } catch {}
}

async function registerNewCard() {
  const h = document.getElementById("reg-holder").value.trim();
  if (!h) return alert("Please enter a card holder name");
  try {
    const res = await fetch(`${API}/api/cards/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: scannedCard.uid, cardHolder: h }),
    });
    const data = await res.json();
    if (res.ok) {
      scannedCard = { uid: data.card.uid, registered: true, card: data.card };
      renderView(currentView);
    } else alert(data.error);
  } catch {
    alert("Failed to register");
  }
}

/* ==========================================================
   TOP-UP VIEW (Agent)
   ========================================================== */
function renderTopup(mc) {
  mc.innerHTML = `<div class="fade-in">
    <div class="page-header"><h1>💰 Top-Up Card</h1><p>Add funds to an RFID card</p></div>
    ${scanAreaHTML(true)}
    <div class="panel ${!scannedCard?.registered ? "hidden" : ""}" id="topup-panel">
      <div class="panel-header"><h3>Top-Up Amount</h3></div>
      <div class="panel-body">
        <div id="topup-result"></div>
        <div class="form-group"><label>Amount ($)</label><input type="number" id="topup-amount" placeholder="Enter amount" min="1" max="1000000"/></div>
        <button class="btn btn-success" onclick="doTopup()">⬆ Process Top-Up</button>
      </div>
    </div>
    <div class="panel"><div class="panel-header"><h3>Recent Top-Ups</h3></div>
      <div class="panel-body no-pad" id="topup-hist">Loading...</div></div></div>`;
  loadHistory("topup-hist", "TOPUP");
}

async function doTopup() {
  if (!scannedCard?.registered) return;
  const amount = parseInt(document.getElementById("topup-amount").value);
  if (!amount || amount <= 0) return alert("Enter a valid amount");
  const rd = document.getElementById("topup-result");
  try {
    const res = await fetch(`${API}/topup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: scannedCard.uid, amount }),
    });
    const data = await res.json();
    if (res.ok) {
      rd.innerHTML = `<div class="alert alert-success" style="display:block">✅ Added <strong>$${amount.toLocaleString()}</strong> — New Balance: <strong>$${data.balanceAfter.toLocaleString()}</strong></div>`;
      scannedCard.card.balance = data.balanceAfter;
      document.getElementById("topup-amount").value = "";
      loadHistory("topup-hist", "TOPUP");
    } else
      rd.innerHTML = `<div class="alert alert-error" style="display:block">❌ ${data.error}</div>`;
  } catch {
    rd.innerHTML = `<div class="alert alert-error" style="display:block">❌ Connection failed</div>`;
  }
}

/* ==========================================================
   PAYMENT VIEW (Cashier) — Multi-select products, then tap card
   ========================================================== */
function getCartItems() {
  return Object.entries(cart)
    .map(([id, qty]) => {
      const p = products.find((x) => x.id === parseInt(id));
      return p ? { product: p, quantity: qty, lineCost: p.price * qty } : null;
    })
    .filter(Boolean);
}
function getCartTotal() {
  return getCartItems().reduce((sum, i) => sum + i.lineCost, 0);
}

function renderPayment(mc) {
  const cartItems = getCartItems();
  const totalCost = getCartTotal();
  const hasSelection = cartItems.length > 0;
  const canPay =
    hasSelection &&
    scannedCard?.registered &&
    scannedCard.card.balance >= totalCost;
  const insufficient =
    hasSelection &&
    scannedCard?.registered &&
    scannedCard.card.balance < totalCost;

  const productCards = products
    .map((p) => {
      const inCart = cart[p.id] > 0;
      return `<div class="product-card ${inCart ? "selected" : ""}" onclick="toggleProduct(${p.id})">
      <div class="prod-check">✓</div>
      <div class="prod-name">${p.name}</div>
      <div class="prod-price">$${p.price.toLocaleString()}</div>
      <div class="prod-cat">${p.category}</div>
    </div>`;
    })
    .join("");

  // Cart summary with per-item qty controls
  let cartSummary = "";
  if (hasSelection) {
    const rows = cartItems
      .map(
        (
          i,
        ) => `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="flex:1;font-weight:500">${i.product.name}</div>
      <div style="color:var(--text-muted);font-size:.8rem">$${i.product.price.toLocaleString()} each</div>
      <input type="number" value="${i.quantity}" min="1" max="100" style="width:60px;padding:4px 8px;background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);text-align:center" onchange="setCartQty(${i.product.id}, this.value)"/>
      <div style="width:80px;text-align:right;font-weight:600;color:var(--accent)">$${i.lineCost.toLocaleString()}</div>
      <button class="btn btn-danger btn-sm" style="padding:4px 8px" onclick="toggleProduct(${i.product.id})">✕</button>
    </div>`,
      )
      .join("");

    cartSummary = `<div style="margin-top:16px">
      <div style="font-size:.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Cart (${cartItems.length} items)</div>
      ${rows}
      <div style="display:flex;justify-content:space-between;padding:12px 0;font-weight:700;font-size:1.2rem">
        <span>Total</span><span style="color:var(--accent)">$${totalCost.toLocaleString()}</span>
      </div>
    </div>`;
  }

  mc.innerHTML = `<div class="fade-in">
    <div class="page-header"><h1>🛒 Payment</h1><p>Select products (click to toggle), then tap the customer's card</p></div>

    <div class="panel">
      <div class="panel-header"><h3>Step 1 — Select Products</h3></div>
      <div class="panel-body">
        <div class="product-grid">${productCards}</div>
        ${hasSelection ? cartSummary : '<p style="color:var(--text-muted)">👆 Tap products above to add them to the cart</p>'}
      </div>
    </div>

    ${
      hasSelection
        ? `<div class="panel">
      <div class="panel-header"><h3>Step 2 — Tap Customer's Card</h3></div>
      <div class="panel-body">
        ${scanAreaHTML(false)}
        ${
          scannedCard?.registered
            ? `<div class="balance-display">
          <div class="balance-label">Card Balance</div>
          <div class="balance-value" style="color:${insufficient ? "var(--danger)" : "var(--success)"}">$${scannedCard.card.balance.toLocaleString()}</div>
          <div class="balance-holder">👤 ${scannedCard.card.card_holder}</div>
          ${insufficient ? '<div style="color:var(--danger);margin-top:8px;font-size:.85rem">⚠️ Insufficient balance — need $' + totalCost.toLocaleString() + "</div>" : ""}
        </div>`
            : ""
        }
      </div>
    </div>`
        : ""
    }

    ${
      canPay
        ? `<div class="panel">
      <div class="panel-header"><h3>Step 3 — Confirm Payment</h3></div>
      <div class="panel-body">
        <div id="pay-result"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          <div style="padding:12px;background:var(--bg-input);border:1px solid var(--border)">
            <div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px">Items</div>
            <div style="font-weight:600">${cartItems.map((i) => i.product.name + "×" + i.quantity).join(", ")}</div>
          </div>
          <div style="padding:12px;background:var(--bg-input);border:1px solid var(--border)">
            <div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px">Total</div>
            <div style="font-weight:700;font-size:1.2rem;color:var(--accent)">$${totalCost.toLocaleString()}</div>
          </div>
          <div style="padding:12px;background:var(--bg-input);border:1px solid var(--border)">
            <div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px">Card Balance</div>
            <div style="font-weight:600;color:var(--success)">$${scannedCard.card.balance.toLocaleString()}</div>
          </div>
          <div style="padding:12px;background:var(--bg-input);border:1px solid var(--border)">
            <div style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px">Remaining After</div>
            <div style="font-weight:600;color:var(--warning)">$${(scannedCard.card.balance - totalCost).toLocaleString()}</div>
          </div>
        </div>
        <button class="btn btn-primary" onclick="doPay()">💳 Confirm & Pay</button>
      </div>
    </div>`
        : ""
    }

    <div id="receipt-container"></div>
  </div>`;
}

function toggleProduct(id) {
  if (cart[id]) {
    delete cart[id];
  } else {
    cart[id] = 1;
  }
  renderView("payment");
}

function setCartQty(id, val) {
  const q = Math.max(1, parseInt(val) || 1);
  cart[id] = q;
  renderView("payment");
}

async function doPay() {
  const cartItems = getCartItems();
  if (!scannedCard?.registered || !cartItems.length) return;
  const rd = document.getElementById("pay-result");
  const items = cartItems.map((i) => ({
    productId: i.product.id,
    quantity: i.quantity,
  }));
  try {
    const res = await fetch(`${API}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: scannedCard.uid, items }),
    });
    const data = await res.json();
    if (res.ok && data.status === "approved") {
      rd.innerHTML = `<div class="alert alert-success" style="display:block">
        ✅ Payment Approved! <strong>$${data.totalCost.toLocaleString()}</strong><br>
        Remaining Balance: <strong>$${data.balanceAfter.toLocaleString()}</strong></div>`;
      scannedCard.card.balance = data.balanceAfter;
      showReceipt(data);
      cart = {};
    } else {
      rd.innerHTML = `<div class="alert alert-error" style="display:block">❌ Declined: ${data.error}</div>`;
    }
  } catch {
    rd.innerHTML = `<div class="alert alert-error" style="display:block">❌ Connection failed</div>`;
  }
}

function showReceipt(d) {
  const itemRows = d.items
    .map(
      (i) =>
        `<div class="receipt-row"><span>${i.name} × ${i.quantity}</span><span>$${i.lineCost.toLocaleString()}</span></div>`,
    )
    .join("");
  document.getElementById("receipt-container").innerHTML =
    `<div class="receipt fade-in" style="display:block">
    <h3>🧾 Payment Receipt</h3><hr/>
    <div class="receipt-row"><span>Card:</span><span style="font-family:monospace">${d.uid}</span></div>
    <div class="receipt-row"><span>Holder:</span><span>${d.card.card_holder}</span></div><hr/>
    ${itemRows}<hr/>
    <div class="receipt-row receipt-total"><span>Total:</span><span>$${d.totalCost.toLocaleString()}</span></div>
    <div class="receipt-row"><span>Prev Balance:</span><span>$${d.balanceBefore.toLocaleString()}</span></div>
    <div class="receipt-row"><span>Remaining:</span><span style="color:green">$${d.balanceAfter.toLocaleString()}</span></div><hr/>
    <div class="receipt-footer">${new Date().toLocaleString()}<br>Team: 1nt3rn4l_53rv3r_3rr0r<br>
      <button class="btn btn-outline btn-sm" style="margin-top:8px;color:#333;border-color:#ccc" onclick="window.print()">🖨 Print</button>
    </div></div>`;
}

/* ==========================================================
   DASHBOARD VIEW (Admin)
   ========================================================== */
async function renderDashboard(mc) {
  mc.innerHTML = `<div class="fade-in">
    <div class="page-header"><h1>📊 Dashboard</h1><p>System overview and analytics</p></div>
    <div class="stats-grid" id="stats-grid">
      <div class="stat-card topup"><div class="stat-label">Top-Ups Today</div><div class="stat-value pulse">—</div></div>
      <div class="stat-card payment"><div class="stat-label">Payments Today</div><div class="stat-value pulse">—</div></div>
      <div class="stat-card cards"><div class="stat-label">Active Cards</div><div class="stat-value pulse">—</div></div>
      <div class="stat-card balance"><div class="stat-label">Total Balance</div><div class="stat-value pulse">—</div></div>
    </div>
    <div class="panel"><div class="panel-header"><h3>Recent Transactions</h3></div>
      <div class="panel-body no-pad" id="dash-tx">Loading...</div></div></div>`;
  try {
    const [stats, txs] = await Promise.all([
      fetchJSON("/api/dashboard"),
      fetchJSON("/api/transactions"),
    ]);
    document.getElementById("stats-grid").innerHTML = `
      <div class="stat-card topup"><div class="stat-label">Top-Ups Today</div><div class="stat-value">$${stats.topupsToday.total.toLocaleString()}</div><div class="stat-sub">${stats.topupsToday.count} transactions</div></div>
      <div class="stat-card payment"><div class="stat-label">Payments Today</div><div class="stat-value">$${stats.paymentsToday.total.toLocaleString()}</div><div class="stat-sub">${stats.paymentsToday.count} transactions</div></div>
      <div class="stat-card cards"><div class="stat-label">Active Cards</div><div class="stat-value">${stats.activeCards}</div><div class="stat-sub">Registered cards</div></div>
      <div class="stat-card balance"><div class="stat-label">Total Balance</div><div class="stat-value">$${stats.totalBalance.toLocaleString()}</div><div class="stat-sub">Across all cards</div></div>`;
    renderTxTable("dash-tx", txs.slice(0, 15));
  } catch {}
}

function renderTxTable(id, txs) {
  const el = document.getElementById(id);
  if (!txs.length) {
    el.innerHTML =
      '<p style="padding:20px;color:var(--text-muted);text-align:center">No transactions yet</p>';
    return;
  }
  el.innerHTML = `<table class="data-table"><thead><tr>
    <th>Time</th><th>Type</th><th>Card UID</th><th>Details</th><th>Amount</th><th>Balance After</th>
  </tr></thead><tbody>${txs
    .map(
      (t) => `<tr>
    <td>${new Date(t.created_at).toLocaleString()}</td>
    <td><span class="badge badge-${t.type.toLowerCase()}">${t.type}</span></td>
    <td style="font-family:monospace">${t.uid}</td>
    <td>${t.product_name ? `${t.product_name} × ${t.quantity}` : "—"}</td>
    <td style="color:${t.type === "TOPUP" ? "var(--success)" : "var(--danger)"}">${t.type === "TOPUP" ? "+" : "-"}$${t.amount.toLocaleString()}</td>
    <td>$${t.balance_after.toLocaleString()}</td></tr>`,
    )
    .join("")}</tbody></table>`;
}

/* ==========================================================
   PRODUCTS VIEW (Admin CRUD)
   ========================================================== */
async function renderProducts(mc) {
  mc.innerHTML = `<div class="fade-in">
    <div class="page-header"><h1>📦 Products</h1><p>Manage products and services</p></div>
    <div class="panel"><div class="panel-header"><h3>Add New Product</h3></div>
      <div class="panel-body">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:12px;align-items:end">
          <div class="form-group" style="margin:0"><label>Name</label><input type="text" id="prod-name" placeholder="Name"/></div>
          <div class="form-group" style="margin:0"><label>Price ($)</label><input type="number" id="prod-price" placeholder="Price" min="1"/></div>
          <div class="form-group" style="margin:0"><label>Category</label><input type="text" id="prod-cat" value="General" placeholder="Category"/></div>
          <button class="btn btn-success btn-sm" onclick="addProd()">+ Add</button>
        </div></div></div>
    <div class="panel"><div class="panel-header"><h3>All Products</h3></div>
      <div class="panel-body no-pad" id="prod-body">Loading...</div></div></div>`;
  await loadProducts();
  renderProdTable();
}

function renderProdTable() {
  const el = document.getElementById("prod-body");
  if (!products.length) {
    el.innerHTML =
      '<p style="padding:20px;color:var(--text-muted);text-align:center">No products</p>';
    return;
  }
  el.innerHTML = `<table class="data-table"><thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Category</th><th>Actions</th></tr></thead><tbody>${products
    .map(
      (p) => `<tr>
    <td>${p.id}</td>
    <td><input value="${p.name}" id="en-${p.id}" style="background:transparent;border:1px solid transparent;color:var(--text-primary);padding:4px 8px;width:100%" onfocus="this.style.borderColor='var(--border)'"/></td>
    <td><input type="number" value="${p.price}" id="ep-${p.id}" style="background:transparent;border:1px solid transparent;color:var(--text-primary);padding:4px 8px;width:90px" onfocus="this.style.borderColor='var(--border)'"/></td>
    <td><input value="${p.category}" id="ec-${p.id}" style="background:transparent;border:1px solid transparent;color:var(--text-primary);padding:4px 8px;width:100%" onfocus="this.style.borderColor='var(--border)'"/></td>
    <td><div class="inline-actions"><button class="btn btn-primary btn-sm" onclick="saveProd(${p.id})">Save</button><button class="btn btn-danger btn-sm" onclick="delProd(${p.id})">Delete</button></div></td>
  </tr>`,
    )
    .join("")}</tbody></table>`;
}

async function addProd() {
  const n = document.getElementById("prod-name").value.trim(),
    p = parseInt(document.getElementById("prod-price").value),
    c = document.getElementById("prod-cat").value.trim();
  if (!n || !p) return alert("Name and price required");
  await fetch(`${API}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: n, price: p, category: c }),
  });
  await loadProducts();
  renderProdTable();
  document.getElementById("prod-name").value = "";
  document.getElementById("prod-price").value = "";
}

async function saveProd(id) {
  const n = document.getElementById(`en-${id}`).value.trim(),
    p = parseInt(document.getElementById(`ep-${id}`).value),
    c = document.getElementById(`ec-${id}`).value.trim();
  if (!n || !p) return;
  await fetch(`${API}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: n, price: p, category: c }),
  });
  await loadProducts();
  renderProdTable();
}

async function delProd(id) {
  if (!confirm("Delete this product?")) return;
  await fetch(`${API}/api/products/${id}`, { method: "DELETE" });
  await loadProducts();
  renderProdTable();
}

/* ==========================================================
   TRANSACTIONS & CARDS VIEWS
   ========================================================== */
async function renderTransactions(mc) {
  mc.innerHTML = `<div class="fade-in"><div class="page-header"><h1>📋 Transaction History</h1><p>Complete ledger</p></div>
    <div class="panel"><div class="panel-header"><h3>All Transactions</h3></div>
      <div class="panel-body no-pad" id="all-tx">Loading...</div></div></div>`;
  renderTxTable("all-tx", await fetchJSON("/api/transactions"));
}

async function renderCards(mc) {
  mc.innerHTML = `<div class="fade-in"><div class="page-header"><h1>💳 Registered Cards</h1><p>All RFID cards</p></div>
    <div class="panel"><div class="panel-header"><h3>Cards</h3></div>
      <div class="panel-body no-pad" id="cards-body">Loading...</div></div></div>`;
  const cards = await fetchJSON("/api/cards");
  const el = document.getElementById("cards-body");
  if (!cards.length) {
    el.innerHTML =
      '<p style="padding:20px;color:var(--text-muted);text-align:center">No cards</p>';
    return;
  }
  el.innerHTML = `<table class="data-table"><thead><tr><th>UID</th><th>Card Holder</th><th>Balance</th><th>Registered</th></tr></thead><tbody>${cards
    .map(
      (c) => `<tr>
    <td style="font-family:monospace">${c.uid}</td><td>${c.card_holder}</td>
    <td style="font-weight:600;color:var(--success)">$${c.balance.toLocaleString()}</td>
    <td>${new Date(c.registered_at).toLocaleString()}</td></tr>`,
    )
    .join("")}</tbody></table>`;
}

/* ==========================================================
   HISTORY HELPER
   ========================================================== */
async function loadHistory(containerId, type) {
  try {
    const txs = (await fetchJSON("/api/transactions"))
      .filter((t) => t.type === type)
      .slice(0, 20);
    const el = document.getElementById(containerId);
    if (!txs.length) {
      el.innerHTML =
        '<p style="padding:20px;color:var(--text-muted);text-align:center">No records yet</p>';
      return;
    }
    el.innerHTML = `<table class="data-table"><thead><tr><th>Time</th><th>Card UID</th><th>Amount</th><th>Balance After</th></tr></thead><tbody>${txs
      .map(
        (t) => `<tr>
      <td>${new Date(t.created_at).toLocaleString()}</td><td style="font-family:monospace">${t.uid}</td>
      <td style="color:${type === "TOPUP" ? "var(--success)" : "var(--danger)"}">$${t.amount.toLocaleString()}</td>
      <td>$${t.balance_after.toLocaleString()}</td></tr>`,
      )
      .join("")}</tbody></table>`;
  } catch {}
}

/* ==========================================================
   INIT
   ========================================================== */
(function () {
  const s = localStorage.getItem("user");
  if (s) {
    try {
      const u = JSON.parse(s);
      if (u.username && u.role) {
        enterApp(u);
        return;
      }
    } catch {}
  }
  document.getElementById("auth-screen").classList.remove("hidden");
})();
