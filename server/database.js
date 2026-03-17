/* ==========================================================
   DATABASE MODULE — SQLite (Source of Truth)
   ========================================================== */
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, "wallet.db"));

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/* ==========================================================
   SCHEMA INITIALIZATION
   ========================================================== */
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    role        TEXT    NOT NULL CHECK(role IN ('agent','cashier','admin')),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cards (
    uid           TEXT    PRIMARY KEY,
    card_holder   TEXT    NOT NULL,
    balance       INTEGER NOT NULL DEFAULT 0,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    price     INTEGER NOT NULL,
    category  TEXT    NOT NULL DEFAULT 'General',
    active    INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    uid             TEXT    NOT NULL,
    type            TEXT    NOT NULL CHECK(type IN ('TOPUP','PAYMENT')),
    amount          INTEGER NOT NULL,
    balance_before  INTEGER NOT NULL,
    balance_after   INTEGER NOT NULL,
    product_id      INTEGER,
    product_name    TEXT,
    quantity        INTEGER,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES cards(uid)
  );
`);

/* ==========================================================
   PREPARED STATEMENTS
   ========================================================== */
const stmts = {
  // Users
  getUser: db.prepare("SELECT * FROM users WHERE username = ?"),
  createUser: db.prepare(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
  ),

  // Cards
  getCard: db.prepare("SELECT * FROM cards WHERE uid = ?"),
  getAllCards: db.prepare(
    "SELECT uid, card_holder, balance, registered_at FROM cards ORDER BY registered_at DESC",
  ),
  registerCard: db.prepare(
    "INSERT INTO cards (uid, card_holder, balance) VALUES (?, ?, 0)",
  ),
  updateBalance: db.prepare("UPDATE cards SET balance = ? WHERE uid = ?"),

  // Products
  getProducts: db.prepare(
    "SELECT * FROM products WHERE active = 1 ORDER BY category, name",
  ),
  getProduct: db.prepare("SELECT * FROM products WHERE id = ?"),
  addProduct: db.prepare(
    "INSERT INTO products (name, price, category) VALUES (?, ?, ?)",
  ),
  updateProduct: db.prepare(
    "UPDATE products SET name = ?, price = ?, category = ? WHERE id = ?",
  ),
  deleteProduct: db.prepare("UPDATE products SET active = 0 WHERE id = ?"),

  // Transactions
  createTransaction: db.prepare(`
    INSERT INTO transactions (uid, type, amount, balance_before, balance_after, product_id, product_name, quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getAllTransactions: db.prepare(
    "SELECT * FROM transactions ORDER BY created_at DESC LIMIT 200",
  ),
  getCardTransactions: db.prepare(
    "SELECT * FROM transactions WHERE uid = ? ORDER BY created_at DESC LIMIT 50",
  ),

  // Dashboard
  totalTopupsToday: db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
    FROM transactions
    WHERE type = 'TOPUP' AND date(created_at) = date('now')
  `),
  totalPaymentsToday: db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
    FROM transactions
    WHERE type = 'PAYMENT' AND date(created_at) = date('now')
  `),
  activeCards: db.prepare("SELECT COUNT(*) AS count FROM cards"),
  totalBalance: db.prepare(
    "SELECT COALESCE(SUM(balance), 0) AS total FROM cards",
  ),
};

/* ==========================================================
   DATABASE API
   ========================================================== */

// ── Users ──
export function getUser(username) {
  return stmts.getUser.get(username);
}

export function createUser(username, password, role) {
  return stmts.createUser.run(username, password, role);
}

// ── Cards ──
export function getCard(uid) {
  return stmts.getCard.get(uid);
}

export function getAllCards() {
  return stmts.getAllCards.all();
}

export function registerCard(uid, cardHolder) {
  stmts.registerCard.run(uid, cardHolder);
  return stmts.getCard.get(uid);
}

// ── Products ──
export function getProducts() {
  return stmts.getProducts.all();
}

export function getProduct(id) {
  return stmts.getProduct.get(id);
}

