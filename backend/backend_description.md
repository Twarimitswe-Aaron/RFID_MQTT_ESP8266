# Backend Description

This document provides a comprehensive overview of the RFID Tap-to-Pay backend system, including architecture, endpoints, request/response formats, status codes, database models, MQTT integration, and Socket.IO real-time messaging.

## Architecture Overview

The backend is built with Node.js and Express.js, using MongoDB Atlas for data persistence. It integrates with MQTT for real-time communication with ESP8266 devices and Socket.IO for real-time updates to the frontend.

Key components:
- **Express Server**: Handles HTTP requests and responses
- **MongoDB**: Stores users, cards, and transactions
- **MQTT Client**: Communicates with ESP8266 devices
- **Socket.IO**: Enables real-time frontend updates
- **Authentication**: JWT-based with role-based access (user/admin)

## Database Models

### User Model
```javascript
{
  username: String (required, unique),
  password: String (hashed, required),
  role: String (enum: ['user', 'admin'], default: 'user')
}
```

### Card Model
```javascript
{
  uid: String (required, unique),
  holderName: String (required),
  balance: Number (default: 0),
  lastTopup: Number (default: 0),
  passcode: String (hashed, optional),
  passcodeSet: Boolean (default: false),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

### Transaction Model
```javascript
{
  uid: String (required, index),
  holderName: String (required),
  userId: String (required), // username of the user who performed the transaction
  type: String (enum: ['topup', 'debit'], required),
  amount: Number (required),
  balanceBefore: Number (required),
  balanceAfter: Number (required),
  description: String (optional),
  timestamp: Date (default: now)
}
```

## Authentication

The system uses JWT (JSON Web Tokens) for authentication. Tokens are issued upon login and must be included in the `Authorization` header as `Bearer <token>` for protected endpoints.

### Token Payload
```json
{
  "id": "user_id",
  "username": "user_username",
  "role": "user|admin"
}
```

## API Endpoints

All endpoints return JSON responses. Error responses include an `error` field with a descriptive message.

### Authentication Endpoints

#### POST /signup
Creates a new user account.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "role": "user|admin" // optional, defaults to "user"
}
```

**Success Response (201):**
```json
{
  "message": "User created"
}
```

**Error Responses:**
- 400: User exists or error
- 400: Username and password required

