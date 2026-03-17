import serial
import argparse

parser = argparse.ArgumentParser(description='Monitor ESP8266 serial output.')
parser.add_argument('port', help='Serial port (e.g., COM3 or /dev/ttyUSB0)')
parser.add_argument('--baudrate', type=int, default=115200, help='Baud rate (default: 115200)')

args = parser.parse_args()

ser = serial.Serial(args.port, args.baudrate, timeout=1)

print(f"Monitoring ESP8266 serial output on {args.port} at {args.baudrate} baud. Press Ctrl+C to stop.")

try:
    while True:
        if ser.in_waiting > 0:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            print(line)
except KeyboardInterrupt:
    print("Stopped.")
finally:
    ser.close()
