const { Pool } = require('pg');
const { success } = require("../model/responseModel");
const crypto = require('crypto');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// Generate random string for credentials
const generateRandomString = (length, prefix = '') => {
  const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
  return prefix + randomBytes.toString('hex').slice(0, length);
};

// Register PSP
const RegisterPSP = async (req, res) => {
  try {
    const { entity_name, bog_license_number, technical_contact_name, official_email } = req.body;

    // Validation
    if (!entity_name || !bog_license_number || !technical_contact_name || !official_email) {
      return res.status(400).json(
        success(false, 400, "All fields are required: entity_name, bog_license_number, technical_contact_name, official_email")
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(official_email)) {
      return res.status(400).json(
        success(false, 400, "Invalid email address")
      );
    }

    // Check if PSP already exists with same license number
    const existingPSP = await pool.query(
      "SELECT id FROM psp_registrations WHERE bog_license_number = $1",
      [bog_license_number]
    );

    if (existingPSP.rows.length > 0) {
      return res.status(400).json(
        success(false, 400, "A PSP with this BoG License Number already exists")
      );
    }

    // Generate credentials
    const psp_id = generateRandomString(8, 'psp_');
    const client_id = generateRandomString(16, 'psp_client_');
    const client_secret = generateRandomString(32, 'sk_test_');
    const webhook_key = generateRandomString(10, 'whsec_');

    // Insert PSP registration
    const result = await pool.query(
      `INSERT INTO psp_registrations (
        psp_id, entity_name, bog_license_number, technical_contact_name,
        official_email, client_id, client_secret, webhook_key, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'approved')
      RETURNING id, psp_id, entity_name, client_id, client_secret, webhook_key, created_at`,
      [psp_id, entity_name, bog_license_number, technical_contact_name, official_email, client_id, client_secret, webhook_key]
    );

    const psp = result.rows[0];

    return res.status(201).json(
      success(true, 201, "PSP registration successful", {
        psp_id: psp.psp_id,
        entity_name: psp.entity_name,
        client_id: psp.client_id,
        client_secret: psp.client_secret,
        webhook_key: psp.webhook_key,
        sandbox_url: "https://sandbox-api.gra.gov.gh/v1",
        created_at: psp.created_at
      })
    );

  } catch (err) {
    console.error("RegisterPSP error:", err);
    return res.status(500).json(success(false, 500, err.message));
  }
};

// Get PSP Credentials
const GetPSPCredentials = async (req, res) => {
  try {
    const { psp_id } = req.query;

    if (!psp_id) {
      return res.status(400).json(
        success(false, 400, "psp_id is required")
      );
    }

    const result = await pool.query(
      `SELECT psp_id, entity_name, client_id, client_secret, webhook_key, status, created_at
       FROM psp_registrations
       WHERE psp_id = $1`,
      [psp_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(
        success(false, 404, "PSP not found")
      );
    }

    const psp = result.rows[0];

    return res.status(200).json(
      success(true, 200, "PSP credentials retrieved", {
        psp_id: psp.psp_id,
        entity_name: psp.entity_name,
        client_id: psp.client_id,
        client_secret: psp.client_secret,
        webhook_key: psp.webhook_key,
        status: psp.status,
        sandbox_url: "https://sandbox-api.gra.gov.gh/v1",
        created_at: psp.created_at
      })
    );

  } catch (err) {
    console.error("GetPSPCredentials error:", err);
    return res.status(500).json(success(false, 500, err.message));
  }
};

// Test API Endpoint (for sandbox testing)
const TestEndpoint = async (req, res) => {
  try {
    const { endpoint, method, apiKey, body } = req.body;

    if (!endpoint || !method || !apiKey) {
      return res.status(400).json(
        success(false, 400, "endpoint, method, and apiKey are required")
      );
    }

    // Verify API key
    const pspCheck = await pool.query(
      "SELECT psp_id, entity_name FROM psp_registrations WHERE client_secret = $1",
      [apiKey]
    );

    if (pspCheck.rows.length === 0) {
      return res.status(401).json(
        success(false, 401, "Invalid API key")
      );
    }

    // Simulate API response based on endpoint
    let responseData = {};

    if (endpoint.includes('/transactions/report')) {
      const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
      const amount = parsedBody?.amount || 0;
      const vatRate = 0.15; // 15% VAT

      responseData = {
        success: true,
        transaction_id: parsedBody?.transaction_id || `txn_${Date.now()}`,
        vat_calculated: (amount * vatRate).toFixed(2),
        currency: parsedBody?.currency || "GHS",
        message: "Transaction recorded successfully"
      };
    } else if (endpoint.includes('/merchants') && endpoint.includes('/compliance')) {
      responseData = {
        success: true,
        merchant_id: endpoint.split('/')[3] || "MRCH-0001",
        compliance_status: "compliant",
        last_filing_date: new Date().toISOString().split('T')[0],
        next_filing_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
    } else if (endpoint.includes('/tax-rates')) {
      responseData = {
        success: true,
        rates: [
          { type: "VAT", rate: 15, description: "Standard VAT rate" },
          { type: "NHIL", rate: 2.5, description: "National Health Insurance Levy" },
          { type: "GETFund", rate: 2.5, description: "Ghana Education Trust Fund" },
          { type: "COVID-19", rate: 1, description: "COVID-19 Health Recovery Levy" }
        ],
        effective_date: "2023-01-01"
      };
    } else {
      responseData = {
        success: true,
        message: "Sandbox test successful",
        endpoint: endpoint,
        method: method
      };
    }

    return res.status(200).json(
      success(true, 200, "API test successful", responseData)
    );

  } catch (err) {
    console.error("TestEndpoint error:", err);
    return res.status(500).json(success(false, 500, err.message));
  }
};

module.exports = {
  RegisterPSP,
  GetPSPCredentials,
  TestEndpoint
};
