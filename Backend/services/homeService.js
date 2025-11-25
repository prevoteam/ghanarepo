
const db = require('../database/db_helper');
const { Sequelize, QueryTypes } = require('sequelize');
const { success } = require("../model/responseModel");
const { Pool } = require('pg');
const fs = require('fs');
const readline = require('readline');
const moment = require('moment');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const { DateTime } = require('luxon');
const { start } = require('repl');
const nodemailer = require("nodemailer");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const Register = async (req, res) => {
  try {
    const { contact, method } = req.body;
    console.log("Received:", contact, method);

    if (!contact || !method) {
      return res
        .status(400)
        .json(success(false, 400, "contact & method required"));
    }

    if (!["email", "mobile"].includes(method)) {
      return res
        .status(400)
        .json(success(false, 400, "Invalid contact method"));
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 1️⃣ Check if user exists
    const checkUser = await pool.query(
      "SELECT id, unique_id FROM users WHERE contact_value = $1",
      [contact]
    );

    let uniqueId = null;

    if (checkUser.rows.length > 0) {
      // user exists
      uniqueId = checkUser.rows[0].unique_id;

      // 2️⃣ Update existing user OTP
      await pool.query(
        `
          UPDATE users
          SET otp_code = $1,
              otp_expires_at = $2,
              updated_at = NOW()
          WHERE contact_value = $3
        `,
        [otp, expiresAt, contact]
      );
    } else {
      // 3️⃣ Insert new user with new UUID
      const insertUser = await pool.query(
        `
          INSERT INTO users (contact_method, contact_value, otp_code, otp_expires_at)
          VALUES ($1, $2, $3, $4)
          RETURNING unique_id
        `,
        [method, contact, otp, expiresAt]
      );

      uniqueId = insertUser.rows[0].unique_id;
    }

    // 4️⃣ Send OTP via Email or SMS
    if (method === "email") {
      await sendEmailOTP(contact, otp);
    } else {
      await sendSmsOTP(contact, otp); // your SMS function
    }

    // 5️⃣ Return unique_id to frontend
    return res.status(200).json(
      success(true, 200, "OTP sent successfully", {
        unique_id: uniqueId,
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(success(false, 500, err.message));
  }
};


const sendEmailOTP = async (email, otp) => {

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_CONFIG_EMAIL,   // your Gmail
      pass: process.env.EMAIL_CONFIG_PASSWORD,  // MUST be an app password
    },
  });
 let htmlTemplate = fs.readFileSync("./templates/otp_email.html", "utf8");
  htmlTemplate = htmlTemplate.replace("{{OTP_CODE}}", otp);

  await transporter.sendMail({
    from: `"E-Commerce Registration Portal" `,
    to: email,
    subject: "Your OTP Code",
  html: htmlTemplate,
  });

  console.log("OTP Email Sent:", email, otp);
};

// -------------------------
// Mobile OTP (Placeholder)
// -------------------------
const sendSmsOTP = async (mobile, otp) => {
  console.log("SIMULATED SMS:", mobile, otp);
  // Add Twilio or SMS API later
};

// -------------------------
// Send Welcome Email
// -------------------------
const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL_CONFIG_EMAIL,
        pass: process.env.EMAIL_CONFIG_PASSWORD,
      },
    });

    let htmlTemplate = fs.readFileSync("./templates/welcome_email.html", "utf8");

    // Replace placeholders
    htmlTemplate = htmlTemplate.replace("{{USER_NAME}}", userName || "Valued Customer");
    htmlTemplate = htmlTemplate.replace("{{USER_EMAIL}}", email);
    htmlTemplate = htmlTemplate.replace("{{LOGIN_TIME}}", new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }));
    htmlTemplate = htmlTemplate.replace("{{PORTAL_URL}}", process.env.FRONT_SITE_URL || "#");

    await transporter.sendMail({
      from: `"E-Commerce Registration Portal" <${process.env.EMAIL_CONFIG_EMAIL}>`,
      to: email,
      subject: "Welcome to E-Commerce Portal - Login Successful",
      html: htmlTemplate,
    });

    console.log("Welcome Email Sent to:", email);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw error - we don't want to fail login if email fails
  }
};


