#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>

/* ==========================================================
   CENTRAL CONFIGURATION
   ========================================================== */
#define WIFI_SSID  "GROUND"
#define WIFI_PASS  "RCA@2024"
#define MQTT_HOST  "157.173.101.159"
#define MQTT_PORT  1883
#define TEAM_ID    "1nt3rn4l_53rv3r_3rr0r"

/* ==========================================================
   AUTO-GENERATED TOPICS
   ========================================================== */
const String BASE       = "rfid/" TEAM_ID "/";
const String T_STATUS   = BASE + "card/status";
const String T_BALANCE  = BASE + "card/balance";
const String T_TOPUP    = BASE + "card/topup";
const String T_PAYMENT  = BASE + "card/payment";
const String T_REMOVED  = BASE + "card/removed";
const String T_HEALTH   = BASE + "device/health";
const String T_LWT      = BASE + "device/status";

/* ==========================================================
   RFID PINS
   ========================================================== */
#define SS_PIN  D4
#define RST_PIN D3
MFRC522 rfid(SS_PIN, RST_PIN);

WiFiClient   espClient;
PubSubClient client(espClient);

/* ==========================================================
   CARD TRACKING  (mirrors main.py logic)
   ========================================================== */
String  lastUID          = "";
bool    cardPresent      = false;
unsigned long firstMissAt       = 0;
unsigned long lastCardCheck     = 0;
unsigned long lastHealthReport  = 0;

#define CARD_CHECK_INTERVAL 200   // ms between scans
#define REMOVE_DELAY_MS     1000  // card must be absent this long before firing removed
#define HEALTH_INTERVAL     60000 // 60 s

/* ==========================================================
   HELPERS
   ========================================================== */
void safePublish(const String& topic, const String& payload) {
  if (!client.connected()) return;
  client.publish(topic.c_str(), payload.c_str());
}

String uidToHex(MFRC522::Uid& uid) {
  String s = "";
  for (byte i = 0; i < uid.size; i++) {
    if (uid.uidByte[i] < 0x10) s += "0";
    s += String(uid.uidByte[i], HEX);
  }
  s.toUpperCase();   // match main.py {:02X}
  return s;
}

unsigned long epochSeconds() {
  // No RTC — return millis-based approximation (good enough for ts field)
  return millis() / 1000UL;
}

/* ==========================================================
   WIFI
   ========================================================== */
void setupWiFi() {
  Serial.print("\nConnecting to ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi connected — IP: " + WiFi.localIP().toString());
}

/* ==========================================================
   MQTT CALLBACK
   ========================================================== */
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String topicStr(topic);
  String msg = "";
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];

  Serial.println("MSG [" + topicStr + "] " + msg);

  JsonDocument doc;
  if (deserializeJson(doc, msg)) { Serial.println("JSON parse error"); return; }

  String uid = doc["uid"] | "";

  if (topicStr == T_TOPUP) {
    // "amount" = new total balance from backend (same as main.py)
    float newBalance = doc["amount"] | 0.0f;

    JsonDocument resp;
    resp["uid"]         = uid;
    resp["new_balance"] = newBalance;
    resp["status"]      = "success";
    resp["type"]        = "topup";
    resp["ts"]          = epochSeconds();

    String out; serializeJson(resp, out);
    safePublish(T_BALANCE, out);
    Serial.println("Top-up confirmed for " + uid + ": balance = " + String(newBalance));
  }
  else if (topicStr == T_PAYMENT) {
    float newBalance = doc["amount"]   | 0.0f;
    float deducted   = doc["deducted"] | 0.0f;

    JsonDocument resp;
    resp["uid"]         = uid;
    resp["new_balance"] = newBalance;
    resp["deducted"]    = deducted;
    resp["status"]      = "success";
    resp["type"]        = "payment";
    resp["ts"]          = epochSeconds();

    String out; serializeJson(resp, out);
    safePublish(T_BALANCE, out);
    Serial.println("Payment processed for " + uid + ": -" + String(deducted) + ", balance = " + String(newBalance));
  }
}

/* ==========================================================
   MQTT CONNECT / RECONNECT
   ========================================================== */
void mqttReconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    String clientId = "ESP8266_" + String(ESP.getChipId(), HEX);

    // LWT: publish "offline" if we drop
    if (client.connect(clientId.c_str(), T_LWT.c_str(), 1, true, "offline")) {
      Serial.println("connected");
      client.publish(T_LWT.c_str(), "online", true);   // retained "online"
      client.subscribe(T_TOPUP.c_str());
      client.subscribe(T_PAYMENT.c_str());
      client.subscribe(T_HEALTH.c_str());
      client.subscribe(T_REMOVED.c_str());
      Serial.println("Subscribed to topup / payment / health / removed");
    } else {
      Serial.print("failed rc="); Serial.print(client.state());
      Serial.println(" — retry in 5s");
      delay(5000);
    }
  }
}

/* ==========================================================
   SETUP
   ========================================================== */
void setup() {
  Serial.begin(9600);
  Serial.println("\n--- ESP8266 RFID SYSTEM STARTING ---");

  SPI.begin();
  rfid.PCD_Init();
  Serial.println("RFID reader initialized");

  setupWiFi();
  client.setServer(MQTT_HOST, MQTT_PORT);
  client.setCallback(mqttCallback);
  client.setBufferSize(512);

  Serial.println("System initialized");
}

/* ==========================================================
   LOOP
   ========================================================== */
void loop() {
  if (!client.connected()) mqttReconnect();
  client.loop();

  unsigned long now = millis();

  /* ── Periodic health report ── */
  if (now - lastHealthReport > HEALTH_INTERVAL) {
    lastHealthReport = now;
    JsonDocument h;
    h["status"] = "online";
    h["ip"]     = WiFi.localIP().toString();
    h["rssi"]   = WiFi.RSSI();
    h["ts"]     = epochSeconds();
    String out; serializeJson(h, out);
    safePublish(T_HEALTH, out);
    Serial.println("Health report published");
  }

  /* ── RFID scan (rate-limited) ── */
  if (now - lastCardCheck < CARD_CHECK_INTERVAL) return;
  lastCardCheck = now;

  String detectedUID = "";
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    detectedUID = uidToHex(rfid.uid);
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }

  if (detectedUID.length() > 0) {
    // Card present — reset removal timer
    firstMissAt = 0;

    if (detectedUID != lastUID || !cardPresent) {
      lastUID     = detectedUID;
      cardPresent = true;
      Serial.println("Card detected: " + detectedUID);

      JsonDocument doc;
      doc["uid"]     = detectedUID;
      doc["status"]  = "detected";
      doc["present"] = true;
      doc["ts"]      = epochSeconds();
      String out; serializeJson(doc, out);
      safePublish(T_STATUS, out);
    }
  } else {
    // No card — debounce removal
    if (cardPresent) {
      if (firstMissAt == 0) {
        firstMissAt = now;                          // start 1-second countdown
      } else if (now - firstMissAt >= REMOVE_DELAY_MS) {
        Serial.println("Card removed: " + lastUID);

        JsonDocument doc;
        doc["uid"]     = lastUID;
        doc["status"]  = "removed";
        doc["present"] = false;
        doc["ts"]      = epochSeconds();
        String out; serializeJson(doc, out);
        safePublish(T_REMOVED, out);

        cardPresent = false;
        lastUID     = "";
        firstMissAt = 0;
      }
    }
  }
}
