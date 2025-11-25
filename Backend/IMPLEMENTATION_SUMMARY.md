# Implementation Summary - GRA Registration Portal

## Overview
I've successfully implemented all backend APIs for the 7 new pages/features based on the Figma screenshots provided. This document summarizes all changes and provides guidance for frontend integration.

---

## Files Created/Modified

### 1. Database Files
- **`database/schema.sql`** - Updated with new fields for market declaration, payment gateway, and VAT obligations
- **`database/migration_add_new_fields.sql`** - Migration script to add new fields to existing database

### 2. Service Layer
- **`services/homeService.js`** - Added 7 new functions:
  - `UpdateMarketDeclaration` - Step 5
  - `UpdatePaymentGateway` - Step 6
  - `DisconnectPaymentGateway` - Step 6
  - `CalculateVATObligation` - Step 7
  - `CompleteRegistration` - Step 8
  - `GetDashboard` - Dashboard page
  - `UpdateSalesData` - Dashboard updates

### 3. Controller Layer
- **`controller/homeController.js`** - Added routes for all new endpoints

### 4. Documentation
- **`API_DOCUMENTATION.md`** - Comprehensive API documentation with examples
- **`test_apis.http`** - REST Client test file for API testing
- **`IMPLEMENTATION_SUMMARY.md`** - This file

---

## New Features Implemented

### Step 5: Market Declaration
**Purpose:** Collect information about digital services sales to Ghana

**API:** `POST /home/UpdateMarketDeclaration`

**Fields Added to Database:**
- `sells_digital_services` (BOOLEAN) - Whether user sells digital services
- `annual_sales_volume` (VARCHAR) - Expected annual sales volume

**Frontend Requirements:**
- Question: "Do you sell digital services to customers in Ghana?"
- Dropdown for annual sales volume with ranges

---

### Step 6: Payment Gateway Linkage
**Purpose:** Link Payment Service Provider (PSP) for transaction tracking

**APIs:**
- `POST /home/UpdatePaymentGateway` - Connect gateway
- `POST /home/DisconnectPaymentGateway` - Disconnect gateway

**Fields Added to Database:**
- `payment_provider` (VARCHAR) - Stripe, Paystack, Flutterwave, or PayPal
- `merchant_id` (VARCHAR) - Auto-generated merchant ID
- `payment_connected` (BOOLEAN) - Connection status
- `payment_connected_at` (TIMESTAMP) - Connection timestamp

**Frontend Requirements:**
- Display 4 payment provider cards (Stripe, Paystack, Flutterwave, PayPal)
- Show success state with merchant ID after connection
- "Disconnect" button to unlink provider

---

### Step 7: e-VAT Obligations
**Purpose:** Calculate VAT obligations based on entity type and business activities

**API:** `POST /home/CalculateVATObligation`

**Fields Added to Database:**
- `compliance_status` (VARCHAR) - Compliant, Non-Compliant, Pending
- `vat_registration_required` (BOOLEAN) - Whether VAT registration is required
- `applicable_vat_rate` (VARCHAR) - Description of applicable VAT rates

**Business Logic:**
- **Non-Resident + Digital Services**: VAT registration required
- **Domestic entities with sales > GH₵200,000**: VAT registration required
- **Rate**: Standard VAT (12.5%) + NHIL (2.5%) + GETFund (2.5%) = 17.5%

**Frontend Requirements:**
- Display compliance status card
- Show entity type and service type
- Display VAT requirement message
- Show applicable rate information

---

### Step 8: Complete Registration & TIN Generation
**Purpose:** Generate TIN, VAT ID, and complete user registration

**API:** `POST /home/CompleteRegistration`

