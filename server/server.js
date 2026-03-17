/* ==========================================================
   CENTRAL CONFIGURATION
   ========================================================== */
const CONFIG = {
  HOST: "0.0.0.0",
  MQTT_HOST: "mqtt://157.173.101.159:1883",
  PORT: 6700,
  TEAM_ID: "1nt3rn4l_53rv3r_3rr0r",
};

/* ==========================================================
   AUTO TOPICS
   ========================================================== */
const BASE = `rfid/${CONFIG.TEAM_ID}/`;
const TOPIC_STATUS = BASE + "card/status";
const TOPIC_BALANCE = BASE + "card/balance";
const TOPIC_TOPUP = BASE + "card/topup";
const TOPIC_PAY = BASE + "card/pay";

/* ==========================================================
   IMPORT MODULES
   ========================================================== */
import express from "express";
import http from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import WebSocket, { WebSocketServer } from "ws";
import mqtt from "mqtt";
import cors from "cors";
import {
  getUser,
  createUser,
  getCard,
  getAllCards,
  registerCard,
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  safeTopup,
  safePayment,
  safeCartPayment,
  getDashboardStats,
  getAllTransactions,
  getCardTransactions,
} from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ==========================================================
   EXPRESS + HTTP + WEBSOCKET SETUP
   ========================================================== */
const app = express();
app.use(cors());
app.use(express.static(join(__dirname, "public")));
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
  ws.on("close", () => console.log("WebSocket client disconnected"));
});

/** Broadcast a message to all connected WebSocket clients */
function broadcast(type, data) {
  const msg = JSON.stringify({ type, ...data });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

/* ==========================================================
   MQTT CLIENT SETUP
   ========================================================== */
const mqttClient = mqtt.connect(CONFIG.MQTT_HOST);

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  mqttClient.subscribe([TOPIC_STATUS, TOPIC_BALANCE], (err, granted) => {
    if (err) console.error("Subscription error:", err);
    else console.log("Subscribed to topics:", granted.map((g) => g.topic).join(", "));
  });
});

mqttClient.on("error", (err) => console.error("MQTT Error:", err));

mqttClient.on("message", (topic, message) => {
  const msgStr = message.toString();
  console.log(`MQTT message received: ${topic} -> ${msgStr}`);

  try {
    const parsed = JSON.parse(msgStr);

    if (topic === TOPIC_STATUS) {
      const card = getCard(parsed.uid);
      broadcast("card_scan", {
        uid: parsed.uid,
        espBalance: parsed.balance,
        registered: !!card,
        card: card || null,
      });
    } else if (topic === TOPIC_BALANCE) {
      const card = getCard(parsed.uid);
      broadcast("balance_update", {
        uid: parsed.uid,
        newBalance: parsed.new_balance,
        card: card || null,
      });
    }
  } catch (e) {
    console.error("Failed to parse MQTT message:", e);
  }

  // Relay raw MQTT to WebSocket for legacy index.html
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN)
      client.send(JSON.stringify({ topic, message: msgStr }));
  });
});

/* ==========================================================
   AUTH ENDPOINTS
   ========================================================== */
app.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  const user = getUser(username);
  if (!user || user.password !== password)
    return res.status(401).json({ error: "Invalid username or password" });

  res.json({ username: user.username, role: user.role });
});