export function addProduct(name, price, category) {
  const info = stmts.addProduct.run(name, price, category || "General");
  return stmts.getProduct.get(info.lastInsertRowid);
}

export function updateProduct(id, name, price, category) {
  stmts.updateProduct.run(name, price, category || "General", id);
  return stmts.getProduct.get(id);
}

export function deleteProduct(id) {
  return stmts.deleteProduct.run(id);
}

// ── Safe Wallet Operations ──

/**
 * Top-up: Increases card balance atomically.
 */
export function safeTopup(uid, amount) {
  const topupTx = db.transaction(() => {
    const card = stmts.getCard.get(uid);
    if (!card) throw new Error("Card not registered");

    const balanceBefore = card.balance;
    const balanceAfter = balanceBefore + amount;

    stmts.updateBalance.run(balanceAfter, uid);
    stmts.createTransaction.run(uid, "TOPUP", amount, balanceBefore, balanceAfter, null, null, null);

    return { card: { ...card, balance: balanceAfter }, balanceBefore, balanceAfter };
  });

  try {
    return { success: true, ...topupTx() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Payment: Deducts card balance atomically.
 */
export function safePayment(uid, productId, quantity) {
  const payTx = db.transaction(() => {
    const card = stmts.getCard.get(uid);
    if (!card) throw new Error("Card not registered");

    const product = stmts.getProduct.get(productId);
    if (!product || !product.active) throw new Error("Product not found");

    const totalCost = product.price * quantity;
    if (card.balance < totalCost)
      throw new Error(`Insufficient balance. Need ${totalCost}, have ${card.balance}`);

    const balanceBefore = card.balance;
    const balanceAfter = balanceBefore - totalCost;

    stmts.updateBalance.run(balanceAfter, uid);
    stmts.createTransaction.run(uid, "PAYMENT", totalCost, balanceBefore, balanceAfter, productId, product.name, quantity);

    return { card: { ...card, balance: balanceAfter }, product, quantity, totalCost, balanceBefore, balanceAfter };
  });

  try {
    return { success: true, ...payTx() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Cart Payment: Deducts card balance for multiple items atomically.
 * items = [{ productId, quantity }, ...]
 */
export function safeCartPayment(uid, items) {
  const cartTx = db.transaction(() => {
    const card = stmts.getCard.get(uid);
    if (!card) throw new Error("Card not registered");

    let totalCost = 0;
    const resolvedItems = [];

    for (const item of items) {
      const product = stmts.getProduct.get(item.productId);
      if (!product || !product.active) throw new Error(`Product #${item.productId} not found`);
      const lineCost = product.price * item.quantity;
      totalCost += lineCost;
      resolvedItems.push({ product, quantity: item.quantity, lineCost });
    }

    if (card.balance < totalCost)
      throw new Error(`Insufficient balance. Need ${totalCost}, have ${card.balance}`);

    const balanceBefore = card.balance;
    let runningBalance = balanceBefore;

    for (const ri of resolvedItems) {
      runningBalance -= ri.lineCost;
      stmts.createTransaction.run(uid, "PAYMENT", ri.lineCost, balanceBefore, runningBalance, ri.product.id, ri.product.name, ri.quantity);
    }

    stmts.updateBalance.run(runningBalance, uid);

    return { card: { ...card, balance: runningBalance }, items: resolvedItems, totalCost, balanceBefore, balanceAfter: runningBalance };
  });

  try {
    return { success: true, ...cartTx() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Dashboard Stats ──
export function getDashboardStats() {
  const topups = stmts.totalTopupsToday.get();
  const payments = stmts.totalPaymentsToday.get();
  const cards = stmts.activeCards.get();
  const balance = stmts.totalBalance.get();

  return {
    topupsToday: topups,
    paymentsToday: payments,
    activeCards: cards.count,
    totalBalance: balance.total,
  };
}

export function getAllTransactions() {
  return stmts.getAllTransactions.all();
}

export function getCardTransactions(uid) {
  return stmts.getCardTransactions.all(uid);
}

export default db;