#### POST /login
Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "token": "jwt_token_string",
  "role": "user|admin"
}
```

**Error Responses:**
- 401: Invalid credentials
- 400: Username and password required

### Protected Endpoints (Require Authentication)

#### POST /topup
Adds funds to a card. Creates new card if UID doesn't exist.

**Request Body:**
```json
{
  "uid": "string", // RFID card UID
  "amount": "number", // Amount to add
  "holderName": "string", // Required for new cards
  "passcode": "string" // Optional, 6-digit for passcode-protected cards
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Topup successful",
  "card": {
    "uid": "string",
    "holderName": "string",
    "balance": "number",
    "lastTopup": "number"
  },
  "transaction": {
    "id": "string",
    "amount": "number",
    "balanceAfter": "number",
    "timestamp": "date"
  }
}
```

**Error Responses:**
- 400: UID and amount required
- 400: Holder name required for new cards
- 401: Passcode required / Incorrect passcode
- 500: Database operation failed

#### POST /pay
Deducts funds from a card for purchases.

**Request Body:**
```json
{
  "uid": "string",
  "productId": "string", // Optional, if purchasing a product
  "amount": "number", // Optional, if custom payment
  "description": "string", // Optional
  "passcode": "string" // Optional, 6-digit for passcode-protected cards
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment successful",
  "card": {
    "uid": "string",
    "holderName": "string",
    "balance": "number"
  },
  "transaction": {
    "id": "string",
    "type": "debit",
    "amount": "number",
    "balanceBefore": "number",
    "balanceAfter": "number",
    "description": "string",
    "timestamp": "date"
  }
}
```

**Error Responses:**
- 400: UID and product or amount required
- 400: Invalid product ID / payment amount
- 400: Insufficient balance
- 401: Passcode required / Incorrect passcode
- 404: Card not found
- 500: Payment processing failed

#### POST /card/:uid/set-passcode
Sets a 6-digit passcode for a card.

**Request Body:**
```json
{
  "passcode": "string" // Exactly 6 digits
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Passcode set successfully",
  "passcodeSet": true
}
```

**Error Responses:**
- 400: Passcode must be exactly 6 digits
- 400: Passcode already set
- 404: Card not found
- 500: Failed to set passcode

#### POST /card/:uid/change-passcode
Changes the passcode for a card (requires old passcode).

**Request Body:**
```json
{
  "oldPasscode": "string",
  "newPasscode": "string" // Exactly 6 digits
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Passcode changed successfully"
}
```

**Error Responses:**
- 400: Both old and new passcodes required / New passcode must be 6 digits
- 400: No passcode set / Passcode already set
- 401: Incorrect old passcode
- 404: Card not found
- 500: Failed to change passcode

#### POST /card/:uid/verify-passcode
Verifies a card's passcode.

**Request Body:**
```json
{
  "passcode": "string" // Exactly 6 digits
}
```

**Success Response (200):**
```json
{
  "success": true,
  "valid": true,
  "message": "Passcode verified"
}
```

**Error Responses:**
- 400: Passcode must be 6 digits / No passcode set
- 401: Incorrect passcode
- 404: Card not found
- 500: Failed to verify passcode

#### GET /card/:uid
Retrieves card details.

**Success Response (200):**
Returns the full card object (see Card Model).

**Error Responses:**
- 404: Card not found
- 500: Database operation failed

#### GET /cards
Retrieves all cards (admin use).

**Success Response (200):**
Array of card objects, sorted by updatedAt descending.

**Error Responses:**
- 500: Database operation failed

#### GET /transactions/:uid
Retrieves transaction history for a specific card.

**Query Parameters:**
- `limit`: number (optional, default: 50) - Max transactions to return

**Success Response (200):**
Array of transaction objects for the card, sorted by timestamp descending.

**Error Responses:**
- 500: Database operation failed

#### GET /transactions
Retrieves all transactions (admin use).

**Query Parameters:**
- `limit`: number (optional, default: 100) - Max transactions to return

**Success Response (200):**
Array of all transaction objects, sorted by timestamp descending.

**Error Responses:**
- 500: Database operation failed

#### GET /user/transactions
Retrieves transactions for the authenticated user. Filters by userId for non-admin users.

**Query Parameters:**
- `limit`: number (optional, default: 100) - Max transactions to return

**Success Response (200):**
Array of transaction objects, sorted by timestamp descending.

**Error Responses:**
- 401: No token provided / Invalid token
- 500: Database operation failed

### Product Endpoints (from productRoutes)

#### GET /products
Retrieves available products for purchase.

**Success Response (200):**
```json
[
  {
    "id": "string",
    "name": "string",
    "price": "number",
    "category": "string"
  }
]
```

## MQTT Integration

The backend subscribes to MQTT topics for real-time communication with ESP8266 devices.

### Topics Subscribed
- `rfid/vikings/card/status` - Card detection/removal
- `rfid/vikings/card/balance` - Balance updates from ESP
- `rfid/vikings/card/payment` - Payment confirmations
- `rfid/vikings/card/removed` - Card removal notifications
- `rfid/vikings/device/health` - Device health reports

### Message Handling
MQTT messages are JSON-parsed and emitted via Socket.IO to connected frontends.

#### Card Status Messages
**Topic:** `rfid/vikings/card/status`
**Payload:**
```json
{
  "uid": "string",
  "balance": "number", // From ESP, simulated
  "status": "detected|removed",
  "present": "boolean",
  "ts": "number"
}
```

**Processing:**
- For existing cards: Emit `card-status` with DB data (balance, holderName)
- For new cards: Emit `card-status` with holderName: null

#### Balance Updates
**Topic:** `rfid/vikings/card/balance`
**Payload:** ESP balance confirmation
**Processing:** Emit `card-balance` to frontend

#### Payment Results
**Topic:** `rfid/vikings/card/payment`
**Payload:** Payment confirmation from ESP
**Processing:** Emit `payment-result` to frontend

#### Card Removal
**Topic:** `rfid/vikings/card/removed`
**Payload:**
```json
{
  "uid": "string",
  "status": "removed",
  "present": false,
  "ts": "number"
}
```
**Processing:** Emit `card-removed` to frontend

#### Health Reports
**Topic:** `rfid/vikings/device/health`
**Payload:** Device health data
**Processing:** Logged, no Socket.IO emission

### Topics Published
- `rfid/vikings/card/topup` - Topup commands to ESP
- `rfid/vikings/card/payment` - Payment commands to ESP

## Socket.IO Events

Real-time events emitted to connected frontend clients.

### Outgoing Events (Server → Client)

#### card-status
Emitted when a card is detected.

**Payload:**
```json
{
  "uid": "string",
  "balance": "number", // From DB
  "holderName": "string|null", // From DB or null for new cards
  "status": "detected",
  "present": true,
  "ts": "number"
}
```

#### card-balance
Emitted after balance updates (topup/payment).

**Payload:**
```json
{
  "uid": "string",
  "balance": "number"
}
```

#### card-removed
Emitted when a card is removed.

**Payload:**
```json
{
  "uid": "string",
  "status": "removed",
  "present": false,
  "ts": "number"
}
```

#### payment-success
Emitted after successful payments.

**Payload:**
```json
{
  "uid": "string",
  "holderName": "string",
  "amount": "number",
  "balanceBefore": "number",
  "balanceAfter": "number",
  "description": "string",
  "timestamp": "date"
}
```

### Incoming Events (Client → Server)
Currently, no client-to-server events are handled. The server emits events based on MQTT messages and API calls.

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad Request (validation errors)
- 401: Unauthorized (auth failures)
- 404: Not Found
- 500: Internal Server Error

Error responses include an `error` field with a descriptive message.

## Security

- Passwords are hashed with bcrypt
- Passcodes are hashed with bcrypt (6-digit)
- JWT tokens expire in 1 hour
- Role-based access control (user vs admin)
- Input validation on all endpoints

## Configuration

Environment variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `PORT1`: Server port (default: 8228)

MQTT Broker: broker.hivemq.com (public broker)
Team ID: vikings
Base Topic: rfid/vikings/