app.post("/signup", (req, res) => {
  const { username, password, role } = req.body || {};
  if (!username || !password || !role)
    return res.status(400).json({ error: "Username, password, and role required" });

  if (!["agent", "cashier", "admin"].includes(role))
    return res.status(400).json({ error: "Role must be agent, cashier, or admin" });

  try {
    if (getUser(username))
      return res.status(409).json({ error: "Username already taken" });
    createUser(username, password, role);
    res.json({ username, role });
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

/* ==========================================================
   CARD ENDPOINTS
   ========================================================== */
app.get("/api/cards", (req, res) => res.json(getAllCards()));

app.get("/api/cards/:uid", (req, res) => {
  const card = getCard(req.params.uid);
  if (!card) return res.status(404).json({ error: "Card not registered" });
  res.json(card);
});

app.post("/api/cards/register", (req, res) => {
  const { uid, cardHolder } = req.body || {};
  if (!uid || !cardHolder)
    return res.status(400).json({ error: "UID and card holder name required" });

  const existing = getCard(uid);
  if (existing)
    return res.status(409).json({ error: "Card already registered", card: existing });

  try {
    const card = registerCard(uid, cardHolder);
    broadcast("card_registered", { card });
    res.json({ status: "registered", card });
  } catch (err) {
    res.status(500).json({ error: "Failed to register card" });
  }
});

/* ==========================================================
   TOPUP ENDPOINT
   ========================================================== */
app.post("/topup", (req, res) => {
  const { uid, amount } = req.body || {};
  if (!uid || !amount)
    return res.status(400).json({ error: "Missing UID or amount" });

  if (amount <= 0 || amount > 1000000)
    return res.status(400).json({ error: "Invalid amount. Must be 1-1,000,000" });

  const result = safeTopup(uid, Math.floor(amount));
  if (!result.success) return res.status(400).json({ error: result.error });

  mqttClient.publish(TOPIC_TOPUP, JSON.stringify({ uid, amount: Math.floor(amount) }), { qos: 1 });

  broadcast("topup_success", {
    uid, amount: Math.floor(amount),
    balanceBefore: result.balanceBefore,
    balanceAfter: result.balanceAfter,
    card: result.card,
  });

  res.json({
    status: "success", uid, amount: Math.floor(amount),
    balanceBefore: result.balanceBefore,
    balanceAfter: result.balanceAfter,
    card: result.card,
  });
});

/* ==========================================================
   PAYMENT ENDPOINT
   ========================================================== */
app.post("/pay", (req, res) => {
  const { uid, items, productId, quantity } = req.body || {};
  if (!uid) return res.status(400).json({ error: "Missing UID" });

  let result;

  if (items && Array.isArray(items) && items.length > 0) {
    for (const it of items) {
      if (!it.productId || !it.quantity || it.quantity <= 0)
        return res.status(400).json({ error: "Invalid item in cart" });
    }
    result = safeCartPayment(uid, items);
  } else if (productId && quantity) {
    result = safePayment(uid, productId, Math.floor(quantity));
  } else {
    return res.status(400).json({ error: "Missing items or product" });
  }

  if (!result.success)
    return res.status(400).json({ status: "declined", error: result.error });

  mqttClient.publish(TOPIC_PAY, JSON.stringify({ uid, amount: result.totalCost }), { qos: 1 });

  const itemsList = result.items
    ? result.items.map((i) => ({ name: i.product.name, quantity: i.quantity, lineCost: i.lineCost }))
    : [{ name: result.product.name, quantity: result.quantity, lineCost: result.totalCost }];

  broadcast("payment_success", {
    uid, items: itemsList, totalCost: result.totalCost,
    balanceBefore: result.balanceBefore, balanceAfter: result.balanceAfter, card: result.card,
  });

  res.json({
    status: "approved", uid, items: itemsList, totalCost: result.totalCost,
    balanceBefore: result.balanceBefore, balanceAfter: result.balanceAfter, card: result.card,
  });
});

/* ==========================================================
   PRODUCT ENDPOINTS (CRUD)
   ========================================================== */
app.get("/api/products", (req, res) => res.json(getProducts()));

app.post("/api/products", (req, res) => {
  const { name, price, category } = req.body || {};
  if (!name || !price) return res.status(400).json({ error: "Name and price required" });
  try {
    const product = addProduct(name, Math.floor(price), category);
    broadcast("product_added", { product });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/api/products/:id", (req, res) => {
  const { name, price, category } = req.body || {};
  if (!name || !price) return res.status(400).json({ error: "Name and price required" });
  const existing = getProduct(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: "Product not found" });
  try {
    const product = updateProduct(Number(req.params.id), name, Math.floor(price), category);
    broadcast("product_updated", { product });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const existing = getProduct(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: "Product not found" });
  try {
    deleteProduct(Number(req.params.id));
    broadcast("product_deleted", { id: Number(req.params.id) });
    res.json({ status: "deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

/* ==========================================================
   DASHBOARD & TRANSACTION ENDPOINTS
   ========================================================== */
app.get("/api/dashboard", (req, res) => res.json(getDashboardStats()));

app.get("/api/transactions", (req, res) => {
  const { uid } = req.query;
  res.json(uid ? getCardTransactions(uid) : getAllTransactions());
});

/* ==========================================================
   START SERVER
   ========================================================== */
server.listen(CONFIG.PORT, CONFIG.HOST, () => {
  console.log(`Server running at http://${CONFIG.HOST}:${CONFIG.PORT}`);
  console.log(`Dashboard: http://localhost:${CONFIG.PORT}/dashboard.html`);
});
