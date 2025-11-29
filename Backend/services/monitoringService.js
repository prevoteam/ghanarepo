const { Pool } = require('pg');
const { success } = require("../model/responseModel");
const nodemailer = require("nodemailer");
const fs = require('fs');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateSessionId = () => crypto.randomBytes(32).toString('hex');

// Send OTP Email
const sendMonitoringOTPEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_CONFIG_EMAIL,
            pass: process.env.EMAIL_CONFIG_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    let htmlTemplate;
    try {
        htmlTemplate = fs.readFileSync("./templates/otp_email.html", "utf8");
        htmlTemplate = htmlTemplate.replace("{{OTP_CODE}}", otp);
    } catch (err) {
        // Fallback to simple HTML if template not found
        htmlTemplate = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>GRA Monitoring Portal - OTP Verification</h2>
                <p>Your One-Time Password (OTP) for login verification is:</p>
                <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p>This OTP will expire in 5 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `;
    }

    await transporter.sendMail({
        from: `"GRA Monitoring Portal" <${process.env.EMAIL_CONFIG_EMAIL}>`,
        to: email,
        subject: "Your GRA Monitoring Portal OTP Code",
        html: htmlTemplate,
    });

    console.log("Monitoring OTP Email Sent:", email, otp);
};

// Send Login Success Email
const sendLoginSuccessEmail = async (email, username) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_CONFIG_EMAIL,
            pass: process.env.EMAIL_CONFIG_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const loginTime = new Date().toLocaleString('en-US', {
        timeZone: 'Africa/Accra',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e40af; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">GRA Monitoring Portal</h1>
            </div>
            <div style="padding: 30px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e40af;">Login Successful</h2>
                <p>Hello <strong>${username}</strong>,</p>
                <p>You have successfully logged into the GRA Monitoring Portal.</p>
                <div style="background-color: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Login Time:</strong> ${loginTime}</p>
                </div>
                <p>If you did not perform this login, please contact the administrator immediately.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="color: #64748b; font-size: 12px;">This is an automated message from GRA Monitoring Portal. Please do not reply to this email.</p>
            </div>
        </div>
    `;

    await transporter.sendMail({
        from: `"GRA Monitoring Portal" <${process.env.EMAIL_CONFIG_EMAIL}>`,
        to: email,
        subject: "GRA Monitoring Portal - Login Successful",
        html: htmlTemplate,
    });

    console.log("Login Success Email Sent to:", email);
};

