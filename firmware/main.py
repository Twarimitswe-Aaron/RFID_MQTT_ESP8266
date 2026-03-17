import network
import time
from umqtt.simple import MQTTClient
import ujson as json
from machine import Pin, SPI
from mfrc522 import MFRC522
import binascii

# ----------------- WiFi Configuration -----------------
ssid = 'RCA'
password = '@RcaNyabihu2023'

# ----------------- MQTT Configuration -----------------
# mqtt_server = "broker.hivemq.com"
mqtt_server = "157.173.101.159"
MQTT_PORT = 1883
# team_id = "vikings"
team_id = "1nt3rn4l_53rv3r_3rr0r"

# ----------------- MQTT Topics -----------------
topic_status = f"rfid/{team_id}/card/status"
topic_balance = f"rfid/{team_id}/card/balance"
topic_topup = f"rfid/{team_id}/card/topup"
topic_payment = f"rfid/{team_id}/card/payment"
topic_health = f"rfid/{team_id}/device/health"
topic_lwt = f"rfid/{team_id}/device/status"
topic_removed = f"rfid/{team_id}/card/removed"

# ----------------- Card Tracking -----------------
lastDetectedUID = ""
cardPresent = False
lastCardCheck = 0
CARD_CHECK_INTERVAL = 200   # ms between scans
REMOVE_DELAY_MS = 1000      # card must be absent this long before firing removed
firstMissAt = 0             # timestamp of first consecutive miss (0 = no miss)

# ----------------- RFID Reader -----------------
reader = MFRC522(sck=14, mosi=13, miso=12, rst=0, cs=2)

# ----------------- Health Report -----------------
last_health_report = 0
HEALTH_INTERVAL = 60000  # 60 seconds

# ----------------- MQTT Callback -----------------
def on_message(topic, msg):
    print(f"Message arrived [{topic}] {msg}")

    try:
        payload = json.loads(msg)
        uid = payload.get("uid")
        topic_str = topic.decode()

        if topic_str == topic_topup:
            # Handle top-up: "amount" is the NEW total balance from backend
            newBalance = payload.get("amount", 0)

            # Prepare response
            response = {
                "uid": uid,
                "new_balance": newBalance,
                "status": "success",
                "type": "topup",
                "ts": int(time.time())
            }

            safe_publish(topic_balance, json.dumps(response))

            print(f"Top-up confirmed for {uid}: balance = {newBalance}")

        elif topic_str == topic_payment:
            # Handle payment: "amount" is the NEW balance, "deducted" is the charge
            newBalance = payload.get("amount", 0)
            deducted = payload.get("deducted", 0)
            desc = payload.get("description", "Payment")

            # Prepare balance update response
            response = {
                "uid": uid,
                "new_balance": newBalance,
                "deducted": deducted,
                "status": "success",
                "type": "payment",
                "ts": int(time.time())
            }

            safe_publish(topic_balance, json.dumps(response))

            print(f"Payment processed for {uid}: -${deducted}, new balance = {newBalance}")

    except Exception as e:
        print(f"Failed to parse message: {e}")

# ----------------- WiFi Setup -----------------
sta_if = network.WLAN(network.STA_IF)
sta_if.active(True)
print("Connecting to WiFi...")
sta_if.connect(ssid, password)
while not sta_if.isconnected():
    time.sleep(1)
print("WiFi connected")
print("IP:", sta_if.ifconfig()[0])

# ----------------- MQTT Setup -----------------
client_id = "ESP8266_Shield_" + binascii.hexlify(sta_if.config('mac')[-3:]).decode('ascii').upper()
client = None

def mqtt_reconnect():
    global client
    print("Connecting to MQTT...")
    try:
        if client:
            try:
                client.disconnect()
            except:
                pass
        client = MQTTClient(client_id, mqtt_server, port=MQTT_PORT, keepalive=60)
        client.set_callback(on_message)
        client.set_last_will(topic_lwt, b"offline", retain=True, qos=1)
        client.connect()
        client.publish(topic_lwt, b"online", retain=True, qos=1)
        client.subscribe(topic_topup)
        client.subscribe(topic_payment)
        client.subscribe(topic_health)
        client.subscribe(topic_removed)
        print("MQTT connected")
        return True
    except Exception as e:
        print(f"MQTT connect failed: {e}")
        client = None
        return False

def safe_publish(topic, msg):
    global client
    try:
        client.publish(topic, msg)
    except Exception as e:
        print(f"Publish failed: {e} — reconnecting")
        if mqtt_reconnect():
            try:
                client.publish(topic, msg)
            except Exception as e2:
                print(f"Publish retry failed: {e2}")

mqtt_reconnect()
print("✓ System initialized successfully")

while True:
    # Guard check_msg — this is where ECONNABORTED was crashing the loop
    try:
        client.check_msg()
    except Exception as e:
        print(f"MQTT error: {e} — reconnecting")
        mqtt_reconnect()
        time.sleep_ms(500)
        continue

    # Periodic health report
    now = time.ticks_ms()
    if time.ticks_diff(now, last_health_report) > HEALTH_INTERVAL:
        last_health_report = now
        import gc
        safe_publish(topic_health, json.dumps({
            "status": "online",
            "ip": sta_if.ifconfig()[0],
            "rssi": sta_if.status('rssi'),
            "free_heap": gc.mem_free(),
            "ts": int(time.time())
        }))
        print("Health report published")

    # ----------------- RFID Scanning -----------------
    currentMillis = time.ticks_ms()

    if time.ticks_diff(currentMillis, lastCardCheck) >= CARD_CHECK_INTERVAL:
        lastCardCheck = currentMillis

        detected_uid = None
        (status, TagType) = reader.request(reader.REQIDL)
        if status == reader.OK:
            (status, uid) = reader.anticoll()
            if status == reader.OK:
                detected_uid = ''.join('{:02X}'.format(x) for x in uid)

        if detected_uid:
            # Card is present — reset removal timer
            firstMissAt = 0

            if detected_uid != lastDetectedUID or not cardPresent:
                lastDetectedUID = detected_uid
                cardPresent = True
                print(f"Card detected: {detected_uid}")
                safe_publish(topic_status, json.dumps({
                    "uid": detected_uid,
                    "status": "detected",
                    "present": True,
                    "ts": int(time.time())
                }))
        else:
            # No card — start or check removal timer
            if cardPresent:
                if firstMissAt == 0:
                    firstMissAt = currentMillis  # start the 1s countdown
                elif time.ticks_diff(currentMillis, firstMissAt) >= REMOVE_DELAY_MS:
                    # Absent for 1 full second — now fire removed
                    print(f"Card removed: {lastDetectedUID}")
                    safe_publish(topic_removed, json.dumps({
                        "uid": lastDetectedUID,
                        "status": "removed",
                        "present": False,
                        "ts": int(time.time())
                    }))
                    cardPresent = False
                    lastDetectedUID = ""
                    firstMissAt = 0

    time.sleep_ms(100)
