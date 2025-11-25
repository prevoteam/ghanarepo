# Ghana Revenue Authority - Registration Portal API Documentation

## Base URL
```
http://localhost:3000/v1/home
```

---

## Table of Contents
1. [Registration Flow APIs](#registration-flow-apis)
2. [Market Declaration (Step 5)](#market-declaration-step-5)
3. [Payment Gateway (Step 6)](#payment-gateway-step-6)
4. [e-VAT Obligations (Step 7)](#e-vat-obligations-step-7)
5. [Complete Registration (Step 8)](#complete-registration-step-8)
6. [Login APIs](#login-apis)
7. [Dashboard APIs](#dashboard-apis)

---

## Registration Flow APIs

### 1. Register User
**Endpoint:** `POST /home/Register`

**Description:** Initiates user registration by sending OTP to email or mobile.

**Request Body:**
```json
{
  "contact": "user@example.com",
  "method": "email"
}
```

**Parameters:**
- `contact` (string, required): Email address or mobile number
- `method` (string, required): Either "email" or "mobile"

**Success Response (200):**
```json
{
  "status": true,
  "resCode": 200,
  "message": "OTP sent successfully",
  "data": {
    "unique_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

### 2. Verify OTP
**Endpoint:** `POST /home/VerifyOTP`

**Description:** Verifies the OTP sent during registration.

**Request Body:**
```json
{
  "unique_id": "550e8400-e29b-41d4-a716-446655440000",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "resCode": 200,
  "message": "OTP verified successfully",
  "data": {
    "unique_id": "550e8400-e29b-41d4-a716-446655440000",
    "is_verified": true
  }
}
```

---

### 3. Resend OTP
**Endpoint:** `POST /home/ResendOTP`

**Description:** Resends OTP to the user's contact.

**Request Body:**
```json
{
  "contact": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "resCode": 200,
  "message": "OTP resent successfully",
  "data": {
    "unique_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

### 4. Set Entity Type
**Endpoint:** `POST /home/SetEntity`

**Description:** Updates user's entity type.

**Request Body:**
```json
{
  "unique_id": "550e8400-e29b-41d4-a716-446655440000",
  "entity_type": "NonResident"
}
```

**Parameters:**
- `entity_type`: "DomesticIndividual" | "DomesticCompany" | "NonResident"

**Success Response (200):**
```json
{
  "status": true,
  "resCode": 200,
  "message": "Entity type updated successfully",
  "data": {
    "id": 1,
    "unique_id": "550e8400-e29b-41d4-a716-446655440000",
    "entity_type": "NonResident"
  }
}
```

---

### 5. Update Agent Details
**Endpoint:** `POST /home/UpdateAgentDetails`

**Description:** Updates agent and user personal details.

**Request Body:**
```json
{
  "unique_id": "550e8400-e29b-41d4-a716-446655440000",
  "full_name": "John Doe",
  "date_of_birth": "1990-01-01",
  "ghana_card_number": "GHA-123456789-0",
  "agent_full_name": "Jane Agent",
  "agent_email": "agent@example.com",
  "agent_ghana_id": "GHA-987654321-0",
  "agent_mobile": "+233123456789"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "resCode": 200,
  "message": "Agent details updated successfully",
  "data": {
    "id": 1,
    "unique_id": "550e8400-e29b-41d4-a716-446655440000",
    "full_name": "John Doe",
    "agent_full_name": "Jane Agent",
    "agent_email": "agent@example.com"
  }
}
```

---

## Market Declaration (Step 5)

### Update Market Declaration
**Endpoint:** `POST /home/UpdateMarketDeclaration`

**Description:** Updates whether user sells digital services and their annual sales volume.

**Request Body:**
```json
{
  "unique_id": "550e8400-e29b-41d4-a716-446655440000",
  "sells_digital_services": true,
  "annual_sales_volume": "500000"
}
```

**Parameters:**
- `sells_digital_services` (boolean, required): Whether user sells digital services to Ghana
- `annual_sales_volume` (string, required): Expected annual sales volume (e.g., "0-50000", "50000-200000", "200000+")

**Success Response (200):**
```json
{
  "status": true,
  "resCode": 200,
  "message": "Market declaration updated successfully",
  "data": {
    "unique_id": "550e8400-e29b-41d4-a716-446655440000",
    "sells_digital_services": true,
    "annual_sales_volume": "500000"
  }
}
```

**UI Integration Notes:**
- Display question: "Do you sell digital services to customers in Ghana?"
- Dropdown options for sales volume:
  - "Below GH₵ 50,000"
  - "GH₵ 50,000 - GH₵ 200,000"
  - "GH₵ 200,000 - GH₵ 500,000"
  - "Above GH₵ 500,000"

---

## Payment Gateway (Step 6)

### 1. Update Payment Gateway
**Endpoint:** `POST /home/UpdatePaymentGateway`

**Description:** Links payment service provider for transaction tracking.

**Request Body:**
```json
{
  "unique_id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_provider": "PayPal",
  "merchant_id": "MERCH-8284"
}
```

**Parameters:**
- `payment_provider` (string, required): One of "Stripe", "Paystack", "Flutterwave", "PayPal"
- `merchant_id` (string, optional): Will be auto-generated if not provided

**Success Response (200):**
```json
{
  "status": true,
  "resCode": 200,
  "message": "Payment gateway connected successfully",
  "data": {
    "unique_id": "550e8400-e29b-41d4-a716-446655440000",
    "payment_provider": "PayPal",
    "merchant_id": "MERCH-8284",
    "payment_connected": true
  }
}
```

**UI Integration Notes:**
- Display 4 payment provider cards: Stripe, Paystack, Flutterwave, PayPal
- After successful connection, show:
  - "Connected to [Provider] !"
  - Merchant ID
  - Message: "You have consented for GRA to receive transaction summaries regarding Ghana sales."
  - "Disconnect" button

---

### 2. Disconnect Payment Gateway
**Endpoint:** `POST /home/DisconnectPaymentGateway`

**Description:** Disconnects the linked payment gateway.

**Request Body:**
```json
{
  "unique_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "resCode": 200,
  "message": "Payment gateway disconnected successfully"
}
```

---

## e-VAT Obligations (Step 7)

### Calculate VAT Obligation
**Endpoint:** `POST /home/CalculateVATObligation`

**Description:** Calculates VAT obligations based on entity type, digital services, and sales volume.

**Request Body:**
```json
{
  "unique_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "resCode": 200,
  "message": "VAT obligations calculated successfully",
  "data": {
    "entity_type": "NonResident",
    "sells_digital_services": true,
    "vat_registration_required": true,
    "compliance_status": "Pending",
    "applicable_vat_rate": "Standard VAT + NHIL + GETFund levies apply"
  }
}
```

**UI Integration Notes:**
- Display compliance status card showing:
  - Entity type (e.g., "Non-Resident Entity")
  - Service type (e.g., "Supplying Digital Services to Ghana (B2C)")
  - VAT requirement message
  - Applicable rate information

**Business Logic:**
- **NonResident + Digital Services**: VAT registration required
- **Domestic entities with sales > GH₵200,000**: VAT registration required
- Rate: Standard VAT (12.5%) + NHIL (2.5%) + GETFund (2.5%) = 17.5%

---

## Complete Registration (Step 8)

### Complete Registration & Generate TIN
**Endpoint:** `POST /home/CompleteRegistration`

**Description:** Generates TIN, VAT ID, and completes user registration.

**Request Body:**
```json
{
  "unique_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "resCode": 200,
  "message": "Registration completed successfully",
  "data": {
    "tin": "GHA21984395",
    "vat_id": "VP008041788",
    "subject_name": "Student",
    "issue_date": "2025-11-24",
    "credential_id": "eav3ued-cf60c0af-6b4a-4864-8f89-892142a0bc91",
    "verifiable_credential": {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiableCredential", "TaxCredential"],
      "issuer": "Ghana Revenue Authority",
      "issuanceDate": "2025-11-24",
      "credentialSubject": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Student",
        "tin": "GHA21984395",
        "vatId": "VP008041788"
      }
    }
  }
}
```

**UI Integration Notes:**
- Display credential card with:
  - Header: "Ghana Revenue Authority - Official E-Commerce TIN Credential"
  - Subject Name
  - TIN number
  - Issue Date (format: "20 November 2025")
  - Credential ID
  - QR code (generate from credential data)
  - "Download PDF" button
  - "Proceed to Login" button

---

## Login APIs

### 1. Send Login OTP
**Endpoint:** `POST /home/send-otp`

**Description:** Sends OTP for login using TIN or Ghana Card Number.

**Request Body:**
```json
{
  "credential": "GHA21984395"
}
```

**Parameters:**
- `credential` (string, required): TIN or Ghana Card Number

**Success Response (200):**
```json
{
  "status": true,
  "message": "OTP sent successfully",
  "otpDev": "123456",
  "unique_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**UI Integration Notes:**
- Input field: "TIN / Ghana Card Number"
- Button: "Login via OTP"
- OTP is sent to registered email

---

### 2. Verify Login OTP
**Endpoint:** `POST /home/verify-otp`

**Description:** Verifies OTP and logs user in.

**Request Body:**
```json
{
  "credential": "GHA21984395",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "message": "OTP verified successfully. Welcome email sent!",
  "unique_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses:**
- 404: User not found
- 400: OTP expired
- 401: Invalid OTP

**UI Integration Notes:**
- Display 6 OTP input boxes
- Show email where OTP was sent
- Display countdown timer (5 minutes)
- "Resend OTP" button
- "Validate" button
- After verification, redirect to dashboard

---

## Dashboard APIs

### 1. Get Dashboard Data
**Endpoint:** `GET /home/GetDashboard`

**Description:** Fetches user dashboard data including sales, VAT liability, and messages.

**Query Parameters:**
- `unique_id` (string, required): User's unique ID

**Example Request:**
```
GET /home/GetDashboard?unique_id=550e8400-e29b-41d4-a716-446655440000
```

**Success Response (200):**
```json
{
  "status": true,
  "resCode": 200,
  "message": "Dashboard data fetched successfully",
  "data": {
    "user": {
      "name": "Lorem Ipsum",
      "tin": "F005041788",
      "vat_id": "VP008041788",
      "compliance_status": "ONTRACK",
      "entity_type": "NonResident",
      "sells_digital_services": true
    },
    "sales": {
      "total_sales": "50000.00",
      "est_vat_liability": "10950.00",
      "currency": "GH₵"
    },
    "recent_history": [
      {
        "month": "Oct 2023 VAT",
        "amount": "GH₵4,200.00",
        "date": "2023-10-15"
      },
      {
        "month": "Sep 2023 VAT",
        "amount": "GH₵3,890.00",
        "date": "2023-09-15"
      }
    ],
    "messages": [
      {
        "title": "Return Deadline Approaching",
        "description": "Your Nov return is due in 5 days.",
        "priority": "high"
      },
      {
        "title": "System Maintenance",
        "description": "Scheduled for Sunday 2am - 4am.",
        "priority": "medium"
      }
    ]
  }
}
```

**UI Integration Notes:**
- Display user card with name, TIN, VAT ID
- Show compliance status badge
- Display sales summary:
  - "Total Sales (PSP Data)": GH₵50,000.00
  - "Est. VAT Liability": GH₵10,950.00
  - Link: "Click to view detailed computation & file return"
- Show recent VAT payment history
- Display system messages

---

### 2. Update Sales Data
**Endpoint:** `POST /home/UpdateSalesData`

**Description:** Updates total sales and automatically calculates VAT liability.

**Request Body:**
```json
{
  "unique_id": "550e8400-e29b-41d4-a716-446655440000",
  "total_sales": 50000.00
}
```

**Success Response (200):**
```json
{
  "status": true,
  "resCode": 200,
  "message": "Sales data updated successfully",
  "data": {
    "total_sales": "50000.00",
    "est_vat_liability": "8750.00"
  }
}
```

**Note:** VAT liability is calculated at 17.5% (Standard VAT 12.5% + NHIL 2.5% + GETFund 2.5%)

---

## Error Responses

All endpoints may return the following error formats:

**400 Bad Request:**
```json
{
  "status": false,
  "resCode": 400,
  "message": "Error description"
}
```

**404 Not Found:**
```json
{
  "status": false,
  "resCode": 404,
  "message": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "status": false,
  "resCode": 500,
  "message": "Error message"
}
```

---

## Complete Registration Flow

### Step-by-Step Flow:

1. **Step 1 - Verification:**
   - `POST /home/Register` - Send OTP
   - `POST /home/VerifyOTP` - Verify OTP

2. **Step 2 - Entity Type:**
   - `POST /home/SetEntity` - Set entity type

3. **Step 3 - Identity:**
   - `POST /home/UpdateAgentDetails` - Update user and agent details

4. **Step 4 - Agent:**
   - Same as Step 3

5. **Step 5 - Market:**
   - `POST /home/UpdateMarketDeclaration` - Update market declaration

6. **Step 6 - Payment:**
   - `POST /home/UpdatePaymentGateway` - Connect payment gateway

7. **Step 7 - Eligibility:**
   - `POST /home/CalculateVATObligation` - Calculate VAT obligations

8. **Step 8 - Completed:**
   - `POST /home/CompleteRegistration` - Generate TIN and complete

### Login Flow:

1. `POST /home/send-otp` - Send login OTP
2. `POST /home/verify-otp` - Verify OTP
3. `GET /home/GetDashboard` - Fetch dashboard data

---

## Database Migration

Before testing the APIs, run the database migration to add new fields:

```sql
-- Run this file
database/migration_add_new_fields.sql
```

Or use the updated schema:
```sql
-- Drop and recreate table
database/schema.sql
```

---

## Testing the APIs

### Prerequisites:
1. PostgreSQL database running
2. Node.js server running: `npm start`
3. Database migrated with new fields

### Example cURL Commands:

**Register User:**
```bash
curl -X POST http://localhost:3000/v1/home/Register \
  -H "Content-Type: application/json" \
  -d '{
    "contact": "test@example.com",
    "method": "email"
  }'
```

**Update Market Declaration:**
```bash
curl -X POST http://localhost:3000/v1/home/UpdateMarketDeclaration \
  -H "Content-Type: application/json" \
  -d '{
    "unique_id": "YOUR_UNIQUE_ID",
    "sells_digital_services": true,
    "annual_sales_volume": "500000"
  }'
```

**Get Dashboard:**
```bash
curl -X GET "http://localhost:3000/v1/home/GetDashboard?unique_id=YOUR_UNIQUE_ID"
```

---

## Notes

- All endpoints require proper error handling on the frontend
- Store `unique_id` in localStorage/sessionStorage after registration
- OTP expires after 5 minutes
- TIN format: GHA + 8 random digits (e.g., GHA21984395)
- VAT ID format: VP + 9 random digits (e.g., VP008041788)
- Merchant ID format: MERCH- + 4 random digits (e.g., MERCH-8284)

---

## Contact

For any API issues or questions, please contact the backend development team.