// -------------------------
// Monitoring Login (Simple username/password check) - Now uses unified users table
// -------------------------
const MonitoringLogin = async (req, res) => {
    try {
        const { user_id, password } = req.body;


        if (!user_id || !password) {
            return res.status(400).json(
                success(false, 400, "User ID and password are required", null)
            );
        }
        console.log("Monitoring Login attempt for username:", user_id);

        // 1️⃣ Find user by username from users table (GRA admin roles only)
        const userQuery = await pool.query(
            `SELECT id, unique_id, username, password, email, user_role, full_name, is_active
             FROM users
             WHERE username = $1 AND user_role IN ('gra_maker', 'gra_checker', 'monitoring', 'admin')`,
            [user_id]
        );

        console.log("User query result:", userQuery.rows);

        if (userQuery.rows.length === 0) {
            return res.status(404).json(
                success(false, 404, "Invalid credentials. User not found.", null)
            );
        }

        const user = userQuery.rows[0];

        // Check if user is active
        if (user.is_active === false) {
            return res.status(403).json(
                success(false, 403, "Account is deactivated. Please contact administrator.", null)
            );
        }

        // 2️⃣ Verify password (plain text comparison)
        if (password !== user.password) {
            return res.status(401).json(
                success(false, 401, "Invalid credentials. Incorrect password.", null)
            );
        }

        // 3️⃣ Generate OTP and session
        const otp = generateOTP();
        const sessionId = generateSessionId();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // 4️⃣ Store OTP and session in database
        await pool.query(
            `UPDATE users
             SET otp_code = $1,
                 otp_expires_at = $2,
                 session_id = $3,
                 updated_at = NOW()
             WHERE id = $4`,
            [otp, expiresAt, sessionId, user.id]
        );

        // 5️⃣ Send OTP via email
        if (user.email) {
            console.log("Sending OTP email to:", user.email);
            try {
                await sendMonitoringOTPEmail(user.email, otp);
            } catch (emailError) {
                console.error("OTP email failed:", emailError);
                // Continue even if email fails - OTP is stored in DB
            }
        }

        // 6️⃣ Return session_id, user_role and masked email for OTP verification
        const maskedEmail = user.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '';

        return res.status(200).json(
            success(true, 200, "OTP sent successfully. Please verify to complete login.", {
                session_id: sessionId,
                email: maskedEmail,
                user_role: user.user_role
            })
        );

    } catch (err) {
        console.error("MonitoringLogin error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Verify Monitoring OTP (Step 2: Complete login) - Now uses unified users table
// -------------------------
const MonitoringVerifyOTP = async (req, res) => {
    try {
        const { session_id, otp } = req.body;

        console.log("Monitoring OTP verification for session:", session_id);

        if (!session_id || !otp) {
            return res.status(400).json(
                success(false, 400, "Session ID and OTP are required", null)
            );
        }

        // 1️⃣ Find user by session_id from users table
        const userQuery = await pool.query(
            `SELECT id, unique_id, username, email, user_role, full_name, otp_code, otp_expires_at
             FROM users
             WHERE session_id = $1 AND user_role IN ('gra_maker', 'gra_checker', 'monitoring', 'admin')`,
            [session_id]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json(
                success(false, 404, "Invalid session. Please login again.", null)
            );
        }

        const user = userQuery.rows[0];

        // 2️⃣ Check OTP expiration
        if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json(
                success(false, 400, "OTP has expired. Please request a new one.", null)
            );
        }

        // 3️⃣ Verify OTP
        if (otp !== user.otp_code) {
            return res.status(401).json(
                success(false, 401, "Invalid OTP. Please try again.", null)
            );
        }

        // 4️⃣ Clear OTP and update last login
        await pool.query(
            `UPDATE users
             SET otp_code = NULL,
                 otp_expires_at = NULL,
                 last_login_at = NOW(),
                 updated_at = NOW()
             WHERE id = $1`,
            [user.id]
        );

        // 5️⃣ Send login success email
        if (user.email) {
            try {
                await sendLoginSuccessEmail(user.email, user.username || user.full_name);
            } catch (emailError) {
                console.error("Login success email failed:", emailError);
            }
        }

        return res.status(200).json(
            success(true, 200, "Login successful", {
                user: {
                    username: user.username,
                    email: user.email,
                    user_role: user.user_role,
                    full_name: user.full_name
                }
            })
        );

    } catch (err) {
        console.error("MonitoringVerifyOTP error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Resend Monitoring OTP - Now uses unified users table
// -------------------------
const MonitoringResendOTP = async (req, res) => {
    try {
        const { session_id } = req.body;

        if (!session_id) {
            return res.status(400).json(
                success(false, 400, "Session ID is required", null)
            );
        }

        // 1️⃣ Find user by session_id from users table
        const userQuery = await pool.query(
            `SELECT id, email FROM users WHERE session_id = $1 AND user_role IN ('gra_maker', 'gra_checker', 'monitoring', 'admin')`,
            [session_id]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json(
                success(false, 404, "Invalid session. Please login again.", null)
            );
        }

        const user = userQuery.rows[0];

        // 2️⃣ Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // 3️⃣ Update OTP
        await pool.query(
            `UPDATE users
             SET otp_code = $1,
                 otp_expires_at = $2,
                 updated_at = NOW()
             WHERE id = $3`,
            [otp, expiresAt, user.id]
        );

        // 4️⃣ Send OTP
        if (user.email) {
            try {
                await sendMonitoringOTPEmail(user.email, otp);
            } catch (emailError) {
                console.error("Email sending failed:", emailError);
            }
        }

        return res.status(200).json(
            success(true, 200, "OTP resent successfully", null)
        );

    } catch (err) {
        console.error("MonitoringResendOTP error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Monitoring Logout - Now uses unified users table
// -------------------------
const MonitoringLogout = async (req, res) => {
    try {
        const authToken = req.headers['x-auth-token'];

        if (!authToken) {
            return res.status(400).json(
                success(false, 400, "Auth token is required", null)
            );
        }

        // Clear auth token and session from users table
        await pool.query(
            `UPDATE users
             SET auth_token = NULL,
                 auth_token_expires_at = NULL,
                 session_id = NULL,
                 updated_at = NOW()
             WHERE auth_token = $1 AND user_role IN ('gra_maker', 'gra_checker', 'monitoring', 'admin')`,
            [authToken]
        );

        return res.status(200).json(
            success(true, 200, "Logged out successfully", null)
        );

    } catch (err) {
        console.error("MonitoringLogout error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Set Password (for first-time setup or password reset) - Now uses unified users table
// -------------------------
const SetPassword = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json(
                success(false, 400, "Username and password are required", null)
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json(
                success(false, 400, "Password must be at least 8 characters long", null)
            );
        }

        // Update user password (plain text) from users table
        const result = await pool.query(
            `UPDATE users
             SET password = $1,
                 updated_at = NOW()
             WHERE username = $2 AND user_role IN ('gra_maker', 'gra_checker', 'monitoring', 'admin')
             RETURNING id, username`,
            [password, username]
        );

        if (result.rowCount === 0) {
            return res.status(404).json(
                success(false, 404, "User not found", null)
            );
        }

        return res.status(200).json(
            success(true, 200, "Password set successfully", null)
        );

    } catch (err) {
        console.error("SetPassword error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Get Merchant Discovery List
// -------------------------
const GetMerchantDiscovery = async (req, res) => {
    try {
        const { status, page = 1, limit = 10, search } = req.query;

        console.log("GetMerchantDiscovery params:", { status, page, limit, search });

        let query = `SELECT id, transaction_id, timestamp, sender_account, receiver_account,
                     psp_provider, trans_type, amount_ghs, e_levy_applied, e_levy_amount, status
                     FROM psp_transactions WHERE 1=1`;
        const params = [];
        let paramIndex = 1;

        // Filter by status if provided
        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        // Search by transaction_id, sender_account, receiver_account
        if (search) {
            query += ` AND (transaction_id ILIKE $${paramIndex} OR sender_account ILIKE $${paramIndex} OR receiver_account ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Get total count for pagination
        const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM');
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Add ordering and pagination
        query += ` ORDER BY id DESC`;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), offset);

        const result = await pool.query(query, params);

        return res.status(200).json(
            success(true, 200, "Merchant discovery data fetched successfully", {
                merchants: result.rows,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            })
        );

    } catch (err) {
        console.error("GetMerchantDiscovery error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Get Merchant Discovery Stats
// -------------------------
const GetMerchantDiscoveryStats = async (req, res) => {
    try {
        const statsQuery = `
            SELECT
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as success,
                COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed,
                COALESCE(SUM(CAST(NULLIF(e_levy_amount, '') AS DECIMAL)), 0) as total_levy_amount,
                COALESCE(SUM(CAST(NULLIF(amount_ghs, '') AS DECIMAL)), 0) as total_amount_ghs
            FROM psp_transactions
        `;

        const result = await pool.query(statsQuery);
        const stats = result.rows[0];

        return res.status(200).json(
            success(true, 200, "Merchant discovery stats fetched successfully", {
                total: parseInt(stats.total),
                pending: parseInt(stats.pending),
                success: parseInt(stats.success),
                failed: parseInt(stats.failed),
                total_levy_amount: parseFloat(stats.total_levy_amount).toFixed(2),
                total_amount_ghs: parseFloat(stats.total_amount_ghs).toFixed(2)
            })
        );

    } catch (err) {
        console.error("GetMerchantDiscoveryStats error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Get Merchant Statistics
// -------------------------
const GetMerchantStatistics = async (req, res) => {
    try {
        const { risk_score, page = 1, limit = 100 } = req.query;

        console.log("GetMerchantStatistics params:", { risk_score, page, limit });

        let query = `SELECT id, transaction_id, timestamp, sender_account, receiver_account,
                     psp_provider, trans_type, amount_ghs, e_levy_applied, e_levy_amount, status
                     FROM psp_transactions WHERE 1=1`;
        const params = [];
        let paramIndex = 1;

        // Filter by risk_score/status if provided
        if (risk_score) {
            query += ` AND status = $${paramIndex}`;
            params.push(risk_score);
            paramIndex++;
        }

        // Get total count for pagination
        const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM');
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Add ordering and pagination
        query += ` ORDER BY CAST(NULLIF(amount_ghs, '') AS DECIMAL) DESC NULLS LAST`;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), offset);

        const result = await pool.query(query, params);

        return res.status(200).json(
            success(true, 200, "Merchant statistics fetched successfully", {
                merchants: result.rows,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            })
        );

    } catch (err) {
        console.error("GetMerchantStatistics error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Configuration Login (TIN/Ghana Card - Send OTP)
// -------------------------
const ConfigurationLogin = async (req, res) => {
    try {
        const { tin_ghana_card, user_role } = req.body;

        console.log("Configuration Login attempt for TIN/Ghana Card:", tin_ghana_card, "Role:", user_role);

        if (!tin_ghana_card) {
            return res.status(400).json(
                success(false, 400, "TIN/Ghana Card Number is required", null)
            );
        }

        // 1️⃣ Find user by ghanacardnumber or agent_tin from users table
        const userQuery = await pool.query(
            `SELECT id, unique_id, ghana_card_number, agent_tin, contact_value
             FROM users
             WHERE ghana_card_number = $1`,
            [String(tin_ghana_card)]
        );

        console.log("User query result:", userQuery.rows);

        if (userQuery.rows.length === 0) {
            return res.status(404).json(
                success(false, 404, "TIN/Ghana Card Number not found. Please check and try again.", null)
            );
        }

        const user = userQuery.rows[0];

        // Check if email exists
        if (!user.contact_value) {
            return res.status(400).json(
                success(false, 400, "No email associated with this account.", null)
            );
        }

        // 2️⃣ Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // 3️⃣ Store OTP in database
        await pool.query(
            `UPDATE users
             SET otp_code = $1,
                 otp_expires_at = $2,
                 updated_at = NOW()
             WHERE id = $3`,
            [otp, expiresAt, user.id]
        );

        // 4️⃣ Send OTP via email
        console.log("Sending OTP email to:", user.contact_value);
        try {
            await sendMonitoringOTPEmail(user.contact_value, otp);
        } catch (emailError) {
            console.error("OTP email failed:", emailError);
        }

        // 5️⃣ Return unique_id and masked email
        const maskedEmail = user.contact_value.replace(/(.{2})(.*)(@.*)/, '$1***$3');

        return res.status(200).json(
            success(true, 200, "OTP sent successfully. Please verify to complete login.", {
                unique_id: user.unique_id,
                email: maskedEmail,
                user_role: user_role || 'maker'
            })
        );

    } catch (err) {
        console.error("ConfigurationLogin error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Configuration Verify OTP
// -------------------------
const ConfigurationVerifyOTP = async (req, res) => {
    try {
        const { unique_id, otp } = req.body;

        console.log("Configuration OTP verification for unique_id:", unique_id);

        if (!unique_id || !otp) {
            return res.status(400).json(
                success(false, 400, "Unique ID and OTP are required", null)
            );
        }

        // 1️⃣ Find user by unique_id
        const userQuery = await pool.query(
            `SELECT id, unique_id, contact_value, fullname, full_name, ghanacardnumber, agent_tin, otp_code, otp_expires_at
             FROM users
             WHERE unique_id = $1`,
            [unique_id]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json(
                success(false, 404, "Invalid session. Please login again.", null)
            );
        }

        const user = userQuery.rows[0];

        // 2️⃣ Check OTP expiration
        if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json(
                success(false, 400, "OTP has expired. Please request a new one.", null)
            );
        }

        // 3️⃣ Verify OTP
        if (otp !== user.otp_code) {
            return res.status(401).json(
                success(false, 401, "Invalid OTP. Please try again.", null)
            );
        }

        // 4️⃣ Clear OTP
        await pool.query(
            `UPDATE users
             SET otp_code = NULL,
                 otp_expires_at = NULL,
                 updated_at = NOW()
             WHERE id = $1`,
            [user.id]
        );

        // 5️⃣ Send login success email
        if (user.contact_value) {
            try {
                await sendLoginSuccessEmail(user.contact_value, user.fullname || user.full_name || 'User');
            } catch (emailError) {
                console.error("Login success email failed:", emailError);
            }
        }

        return res.status(200).json(
            success(true, 200, "Login successful", {
                user: {
                    id: user.id,
                    unique_id: user.unique_id,
                    email: user.contact_value,
                    name: user.fullname || user.full_name,
                    ghana_card: user.ghanacardnumber,
                    tin: user.agent_tin
                }
            })
        );

    } catch (err) {
        console.error("ConfigurationVerifyOTP error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Configuration Resend OTP
// -------------------------
const ConfigurationResendOTP = async (req, res) => {
    try {
        const { unique_id } = req.body;

        if (!unique_id) {
            return res.status(400).json(
                success(false, 400, "Unique ID is required", null)
            );
        }

        // 1️⃣ Find user by unique_id
        const userQuery = await pool.query(
            `SELECT id, contact_value FROM users WHERE unique_id = $1`,
            [unique_id]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json(
                success(false, 404, "Invalid session. Please login again.", null)
            );
        }

        const user = userQuery.rows[0];

        // 2️⃣ Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // 3️⃣ Update OTP
        await pool.query(
            `UPDATE users
             SET otp_code = $1,
                 otp_expires_at = $2,
                 updated_at = NOW()
             WHERE id = $3`,
            [otp, expiresAt, user.id]
        );

        // 4️⃣ Send OTP
        if (user.contact_value) {
            try {
                await sendMonitoringOTPEmail(user.contact_value, otp);
            } catch (emailError) {
                console.error("Email sending failed:", emailError);
            }
        }

        return res.status(200).json(
            success(true, 200, "OTP resent successfully", null)
        );

    } catch (err) {
        console.error("ConfigurationResendOTP error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// GRA Admin Unified Login - Now uses only users table
// -------------------------
const GRAAdminLogin = async (req, res) => {
    try {
        const { user_id, password } = req.body;

        console.log("GRA Admin Login attempt for user:", user_id);

        if (!user_id || !password) {
            return res.status(400).json(
                success(false, 400, "User ID and password are required", null)
            );
        }

        // Find user by username from users table (GRA admin roles only)
        const userQuery = await pool.query(
            `SELECT id, unique_id, username, password, email, user_role, full_name, is_active
             FROM users
             WHERE username = $1 AND user_role IN ('gra_maker', 'gra_checker', 'monitoring', 'admin')`,
            [user_id]
        );

        if (userQuery.rows.length === 0) {
            return res.status(401).json(
                success(false, 401, "Invalid credentials. Please check your User ID and Password.", null)
            );
        }

        const dbUser = userQuery.rows[0];

        // Check if user is active
        if (dbUser.is_active === false) {
            return res.status(403).json(
                success(false, 403, "Account is deactivated. Please contact administrator.", null)
            );
        }

        // Verify password
        if (password !== dbUser.password) {
            return res.status(401).json(
                success(false, 401, "Invalid credentials. Please check your User ID and Password.", null)
            );
        }

        // Generate OTP and session
        const otp = generateOTP();
        const sessionId = generateSessionId();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store OTP and session in users table
        await pool.query(
            `UPDATE users
             SET otp_code = $1, otp_expires_at = $2, session_id = $3, updated_at = NOW()
             WHERE id = $4`,
            [otp, expiresAt, sessionId, dbUser.id]
        );

        // Send OTP via email
        if (dbUser.email) {
            console.log("Sending GRA Admin OTP to:", dbUser.email);
            try {
                await sendMonitoringOTPEmail(dbUser.email, otp);
            } catch (emailError) {
                console.error("OTP email failed:", emailError);
            }
        }

        // Return session info
        const maskedEmail = dbUser.email ? dbUser.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '';

        return res.status(200).json(
            success(true, 200, "OTP sent successfully. Please verify to complete login.", {
                session_id: sessionId,
                unique_id: dbUser.unique_id,
                email: maskedEmail,
                user_role: dbUser.user_role
            })
        );

    } catch (err) {
        console.error("GRAAdminLogin error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// GRA Admin Verify OTP - Now uses only users table
// -------------------------
const GRAAdminVerifyOTP = async (req, res) => {
    try {
        const { session_id, otp } = req.body;

        console.log("GRA Admin OTP verification for session:", session_id);

        if (!session_id || !otp) {
            return res.status(400).json(
                success(false, 400, "Session ID and OTP are required", null)
            );
        }

        // Find user by session_id from users table
        const userQuery = await pool.query(
            `SELECT id, unique_id, username, email, user_role, full_name, otp_code, otp_expires_at
             FROM users
             WHERE session_id = $1 AND user_role IN ('gra_maker', 'gra_checker', 'monitoring', 'admin')`,
            [session_id]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json(
                success(false, 404, "Invalid session. Please login again.", null)
            );
        }

        const user = userQuery.rows[0];

        // Check OTP expiration
        if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json(
                success(false, 400, "OTP has expired. Please request a new one.", null)
            );
        }

        // Verify OTP
        if (otp !== user.otp_code) {
            return res.status(401).json(
                success(false, 401, "Invalid OTP. Please try again.", null)
            );
        }

        // Generate auth token
        const authToken = generateSessionId();

        // Clear OTP and update last login
        await pool.query(
            `UPDATE users
             SET otp_code = NULL, otp_expires_at = NULL, auth_token = $1, last_login_at = NOW(), updated_at = NOW()
             WHERE id = $2`,
            [authToken, user.id]
        );

        // Send login success email
        if (user.email) {
            try {
                await sendLoginSuccessEmail(user.email, user.username || user.full_name);
            } catch (emailError) {
                console.error("Login success email failed:", emailError);
            }
        }

        return res.status(200).json(
            success(true, 200, "Login successful", {
                token: authToken,
                user_role: user.user_role,
                unique_id: user.unique_id,
                user: {
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name
                }
            })
        );

    } catch (err) {
        console.error("GRAAdminVerifyOTP error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// GRA Admin Resend OTP - Now uses only users table
// -------------------------
const GRAAdminResendOTP = async (req, res) => {
    try {
        const { session_id } = req.body;

        if (!session_id) {
            return res.status(400).json(
                success(false, 400, "Session ID is required", null)
            );
        }

        // Find user by session_id from users table
        const userQuery = await pool.query(
            `SELECT id, email FROM users WHERE session_id = $1 AND user_role IN ('gra_maker', 'gra_checker', 'monitoring', 'admin')`,
            [session_id]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json(
                success(false, 404, "Invalid session. Please login again.", null)
            );
        }

        const user = userQuery.rows[0];

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Update OTP
        await pool.query(
            `UPDATE users SET otp_code = $1, otp_expires_at = $2, updated_at = NOW() WHERE id = $3`,
            [otp, expiresAt, user.id]
        );

        // Send OTP
        if (user.email) {
            try {
                await sendMonitoringOTPEmail(user.email, otp);
            } catch (emailError) {
                console.error("Email sending failed:", emailError);
            }
        }

        return res.status(200).json(
            success(true, 200, "OTP resent successfully", null)
        );

    } catch (err) {
        console.error("GRAAdminResendOTP error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Get VAT Rates
// -------------------------
const GetVATRates = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, levy_type, rate, effective_date, calculation_order, status, pending_rate, submitted_by, submitted_at
             FROM vat_rates
             ORDER BY id ASC`
        );

        return res.status(200).json(
            success(true, 200, "VAT rates fetched successfully", {
                rates: result.rows
            })
        );
    } catch (err) {
        console.error("GetVATRates error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Submit VAT Rate Change (Maker)
// -------------------------
const SubmitVATRateChange = async (req, res) => {
    try {
        const { rate_id, new_rate, submitted_by } = req.body;

        console.log("VAT Rate change request:", { rate_id, new_rate, submitted_by });

        if (!rate_id || !new_rate) {
            return res.status(400).json(
                success(false, 400, "Rate ID and new rate are required", null)
            );
        }

        // Update the rate with pending status
        const result = await pool.query(
            `UPDATE vat_rates
             SET pending_rate = $1,
                 status = 'pending',
                 submitted_by = $2,
                 submitted_at = NOW(),
                 updated_at = NOW()
             WHERE id = $3
             RETURNING *`,
            [new_rate, submitted_by || 'maker', rate_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json(
                success(false, 404, "VAT rate not found", null)
            );
        }

        // Create notification for checkers
        const rateData = result.rows[0];
        await pool.query(
            `INSERT INTO notifications (
                notification_type, title, message, target_role,
                reference_id, reference_type, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                'rate_approval',
                'VAT Rate Approval Required',
                `A VAT rate change for ${rateData.levy_type || 'VAT'} is pending approval. Please review.`,
                'gra_checker',
                rate_id,
                'vat_rate',
                submitted_by || 'maker'
            ]
        );

        return res.status(200).json(
            success(true, 200, "Rate change submitted for approval", {
                rate: result.rows[0]
            })
        );
    } catch (err) {
        console.error("SubmitVATRateChange error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Approve/Reject VAT Rate Change (Checker)
// -------------------------
const ApproveRejectVATRate = async (req, res) => {
    try {
        const { rate_id, action, approved_by } = req.body;

        console.log("VAT Rate approval request:", { rate_id, action, approved_by });

        if (!rate_id || !action) {
            return res.status(400).json(
                success(false, 400, "Rate ID and action are required", null)
            );
        }

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json(
                success(false, 400, "Action must be 'approve' or 'reject'", null)
            );
        }

        // First check if the rate exists and has pending status
        const checkResult = await pool.query(
            `SELECT id, levy_type, status, pending_rate FROM vat_rates WHERE id = $1`,
            [rate_id]
        );

        if (checkResult.rowCount === 0) {
            return res.status(404).json(
                success(false, 404, "VAT rate not found with the given ID", null)
            );
        }

        const existingRate = checkResult.rows[0];

        if (existingRate.status !== 'pending') {
            return res.status(400).json(
                success(false, 400, `Cannot ${action} - rate is not in pending status. Current status: ${existingRate.status}`, null)
            );
        }

        if (action === 'approve' && existingRate.pending_rate === null) {
            return res.status(400).json(
                success(false, 400, "Cannot approve - no pending rate value found", null)
            );
        }

        let result;

        if (action === 'approve') {
            // Apply the pending rate and clear pending status
            result = await pool.query(
                `UPDATE vat_rates
                 SET rate = pending_rate,
                     pending_rate = NULL,
                     status = 'active',
                     approved_by = $1,
                     approved_at = NOW(),
                     updated_at = NOW()
                 WHERE id = $2
                 RETURNING *`,
                [approved_by || 'checker', rate_id]
            );
        } else {
            // Reject - clear pending rate and status
            result = await pool.query(
                `UPDATE vat_rates
                 SET pending_rate = NULL,
                     status = 'active',
                     rejected_by = $1,
                     rejected_at = NOW(),
                     updated_at = NOW()
                 WHERE id = $2
                 RETURNING *`,
                [approved_by || 'checker', rate_id]
            );
        }

        if (result.rowCount === 0) {
            return res.status(404).json(
                success(false, 404, "VAT rate not found", null)
            );
        }

        const message = action === 'approve'
            ? "Rate change approved successfully"
            : "Rate change rejected";

        return res.status(200).json(
            success(true, 200, message, {
                rate: result.rows[0]
            })
        );
    } catch (err) {
        console.error("ApproveRejectVATRate error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Get VAT Eligibility List
// -------------------------
const GetVATEligibilityList = async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;

        console.log("GetVATEligibilityList params:", { status, page, limit });

        let query = `
            SELECT id, merchant_name, merchant_email, psp_name,
                   registration_status, transaction_value, vat_amount,
                   tin, action_status, created_at, updated_at
            FROM vat_eligibility
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        // Filter by registration status if provided
        if (status) {
            query += ` AND registration_status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        // Get total count for pagination
        const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM');
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Add ordering and pagination
        query += ` ORDER BY id ASC`;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), offset);

        const result = await pool.query(query, params);

        return res.status(200).json(
            success(true, 200, "VAT eligibility list fetched successfully", {
                merchants: result.rows,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            })
        );

    } catch (err) {
        console.error("GetVATEligibilityList error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Generate TIN Number
// -------------------------
const generateTIN = async () => {
    try {
        const result = await pool.query(`SELECT nextval('tin_sequence') as tin_number`);
        const tinNumber = result.rows[0].tin_number;
        return `P${String(tinNumber).padStart(9, '0')}`;
    } catch (error) {
        // Fallback if sequence doesn't exist - generate random TIN
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `P${String(timestamp).slice(-6)}${String(random).padStart(3, '0')}`;
    }
};

// -------------------------
// Process Compliance Action
// -------------------------
const ProcessComplianceAction = async (req, res) => {
    try {
        const {
            merchant_id,
            merchant_name,
            merchant_email,
            transaction_value,
            vat_amount,
            levies_amount,
            total_liability
        } = req.body;

        console.log("ProcessComplianceAction request:", req.body);

        if (!merchant_id) {
            return res.status(400).json(
                success(false, 400, "Merchant ID is required", null)
            );
        }

        // Check if merchant already has a TIN
        const existingCheck = await pool.query(
            `SELECT id, tin, action_status FROM vat_eligibility WHERE id = $1`,
            [merchant_id]
        );

        if (existingCheck.rows.length === 0) {
            return res.status(404).json(
                success(false, 404, "Merchant not found", null)
            );
        }

        if (existingCheck.rows[0].action_status === 'Processed' && existingCheck.rows[0].tin) {
            return res.status(400).json(
                success(false, 400, "Compliance action already processed for this merchant", {
                    tin: existingCheck.rows[0].tin
                })
            );
        }

        // Generate TIN
        const tin = await generateTIN();

        // Generate payment link
        const paymentLink = `https://pay.gra.gov.gh/invoice/${tin}/${Date.now()}`;

        // Update vat_eligibility with TIN and status
        const result = await pool.query(
            `UPDATE vat_eligibility SET
                tin = $1,
                registration_status = 'Actioned',
                action_status = 'Processed',
                updated_at = NOW()
            WHERE id = $2
            RETURNING *`,
            [tin, merchant_id]
        );

        console.log("Compliance action processed successfully:", result.rows[0]);

        return res.status(200).json(
            success(true, 200, "Compliance action processed successfully", {
                tin,
                merchant_id,
                merchant_name: result.rows[0].merchant_name,
                merchant_email: result.rows[0].merchant_email,
                payment_link: paymentLink,
                registration_status: 'Actioned',
                action_status: 'Processed'
            })
        );

    } catch (err) {
        console.error("ProcessComplianceAction error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Download Notice of Liability PDF
// -------------------------
const DownloadNoticePDF = async (req, res) => {
    try {
        const { tin } = req.params;

        if (!tin) {
            return res.status(400).json(success(false, 400, "TIN is required", null));
        }

        // Get merchant details from database
        const result = await pool.query(
            `SELECT * FROM vat_eligibility WHERE tin = $1`,
            [tin]
        );

        if (result.rows.length === 0) {
            return res.status(404).json(success(false, 404, "Merchant not found", null));
        }

        const merchant = result.rows[0];
        const currentDate = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // Generate payment link and QR code
        const paymentLink = `https://pay.gra.gov.gh/invoice/${tin}`;

        // Generate QR code as PNG buffer
        const qrCodeBuffer = await QRCode.toBuffer(paymentLink, {
            type: 'png',
            width: 200,
            margin: 2
        });

        console.log('QR Code generated, buffer size:', qrCodeBuffer.length);

        // Create PDF document
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Notice_of_Liability_${tin}.pdf`);

        // Pipe PDF to response
        doc.pipe(res);

        // Header
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e40af')
           .text('GHANA REVENUE AUTHORITY', { align: 'center' });
        doc.fontSize(12).font('Helvetica').fillColor('#333')
           .text('VAT Compliance Division', { align: 'center' });
        doc.moveDown(1.5);

        // Title
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#000')
           .text('NOTICE OF VAT LIABILITY', { align: 'center', underline: true });
        doc.moveDown(1.5);

        // Date and Reference
        doc.fontSize(10).font('Helvetica').fillColor('#333')
           .text(`Date: ${currentDate}`, { align: 'right' });
        doc.text(`Reference: GRA/VAT/${tin}`, { align: 'right' });
        doc.moveDown(1.5);

        // Merchant Details
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('To:');
        doc.font('Helvetica').text(merchant.merchant_name || 'N/A');
        doc.text(merchant.merchant_email || 'N/A');
        doc.moveDown(1.5);

        // Body
        doc.fontSize(11).font('Helvetica-Bold').text('RE: Notice of Registration and VAT Liability Assessment');
        doc.moveDown(0.5);

        doc.font('Helvetica').text(
            `This notice serves to inform you that based on our records, your entity has been identified as a ` +
            `Non-Resident Entity conducting taxable transactions within the jurisdiction of Ghana.`,
            { align: 'justify' }
        );
        doc.moveDown(0.5);

        doc.text(
            `In accordance with the Value Added Tax Act, 2013 (Act 870) as amended, you are hereby required to ` +
            `register for VAT and remit the assessed liability as detailed below:`,
            { align: 'justify' }
        );
        doc.moveDown(1.5);

        // Liability Details Box
        const liabilityBoxY = doc.y;
        doc.rect(50, liabilityBoxY, 495, 100).stroke('#1e40af');

        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e40af')
           .text('LIABILITY ASSESSMENT DETAILS', 60, liabilityBoxY + 8);

        doc.fontSize(10).font('Helvetica').fillColor('#333');
        doc.text(`Administrative TIN:`, 60, liabilityBoxY + 28);
        doc.font('Helvetica-Bold').text(`${tin}`, 200, liabilityBoxY + 28);

        doc.font('Helvetica').text(`Gross Transaction Value:`, 60, liabilityBoxY + 45);
        doc.text(`GHS ${parseFloat(merchant.transaction_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 200, liabilityBoxY + 45);

        doc.text(`Total VAT Liability:`, 60, liabilityBoxY + 62);
        doc.font('Helvetica-Bold').fillColor('#DC2626')
           .text(`GHS ${parseFloat(merchant.vat_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 200, liabilityBoxY + 62);

        doc.font('Helvetica').fillColor('#333').text(`Status:`, 60, liabilityBoxY + 79);
        doc.font('Helvetica-Bold').fillColor('#10B981').text(`${merchant.action_status || 'Processed'}`, 200, liabilityBoxY + 79);

        // Move below the box
        doc.y = liabilityBoxY + 115;

        // Payment Instructions
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000')
           .text('Payment Instructions:');
        doc.moveDown(0.3);

        doc.font('Helvetica').text(
            `Please remit the assessed amount within 30 days of receiving this notice. Payment can be made ` +
            `through the GRA online payment portal by scanning the QR code below or using the payment link.`,
            { align: 'justify' }
        );
        doc.moveDown(1);

        // QR Code Section
        const qrSectionY = doc.y;
        doc.rect(50, qrSectionY, 495, 130).stroke('#1e40af');

        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af')
           .text('SCAN TO PAY', 60, qrSectionY + 8);

        // Add QR Code image - place it directly
        try {
            doc.image(qrCodeBuffer, 60, qrSectionY + 25, {
                width: 90,
                height: 90
            });
            console.log('QR Code added to PDF successfully');
        } catch (imgErr) {
            console.error('Error adding QR image:', imgErr);
        }

        // Payment link text next to QR code
        doc.fontSize(10).font('Helvetica').fillColor('#333')
           .text('Payment Link:', 170, qrSectionY + 30);
        doc.fontSize(9).fillColor('#1e40af')
           .text(paymentLink, 170, qrSectionY + 45);

        doc.fontSize(9).font('Helvetica').fillColor('#666')
           .text('Scan this QR code with your mobile device', 170, qrSectionY + 65);
        doc.text('to make a secure payment directly to GRA.', 170, qrSectionY + 78);

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#DC2626')
           .text(`Amount Due: GHS ${parseFloat(merchant.vat_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 170, qrSectionY + 100);

        // Footer - positioned at bottom
        doc.fontSize(9).font('Helvetica').fillColor('#666')
           .text('This is an official document generated by the Ghana Revenue Authority.', 50, 750, { align: 'center', width: 495 });
        doc.text('For inquiries, contact: vat.compliance@gra.gov.gh', 50, 762, { align: 'center', width: 495 });

        // Finalize PDF
        doc.end();

    } catch (err) {
        console.error("DownloadNoticePDF error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Export VAT Eligibility List as PDF
// -------------------------
const ExportVATEligibilityPDF = async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT id, merchant_name, merchant_email, psp_name,
                   registration_status, transaction_value, vat_amount,
                   tin, action_status, created_at
            FROM vat_eligibility
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ` AND registration_status = $1`;
            params.push(status);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);
        const merchants = result.rows;

        const currentDate = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // Create PDF document
        const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=VAT_Eligibility_List_${Date.now()}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e40af')
           .text('GHANA REVENUE AUTHORITY', { align: 'center' });
        doc.fontSize(10).font('Helvetica').fillColor('#333')
           .text('VAT Compliance Division', { align: 'center' });
        doc.moveDown(1);

        // Title
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
           .text('VAT ELIGIBILITY LIST', { align: 'center' });
        doc.fontSize(9).font('Helvetica').fillColor('#666')
           .text(`Generated on: ${currentDate}`, { align: 'center' });
        doc.moveDown(1.5);

        // Table Header
        const tableTop = doc.y;
        const colWidths = [30, 130, 150, 80, 80, 90, 90, 80];
        const headers = ['#', 'Merchant Name', 'Email', 'PSP', 'Status', 'Transaction', 'VAT Amount', 'Action'];

        // Draw header background
        doc.rect(40, tableTop - 5, 760, 20).fill('#1e40af');

        // Draw header text
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#fff');
        let xPos = 45;
        headers.forEach((header, i) => {
            doc.text(header, xPos, tableTop, { width: colWidths[i], align: 'left' });
            xPos += colWidths[i];
        });

        // Draw rows
        let yPos = tableTop + 20;
        doc.font('Helvetica').fontSize(8).fillColor('#333');

        merchants.forEach((merchant, index) => {
            // Check if we need a new page
            if (yPos > 520) {
                doc.addPage();
                yPos = 50;

                // Redraw header on new page
                doc.rect(40, yPos - 5, 760, 20).fill('#1e40af');
                doc.fontSize(8).font('Helvetica-Bold').fillColor('#fff');
                xPos = 45;
                headers.forEach((header, i) => {
                    doc.text(header, xPos, yPos, { width: colWidths[i], align: 'left' });
                    xPos += colWidths[i];
                });
                yPos += 20;
                doc.font('Helvetica').fontSize(8).fillColor('#333');
            }

            // Alternate row background
            if (index % 2 === 0) {
                doc.rect(40, yPos - 3, 760, 18).fill('#f3f4f6');
            }

            doc.fillColor('#333');
            xPos = 45;

            // Row data
            doc.text(String(index + 1), xPos, yPos, { width: colWidths[0] });
            xPos += colWidths[0];

            doc.text(merchant.merchant_name || 'N/A', xPos, yPos, { width: colWidths[1] - 5 });
            xPos += colWidths[1];

            doc.text(merchant.merchant_email || 'N/A', xPos, yPos, { width: colWidths[2] - 5 });
            xPos += colWidths[2];

            doc.text(merchant.psp_name || 'N/A', xPos, yPos, { width: colWidths[3] - 5 });
            xPos += colWidths[3];

            doc.text(merchant.registration_status || 'N/A', xPos, yPos, { width: colWidths[4] - 5 });
            xPos += colWidths[4];

            const transValue = parseFloat(merchant.transaction_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
            doc.text(`GH₵${transValue}`, xPos, yPos, { width: colWidths[5] - 5 });
            xPos += colWidths[5];

            const vatValue = parseFloat(merchant.vat_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
            doc.text(`GH₵${vatValue}`, xPos, yPos, { width: colWidths[6] - 5 });
            xPos += colWidths[6];

            doc.text(merchant.action_status || 'Pending', xPos, yPos, { width: colWidths[7] - 5 });

            yPos += 18;
        });

        // Summary
        doc.moveDown(2);
        yPos = doc.y + 10;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e40af')
           .text(`Total Merchants: ${merchants.length}`, 40, yPos);

        // Calculate totals
        const totalTransaction = merchants.reduce((sum, m) => sum + parseFloat(m.transaction_value || 0), 0);
        const totalVAT = merchants.reduce((sum, m) => sum + parseFloat(m.vat_amount || 0), 0);

        doc.text(`Total Transaction Value: GH₵${totalTransaction.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 40, yPos + 15);
        doc.text(`Total VAT Amount: GH₵${totalVAT.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 40, yPos + 30);

        // Footer
        doc.fontSize(8).font('Helvetica').fillColor('#666')
           .text('This is an official document generated by the Ghana Revenue Authority.', 40, 550, { align: 'center', width: 760 });

        doc.end();

    } catch (err) {
        console.error("ExportVATEligibilityPDF error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Get Notifications for User
// -------------------------
const GetNotifications = async (req, res) => {
    try {
        const { user_role, user_id } = req.query;

        if (!user_role) {
            return res.status(400).json(
                success(false, 400, "User role is required", null)
            );
        }

        // Get notifications for the user's role
        const result = await pool.query(
            `SELECT id, notification_type, title, message, target_role,
                    reference_id, reference_type, is_read, created_by, created_at, read_at
             FROM notifications
             WHERE target_role = $1
             ORDER BY created_at DESC
             LIMIT 50`,
            [user_role]
        );

        // Get unread count
        const unreadResult = await pool.query(
            `SELECT COUNT(*) as unread_count
             FROM notifications
             WHERE target_role = $1 AND is_read = FALSE`,
            [user_role]
        );

        return res.status(200).json(
            success(true, 200, "Notifications fetched successfully", {
                notifications: result.rows,
                unread_count: parseInt(unreadResult.rows[0].unread_count)
            })
        );

    } catch (err) {
        console.error("GetNotifications error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Mark Notification as Read
// -------------------------
const MarkNotificationRead = async (req, res) => {
    try {
        const { notification_id } = req.params;

        if (!notification_id) {
            return res.status(400).json(
                success(false, 400, "Notification ID is required", null)
            );
        }

        const result = await pool.query(
            `UPDATE notifications
             SET is_read = TRUE, read_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [notification_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json(
                success(false, 404, "Notification not found", null)
            );
        }

        return res.status(200).json(
            success(true, 200, "Notification marked as read", {
                notification: result.rows[0]
            })
        );

    } catch (err) {
        console.error("MarkNotificationRead error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Mark All Notifications as Read
// -------------------------
const MarkAllNotificationsRead = async (req, res) => {
    try {
        const { user_role } = req.body;

        if (!user_role) {
            return res.status(400).json(
                success(false, 400, "User role is required", null)
            );
        }

        await pool.query(
            `UPDATE notifications
             SET is_read = TRUE, read_at = NOW()
             WHERE target_role = $1 AND is_read = FALSE`,
            [user_role]
        );

        return res.status(200).json(
            success(true, 200, "All notifications marked as read", null)
        );

    } catch (err) {
        console.error("MarkAllNotificationsRead error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

module.exports = {
    MonitoringLogin,
    MonitoringVerifyOTP,
    MonitoringResendOTP,
    MonitoringLogout,
    SetPassword,
    GetMerchantDiscovery,
    GetMerchantDiscoveryStats,
    GetMerchantStatistics,
    ConfigurationLogin,
    ConfigurationVerifyOTP,
    ConfigurationResendOTP,
    GRAAdminLogin,
    GRAAdminVerifyOTP,
    GRAAdminResendOTP,
    GetVATRates,
    SubmitVATRateChange,
    ApproveRejectVATRate,
    GetVATEligibilityList,
    ProcessComplianceAction,
    DownloadNoticePDF,
    ExportVATEligibilityPDF,
    GetNotifications,
    MarkNotificationRead,
    MarkAllNotificationsRead
};
