const { Pool } = require('pg');
const { success } = require("../model/responseModel");
const nodemailer = require("nodemailer");
const fs = require('fs');
const crypto = require('crypto');

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

        // 1️⃣ Find user by ghanacardnumber or tin from users table
        const userQuery = await pool.query(
            `SELECT id, unique_id,  ghana_card_number, tin ,contact_value
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
            `SELECT id, unique_id, contact_value, fullname, full_name, ghanacardnumber, tin, otp_code, otp_expires_at
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
                    tin: user.tin
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
    ApproveRejectVATRate
};