**Fields Added to Database:**
- `tin` (VARCHAR) - Tax Identification Number (format: GHA########)
- `vat_id` (VARCHAR) - VAT ID (format: VP#########)
- `credential_id` (VARCHAR) - Unique credential identifier
- `verifiable_credential` (JSONB) - Complete verifiable credential object
- `registration_completed` (BOOLEAN) - Registration status

**Generated Data:**
- TIN: GHA + 8 random digits (e.g., GHA21984395)
- VAT ID: VP + 9 random digits (e.g., VP008041788)
- Credential ID: Unique UUID-like string
- Issue Date: Current date
- Verifiable Credential: W3C compliant credential structure

**Frontend Requirements:**
- Display credential card with:
  - Ghana Revenue Authority header
  - Subject Name
  - TIN number
  - Issue Date (formatted: "20 November 2025")
  - Credential ID
  - QR code (generate from credential data)
- "Download PDF" button (to be implemented)
- "Proceed to Login" button

---

### Login System
**Purpose:** Allow registered users to login using TIN or Ghana Card Number

**APIs:**
- `POST /home/send-otp` - Send OTP to registered email
- `POST /home/verify-otp` - Verify OTP and login

**Frontend Requirements:**
- Login page with input for TIN/Ghana Card Number
- "Login via OTP" button
- OTP verification modal with:
  - 6 OTP input boxes
  - Email display
  - 5-minute countdown timer
  - "Resend OTP" button
  - "Validate" button

---

### Dashboard
**Purpose:** Display user information, sales data, VAT liability, and messages

**APIs:**
- `GET /home/GetDashboard` - Fetch dashboard data
- `POST /home/UpdateSalesData` - Update sales and calculate VAT

**Fields Added to Database:**
- `total_sales` (DECIMAL) - Total sales amount
- `est_vat_liability` (DECIMAL) - Estimated VAT liability
- `vat_id` (VARCHAR) - VAT identification number

**Dashboard Components:**
1. **User Card:**
   - Name
   - TIN number
   - VAT ID
   - Compliance status badge

2. **Sales Summary:**
   - Total Sales (PSP Data)
   - Estimated VAT Liability
   - Link to detailed computation

3. **Recent History:**
   - Past VAT payments
   - Amounts and dates

4. **Messages:**
   - System notifications
   - Return deadline reminders
   - Maintenance alerts

---

## Database Schema Changes

### New Columns Added to `users` Table:

```sql
-- Agent Details
ghana_card_number VARCHAR(50)
agent_full_name VARCHAR(255)
agent_email VARCHAR(255)
agent_ghana_id VARCHAR(50)
agent_mobile VARCHAR(50)

-- Market Declaration
sells_digital_services BOOLEAN
annual_sales_volume VARCHAR(50)

-- Payment Gateway
payment_provider VARCHAR(50)
merchant_id VARCHAR(255)
payment_connected BOOLEAN DEFAULT FALSE
payment_connected_at TIMESTAMP

-- e-VAT Obligations
vat_id VARCHAR(100)
compliance_status VARCHAR(50)
vat_registration_required BOOLEAN
applicable_vat_rate VARCHAR(255)

-- Dashboard
total_sales DECIMAL(15, 2) DEFAULT 0.00
est_vat_liability DECIMAL(15, 2) DEFAULT 0.00
registration_completed BOOLEAN DEFAULT FALSE
```

### New Indexes:
```sql
CREATE INDEX idx_users_vat_id ON users(vat_id);
CREATE INDEX idx_users_merchant_id ON users(merchant_id);
```

---

## Setup Instructions

### 1. Database Migration

Run the migration script to add new fields to existing database:

```bash
psql -U postgres -d GRA_DB -f database/migration_add_new_fields.sql
```

Or if starting fresh:

```bash
psql -U postgres -d GRA_DB -f database/schema.sql
```

### 2. Start the Server

```bash
npm start
```

Server will run on: `http://localhost:3000`

### 3. Test APIs

Use the provided `test_apis.http` file with REST Client extension in VS Code, or use cURL/Postman with the examples in `API_DOCUMENTATION.md`.

---

## API Endpoints Summary

### Registration Flow
- `POST /v1/home/Register` - Send OTP
- `POST /v1/home/VerifyOTP` - Verify OTP
- `POST /v1/home/ResendOTP` - Resend OTP
- `POST /v1/home/SetEntity` - Set entity type
- `POST /v1/home/UpdateAgentDetails` - Update agent details

### New Features (Steps 5-8)
- `POST /v1/home/UpdateMarketDeclaration` - Market declaration
- `POST /v1/home/UpdatePaymentGateway` - Connect payment gateway
- `POST /v1/home/DisconnectPaymentGateway` - Disconnect gateway
- `POST /v1/home/CalculateVATObligation` - Calculate VAT obligations
- `POST /v1/home/CompleteRegistration` - Generate TIN & complete

### Login
- `POST /v1/home/send-otp` - Send login OTP
- `POST /v1/home/verify-otp` - Verify login OTP

### Dashboard
- `GET /v1/home/GetDashboard` - Get dashboard data
- `POST /v1/home/UpdateSalesData` - Update sales data

---

## Frontend Integration Guide

### 1. State Management
Store the following in your state management (Redux/Context):
- `unique_id` - After registration/login
- `user_data` - User details from dashboard
- `registration_step` - Current step in registration flow

### 2. API Call Flow

**Registration:**
```
Register → VerifyOTP → SetEntity → UpdateAgentDetails →
UpdateMarketDeclaration → UpdatePaymentGateway →
CalculateVATObligation → CompleteRegistration
```

**Login:**
```
send-otp → verify-otp → GetDashboard
```

### 3. Error Handling
All APIs return consistent error format:
```json
{
  "status": false,
  "resCode": 400,
  "message": "Error description"
}
```

Handle errors appropriately in UI with toast notifications or error messages.

### 4. Loading States
Implement loading states for all API calls to improve UX.

### 5. Form Validation
Validate data on frontend before sending to API:
- Email format validation
- Required field checks
- Dropdown selections
- OTP format (6 digits)

---

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Server starts without errors
- [ ] Registration flow works end-to-end
- [ ] Market declaration saves correctly
- [ ] Payment gateway connection works
- [ ] VAT obligation calculation is accurate
- [ ] TIN and VAT ID generation works
- [ ] Login with TIN works
- [ ] OTP verification works
- [ ] Dashboard displays correct data
- [ ] Sales data updates correctly

---

## Business Logic Notes

### VAT Calculation
- **Rate**: 17.5% total
  - Standard VAT: 12.5%
  - NHIL (National Health Insurance Levy): 2.5%
  - GETFund (Ghana Education Trust Fund): 2.5%

### VAT Registration Requirements
1. **Non-Resident** selling digital services to Ghana → **Required**
2. **Domestic entities** with annual sales > GH₵200,000 → **Required**
3. Others → Not required (but can opt-in)

### TIN Format
- Prefix: GHA
- Length: 11 characters
- Example: GHA21984395

### VAT ID Format
- Prefix: VP
- Length: 11 characters
- Example: VP008041788

### Merchant ID Format
- Prefix: MERCH-
- Length: 10 characters
- Example: MERCH-8284

---

## Security Considerations

1. **OTP Expiration**: OTPs expire after 5 minutes
2. **Unique IDs**: UUID v4 format for user identification
3. **Email Verification**: Required for registration
4. **SQL Injection**: All queries use parameterized statements
5. **Input Validation**: Validate all user inputs on backend

---

## Email Templates

The system sends emails for:
1. **Registration OTP** - `templates/otp_email.html`
2. **Welcome Email** - `templates/welcome_email.html` (sent after successful login)

Ensure these template files exist in the `templates/` directory.

---

## Environment Variables

Required in `.env` file:
```env
# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=GRA_DB
DB_USER=postgres
DB_PASSWORD=postgres

# Email
EMAIL_CONFIG_EMAIL=your-email@gmail.com
EMAIL_CONFIG_PASSWORD=your-app-password
```

---

## Next Steps for Frontend

1. **Implement Step 5 (Market Declaration):**
   - Create form with question about digital services
   - Add dropdown for sales volume
   - Call `UpdateMarketDeclaration` API

2. **Implement Step 6 (Payment Gateway):**
   - Create payment provider selection cards
   - Call `UpdatePaymentGateway` API
   - Show success state with merchant ID
   - Add disconnect functionality

3. **Implement Step 7 (e-VAT Obligations):**
   - Call `CalculateVATObligation` API
   - Display compliance status card
   - Show VAT requirements and rates

4. **Implement Step 8 (Registration Complete):**
   - Call `CompleteRegistration` API
   - Display TIN credential card
   - Generate QR code from credential data
   - Implement PDF download functionality
   - Add "Proceed to Login" button

5. **Implement Login Page:**
   - Create login form with TIN/Ghana Card input
   - Call `send-otp` API
   - Show OTP verification modal
   - Call `verify-otp` API
   - Redirect to dashboard on success

6. **Implement Dashboard:**
   - Call `GetDashboard` API
   - Display user information
   - Show sales and VAT liability
   - Display recent history
   - Show system messages

---

## Support

For any issues or questions:
1. Check `API_DOCUMENTATION.md` for detailed API specs
2. Use `test_apis.http` for API testing
3. Review error messages in server console
4. Check database for data persistence

---

## Conclusion

All backend APIs have been successfully implemented and are ready for frontend integration. The system now supports:
- Complete registration flow (8 steps)
- Market declaration
- Payment gateway linkage
- VAT obligation calculation
- TIN and VAT ID generation
- Login system
- Dashboard with sales tracking

The APIs follow RESTful conventions, include proper error handling, and return consistent response formats for easy frontend integration.