const VerifyOTP = async (req, res) => {
  try {
    const { unique_id, otp } = req.body;

    if (!unique_id || !otp) {
      return res.status(400).json(success(false, 400, "unique_id & otp required"));
    }

    // 1️⃣ Fetch user
    const userQuery = await pool.query(
      `SELECT id, unique_id, otp_code, otp_expires_at, is_verified
       FROM users
       WHERE unique_id = $1`,
      [unique_id]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json(success(false, 404, "User not found"));
    }

    const user = userQuery.rows[0];

    // 2️⃣ Check OTP expired
    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json(success(false, 400, "OTP has expired"));
    }

    // 3️⃣ Compare OTP
    if (otp !== user.otp_code) {
      return res.status(400).json(success(false, 400, "Invalid OTP"));
    }

    // 4️⃣ Mark verified + clear OTP
    await pool.query(
      `UPDATE users
       SET is_verified = TRUE,
           otp_code = NULL,
           otp_expires_at = NULL,
           updated_at = NOW()
       WHERE unique_id = $1`,
      [unique_id]
    );

    return res.status(200).json(
      success(true, 200, "OTP verified successfully", {
        unique_id: user.unique_id,
        is_verified: true
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(success(false, 500, err.message));
  }
};
const ResendOTP = async (req, res) => {
  try {
    const { contact } = req.body;

    if (!contact) {
      return res.status(400).json(success(false, 400, "contact is required"));
    }

    // 1️⃣ Check user exists
    const userQuery = await pool.query(
      `SELECT unique_id, contact_method FROM users WHERE contact_value = $1`,
      [contact]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json(success(false, 404, "User not found"));
    }

    const user = userQuery.rows[0];

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 2️⃣ Update OTP
    await pool.query(
      `UPDATE users
       SET otp_code = $1,
           otp_expires_at = $2,
           updated_at = NOW()
       WHERE contact_value = $3`,
      [otp, expiresAt, contact]
    );

    // 3️⃣ Send OTP
    if (user.contact_method === "email") {
      await sendEmailOTP(contact, otp);
    } else {
      await sendSmsOTP(contact, otp);
    }

    return res.status(200).json(
      success(true, 200, "OTP resent successfully", {
        unique_id: user.unique_id,
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(success(false, 500, err.message));
  }
};

// homeService.js

const UpdateEntityType = async (req, res) => {
  try {
    const { unique_id, entity_type } = req.body;

    // 1) Validate input
    if (!unique_id || !entity_type) {
      return res
        .status(400)
        .json(success(false, 400, "unique_id & entity_type required"));
    }

    // Optional: validate entity_type values
    const allowedTypes = ["DomesticIndividual", "DomesticCompany", "NonResident"];
    if (!allowedTypes.includes(entity_type)) {
      return res
        .status(400)
        .json(success(false, 400, "Invalid entity_type"));
    }

    // 2) Update only the entity_type based on unique_id
    const result = await pool.query(
      `
        UPDATE users
        SET entity_type = $1,
            updated_at = NOW()
        WHERE unique_id = $2
        RETURNING id, unique_id, entity_type
      `,
      [entity_type, unique_id]
    ); // [web:137][web:150]

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json(success(false, 404, "User not found for given unique_id"));
    }

    const user = result.rows[0];

    return res.status(200).json(
      success(true, 200, "Entity type updated successfully", {
        id: user.id,
        unique_id: user.unique_id,
        entity_type: user.entity_type,
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(success(false, 500, err.message));
  }
};


const UpdateAgentDetails = async (req, res) => {
  try {
    const {
      unique_id,
      full_name,
      date_of_birth,
      ghana_card_number,
      agent_full_name,
      agent_email,
      agent_ghana_id,
      agent_mobile
    } = req.body;

    console.log("Received agent details update for unique_id:", unique_id);

    if (!unique_id) {
      return res.status(400).json(success(false, 400, "unique_id is required"));
    }

    // Check if user exists
    const checkUser = await pool.query(
      "SELECT id, unique_id FROM users WHERE unique_id = $1",
      [unique_id]
    );

    if (checkUser.rows.length === 0) {
      return res
        .status(404)
        .json(success(false, 404, "User not found for given unique_id"));
    }

    // Update agent details
    await pool.query(
      `
        UPDATE users
        SET full_name = $1,
            date_of_birth = $2,
            ghana_card_number = $3,
            agent_full_name = $4,
            agent_email = $5,
            agent_ghana_id = $6,
            agent_mobile = $7,
            updated_at = NOW()
        WHERE unique_id = $8
      `,
      [
        full_name,
        date_of_birth,
        ghana_card_number,
        agent_full_name,
        agent_email,
        agent_ghana_id,
        agent_mobile,
        unique_id
      ]
    );

    // Fetch updated user data
    const result = await pool.query(
      "SELECT id, unique_id, full_name, agent_full_name, agent_email FROM users WHERE unique_id = $1",
      [unique_id]
    );

    const user = result.rows[0];

    return res.status(200).json(
      success(true, 200, "Agent details updated successfully", {
        id: user.id,
        unique_id: user.unique_id,
        full_name: user.full_name,
        agent_full_name: user.agent_full_name,
        agent_email: user.agent_email
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(success(false, 500, err.message));
  }
};

const UpdateRegistration = async (req, res) => {
  try {
    const { uniqueId, method, contact, ...fields } = req.body;

    console.log("Received update request uniqueId:", uniqueId);
    console.log("Received fields:", fields);

    if (!uniqueId) {
      return res.status(400).json(success(false, 400, "uniqueId is required"));
    }

    // ✅ Handle file upload
    if (req.file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "video/mp4"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json(success(false, 400, "Invalid file type"));
      }

      // Save relative path - determine which document type
      const filePath = req.file.path.replace(/^uploads[\\/]/, "");

      if (fields.passport_document === 'true') {
        fields.passport_image = filePath;
        delete fields.passport_document;
      } else if (fields.selfie_document === 'true') {
        fields.selfie_image = filePath;
        delete fields.selfie_document;
      } else {
        fields.profile_image = filePath;
      }
    }

    // 1️⃣ Check if user exists
    const checkUser = await pool.query(
      `SELECT id, unique_id FROM users WHERE unique_id = $1`,
      [uniqueId]
    );

    if (checkUser.rows.length === 0) {
      return res
        .status(404)
        .json(success(false, 404, "User not found for this uniqueId"));
    }

    const dbUniqueId = checkUser.rows[0].unique_id; // <-- FIXED

    // 2️⃣ Build dynamic update SQL
    const setColumns = [];
    const values = [];
    let index = 1;

    for (const key in fields) {
      if (fields[key] !== undefined && fields[key] !== null) {
        setColumns.push(`${key} = $${index}`);
        values.push(fields[key]);
        index++;
      }
    }

    if (setColumns.length === 0) {
      return res.status(400).json(success(false, 400, "No fields to update"));
    }

    values.push(uniqueId);

    // 3️⃣ Execute update
    await pool.query(
      `
      UPDATE users
      SET ${setColumns.join(", ")},
          updated_at = NOW()
      WHERE unique_id = $${index}
      `,
      values
    );

    // 4️⃣ Create OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 5️⃣ Update OTP
    await pool.query(
      `
        UPDATE users
        SET otp_code = $1,
            otp_expires_at = $2,
            updated_at = NOW()
        WHERE unique_id = $3
      `,
      [otp, expiresAt, dbUniqueId]
    );

    // 6️⃣ Send OTP

    const userResult = await pool.query(
      `
        SELECT  contact_value
        FROM users
        WHERE unique_id = $1
      `,
      [dbUniqueId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Email  not found",
      });
    }

    const user = userResult.rows[0];
    const dbEmail = user.contact_value; 
    
      await sendEmailOTP(dbEmail, otp);
    

    return res.status(200).json(
      success(true, 200, "User updated successfully", {
        uniqueId: dbUniqueId,
        profile_image: fields.profile_image || null,
      })
    );

  } catch (err) {
    console.error("UpdateRegistration Error:", err);
    return res.status(500).json(success(false, 500, err.message));
  }
};


const UpdateCredential = async (req, res) => {
  try {
    const { uniqueId, tin, verifiableCredential, subjectName, issueDate, credentialId } = req.body;

    if (!uniqueId) {
      return res.status(400).json({ success: false, message: "uniqueId required" });
    }

    await pool.query(
      `
        UPDATE users
        SET tin = $1,
            verifiable_credential = $2,
            subject_name = $3,
            issue_date = $4,
            credential_id = $5,
            updated_at = NOW()
        WHERE unique_id = $6
      `,
      [
        tin,
        JSON.stringify(verifiableCredential),
        subjectName,
        issueDate,
        credentialId,
        uniqueId
      ]
    );

    res.json({
      success: true,
      message: "Credential updated successfully"
    });

  } catch (err) {
    console.error("UpdateCredential error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


const SendOtp = async (req, res) => {
  try {
    const { credential } = req.body;

    console.log("Received credential:", credential);

    if (!credential) {
      return res.status(400).json({
        status: false,
        message: "Credential is required"
      });
    }

    // 1️⃣ Check if user exists
    const checkUser = await pool.query(
      `
        SELECT unique_id, tin, subject_name,contact_value
        FROM users
        WHERE tin = $1 
      `,
      [credential]
    );

    if (checkUser.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    const user = checkUser.rows[0];
    const uniqueId = user.unique_id;
 const dbEmail = user.contact_value; 
    // 2️⃣ Generate OTP
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
  await sendEmailOTP(dbEmail, otp);
    // 3️⃣ Update OTP in DB (same pattern as Register)
    await pool.query(
      `
        UPDATE users
        SET otp_code = $1,
            otp_expires_at = $2,
            updated_at = NOW()
        WHERE unique_id = $3
      `,
      [otp, expiresAt, uniqueId]
    );

    console.log("OTP for", credential, ":", otp);

    // 4️⃣ Return OTP (test only)
    return res.status(200).json({
      status: true,
      message: "OTP sent successfully",
      otpDev: otp,
      unique_id: uniqueId
    });

  } catch (err) {
    console.error("SendOtp error:", err);
    return res.status(500).json({
      status: false,
      message: err.message
    });
  }
};



// ----------------------------------------------------------------------
// VERIFY OTP  (also same pattern as Register verify logic)
// ----------------------------------------------------------------------
const LoginVerifyOtp = async (req, res) => {
  try {
    const { credential, otp } = req.body;

    if (!credential || !otp) {
      return res.status(400).json({
        status: false,
        message: "credential and otp are required"
      });
    }

    // 1️⃣ Fetch user by credential (including email for welcome email)
    const result = await pool.query(
      `
        SELECT unique_id, otp_code, otp_expires_at, contact_value
        FROM users
        WHERE tin = $1
      `,
      [credential]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    const user = result.rows[0];

    // 2️⃣ Check OTP expiration
    if (new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({
        status: false,
        message: "OTP expired"
      });
    }

    // 3️⃣ Compare OTP
    if (user.otp_code !== otp) {
      return res.status(401).json({
        status: false,
        message: "Invalid OTP"
      });
    }

    // 4️⃣ Send welcome email after successful login
    if (user.contact_value) {
      await sendWelcomeEmail(user.contact_value,user.contact_value);
    }

    return res.status(200).json({
      status: true,
      message: "OTP verified successfully. Welcome email sent!",
      unique_id: user.unique_id
    });

  } catch (err) {
    console.error("LoginVerifyOtp error:", err);
    return res.status(500).json({
      status: false,
      message: err.message
    });
  }
};




// -------------------------
// Market Declaration (Step 5)
// -------------------------
const UpdateMarketDeclaration = async (req, res) => {
  try {
    const { unique_id, sells_digital_services, annual_sales_volume } = req.body;

    if (!unique_id) {
      return res.status(400).json(success(false, 400, "unique_id is required"));
    }

    if (sells_digital_services === undefined || !annual_sales_volume) {
      return res.status(400).json(
        success(false, 400, "sells_digital_services and annual_sales_volume are required")
      );
    }

    // Check if user exists
    const checkUser = await pool.query(
      "SELECT id, unique_id FROM users WHERE unique_id = $1",
      [unique_id]
    );

    if (checkUser.rows.length === 0) {
      return res.status(404).json(success(false, 404, "User not found"));
    }

    // Update market declaration
    await pool.query(
      `UPDATE users
       SET sells_digital_services = $1,
           annual_sales_volume = $2,
           updated_at = NOW()
       WHERE unique_id = $3`,
      [sells_digital_services, annual_sales_volume, unique_id]
    );

    return res.status(200).json(
      success(true, 200, "Market declaration updated successfully", {
        unique_id,
        sells_digital_services,
        annual_sales_volume
      })
    );
  } catch (err) {
    console.error("UpdateMarketDeclaration error:", err);
    return res.status(500).json(success(false, 500, err.message));
  }
};

// -------------------------
// Payment Gateway Linkage (Step 6)
// -------------------------
const UpdatePaymentGateway = async (req, res) => {
  try {
    const { unique_id, payment_provider, merchant_id } = req.body;

    if (!unique_id || !payment_provider) {
      return res.status(400).json(
        success(false, 400, "unique_id and payment_provider are required")
      );
    }

    // Validate payment provider
    const validProviders = ['Stripe', 'Paystack', 'Flutterwave', 'PayPal'];
    if (!validProviders.includes(payment_provider)) {
      return res.status(400).json(
        success(false, 400, "Invalid payment provider")
      );
    }

    // Check if user exists
    const checkUser = await pool.query(
      "SELECT id, unique_id FROM users WHERE unique_id = $1",
      [unique_id]
    );

    if (checkUser.rows.length === 0) {
      return res.status(404).json(success(false, 404, "User not found"));
    }

    // Generate merchant ID if not provided
    const finalMerchantId = merchant_id || `MERCH-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update payment gateway information
    await pool.query(
      `UPDATE users
       SET payment_provider = $1,
           merchant_id = $2,
           payment_connected = TRUE,
           payment_connected_at = NOW(),
           updated_at = NOW()
       WHERE unique_id = $3`,
      [payment_provider, finalMerchantId, unique_id]
    );

    return res.status(200).json(
      success(true, 200, "Payment gateway connected successfully", {
        unique_id,
        payment_provider,
        merchant_id: finalMerchantId,
        payment_connected: true
      })
    );
  } catch (err) {
    console.error("UpdatePaymentGateway error:", err);
    return res.status(500).json(success(false, 500, err.message));
  }
};

// -------------------------
// Disconnect Payment Gateway
// -------------------------
const DisconnectPaymentGateway = async (req, res) => {
  try {
    const { unique_id } = req.body;

    if (!unique_id) {
      return res.status(400).json(success(false, 400, "unique_id is required"));
    }

    // Update payment gateway to disconnect
    await pool.query(
      `UPDATE users
       SET payment_provider = NULL,
           merchant_id = NULL,
           payment_connected = FALSE,
           payment_connected_at = NULL,
           updated_at = NOW()
       WHERE unique_id = $1`,
      [unique_id]
    );

    return res.status(200).json(
      success(true, 200, "Payment gateway disconnected successfully")
    );
  } catch (err) {
    console.error("DisconnectPaymentGateway error:", err);
    return res.status(500).json(success(false, 500, err.message));
  }
};

// -------------------------
// e-VAT Obligations (Step 7)
// -------------------------
const CalculateVATObligation = async (req, res) => {
  try {
    const { unique_id } = req.body;

    if (!unique_id) {
      return res.status(400).json(success(false, 400, "unique_id is required"));
    }

    // Fetch user details
    const result = await pool.query(
      `SELECT entity_type, sells_digital_services, annual_sales_volume
       FROM users
       WHERE unique_id = $1`,
      [unique_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(success(false, 404, "User not found"));
    }

    const user = result.rows[0];

    // Determine VAT obligation based on entity type and digital services
    let vat_registration_required = false;
    let compliance_status = 'Compliant';
    let applicable_vat_rate = '';

    if (user.entity_type === 'NonResident' && user.sells_digital_services) {
      vat_registration_required = true;
      compliance_status = 'Pending';
      applicable_vat_rate = 'Standard VAT + NHIL + GETFund levies apply';
    } else if (user.entity_type === 'DomesticCompany' || user.entity_type === 'DomesticIndividual') {
      // Check sales volume threshold
      if (user.annual_sales_volume && parseFloat(user.annual_sales_volume) > 200000) {
        vat_registration_required = true;
        compliance_status = 'Pending';
        applicable_vat_rate = 'Standard VAT (12.5%) + NHIL (2.5%) + GETFund (2.5%) = 17.5%';
      }
    }

    // Update VAT obligations
    await pool.query(
      `UPDATE users
       SET compliance_status = $1,
           vat_registration_required = $2,
           applicable_vat_rate = $3,
           updated_at = NOW()
       WHERE unique_id = $4`,
      [compliance_status, vat_registration_required, applicable_vat_rate, unique_id]
    );

    return res.status(200).json(
      success(true, 200, "VAT obligations calculated successfully", {
        entity_type: user.entity_type,
        sells_digital_services: user.sells_digital_services,
        vat_registration_required,
        compliance_status,
        applicable_vat_rate
      })
    );
  } catch (err) {
    console.error("CalculateVATObligation error:", err);
    return res.status(500).json(success(false, 500, err.message));
  }
};

// -------------------------
// Generate TIN and Complete Registration (Step 8)
// -------------------------
const CompleteRegistration = async (req, res) => {
  try {
    const { unique_id } = req.body;

    if (!unique_id) {
      return res.status(400).json(success(false, 400, "unique_id is required"));
    }

    // Fetch user details
    const result = await pool.query(
      `SELECT id, unique_id, full_name, subject_name, tin, vat_id
       FROM users
       WHERE unique_id = $1`,
      [unique_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(success(false, 404, "User not found"));
    }

    const user = result.rows[0];

    // Generate TIN if not exists
    let tin = user.tin;
    if (!tin) {
      tin = `GHA${Math.floor(10000000 + Math.random() * 90000000)}`;
    }

    // Generate VAT ID
    const vat_id = `VP${Math.floor(100000000 + Math.random() * 900000000)}`;

    // Generate credential ID
    const credential_id = `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 12)}`;

    // Issue date
    const issue_date = new Date().toISOString().split('T')[0];

    // Subject name
    const subject_name = user.subject_name || user.full_name || "Registered User";

    // Create verifiable credential
    const verifiable_credential = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "TaxCredential"],
      issuer: "Ghana Revenue Authority",
      issuanceDate: issue_date,
      credentialSubject: {
        id: unique_id,
        name: subject_name,
        tin: tin,
        vatId: vat_id
      }
    };

    // Update user with complete registration
    await pool.query(
      `UPDATE users
       SET tin = $1,
           vat_id = $2,
           subject_name = $3,
           issue_date = $4,
           credential_id = $5,
           verifiable_credential = $6,
           registration_completed = TRUE,
           updated_at = NOW()
       WHERE unique_id = $7`,
      [
        tin,
        vat_id,
        subject_name,
        issue_date,
        credential_id,
        JSON.stringify(verifiable_credential),
        unique_id
      ]
    );

    return res.status(200).json(
      success(true, 200, "Registration completed successfully", {
        tin,
        vat_id,
        subject_name,
        issue_date,
        credential_id,
        verifiable_credential
      })
    );
  } catch (err) {
    console.error("CompleteRegistration error:", err);
    return res.status(500).json(success(false, 500, err.message));
  }
};

// -------------------------
// Get Dashboard Data
// -------------------------
const GetDashboard = async (req, res) => {
  try {
    const { unique_id } = req.query;

    if (!unique_id) {
      return res.status(400).json(success(false, 400, "unique_id is required"));
    }

    // Fetch complete user data
    const result = await pool.query(
      `SELECT
        unique_id,
        full_name,
        tin,
        vat_id,
        compliance_status,
        total_sales,
        est_vat_liability,
        entity_type,
        sells_digital_services,
        payment_provider,
        merchant_id,
        registration_completed,
        created_at
       FROM users
       WHERE unique_id = $1`,
      [unique_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(success(false, 404, "User not found"));
    }

    const user = result.rows[0];

    // Mock recent history
    const recent_history = [
      {
        month: "Oct 2023 VAT",
        amount: "GH₵4,200.00",
        date: "2023-10-15"
      },
      {
        month: "Sep 2023 VAT",
        amount: "GH₵3,890.00",
        date: "2023-09-15"
      }
    ];

    // Mock messages
    const messages = [
      {
        title: "Return Deadline Approaching",
        description: "Your Nov return is due in 5 days.",
        priority: "high"
      },
      {
        title: "System Maintenance",
        description: "Scheduled for Sunday 2am - 4am.",
        priority: "medium"
      }
    ];

    return res.status(200).json(
      success(true, 200, "Dashboard data fetched successfully", {
        user: {
          name: user.full_name || "User",
          tin: user.tin,
          vat_id: user.vat_id,
          compliance_status: user.compliance_status || "ONTRACK",
          entity_type: user.entity_type,
          sells_digital_services: user.sells_digital_services
        },
        sales: {
          total_sales: parseFloat(user.total_sales || 0).toFixed(2),
          est_vat_liability: parseFloat(user.est_vat_liability || 0).toFixed(2),
          currency: "GH₵"
        },
        recent_history,
        messages
      })
    );
  } catch (err) {
    console.error("GetDashboard error:", err);
    return res.status(500).json(success(false, 500, err.message));
  }
};

// -------------------------
// Update Sales and VAT Data
// -------------------------
const UpdateSalesData = async (req, res) => {
  try {
    const { unique_id, total_sales } = req.body;

    if (!unique_id || total_sales === undefined) {
      return res.status(400).json(
        success(false, 400, "unique_id and total_sales are required")
      );
    }

    // Calculate VAT liability (assuming 17.5% rate)
    const vat_rate = 0.175;
    const est_vat_liability = parseFloat(total_sales) * vat_rate;

    // Update sales data
    await pool.query(
      `UPDATE users
       SET total_sales = $1,
           est_vat_liability = $2,
           updated_at = NOW()
       WHERE unique_id = $3`,
      [total_sales, est_vat_liability, unique_id]
    );

    return res.status(200).json(
      success(true, 200, "Sales data updated successfully", {
        total_sales: parseFloat(total_sales).toFixed(2),
        est_vat_liability: est_vat_liability.toFixed(2)
      })
    );
  } catch (err) {
    console.error("UpdateSalesData error:", err);
    return res.status(500).json(success(false, 500, err.message));
  }
};

module.exports = {
    Register,
    VerifyOTP,
    ResendOTP,
    UpdateEntityType,
    UpdateRegistration,
    UpdateCredential,
    SendOtp,
    LoginVerifyOtp,
    UpdateMarketDeclaration,
    UpdatePaymentGateway,
    DisconnectPaymentGateway,
    CalculateVATObligation,
    CompleteRegistration,
    GetDashboard,
    UpdateSalesData,
    UpdateAgentDetails
};
