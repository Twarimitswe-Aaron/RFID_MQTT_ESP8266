/* ==========================================================
   CENTRAL CONFIGURATION
   ========================================================== */
const CONFIG = {
  HOST: "0.0.0.0", // Server host
  MQTT_HOST: "mqtt://157.173.101.159:1883", // MQTT broker
  PORT: 5000,
  TEAM_ID: "1nt3rn4l_53rv3r_3rr0r",
};

/* ==========================================================
   AUTO TOPICS
   ========================================================== */
const BASE = `rfid/${CONFIG.TEAM_ID}/`;
const TOPIC_STATUS = BASE + "card/status";
const TOPIC_BALANCE = BASE + "card/balance";
const TOPIC_TOPUP = BASE + "card/topup";

/* ==========================================================
   IMPORT MODULES
   ========================================================== */
import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import mqtt from "mqtt";
import cors from "cors";

/* ==========================================================
   EXPRESS + HTTP + WEBSOCKET SETUP
   ========================================================== */
const app = express();
app.use(cors()); // allows all origins
app.use(express.static("public")); // put your HTML in public/
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

/* ==========================================================
   MQTT CLIENT SETUP
   ========================================================== */
const mqttClient = mqtt.connect(CONFIG.MQTT_HOST);

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");

  mqttClient.subscribe([TOPIC_STATUS, TOPIC_BALANCE], (err, granted) => {
    if (err) console.error("Subscription error:", err);
    else
      console.log(
        "Subscribed to topics:",
        granted.map((g) => g.topic).join(", "),
      );
  });
});

mqttClient.on("error", (err) => {
  console.error("MQTT Error:", err);
});

mqttClient.on("message", (topic, message) => {
  const msgStr = message.toString();
  console.log(`MQTT message received: ${topic} -> ${msgStr}`);

  // Broadcast to all WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ topic, message: msgStr }));
    }
  });
});

/* ==========================================================
   EXPRESS ENDPOINT FOR TOPUP
   ========================================================== */
app.post("/topup", (req, res) => {
  if (!req.body || !req.body.uid || !req.body.amount) {
    return res.status(400).json({ error: "Missing UID or amount" });
  }

  const { uid, amount } = req.body;

  if (amount <= 0 || amount > 1000000) {
    return res
      .status(400)
      .json({ error: "Invalid amount. Must be 1-1,000,000" });
  }

  const payload = JSON.stringify(req.body);
  mqttClient.publish(TOPIC_TOPUP, payload, { qos: 1 }, (err) => {
    if (err) {
      console.error("Failed to publish topup:", err);
      return res.status(500).json({ status: "error" });
    }
    console.log("Topup published:", payload);
    res.json({ status: "sent" });
  });
});

/* ==========================================================
   START SERVER
   ========================================================== */
server.listen(CONFIG.PORT, CONFIG.HOST, () => {
  console.log(`Backend running at http://${CONFIG.HOST}:${CONFIG.PORT}`);
});
